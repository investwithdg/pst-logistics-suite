import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, Driver, Notification, UserRole, OrderStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface AppContextType {
  currentUser: { id: string; name: string; role: UserRole } | null;
  orders: Order[];
  drivers: Driver[];
  notifications: Notification[];
  loading: boolean;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userRole } = useAuth();
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: UserRole } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Set current user based on auth user and role
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!user || !userRole) {
        setCurrentUser(null);
        return;
      }

      // For drivers, fetch their name from the drivers table
      if (userRole === 'driver') {
        const { data: driverData } = await supabase
          .from('drivers')
          .select('name')
          .eq('id', user.id)
          .single();

        setCurrentUser({
          id: user.id,
          name: driverData?.name || user.email || 'Driver',
          role: userRole as UserRole,
        });
      } else {
        setCurrentUser({
          id: user.id,
          name: user.email || 'User',
          role: userRole as UserRole,
        });
      }
    };

    loadCurrentUser();
  }, [user, userRole]);

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setOrders(data.map((order: any) => ({
          id: order.id,
          customerId: order.customer_id,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          pickupAddress: order.pickup_address,
          dropoffAddress: order.dropoff_address,
          distance: order.distance,
          packageWeight: order.package_weight,
          packageDescription: order.package_description,
          status: order.status as OrderStatus,
          createdAt: order.created_at,
          estimatedDelivery: order.estimated_delivery,
          driverId: order.driver_id,
          driverName: order.driver_name,
          driverPhone: order.driver_phone,
          baseRate: order.base_rate,
          mileageCharge: order.mileage_charge,
          surcharge: order.surcharge,
          totalPrice: order.total_price,
        })));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  // Fetch drivers from Supabase
  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('name');

      if (error) throw error;
      
      if (data) {
        setDrivers(data.map(driver => ({
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          vehicleType: driver.vehicle_type,
          status: driver.status as 'available' | 'busy' | 'offline',
          currentLocation: driver.current_location,
        })));
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    }
  };

  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      if (data) {
        setNotifications(data.map(notif => ({
          id: notif.id,
          userId: notif.user_id,
          message: notif.message,
          timestamp: notif.created_at,
          read: notif.read,
          type: notif.type as 'info' | 'success' | 'warning',
        })));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOrders(),
        fetchDrivers(),
        fetchNotifications(),
      ]);
      setLoading(false);
      setLastUpdated(new Date());
    };

    loadData();
  }, [currentUser]);

  // Set up real-time subscriptions
  useEffect(() => {
    console.log('[AppContext] Setting up real-time subscriptions');

    // Subscribe to orders changes
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('[Real-time] Orders change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newOrder: any = payload.new;
            setOrders(prev => [{
              id: newOrder.id,
              customerId: newOrder.customer_id,
              customerName: newOrder.customer_name,
              customerPhone: newOrder.customer_phone,
              pickupAddress: newOrder.pickup_address,
              dropoffAddress: newOrder.dropoff_address,
              distance: newOrder.distance,
              packageWeight: newOrder.package_weight,
              packageDescription: newOrder.package_description,
              status: newOrder.status as OrderStatus,
              createdAt: newOrder.created_at,
              estimatedDelivery: newOrder.estimated_delivery,
              driverId: newOrder.driver_id,
              driverName: newOrder.driver_name,
              driverPhone: newOrder.driver_phone,
              baseRate: newOrder.base_rate,
              mileageCharge: newOrder.mileage_charge,
              surcharge: newOrder.surcharge,
              totalPrice: newOrder.total_price,
            }, ...prev]);
            toast.success('New order received');
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder: any = payload.new;
            setOrders(prev => prev.map(o => 
              o.id === updatedOrder.id ? {
                id: updatedOrder.id,
                customerId: updatedOrder.customer_id,
                customerName: updatedOrder.customer_name,
                customerPhone: updatedOrder.customer_phone,
                pickupAddress: updatedOrder.pickup_address,
                dropoffAddress: updatedOrder.dropoff_address,
                distance: updatedOrder.distance,
                packageWeight: updatedOrder.package_weight,
                packageDescription: updatedOrder.package_description,
                status: updatedOrder.status as OrderStatus,
                createdAt: updatedOrder.created_at,
                estimatedDelivery: updatedOrder.estimated_delivery,
                driverId: updatedOrder.driver_id,
                driverName: updatedOrder.driver_name,
                driverPhone: updatedOrder.driver_phone,
                baseRate: updatedOrder.base_rate,
                mileageCharge: updatedOrder.mileage_charge,
                surcharge: updatedOrder.surcharge,
                totalPrice: updatedOrder.total_price,
              } : o
            ));
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
          
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    // Subscribe to drivers changes
    const driversChannel = supabase
      .channel('drivers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drivers' },
        (payload) => {
          console.log('[Real-time] Drivers change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newDriver = payload.new as any;
            setDrivers(prev => [...prev, {
              id: newDriver.id,
              name: newDriver.name,
              phone: newDriver.phone,
              vehicleType: newDriver.vehicle_type,
              status: newDriver.status,
              currentLocation: newDriver.current_location,
            }]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedDriver = payload.new as any;
            setDrivers(prev => prev.map(d => 
              d.id === updatedDriver.id ? {
                id: updatedDriver.id,
                name: updatedDriver.name,
                phone: updatedDriver.phone,
                vehicleType: updatedDriver.vehicle_type,
                status: updatedDriver.status,
                currentLocation: updatedDriver.current_location,
              } : d
            ));
          } else if (payload.eventType === 'DELETE') {
            setDrivers(prev => prev.filter(d => d.id !== payload.old.id));
          }
          
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    // Subscribe to notifications changes (only if user is logged in)
    let notificationsChannel: any = null;
    if (currentUser) {
      notificationsChannel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${currentUser.id}`,
          },
          (payload) => {
            console.log('[Real-time] Notifications change:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newNotif = payload.new as any;
              setNotifications(prev => [{
                id: newNotif.id,
                userId: newNotif.user_id,
                message: newNotif.message,
                timestamp: newNotif.created_at,
                read: newNotif.read,
                type: newNotif.type,
              }, ...prev]);
              
              toast.info(newNotif.message);
            } else if (payload.eventType === 'UPDATE') {
              const updatedNotif = payload.new as any;
              setNotifications(prev => prev.map(n => 
                n.id === updatedNotif.id ? {
                  id: updatedNotif.id,
                  userId: updatedNotif.user_id,
                  message: updatedNotif.message,
                  timestamp: updatedNotif.created_at,
                  read: updatedNotif.read,
                  type: updatedNotif.type,
                } : n
              ));
            }
          }
        )
        .subscribe();
    }

    // Cleanup subscriptions
    return () => {
      console.log('[AppContext] Cleaning up subscriptions');
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(driversChannel);
      if (notificationsChannel) {
        supabase.removeChannel(notificationsChannel);
      }
    };
  }, [currentUser]);

  const addOrder = async (order: Order) => {
    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          customer_id: order.customerId,
          customer_name: order.customerName,
          customer_email: order.customerPhone, // TODO: Add email field to Order type
          customer_phone: order.customerPhone,
          pickup_address: order.pickupAddress,
          dropoff_address: order.dropoffAddress,
          distance: order.distance,
          package_weight: order.packageWeight,
          package_description: order.packageDescription,
          base_rate: order.baseRate,
          mileage_charge: order.mileageCharge,
          surcharge: order.surcharge,
          total_price: order.totalPrice,
          status: order.status,
          estimated_delivery: order.estimatedDelivery,
        }]);

      if (error) throw error;
      
      toast.success('Order created successfully');
      // Real-time subscription will handle updating the UI
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error('Failed to create order');
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      // Optimistic update
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      ));

      const { error } = await supabase
        .from('orders')
        .update({
          status: updates.status,
          driver_id: updates.driverId,
          driver_name: updates.driverName,
          driver_phone: updates.driverPhone,
          assigned_at: updates.status === 'assigned' ? new Date().toISOString() : undefined,
          picked_up_at: updates.status === 'picked-up' ? new Date().toISOString() : undefined,
          in_transit_at: updates.status === 'in-transit' ? new Date().toISOString() : undefined,
          delivered_at: updates.status === 'delivered' ? new Date().toISOString() : undefined,
          completed_at: updates.status === 'completed' ? new Date().toISOString() : undefined,
        })
        .eq('id', orderId);

      if (error) throw error;

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
      // Revert optimistic update
      await fetchOrders();
    }
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    const order = orders.find(o => o.id === orderId);
    
    if (!driver || !order) return;

    try {
      // Update order with driver info
      await updateOrder(orderId, {
        status: 'assigned',
        driverId: driver.id,
        driverName: driver.name,
        driverPhone: driver.phone,
      });

      // Update driver status to busy
      const { error: driverError } = await supabase
        .from('drivers')
        .update({ status: 'busy' })
        .eq('id', driverId);

      if (driverError) throw driverError;

      // Create notifications for customer and driver
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: order.customerId,
            message: `Driver ${driver.name} has been assigned to your order ${orderId}`,
            type: 'info',
          },
          {
            user_id: driverId,
            message: `New job assigned: ${order.pickupAddress} → ${order.dropoffAddress}`,
            type: 'info',
          },
        ]);

      toast.success('Driver assigned successfully');
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Failed to assign driver');
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    try {
      await updateOrder(orderId, { status });

      const statusMessages: Record<OrderStatus, string> = {
        'pending': 'Order received and pending assignment',
        'assigned': 'Driver assigned to your order',
        'picked-up': 'Package has been picked up',
        'in-transit': 'Package is out for delivery',
        'delivered': 'Package has been delivered',
        'completed': 'Delivery completed',
      };

      // Create notification for customer
      await supabase
        .from('notifications')
        .insert([{
          user_id: order.customerId,
          message: statusMessages[status],
          type: status === 'delivered' ? 'success' : 'info',
          order_id: orderId,
        }]);

      // When delivery completes, free the driver
      if ((status === 'delivered' || status === 'completed') && order.driverId) {
        await supabase
          .from('drivers')
          .update({ status: 'available' })
          .eq('id', order.driverId);
      }

      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notification.userId,
          message: notification.message,
          type: notification.type,
          read: notification.read,
        }]);

      if (error) throw error;
      
      // Real-time subscription will handle updating the UI
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update
      await fetchNotifications();
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchOrders(),
      fetchDrivers(),
      fetchNotifications(),
    ]);
    setLastUpdated(new Date());
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        orders,
        drivers,
        notifications,
        loading,
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
