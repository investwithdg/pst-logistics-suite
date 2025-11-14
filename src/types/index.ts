export type OrderStatus = 
  | "pending" 
  | "assigned" 
  | "picked-up" 
  | "in-transit" 
  | "delivered" 
  | "completed";

export type UserRole = "customer" | "dispatcher" | "driver" | "admin";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  status: "available" | "busy" | "offline";
  currentLocation?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  distance: number;
  packageWeight: number;
  packageDescription: string;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery?: string;
  assignedAt?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  baseRate: number;
  mileageCharge: number;
  surcharge: number;
  totalPrice: number;
  specialInstructions?: string;
  
  // Customer-facing fields
  scheduledPickupTime?: string;
  scheduledDeliveryTime?: string;
  deliveryType?: string;
  vehicleTypeRequired?: string;
  rushRequested?: boolean;
  numberOfStops?: number;
  
  // Driver-facing fields
  deliveryExceptionType?: string;
  deliveryExceptionNotes?: string;
  driverFeedback?: string;
  driverContactedCustomer?: boolean;
  
  // Admin/Dispatcher fields
  dealPipelineStage?: string;
  deliveryResolutionStatus?: string;
  quoteStatus?: string;
  paymentStatus?: string;
  pricingMode?: string;
  quoteSent?: boolean;
  invoiceSent?: boolean;
  deliveryRoute?: any;
  recurringFrequency?: string;
  
  proofOfDelivery?: {
    photo?: string;
    signature?: string;
    notes?: string;
    timestamp: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

export interface Quote {
  pickupAddress: string;
  dropoffAddress: string;
  distance: number;
  packageWeight: number;
  packageDescription: string;
  baseRate: number;
  mileageCharge: number;
  surcharge: number;
  totalPrice: number;
}
