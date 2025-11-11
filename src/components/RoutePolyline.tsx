import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

interface RoutePolylineProps {
  encodedPath: string;
}

export const RoutePolyline = ({ encodedPath }: RoutePolylineProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !encodedPath) return;

    const polyline = new google.maps.Polyline({
      path: google.maps.geometry.encoding.decodePath(encodedPath),
      geodesic: true,
      strokeColor: "#3b82f6",
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [map, encodedPath]);

  return null;
};
