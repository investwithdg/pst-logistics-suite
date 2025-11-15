import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { order_id, sync_type, changes } = await req.json();
    console.log(`[sync-order-to-hubspot] Syncing order ${order_id}, type: ${sync_type}`);

    // Fetch order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${order_id}`);
    }

    // Only sync if order has HubSpot deal ID (except for order-creation which creates the deal)
    if (!order.hubspot_deal_id && sync_type !== 'order-creation') {
      console.log(`[sync-order-to-hubspot] Order ${order_id} has no HubSpot deal ID, skipping sync`);
      return new Response(
        JSON.stringify({ success: true, message: 'No HubSpot deal ID, skipped' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get webhook URL from config based on sync type
    const { data: webhookConfig } = await supabaseClient
      .from('webhook_config')
      .select('webhook_url, is_active')
      .eq('webhook_name', `hubspot-${sync_type}`)
      .eq('is_active', true)
      .single();

    if (!webhookConfig?.webhook_url) {
      console.warn(`[sync-order-to-hubspot] No active webhook configured for ${sync_type}`);
      
      // Log sync status as skipped
      await supabaseClient
        .from('hubspot_sync_status')
        .insert({
          order_id,
          sync_type,
          hubspot_deal_id: order.hubspot_deal_id,
          sync_status: 'skipped',
          error_message: 'No webhook configured'
        });

      return new Response(
        JSON.stringify({ success: true, message: 'No webhook configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build payload based on sync type
    let payload: any = {
      deal_id: order.hubspot_deal_id,
      order_number: order.order_number,
      order_id: order.id
    };

    switch (sync_type) {
      case 'status-update':
        // Send ALL fields for complete pipeline stage context
        payload = {
          ...payload,
          status: order.status,
          updated_at: new Date().toISOString(),
          
          // Scheduled times (for Accepted/Scheduled stage)
          scheduled_pickup_time: order.scheduled_pickup_time,
          scheduled_delivery_time: order.scheduled_delivery_time,
          
          // Locations
          pickup_address: order.pickup_address,
          dropoff_address: order.dropoff_address,
          pickup_lat: order.pickup_lat,
          pickup_lng: order.pickup_lng,
          dropoff_lat: order.dropoff_lat,
          dropoff_lng: order.dropoff_lng,
          
          // Actual times (for each stage)
          picked_up_at: order.picked_up_at,
          in_transit_at: order.in_transit_at,
          delivered_at: order.delivered_at,
          completed_at: order.completed_at,
          
          // Driver info (if assigned)
          driver_id: order.driver_id,
          driver_name: order.driver_name,
          driver_phone: order.driver_phone,
          
          // Delivery details
          delivery_type: order.delivery_type,
          vehicle_type_required: order.vehicle_type_required,
          rush_requested: order.rush_requested,
          number_of_stops: order.number_of_stops,
          
          // Exception handling
          delivery_exception_type: order.delivery_exception_type,
          delivery_exception_notes: order.delivery_exception_notes,
          driver_contacted_customer: order.driver_contacted_customer,
          driver_feedback: order.driver_feedback,
          
          // Customer feedback (for Completed stage)
          special_instructions: order.special_instructions
        };
        break;

      case 'driver-assignment':
        payload = {
          ...payload,
          driver_name: order.driver_name,
          driver_phone: order.driver_phone,
          driver_id: order.driver_id,
          assigned_at: order.assigned_at,
          
          // Include order context for dispatcher
          status: order.status,
          pickup_address: order.pickup_address,
          dropoff_address: order.dropoff_address,
          scheduled_pickup_time: order.scheduled_pickup_time,
          scheduled_delivery_time: order.scheduled_delivery_time,
          package_description: order.package_description,
          special_instructions: order.special_instructions
        };
        break;

      case 'proof-of-delivery':
        // Fetch proof of delivery
        const { data: proof } = await supabaseClient
          .from('proof_of_delivery')
          .select('*')
          .eq('order_id', order_id)
          .single();

        payload = {
          ...payload,
          proof_photo_url: proof?.photo_url,
          proof_signature_url: proof?.signature_url,
          proof_notes: proof?.notes,
          recipient_name: proof?.recipient_name,
          delivered_at: order.delivered_at
        };
        break;

      case 'order-update':
        payload = {
          ...payload,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          pickup_address: order.pickup_address,
          dropoff_address: order.dropoff_address,
          package_description: order.package_description,
          special_instructions: order.special_instructions,
          total_price: order.total_price,
          changes: changes || {}
        };
        break;

      case 'payment-update':
        payload = {
          ...payload,
          payment_status: order.payment_status,
          stripe_session_id: order.stripe_session_id,
          total_price: order.total_price
        };
        break;

      case 'delivery-exception':
        payload = {
          ...payload,
          exception_type: order.delivery_exception_type,
          exception_notes: order.delivery_exception_notes,
          driver_contacted_customer: order.driver_contacted_customer,
          driver_feedback: order.driver_feedback
        };
        break;

      case 'order-creation':
        // Full order details when first created after payment
        payload = {
          ...payload,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          pickup_address: order.pickup_address,
          dropoff_address: order.dropoff_address,
          package_description: order.package_description,
          special_instructions: order.special_instructions,
          total_price: order.total_price,
          payment_status: order.payment_status,
          status: order.status,
          scheduled_pickup_time: order.scheduled_pickup_time,
          scheduled_delivery_time: order.scheduled_delivery_time,
          delivery_type: order.delivery_type,
          vehicle_type_required: order.vehicle_type_required,
          distance: order.distance,
          package_weight: order.package_weight
        };
        break;

      default:
        payload = {
          ...payload,
          ...order
        };
    }

    // Send to Make.com webhook
    console.log(`[sync-order-to-hubspot] Sending to webhook: ${webhookConfig.webhook_url}`);
    const webhookResponse = await fetch(webhookConfig.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const webhookResult = await webhookResponse.json().catch(() => ({}));

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed: ${webhookResponse.status} - ${JSON.stringify(webhookResult)}`);
    }

    console.log(`[sync-order-to-hubspot] Successfully synced order ${order_id}`);

    // Log successful sync
    await supabaseClient
      .from('hubspot_sync_status')
      .insert({
        order_id,
        sync_type,
        hubspot_deal_id: order.hubspot_deal_id,
        sync_status: 'success',
        last_attempt_at: new Date().toISOString()
      });

    // Log webhook
    await supabaseClient
      .from('webhook_logs')
      .insert({
        webhook_name: `hubspot-${sync_type}`,
        direction: 'outgoing',
        payload,
        response: webhookResult,
        status: 'success'
      });

    return new Response(
      JSON.stringify({ success: true, order_id, sync_type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[sync-order-to-hubspot] Error:', error);

    const { order_id, sync_type } = await req.json().catch(() => ({}));

    // Log failed sync
    if (order_id) {
      await supabaseClient
        .from('hubspot_sync_status')
        .insert({
          order_id,
          sync_type: sync_type || 'unknown',
          sync_status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          last_attempt_at: new Date().toISOString()
        });
    }

    // Log failed webhook
    await supabaseClient
      .from('webhook_logs')
      .insert({
        webhook_name: `hubspot-${sync_type || 'unknown'}`,
        direction: 'outgoing',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
