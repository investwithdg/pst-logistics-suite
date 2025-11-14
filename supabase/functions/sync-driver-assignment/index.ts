import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAKE_WEBHOOK_URL = Deno.env.get("MAKE_WEBHOOK_URL_DRIVER_SYNC");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { order_id, driver_id } = await req.json();
    console.log('[sync-driver-assignment] Syncing assignment:', { order_id, driver_id });

    // Get order and driver details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*, hubspot_deal_id')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    const { data: driver, error: driverError } = await supabaseClient
      .from('drivers')
      .select('*')
      .eq('id', driver_id)
      .single();

    if (driverError || !driver) {
      throw new Error('Driver not found');
    }

    if (!order.hubspot_deal_id) {
      console.log('[sync-driver-assignment] No HubSpot deal ID, skipping sync');
      return new Response(
        JSON.stringify({ success: true, message: 'No HubSpot deal to sync' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send to Make.com webhook
    const webhookPayload = {
      hubspot_deal_id: order.hubspot_deal_id,
      assigned_driver_name: driver.name,
      assigned_driver_phone: driver.phone,
      assigned_driver_vehicle: driver.vehicle_type,
      assigned_driver_plate: driver.vehicle_plate,
      assignment_timestamp: new Date().toISOString()
    };

    const response = await fetch(MAKE_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      throw new Error(`Make.com webhook failed: ${response.status}`);
    }

    console.log('[sync-driver-assignment] Successfully synced to HubSpot');

    // Update sync status
    await supabaseClient
      .from('hubspot_sync_status')
      .insert({
        order_id,
        sync_type: 'driver_assignment',
        hubspot_deal_id: order.hubspot_deal_id,
        sync_status: 'success'
      });

    // Log webhook
    await supabaseClient
      .from('webhook_logs')
      .insert({
        webhook_name: 'sync-driver-assignment',
        direction: 'outgoing',
        payload: webhookPayload,
        response: await response.json().catch(() => ({})),
        status: 'success'
      });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[sync-driver-assignment] Error:', error);

    // Log failed webhook
    await supabaseClient
      .from('webhook_logs')
      .insert({
        webhook_name: 'sync-driver-assignment',
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
