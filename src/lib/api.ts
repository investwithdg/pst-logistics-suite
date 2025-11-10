// Mock API helper for webhook calls
// Replace with actual API endpoints when backend is ready

const MOCK_DELAY = 800; // Simulate network delay

const mockDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

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
