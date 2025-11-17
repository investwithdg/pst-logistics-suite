// API helper for webhook calls
// Supports both Supabase Edge Functions and Make.com webhooks

import { supabase } from '@/integrations/supabase/client';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  retryable?: boolean;
  url?: string;
  sessionId?: string;
  orderNumber?: string;
}

type WebhookType = 'edge-function' | 'make-webhook';

// Generic webhook caller supporting both edge functions and Make.com
export const callWebhook = async <T = any>(
  functionName: string,
  data?: any,
  type: WebhookType = 'edge-function'
): Promise<ApiResponse<T>> => {
  try {
    if (type === 'edge-function') {
      // Call Supabase Edge Function using invoke
      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body: data,
      });

      if (error) {
        console.error(`[Edge Function Error] ${functionName}:`, error);
        return {
          success: false,
          error: error.message || 'Edge function call failed',
          retryable: true,
        };
      }

      return result || { success: true };
    } else {
      // Call Make.com webhook using fetch
      // Get webhook URL from config (will be implemented in Phase 2)
      const webhookUrl = await getWebhookUrl(functionName);
      
      if (!webhookUrl) {
        return {
          success: false,
          error: `Webhook URL not configured for: ${functionName}`,
          retryable: false,
        };
      }

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json().catch(() => null);

      if (result && typeof result === 'object' && 'success' in result) {
        return result;
      }

      return {
        success: true,
        data: result ?? undefined,
      };
    }
  } catch (error: any) {
    console.error(`[Webhook Error] ${functionName}:`, error);
    return {
      success: false,
      error: error.message || 'Network error occurred',
      retryable: true,
    };
  }
};

// Helper to get webhook URL from configuration
async function getWebhookUrl(webhookName: string): Promise<string | null> {
  let record: { webhook_url?: string | null; is_active?: boolean | null } | null = null;

  try {
    const { data, error } = await supabase
      .from('webhook_config')
      .select('webhook_url, is_active')
      .eq('webhook_name', webhookName)
      .eq('webhook_type', 'make-webhook')
      .single();

    if (error) {
      console.error(`[Webhook Config] Error fetching ${webhookName}:`, error);
    } else {
      record = data;
    }
  } catch (error) {
    console.error(`[Webhook Config] Unexpected error for ${webhookName}:`, error);
  }

  if (record?.is_active && record?.webhook_url) {
    return record.webhook_url;
  }

  // Fallback: read webhook URL from environment if DB is missing/inactive
  const envUrl = getEnvWebhookUrl(webhookName);
  if (envUrl) {
    console.warn(`[Webhook Config] Using env fallback for ${webhookName}`);
    return envUrl;
  }

  if (record && record.is_active === false) {
    console.warn(`[Webhook Config] ${webhookName} is not active`);
  } else {
    console.warn(`[Webhook Config] ${webhookName} URL not configured`);
  }

  return null;
}

// Helper: resolve Make webhook URL from environment variables as a fallback.
// For a webhookName like "quote-accepted", it will look for:
// VITE_MAKE_QUOTE_ACCEPTED_URL
function getEnvWebhookUrl(webhookName: string): string | null {
  try {
    const env = import.meta.env as Record<string, string | undefined>;
    const key = `VITE_MAKE_${webhookName.replace(/-/g, '_').toUpperCase()}_URL`;
    const candidate = env?.[key];
    if (candidate && /^https?:\/\//i.test(candidate)) {
      return candidate;
    }
    return null;
  } catch {
    return null;
  }
}

// API helper functions - now routing to appropriate webhook type
export const api = {
  // Edge Functions (Simple DB operations)
  calculateQuote: async (data: any): Promise<ApiResponse> => {
    return callWebhook('calculate-quote', data, 'edge-function');
  },

  // Make.com Webhooks (Complex orchestration)
  // Step I: Quote Accepted -> Create Contact + Deal
  quoteAccepted: async (data: any): Promise<ApiResponse> => {
    return callWebhook('quote-accepted', data, 'make-webhook');
  },

  processPayment: async (data: any): Promise<ApiResponse> => {
    return callWebhook('process-payment', data, 'make-webhook');
  },

  assignDriver: async (data: { orderId: string; driverId: string }): Promise<ApiResponse> => {
    const result = await callWebhook('assign-driver', data, 'make-webhook');
    
    // Sync driver assignment to HubSpot after successful assignment
    if (result.success) {
      await callWebhook('sync-driver-assignment', data, 'edge-function');
    }
    
    return result;
  },

  updateStatus: async (data: { orderId: string; status: string }): Promise<ApiResponse> => {
    return callWebhook('update-status', data, 'make-webhook');
  },

  submitProof: async (data: any): Promise<ApiResponse> => {
    return callWebhook('submit-proof', data, 'make-webhook');
  },

  cancelOrder: async (orderId: string, reason: string): Promise<ApiResponse> => {
    return callWebhook('cancel-order', { orderId, reason }, 'make-webhook');
  },

  refundOrder: async (orderId: string): Promise<ApiResponse> => {
    return callWebhook('refund-order', { orderId }, 'make-webhook');
  },

  reassignDriver: async (orderId: string, newDriverId: string): Promise<ApiResponse> => {
    return callWebhook('reassign-driver', { orderId, newDriverId }, 'make-webhook');
  },
};
