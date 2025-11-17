import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAKE_WEBHOOK_URL = "https://hook.us1.make.com/q1mhkja0kx3xbkbqx365gtw2f99nry1i";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('[sync-hubspot-quote] Received data:', body);

    // Send to Make.com webhook
    const webhookPayload = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      pickupAddress: body.pickupAddress,
      dropoffAddress: body.dropoffAddress,
      amount: body.amount,
      deliverySize: body.deliverySize,
      weight: body.weight,
      specialInstructions: body.specialInstructions,
      distance: body.distance,
      timestamp: new Date().toISOString(),
    };

    console.log('[sync-hubspot-quote] Sending payload to webhook:', webhookPayload);

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    const responseText = await response.text();
    console.log('[sync-hubspot-quote] Webhook response status:', response.status);
    console.log('[sync-hubspot-quote] Webhook response body:', responseText);

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}: ${responseText}`);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log('[sync-hubspot-quote] Response is not JSON, using raw text');
      responseData = { raw: responseText };
    }

    console.log('[sync-hubspot-quote] Successfully sent to HubSpot');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Data synced to HubSpot',
        data: responseData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[sync-hubspot-quote] Error:', error);
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
