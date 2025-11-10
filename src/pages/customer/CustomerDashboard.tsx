import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, Clock, Eye } from "lucide-react";

const mockOrders = [
  {
    id: "DEL-2025-001",
    pickup: "123 Main St, Chicago, IL",
    dropoff: "456 Oak Ave, Naperville, IL",
    status: "in-transit",
    driver: "Mike Johnson",
    estimatedDelivery: "2:30 PM",
    amount: 52.50,
  },
  {
    id: "DEL-2025-002",
    pickup: "789 Elm St, Chicago, IL",
    dropoff: "321 Pine Rd, Aurora, IL",
    status: "pending",
    driver: null,
    estimatedDelivery: "4:00 PM",
    amount: 67.25,
  },
  {
    id: "DEL-2024-098",
    pickup: "555 Market St, Chicago, IL",
    dropoff: "888 Lake Dr, Evanston, IL",
    status: "delivered",
    driver: "Sarah Williams",
    deliveredAt: "Dec 15, 2024",
    amount: 45.00,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-warning/10 text-warning border-warning/20";
    case "in-transit":
      return "bg-info/10 text-info border-info/20";
    case "delivered":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const CustomerDashboard = () => {
  const activeOrders = mockOrders.filter(o => o.status !== "delivered");
  const completedOrders = mockOrders.filter(o => o.status === "delivered");

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation userRole="customer" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Deliveries</h1>
          <p className="text-muted-foreground">Track and manage all your delivery orders</p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              <Package className="h-4 w-4" />
              Active Orders ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <Clock className="h-4 w-4" />
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-2">Order #{order.id}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status === "in-transit" ? "In Transit" : "Pending Assignment"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">${order.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Pickup</p>
                        <p className="text-sm text-muted-foreground">{order.pickup}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <MapPin className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Dropoff</p>
                        <p className="text-sm text-muted-foreground">{order.dropoff}</p>
                      </div>
                    </div>
                  </div>

                  {order.driver && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Driver: {order.driver}</p>
                          <p className="text-sm text-muted-foreground">
                            Estimated delivery: {order.estimatedDelivery}
                          </p>
                        </div>
                        <Button>
                          <Eye className="h-4 w-4 mr-2" />
                          Track Live
                        </Button>
                      </div>
                    </div>
                  )}

                  {!order.driver && (
                    <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                      <p className="text-sm text-warning">
                        Waiting for driver assignment. You'll be notified once a driver accepts this delivery.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-2">Order #{order.id}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>Delivered</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${order.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{order.deliveredAt}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Pickup</p>
                        <p className="text-sm text-muted-foreground">{order.pickup}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Dropoff</p>
                        <p className="text-sm text-muted-foreground">{order.dropoff}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">View Receipt</Button>
                    <Button variant="outline" size="sm">Rebook</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;
