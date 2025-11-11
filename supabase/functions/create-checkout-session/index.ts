import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CheckoutRequestSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  pickupAddress: z.string(),
  dropoffAddress: z.string(),
  distance: z.number().positive(),
  packageWeight: z.number().positive(),
  packageDescription: z.string(),
  amount: z.number().positive(),
  baseRate: z.number(),
  mileageCharge: z.number(),
  surcharge: z.number(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const input = CheckoutRequestSchema.parse(body);

    console.log('[create-checkout-session] Input:', input);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ 
      email: input.customerEmail, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: input.customerEmail,
        name: input.customerName,
        phone: input.customerPhone,
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Delivery Service',
              description: `${input.pickupAddress} → ${input.dropoffAddress}`,
              metadata: {
                packageDescription: input.packageDescription,
                distance: input.distance.toString(),
                weight: input.packageWeight.toString(),
              },
            },
            unit_amount: Math.round(input.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/quote`,
      metadata: {
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        pickupAddress: input.pickupAddress,
        dropoffAddress: input.dropoffAddress,
        distance: input.distance.toString(),
        packageWeight: input.packageWeight.toString(),
        packageDescription: input.packageDescription,
        baseRate: input.baseRate.toString(),
        mileageCharge: input.mileageCharge.toString(),
        surcharge: input.surcharge.toString(),
        totalPrice: input.amount.toString(),
      },
    });

    console.log('[create-checkout-session] Session created:', session.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: session.url,
        sessionId: session.id,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[create-checkout-session] Error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid input', 
          details: error.errors 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

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
