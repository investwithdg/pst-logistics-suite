import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { RouteReplayMap } from "@/components/RouteReplayMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, History } from "lucide-react";
import { Link } from "react-router-dom";

const RouteReplay = () => {
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId");
  const [orderId, setOrderId] = useState(orderIdFromUrl || "");
  const [showMap, setShowMap] = useState(!!orderIdFromUrl);

  const handleViewReplay = () => {
    if (orderId) {
      setShowMap(true);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Route Replay</h1>
          </div>
          <p className="text-muted-foreground">
            View the complete historical path for completed deliveries
          </p>
        </div>

        {!showMap && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Enter Order ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter order ID (e.g., uuid)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleViewReplay} size="lg" disabled={!orderId}>
                  View Replay
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showMap && orderId && (
          <div>
            <RouteReplayMap orderId={orderId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteReplay;
