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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const body = await req.json();
    console.log('[hubspot-order-webhook] Received webhook:', body);

    // Extract order data from webhook payload
    const {
      deal_id,
      customer_name,
      customer_email,
      customer_phone,
      pickup_address,
      dropoff_address,
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng,
      package_description,
      package_weight,
      special_instructions,
      total_price,
      stripe_session_id,
      hubspot_properties
    } = body;

    // Calculate distance (mock for now - should use actual calculation)
    const distance = 10; // This should come from the quote calculation

    // Insert order into database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        customer_phone,
        pickup_address,
        dropoff_address,
        pickup_lat,
        pickup_lng,
        dropoff_lat,
        dropoff_lng,
        package_description,
        package_weight,
        special_instructions,
        total_price,
        distance,
        base_rate: 25,
        mileage_charge: distance * 2.5,
        stripe_session_id,
        hubspot_deal_id: deal_id,
        hubspot_properties,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('[hubspot-order-webhook] Error inserting order:', orderError);
      throw orderError;
    }

    console.log('[hubspot-order-webhook] Order created:', order.id);

    // Create sync status record
    const { error: syncError } = await supabaseClient
      .from('hubspot_sync_status')
      .insert({
        order_id: order.id,
        sync_type: 'order_creation',
        hubspot_deal_id: deal_id,
        sync_status: 'success'
      });

    if (syncError) {
      console.error('[hubspot-order-webhook] Error creating sync status:', syncError);
    }

    // Log webhook
    await supabaseClient
      .from('webhook_logs')
      .insert({
        webhook_name: 'hubspot-order-webhook',
        direction: 'incoming',
        payload: body,
        status: 'success'
      });

    // Create notification for dispatchers
    const { data: dispatchers } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'dispatcher');

    if (dispatchers && dispatchers.length > 0) {
      const notifications = dispatchers.map(d => ({
        user_id: d.user_id,
        type: 'new_order',
        title: 'New Order',
        message: `New order ${order.order_number} from ${customer_name}`,
        order_id: order.id
      }));

      await supabaseClient
        .from('notifications')
        .insert(notifications);
    }

    return new Response(
      JSON.stringify({ success: true, order_id: order.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[hubspot-order-webhook] Error:', error);
    
    // Log failed webhook
    await supabaseClient
      .from('webhook_logs')
      .insert({
        webhook_name: 'hubspot-order-webhook',
        direction: 'incoming',
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
