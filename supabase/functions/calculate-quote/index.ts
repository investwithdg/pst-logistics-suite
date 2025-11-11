import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QuoteRequestSchema = z.object({
  distance: z.number().positive(),
  packageWeight: z.number().positive(),
  isUrgent: z.boolean().optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const input = QuoteRequestSchema.parse(body);

    console.log('[calculate-quote] Input:', input);

    // Fetch active pricing rules
    const { data: pricingRules, error: pricingError } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('active', true)
      .single();

    if (pricingError || !pricingRules) {
      console.error('[calculate-quote] Pricing rules error:', pricingError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unable to fetch pricing rules' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Calculate pricing
    const baseRate = Number(pricingRules.base_rate);
    const mileageCharge = Number(pricingRules.per_mile_rate) * input.distance;
    const weightCharge = Number(pricingRules.per_pound_rate) * input.packageWeight;
    
    let surcharge = 0;
    if (input.packageWeight > Number(pricingRules.heavy_package_threshold)) {
      surcharge += Number(pricingRules.heavy_package_surcharge);
    }
    
    let subtotal = baseRate + mileageCharge + weightCharge + surcharge;
    
    if (input.isUrgent) {
      const urgentSurcharge = (subtotal * Number(pricingRules.urgent_surcharge_percent)) / 100;
      surcharge += urgentSurcharge;
      subtotal += urgentSurcharge;
    }

    const quote = {
      baseRate,
      mileageCharge,
      weightCharge,
      surcharge,
      totalPrice: subtotal,
    };

    console.log('[calculate-quote] Result:', quote);

    return new Response(
      JSON.stringify({ success: true, data: quote }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[calculate-quote] Error:', error);
    
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
