# Phase 2: Order Creation Before Payment - Setup Guide

## Overview
Phase 2 implements order creation BEFORE payment processing, enabling:
- ✅ Anonymous orders (no account required to checkout)
- ✅ Duplicate payment prevention
- ✅ Auto-cancellation of abandoned orders (30 min timeout)
- ✅ Invoice manual approval with optional auto-approve toggle
- ✅ Order tracking via order number on thank-you page

## What Was Implemented

### 1. Database Changes
- `customer_id` is now nullable (supports anonymous orders)
- Added `stripe_session_id` field to track payment sessions
- Added `invoice_approved_manually` flag for invoice workflow
- Created `admin_settings` table for global app settings
- Added indexes for performance and duplicate prevention

### 2. Edge Function Updates
- **`create-checkout-session`**: Now creates order BEFORE redirecting to Stripe
  - Checks for duplicate pending orders (last 30 mins)
  - Returns existing session if found
  - Creates new order with `pending_payment` status
  - Adds `order_number` to Stripe success URL

### 3. New Edge Function
- **`cleanup-abandoned-orders`**: Deletes orders stuck in `pending_payment` for >30 minutes
  - Should be scheduled as a cron job (see setup below)

### 4. Frontend Updates
- **ThankYou Page**: Now displays actual order number from URL params
- **Admin Settings Page**: Added invoice auto-approve toggle

## Required Setup Steps

### Step 1: Configure Make.com Webhook for Payment Success

The `stripe-payment-success` webhook handles order completion after Stripe confirms payment.

**Webhook Name**: `stripe-payment-success`  
**Trigger**: Stripe webhook → `checkout.session.completed`  
**Actions Required**:

1. **Create Make.com scenario** that:
   - Receives Stripe webhook data
   - Updates order in Supabase:
     ```
     UPDATE orders 
     SET status = 'pending',
         customer_id = <if_user_authenticated>
     WHERE stripe_session_id = {{stripe_session_id}}
     ```
   - Creates HubSpot Order object (Pipeline ID: `14a2e10e-5471-408a-906e-c51f3b04369e`)
   - Sends confirmation email to customer
   - Creates notification for dispatchers in Supabase `notifications` table

2. **Get webhook URL** from Make.com scenario (format: `https://hook.us1.make.com/xxxxx`)

3. **Update database** with webhook URL:
   - Navigate to: Backend → Database → `webhook_config` table
   - Find row where `webhook_name = 'stripe-payment-success'`
   - Update `webhook_url` field with your Make.com URL
   - Ensure `is_active = true`

4. **Configure Stripe webhook** in Stripe Dashboard:
   - Event: `checkout.session.completed`
   - Endpoint URL: Your Make.com webhook URL

### Step 2: Schedule Abandoned Order Cleanup

The `cleanup-abandoned-orders` function should run every 30 minutes via cron job.

**Option A: Use Make.com Scheduler**
1. Create new Make scenario with "Schedule" trigger (every 30 minutes)
2. Add HTTP module to call: `https://otxlvlxvodzqgwkbyknb.supabase.co/functions/v1/cleanup-abandoned-orders`
3. Method: POST
4. Headers: `apikey: <your_supabase_anon_key>`

**Option B: Use External Cron Service** (e.g., cron-job.org)
1. Create cron job with URL: `https://otxlvlxvodzqgwkbyknb.supabase.co/functions/v1/cleanup-abandoned-orders`
2. Schedule: Every 30 minutes
3. Add header: `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your Supabase anon key)

### Step 3: Configure Stripe Checkout Success URL

Ensure your Stripe account has the correct success URL configured:
- Success URL: `https://your-domain.com/thank-you?session_id={CHECKOUT_SESSION_ID}&order_number={ORDER_NUMBER}`

This is automatically set by the `create-checkout-session` function, but verify in Stripe Dashboard.

## Testing Checklist

### Test 1: Normal Order Flow
1. ✅ Go to `/quote` page
2. ✅ Fill in delivery details and calculate price
3. ✅ Click "Pay Now"
4. ✅ Complete Stripe checkout
5. ✅ Verify redirect to `/thank-you?order_number=ORD-xxx`
6. ✅ Verify order number displays correctly
7. ✅ Check database: order status should be `pending` (not `pending_payment`)

### Test 2: Duplicate Prevention
1. ✅ Start checkout process (don't complete payment)
2. ✅ Go back and start checkout again with same email
3. ✅ Verify you're redirected to the SAME Stripe session

### Test 3: Abandoned Order Cleanup
1. ✅ Start checkout process (don't complete payment)
2. ✅ Wait 31 minutes
3. ✅ Trigger cleanup function manually or wait for cron
4. ✅ Verify abandoned order is deleted from database

### Test 4: Invoice Settings
1. ✅ Log in as admin
2. ✅ Navigate to Settings
3. ✅ Toggle "Auto-approve invoices" switch
4. ✅ Click "Save Invoice Settings"
5. ✅ Verify setting persists after page refresh

## HubSpot Data Flow

```
Quote Page (Customer sees price)
    ↓
[Stripe Checkout Session Created]
    ↓
Order created in Supabase (status: pending_payment)
    ↓
Customer completes payment in Stripe
    ↓
[Stripe webhook → Make.com → stripe-payment-success]
    ↓
Order updated (status: pending)
    ↓
HubSpot Order created (Pipeline: 14a2e10e-5471-408a-906e-c51f3b04369e)
    ↓
Confirmation email sent
    ↓
Dispatcher notified
```

## Troubleshooting

### Order stuck in "pending_payment" status
- Check if Stripe webhook is configured correctly
- Verify Make.com scenario is active
- Check `webhook_config` table has correct URL
- Manually trigger cleanup function

### Order number not showing on thank-you page
- Check URL params: should have `?order_number=ORD-xxx`
- Verify `create-checkout-session` is returning `orderNumber` in response
- Check browser console for errors

### Invoice settings not saving
- Verify user has admin role in `user_roles` table
- Check RLS policies on `admin_settings` table
- Review browser console for API errors

## Next Steps (Phase 3+)
- [ ] Account creation flow for anonymous users
- [ ] Dispatch and delivery webhook updates
- [ ] Proof of delivery HubSpot integration
- [ ] Invoice generation trigger logic

---

**Questions?** Check logs in Backend → Edge Functions for detailed error messages.
