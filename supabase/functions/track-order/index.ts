import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TrackRequestSchema = z.object({
  orderNumber: z.string().min(1),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '' // Public endpoint
    );

    const body = await req.json();
    const input = TrackRequestSchema.parse(body);

    console.log('[track-order] Tracking order:', input.orderNumber);

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', input.orderNumber)
      .single();

    if (error || !order) {
      console.error('[track-order] Order not found:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Order not found' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Fetch proof of delivery if exists
    const { data: proof } = await supabase
      .from('proof_of_delivery')
      .select('*')
      .eq('order_id', order.id)
      .maybeSingle();

    const trackingData = {
      ...order,
      proofOfDelivery: proof,
    };

    console.log('[track-order] Found order:', order.id);

    return new Response(
      JSON.stringify({ success: true, data: trackingData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[track-order] Error:', error);
    
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
