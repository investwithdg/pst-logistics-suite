import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find abandoned orders (pending_payment for > 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: abandonedOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, customer_email')
      .eq('status', 'pending_payment')
      .lt('created_at', thirtyMinutesAgo);

    if (fetchError) throw fetchError;

    if (!abandonedOrders || abandonedOrders.length === 0) {
      console.log('[cleanup-abandoned-orders] No abandoned orders found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No abandoned orders',
          count: 0,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`[cleanup-abandoned-orders] Found ${abandonedOrders.length} abandoned orders`);

    // Delete abandoned orders
    const orderIds = abandonedOrders.map(o => o.id);
    
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .in('id', orderIds);

    if (deleteError) throw deleteError;

    console.log(`[cleanup-abandoned-orders] Deleted ${abandonedOrders.length} orders:`, 
      abandonedOrders.map(o => o.order_number).join(', ')
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleaned up ${abandonedOrders.length} abandoned orders`,
        count: abandonedOrders.length,
        orders: abandonedOrders.map(o => o.order_number),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[cleanup-abandoned-orders] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
