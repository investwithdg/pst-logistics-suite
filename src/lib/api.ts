// API helper for webhook calls
// Webhooks will be implemented as edge functions

import { supabase } from '@/integrations/supabase/client';

const MOCK_DELAY = 800; // Simulate network delay for now
const mockDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  retryable?: boolean;
}

// Generic webhook caller with auth headers
export const callWebhook = async <T = any>(
  endpoint: string,
  data?: any,
  method: 'GET' | 'POST' = 'POST'
): Promise<ApiResponse<T>> => {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error(`[Webhook Error] ${endpoint}:`, error);
    return {
      success: false,
      error: error.message || 'Network error occurred',
      retryable: true,
    };
  }
};

export const api = {
  calculateQuote: async (data: any): Promise<ApiResponse> => {
    console.log('[API] POST /api/webhooks/calculate-quote', data);
    await mockDelay();
    return {
      success: true,
      data: {
        baseRate: 25,
        mileageCharge: data.distance * 2.5,
        surcharge: data.packageWeight > 50 ? 15 : 0,
        totalPrice: 25 + (data.distance * 2.5) + (data.packageWeight > 50 ? 15 : 0)
      }
    };
  },

  processPayment: async (data: any): Promise<ApiResponse> => {
    console.log('[API] POST /api/webhooks/process-payment', data);
    await mockDelay();
    return {
      success: true,
      data: { orderId: `ORD-${Date.now()}` }
    };
  },

  assignDriver: async (data: { orderId: string; driverId: string }): Promise<ApiResponse> => {
    console.log('[API] POST /api/webhooks/assign-driver', data);
    await mockDelay();
    return { success: true };
  },

  updateStatus: async (data: { orderId: string; status: string }): Promise<ApiResponse> => {
    console.log('[API] POST /api/webhooks/update-status', data);
    await mockDelay();
    return { success: true };
  },

  updatePickup: async (data: { orderId: string }): Promise<ApiResponse> => {
    console.log('[API] POST /api/webhooks/update-pickup', data);
    await mockDelay();
    return { success: true };
  },

  updateDelivery: async (data: { orderId: string }): Promise<ApiResponse> => {
    console.log('[API] POST /api/webhooks/update-delivery', data);
    await mockDelay();
    return { success: true };
  },

  submitProof: async (data: any): Promise<ApiResponse> => {
    console.log('[API] POST /api/webhooks/submit-proof', data);
    await mockDelay();
    return { success: true };
  },

  fetchOrders: async (role: string): Promise<ApiResponse> => {
    console.log('[API] GET /api/data/' + role);
    await mockDelay();
    return { success: true, data: [] };
  }
};
