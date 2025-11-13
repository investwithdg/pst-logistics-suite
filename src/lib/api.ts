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

      const result = await response.json();
      return result;
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
  try {
    const { data, error } = await supabase
      .from('webhook_config')
      .select('webhook_url, is_active')
      .eq('webhook_name', webhookName)
      .eq('webhook_type', 'make-webhook')
      .single();

    if (error) {
      console.error(`[Webhook Config] Error fetching ${webhookName}:`, error);
      return null;
    }

    if (!data?.is_active) {
      console.warn(`[Webhook Config] ${webhookName} is not active`);
      return null;
    }

    if (!data?.webhook_url) {
      console.warn(`[Webhook Config] ${webhookName} URL not configured`);
      return null;
    }

    return data.webhook_url;
  } catch (error) {
    console.error(`[Webhook Config] Unexpected error for ${webhookName}:`, error);
    return null;
  }
}

// API helper functions - now routing to appropriate webhook type
export const api = {
  // Edge Functions (Simple DB operations)
  calculateQuote: async (data: any): Promise<ApiResponse> => {
    return callWebhook('calculate-quote', data, 'edge-function');
  },

  trackOrder: async (orderNumber: string): Promise<ApiResponse> => {
    return callWebhook('track-order', { orderNumber }, 'edge-function');
  },

  updateDriverStatus: async (driverId: string, status: string): Promise<ApiResponse> => {
    return callWebhook('driver-status', { driverId, status }, 'edge-function');
  },

  driverJobAction: async (orderId: string, action: 'accept' | 'decline'): Promise<ApiResponse> => {
    return callWebhook('driver-job-action', { orderId, action }, 'edge-function');
  },

  updateDriverLocation: async (driverId: string, lat: number, lng: number): Promise<ApiResponse> => {
    return callWebhook('driver-location', { driverId, lat, lng }, 'edge-function');
  },

  fetchDriverEarnings: async (driverId: string): Promise<ApiResponse> => {
    return callWebhook('driver-earnings', { driverId }, 'edge-function');
  },

  updatePricing: async (pricingData: any): Promise<ApiResponse> => {
    return callWebhook('update-pricing', pricingData, 'edge-function');
  },

  fetchNotifications: async (userId: string): Promise<ApiResponse> => {
    return callWebhook('fetch-notifications', { userId }, 'edge-function');
  },

  markNotificationRead: async (notificationId: string): Promise<ApiResponse> => {
    return callWebhook('mark-notification-read', { notificationId }, 'edge-function');
  },

  fetchOrders: async (filters?: any): Promise<ApiResponse> => {
    return callWebhook('fetch-orders', filters, 'edge-function');
  },

  updateDeliveryInstructions: async (orderId: string, instructions: string): Promise<ApiResponse> => {
    return callWebhook('update-delivery-instructions', { orderId, instructions }, 'edge-function');
  },

  // Make.com Webhooks (Complex orchestration)
  processPayment: async (data: any): Promise<ApiResponse> => {
    return callWebhook('create-checkout-session', data, 'edge-function');
  },

  assignDriver: async (data: { orderId: string; driverId: string }): Promise<ApiResponse> => {
    return callWebhook('assign-driver', data, 'make-webhook');
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
