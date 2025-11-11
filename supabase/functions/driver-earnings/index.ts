import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EarningsRequestSchema = z.object({
  driverId: z.string().uuid(),
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
    const input = EarningsRequestSchema.parse(body);

    console.log('[driver-earnings] Fetching earnings for driver:', input.driverId);

    // Get all completed orders for driver
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_price, completed_at, created_at')
      .eq('driver_id', input.driverId)
      .eq('status', 'completed');

    if (error) {
      console.error('[driver-earnings] Query error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Calculate earnings
    const totalEarnings = orders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
    
    // Calculate today's earnings
    const today = new Date().toISOString().split('T')[0];
    const todayEarnings = orders?.filter(order => 
      order.completed_at?.startsWith(today)
    ).reduce((sum, order) => sum + Number(order.total_price), 0) || 0;

    const earnings = {
      totalEarnings,
      todayEarnings,
      totalDeliveries: orders?.length || 0,
      todayDeliveries: orders?.filter(order => order.completed_at?.startsWith(today)).length || 0,
    };

    console.log('[driver-earnings] Earnings calculated:', earnings);

    return new Response(
      JSON.stringify({ success: true, data: earnings }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[driver-earnings] Error:', error);
    
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
