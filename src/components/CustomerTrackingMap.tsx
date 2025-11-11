import { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { supabase } from '@/integrations/supabase/client';
import { Truck } from 'lucide-react';
import { RoutePolyline } from './RoutePolyline';

interface CustomerTrackingMapProps {
  orderId: string;
}

interface OrderLocation {
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  driver_id: string | null;
}

interface DriverLocation {
  current_location_lat: number | null;
  current_location_lng: number | null;
}

export const CustomerTrackingMap = ({ orderId }: CustomerTrackingMapProps) => {
  const [orderData, setOrderData] = useState<OrderLocation | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [center, setCenter] = useState({ lat: 41.8781, lng: -87.6298 });
  const [routePolyline, setRoutePolyline] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  useEffect(() => {
    if (!orderData?.driver_id) return;

    fetchDriverLocation();

    // Subscribe to driver location updates
    const channel = supabase
      .channel(`driver-${orderData.driver_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers',
          filter: `id=eq.${orderData.driver_id}`,
        },
        (payload) => {
          setDriverLocation({
            current_location_lat: payload.new.current_location_lat,
            current_location_lng: payload.new.current_location_lng,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderData?.driver_id]);

  const fetchOrderData = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, driver_id')
      .eq('id', orderId)
      .single();

    if (!error && data) {
      setOrderData(data);
      
      // Set center to pickup location if available
      if (data.pickup_lat && data.pickup_lng) {
        setCenter({
          lat: Number(data.pickup_lat),
          lng: Number(data.pickup_lng),
        });
      }

      // Fetch route between pickup and dropoff
      if (data.pickup_lat && data.pickup_lng && data.dropoff_lat && data.dropoff_lng) {
        const { data: routeData } = await supabase.functions.invoke('get-directions', {
          body: {
            origin: `${data.pickup_lat},${data.pickup_lng}`,
            destination: `${data.dropoff_lat},${data.dropoff_lng}`,
          },
        });

        if (routeData?.success) {
          setRoutePolyline(routeData.data.polyline);
        }
      }
    }
  };

  const fetchDriverLocation = async () => {
    if (!orderData?.driver_id) return;

    const { data, error } = await supabase
      .from('drivers')
      .select('current_location_lat, current_location_lng')
      .eq('id', orderData.driver_id)
      .single();

    if (!error && data) {
      setDriverLocation(data);
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
    <APIProvider apiKey={apiKey} libraries={['geometry']}>
      <Map
        defaultCenter={center}
        defaultZoom={13}
        mapId="customer-tracking-map"
        style={{ width: '100%', height: '100%' }}
        gestureHandling="greedy"
      >
        {/* Route polyline */}
        {routePolyline && <RoutePolyline encodedPath={routePolyline} />}
        
        {/* Pickup marker */}
        {orderData?.pickup_lat && orderData?.pickup_lng && (
          <AdvancedMarker
            position={{
              lat: Number(orderData.pickup_lat),
              lng: Number(orderData.pickup_lng),
            }}
            title="Pickup Location"
          >
            <Pin background="#3b82f6" borderColor="#1e40af" glyphColor="#fff" />
          </AdvancedMarker>
        )}

        {/* Dropoff marker */}
        {orderData?.dropoff_lat && orderData?.dropoff_lng && (
          <AdvancedMarker
            position={{
              lat: Number(orderData.dropoff_lat),
              lng: Number(orderData.dropoff_lng),
            }}
            title="Dropoff Location"
          >
            <Pin background="#10b981" borderColor="#059669" glyphColor="#fff" />
          </AdvancedMarker>
        )}

        {/* Driver location marker */}
        {driverLocation?.current_location_lat && driverLocation?.current_location_lng && (
          <AdvancedMarker
            position={{
              lat: Number(driverLocation.current_location_lat),
              lng: Number(driverLocation.current_location_lng),
            }}
            title="Driver Location"
          >
            <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg animate-pulse">
              <Truck className="h-6 w-6" />
            </div>
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
};
