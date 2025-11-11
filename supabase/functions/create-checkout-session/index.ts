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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for existing pending order with same email to prevent duplicates
    const { data: existingOrders } = await supabase
      .from('orders')
      .select('id, order_number, stripe_session_id')
      .eq('customer_email', input.customerEmail)
      .eq('status', 'pending_payment')
      .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 mins
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingOrders && existingOrders.length > 0) {
      const existingOrder = existingOrders[0];
      console.log('[create-checkout-session] Found existing pending order:', existingOrder.order_number);
      
      // Initialize Stripe to get existing session
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2025-08-27.basil',
      });

      // Get existing Stripe session
      if (existingOrder.stripe_session_id) {
        try {
          const existingSession = await stripe.checkout.sessions.retrieve(existingOrder.stripe_session_id);
          
          if (existingSession.status === 'open') {
            return new Response(
              JSON.stringify({ 
                success: true, 
                url: existingSession.url,
                sessionId: existingSession.id,
                orderNumber: existingOrder.order_number,
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              }
            );
          }
        } catch (err) {
          console.log('[create-checkout-session] Existing session expired or invalid:', err);
        }
      }
    }

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

    // Create order in DB BEFORE payment (with pending_payment status)
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: input.customerEmail,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        pickup_address: input.pickupAddress,
        dropoff_address: input.dropoffAddress,
        distance: input.distance,
        package_weight: input.packageWeight,
        package_description: input.packageDescription,
        base_rate: input.baseRate,
        mileage_charge: input.mileageCharge,
        surcharge: input.surcharge,
        total_price: input.amount,
        status: 'pending_payment',
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error('[create-checkout-session] Order creation error:', orderError);
      throw new Error('Failed to create order');
    }

    console.log('[create-checkout-session] Order created:', newOrder.order_number);

    // Create checkout session with order_number
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
      success_url: `${req.headers.get('origin')}/thank-you?session_id={CHECKOUT_SESSION_ID}&order_number=${newOrder.order_number}`,
      cancel_url: `${req.headers.get('origin')}/quote`,
      metadata: {
        orderId: newOrder.id,
        orderNumber: newOrder.order_number,
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

    // Update order with stripe_session_id
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', newOrder.id);

    console.log('[create-checkout-session] Session created:', session.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: session.url,
        sessionId: session.id,
        orderNumber: newOrder.order_number,
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
