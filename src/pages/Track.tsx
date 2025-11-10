import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, CheckCircle, Truck, Clock } from "lucide-react";

const Track = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleTrack = () => {
    // Mock tracking data
    setTrackingData({
      orderNumber: orderNumber || "DEL-2025-001",
      status: "in-transit",
      pickup: "123 Main St, Chicago, IL",
      dropoff: "456 Oak Ave, Naperville, IL",
      driver: "Mike Johnson",
      estimatedDelivery: "2:30 PM",
      timeline: [
        { status: "Order Placed", time: "10:15 AM", completed: true },
        { status: "Driver Assigned", time: "10:30 AM", completed: true },
        { status: "Picked Up", time: "11:00 AM", completed: true },
        { status: "In Transit", time: "11:15 AM", completed: true },
        { status: "Out for Delivery", time: "2:00 PM", completed: false },
        { status: "Delivered", time: "Est. 2:30 PM", completed: false },
      ],
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Track Your Delivery</h1>
          <p className="text-muted-foreground">Enter your order number to see real-time updates</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input
                placeholder="Enter order number (e.g., DEL-2025-001)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleTrack} size="lg">
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>

        {trackingData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">Order #{trackingData.orderNumber}</CardTitle>
                    <Badge className="bg-info/10 text-info border-info/20">In Transit</Badge>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Pickup</p>
                      <p className="text-sm text-muted-foreground">{trackingData.pickup}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Dropoff</p>
                      <p className="text-sm text-muted-foreground">{trackingData.dropoff}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Driver: {trackingData.driver}</p>
                      <p className="text-sm text-muted-foreground">
                        Estimated delivery: {trackingData.estimatedDelivery}
                      </p>
                    </div>
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Delivery Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingData.timeline.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.completed
                              ? "bg-success text-success-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        {index < trackingData.timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-12 ${
                              item.completed ? "bg-success" : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className={`font-medium ${item.completed ? "" : "text-muted-foreground"}`}>
                          {item.status}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Track;
