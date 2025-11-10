import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, User, Clock, Map } from "lucide-react";

const mockOrders = [
  {
    id: "DEL-2025-003",
    customer: "Jane Smith",
    pickup: "123 Commerce Dr, Chicago, IL",
    dropoff: "789 Business Pkwy, Schaumburg, IL",
    distance: "15.2 mi",
    status: "ready",
    amount: 62.50,
    createdAt: "10:30 AM",
  },
  {
    id: "DEL-2025-004",
    customer: "Robert Chen",
    pickup: "456 Industrial Rd, Chicago, IL",
    dropoff: "321 Tech Center, Naperville, IL",
    distance: "22.8 mi",
    status: "ready",
    amount: 82.00,
    createdAt: "11:15 AM",
  },
];

const mockAssignedOrders = [
  {
    id: "DEL-2025-001",
    customer: "John Doe",
    driver: "Mike Johnson",
    pickup: "123 Main St, Chicago, IL",
    dropoff: "456 Oak Ave, Naperville, IL",
    status: "in-transit",
    amount: 52.50,
  },
];

const mockDrivers = [
  { id: "1", name: "Mike Johnson", status: "busy" },
  { id: "2", name: "Sarah Williams", status: "available" },
  { id: "3", name: "David Brown", status: "available" },
  { id: "4", name: "Emily Davis", status: "offline" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "ready":
      return "bg-warning/10 text-warning border-warning/20";
    case "in-transit":
      return "bg-info/10 text-info border-info/20";
    case "delivered":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const DispatcherOrders = () => {
  const availableDrivers = mockDrivers.filter(d => d.status === "available");

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation userRole="dispatcher" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Queue</h1>
          <p className="text-muted-foreground">Manage and assign delivery orders to drivers</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready for Dispatch</p>
                  <p className="text-3xl font-bold text-warning">{mockOrders.length}</p>
                </div>
                <Package className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-info">{mockAssignedOrders.length}</p>
                </div>
                <Clock className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Drivers</p>
                  <p className="text-3xl font-bold text-success">{availableDrivers.length}</p>
                </div>
                <User className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Deliveries</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Ready for Dispatch ({mockOrders.length})
            </TabsTrigger>
            <TabsTrigger value="assigned">
              Assigned ({mockAssignedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {mockOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-2">Order #{order.id}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Customer: {order.customer}</span>
                        <span>•</span>
                        <span>Created: {order.createdAt}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>Ready for Dispatch</Badge>
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

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Distance</p>
                        <p className="font-medium">{order.distance}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium text-primary">${order.amount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDrivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button>Assign Driver</Button>
                      <Button variant="outline" size="icon">
                        <Map className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-4">
            {mockAssignedOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-2">Order #{order.id}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Customer: {order.customer}</span>
                        <span>•</span>
                        <span>Driver: {order.driver}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>In Transit</Badge>
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

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium text-primary">${order.amount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline">View Details</Button>
                      <Button variant="outline" size="icon">
                        <Map className="h-4 w-4" />
                      </Button>
                    </div>
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

export default DispatcherOrders;
