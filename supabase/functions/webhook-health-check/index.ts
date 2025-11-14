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
    // Get webhook configurations
    const { data: webhooks } = await supabaseClient
      .from('webhook_config')
      .select('*')
      .eq('is_active', true);

    const results = [];

    if (webhooks) {
      for (const webhook of webhooks) {
        if (!webhook.webhook_url) continue;

        try {
          const testPayload = {
            test: true,
            timestamp: new Date().toISOString(),
            webhook_name: webhook.webhook_name
          };

          const response = await fetch(webhook.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload),
            signal: AbortSignal.timeout(5000) // 5 second timeout
          });

          const status = response.ok ? 'healthy' : 'unhealthy';
          
          results.push({
            webhook_name: webhook.webhook_name,
            status,
            response_code: response.status,
            tested_at: new Date().toISOString()
          });

          // Log the test
          await supabaseClient
            .from('webhook_logs')
            .insert({
              webhook_name: webhook.webhook_name,
              direction: 'outgoing',
              payload: testPayload,
              status: response.ok ? 'success' : 'failed',
              error_message: response.ok ? null : `HTTP ${response.status}`
            });

        } catch (error) {
          results.push({
            webhook_name: webhook.webhook_name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            tested_at: new Date().toISOString()
          });

          await supabaseClient
            .from('webhook_logs')
            .insert({
              webhook_name: webhook.webhook_name,
              direction: 'outgoing',
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[webhook-health-check] Error:', error);
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
