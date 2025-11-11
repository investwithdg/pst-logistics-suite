import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FetchOrdersSchema = z.object({
  customerId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  status: z.string().optional(),
  limit: z.number().positive().optional(),
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
    const input = FetchOrdersSchema.parse(body);

    console.log('[fetch-orders] Fetching orders with filters:', input);

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (input.customerId) {
      query = query.eq('customer_id', input.customerId);
    }

    if (input.driverId) {
      query = query.eq('driver_id', input.driverId);
    }

    if (input.status) {
      query = query.eq('status', input.status);
    }

    if (input.limit) {
      query = query.limit(input.limit);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('[fetch-orders] Query error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('[fetch-orders] Found orders:', orders?.length);

    return new Response(
      JSON.stringify({ success: true, data: orders || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[fetch-orders] Error:', error);
    
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
