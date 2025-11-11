import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JobActionSchema = z.object({
  orderId: z.string().uuid(),
  action: z.enum(['accept', 'decline']),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const body = await req.json();
    const input = JobActionSchema.parse(body);

    console.log('[driver-job-action] Action:', input);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not authenticated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    if (input.action === 'accept') {
      // Update order to assign driver
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', input.orderId);

      if (orderError) {
        console.error('[driver-job-action] Order update error:', orderError);
        return new Response(
          JSON.stringify({ success: false, error: orderError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Update driver status to busy
      const { error: driverError } = await supabase
        .from('drivers')
        .update({ status: 'busy' })
        .eq('id', user.id);

      if (driverError) {
        console.error('[driver-job-action] Driver update error:', driverError);
      }
    }

    console.log('[driver-job-action] Action completed successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[driver-job-action] Error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid input', 
          details: error.errors 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
