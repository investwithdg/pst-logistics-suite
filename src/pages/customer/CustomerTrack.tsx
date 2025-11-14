import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerTrackingMap } from "@/components/CustomerTrackingMap";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CustomerTrack = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      toast({
        title: "Order number required",
        description: "Please enter an order number to track",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber.trim())
        .single();

      if (error || !data) {
        toast({
          title: "Order not found",
          description: "No order found with this number",
          variant: "destructive",
        });
        setTrackingOrder(null);
        return;
      }

      setTrackingOrder(data);
      toast({
        title: "Order found",
        description: `Tracking order ${data.order_number}`,
      });
    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: "Error",
        description: "Failed to track order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Track Order</h1>
        <p className="text-muted-foreground">Enter your order number to track your delivery</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter order number (e.g., ORD-2025-01-14-abc123)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Track"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {trackingOrder && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-medium">{trackingOrder.order_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{trackingOrder.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Address</p>
                    <p className="font-medium">{trackingOrder.pickup_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dropoff Address</p>
                    <p className="font-medium">{trackingOrder.dropoff_address}</p>
                  </div>
                  {trackingOrder.driver_name && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Driver</p>
                        <p className="font-medium">{trackingOrder.driver_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Driver Phone</p>
                        <p className="font-medium">{trackingOrder.driver_phone}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] rounded-lg overflow-hidden">
                  <CustomerTrackingMap orderId={trackingOrder.id} />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerTrack;
