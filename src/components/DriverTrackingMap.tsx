import { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { supabase } from '@/integrations/supabase/client';
import { Truck, MapPin } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  status: string;
  current_location_lat: number | null;
  current_location_lng: number | null;
  vehicle_type: string;
}

interface Order {
  id: string;
  order_number: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  status: string;
  driver_id: string | null;
}

export const DriverTrackingMap = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [center, setCenter] = useState({ lat: 41.8781, lng: -87.6298 }); // Chicago default

  useEffect(() => {
    fetchDrivers();
    fetchActiveOrders();

    // Subscribe to driver location updates
    const driversChannel = supabase
      .channel('driver-locations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers',
        },
        (payload) => {
          setDrivers((prev) =>
            prev.map((driver) =>
              driver.id === payload.new.id
                ? { ...driver, ...payload.new }
                : driver
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(driversChannel);
    };
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'available')
      .not('current_location_lat', 'is', null)
      .not('current_location_lng', 'is', null);

    if (!error && data) {
      setDrivers(data);
      
      // Set center to first driver with location
      if (data.length > 0 && data[0].current_location_lat && data[0].current_location_lng) {
        setCenter({
          lat: Number(data[0].current_location_lat),
          lng: Number(data[0].current_location_lng),
        });
      }
    }
  };

  const fetchActiveOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['assigned', 'picked-up', 'in-transit'])
      .not('pickup_lat', 'is', null)
      .not('pickup_lng', 'is', null);

    if (!error && data) {
      setOrders(data);
    }
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={11}
        mapId="driver-tracking-map"
        style={{ width: '100%', height: '100%' }}
        gestureHandling="greedy"
      >
        {/* Driver markers */}
        {drivers.map((driver) => {
          if (!driver.current_location_lat || !driver.current_location_lng) return null;
          
          return (
            <AdvancedMarker
              key={driver.id}
              position={{
                lat: Number(driver.current_location_lat),
                lng: Number(driver.current_location_lng),
              }}
              title={`${driver.name} - ${driver.vehicle_type}`}
            >
              <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                <Truck className="h-5 w-5" />
              </div>
            </AdvancedMarker>
          );
        })}

        {/* Order pickup markers */}
        {orders.map((order) => {
          if (!order.pickup_lat || !order.pickup_lng) return null;
          
          return (
            <AdvancedMarker
              key={`pickup-${order.id}`}
              position={{
                lat: Number(order.pickup_lat),
                lng: Number(order.pickup_lng),
              }}
              title={`Pickup: ${order.order_number}`}
            >
              <Pin background="#3b82f6" borderColor="#1e40af" glyphColor="#fff" />
            </AdvancedMarker>
          );
        })}

        {/* Order dropoff markers */}
        {orders.map((order) => {
          if (!order.dropoff_lat || !order.dropoff_lng) return null;
          
          return (
            <AdvancedMarker
              key={`dropoff-${order.id}`}
              position={{
                lat: Number(order.dropoff_lat),
                lng: Number(order.dropoff_lng),
              }}
              title={`Dropoff: ${order.order_number}`}
            >
              <Pin background="#10b981" borderColor="#059669" glyphColor="#fff" />
            </AdvancedMarker>
          );
        })}
      </Map>
    </APIProvider>
  );
};
