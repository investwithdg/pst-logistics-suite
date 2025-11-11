import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { supabase } from "@/integrations/supabase/client";
import { RoutePolyline } from "./RoutePolyline";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Play, Pause, RotateCcw, MapPin, Flag } from "lucide-react";
import { Slider } from "./ui/slider";

interface Waypoint {
  id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
  speed?: number;
  heading?: number;
}

interface RouteReplayMapProps {
  orderId: string;
}

export const RouteReplayMap = ({ orderId }: RouteReplayMapProps) => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [order, setOrder] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [routePolyline, setRoutePolyline] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    fetchRouteHistory();
  }, [orderId]);

  useEffect(() => {
    if (isPlaying && currentIndex < waypoints.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 1000); // Move to next waypoint every second
      return () => clearTimeout(timer);
    } else if (currentIndex >= waypoints.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIndex, waypoints.length]);

  useEffect(() => {
    if (order?.pickup_lat && order?.dropoff_lat) {
      fetchRoute();
    }
  }, [order]);

  const fetchRouteHistory = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-route-history', {
        body: { orderId }
      });

      if (error) throw error;

      if (data.success) {
        setWaypoints(data.data.waypoints);
        setOrder(data.data.order);
      }
    } catch (error) {
      console.error('Error fetching route history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoute = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-directions', {
        body: {
          origin: `${order.pickup_lat},${order.pickup_lng}`,
          destination: `${order.dropoff_lat},${order.dropoff_lng}`
        }
      });

      if (error) throw error;
      if (data.success) {
        setRoutePolyline(data.data.polyline);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const handleSliderChange = (value: number[]) => {
    setCurrentIndex(value[0]);
    setIsPlaying(false);
  };

  if (!apiKey) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">Google Maps API key not configured</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">Loading route history...</p>
      </div>
    );
  }

  if (!waypoints.length) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No route history available for this delivery</p>
      </div>
    );
  }

  const currentWaypoint = waypoints[currentIndex];
  const center = { lat: currentWaypoint.latitude, lng: currentWaypoint.longitude };

  return (
    <div className="space-y-4">
      <APIProvider apiKey={apiKey} libraries={['geometry']}>
        <div className="h-[500px] rounded-lg overflow-hidden border">
          <Map
            defaultZoom={13}
            center={center}
            mapId="route-replay-map"
            gestureHandling="greedy"
          >
            {routePolyline && <RoutePolyline encodedPath={routePolyline} />}
            
            {/* Pickup marker */}
            {order && (
              <AdvancedMarker position={{ lat: order.pickup_lat, lng: order.pickup_lng }}>
                <Pin background="hsl(var(--primary))" borderColor="white" glyphColor="white">
                  <MapPin className="h-4 w-4" />
                </Pin>
              </AdvancedMarker>
            )}

            {/* Dropoff marker */}
            {order && (
              <AdvancedMarker position={{ lat: order.dropoff_lat, lng: order.dropoff_lng }}>
                <Pin background="hsl(var(--success))" borderColor="white" glyphColor="white">
                  <Flag className="h-4 w-4" />
                </Pin>
              </AdvancedMarker>
            )}

            {/* Current position marker */}
            <AdvancedMarker position={center}>
              <div className="relative">
                <div className="absolute inset-0 bg-info rounded-full animate-ping opacity-75" style={{ width: '20px', height: '20px' }} />
                <div className="relative bg-info rounded-full border-2 border-white shadow-lg" style={{ width: '20px', height: '20px' }} />
              </div>
            </AdvancedMarker>
          </Map>
        </div>
      </APIProvider>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={handlePlayPause}
                variant="outline"
                size="icon"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="icon"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(currentWaypoint.recorded_at).toLocaleTimeString()}
            </div>
          </div>

          <div className="space-y-2">
            <Slider
              value={[currentIndex]}
              onValueChange={handleSliderChange}
              max={waypoints.length - 1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Waypoint {currentIndex + 1} of {waypoints.length}</span>
              {currentWaypoint.speed && (
                <span>{currentWaypoint.speed.toFixed(1)} mph</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Start Time</p>
              <p className="text-sm font-medium">
                {new Date(waypoints[0].recorded_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">End Time</p>
              <p className="text-sm font-medium">
                {new Date(waypoints[waypoints.length - 1].recorded_at).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
