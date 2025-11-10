import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, Driver, Notification, UserRole, OrderStatus } from '@/types';

interface AppContextType {
  currentUser: { id: string; name: string; role: UserRole } | null;
  orders: Order[];
  drivers: Driver[];
  notifications: Notification[];
  setCurrentUser: (user: { id: string; name: string; role: UserRole } | null) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  assignDriver: (orderId: string, driverId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (notificationId: string) => void;
  refreshData: () => void;
  lastUpdated: Date;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MOCK_DRIVERS: Driver[] = [
  { id: 'D1', name: 'Mike Johnson', phone: '555-0101', vehicleType: 'Van', status: 'available' },
  { id: 'D2', name: 'Sarah Williams', phone: '555-0102', vehicleType: 'Box Truck', status: 'available' },
  { id: 'D3', name: 'James Brown', phone: '555-0103', vehicleType: 'Cargo Van', status: 'busy' },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2025-001',
    customerId: 'C1',
    customerName: 'John Smith',
    customerPhone: '555-1234',
    pickupAddress: '123 Main St, Chicago, IL 60601',
    dropoffAddress: '456 Oak Ave, Naperville, IL 60540',
    distance: 28,
    packageWeight: 35,
    packageDescription: 'Office supplies',
    status: 'pending',
    createdAt: new Date().toISOString(),
    baseRate: 25,
    mileageCharge: 70,
    surcharge: 0,
    totalPrice: 95,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: UserRole } | null>(null);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate periodic data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const addOrder = (order: Order) => {
    setOrders(prev => [...prev, order]);
    setLastUpdated(new Date());
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
    setLastUpdated(new Date());
  };

  const assignDriver = (orderId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      updateOrder(orderId, {
        status: 'assigned',
        driverId: driver.id,
        driverName: driver.name,
        driverPhone: driver.phone,
      });
      // Mark driver as busy when assigned
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'busy' } : d));
      
      // Add notifications
      const order = orders.find(o => o.id === orderId);
      if (order) {
        addNotification({
          userId: order.customerId,
          message: `Driver ${driver.name} has been assigned to your order ${orderId}`,
          read: false,
          type: 'info',
        });
        addNotification({
          userId: driverId,
          message: `New job assigned: ${order.pickupAddress} → ${order.dropoffAddress}`,
          read: false,
          type: 'info',
        });
      }
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrder(orderId, { status });
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const statusMessages: Record<OrderStatus, string> = {
        'pending': 'Order received and pending assignment',
        'assigned': 'Driver assigned to your order',
        'picked-up': 'Package has been picked up',
        'in-transit': 'Package is out for delivery',
        'delivered': 'Package has been delivered',
        'completed': 'Delivery completed',
      };
      
      addNotification({
        userId: order.customerId,
        message: statusMessages[status],
        read: false,
        type: status === 'delivered' ? 'success' : 'info',
      });

      // When delivery completes, free the driver
      if ((status === 'delivered' || status === 'completed') && order.driverId) {
        setDrivers(prev => prev.map(d => d.id === order.driverId ? { ...d, status: 'available' } : d));
      }
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `N-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const refreshData = () => {
    setLastUpdated(new Date());
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        orders,
        drivers,
        notifications,
        setCurrentUser,
        addOrder,
        updateOrder,
        assignDriver,
        updateOrderStatus,
        addNotification,
        markNotificationRead,
        refreshData,
        lastUpdated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
