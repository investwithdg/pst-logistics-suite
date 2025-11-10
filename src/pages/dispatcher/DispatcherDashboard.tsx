import { DashboardLayout } from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Package, Truck, User, TrendingUp, Clock, MapPin } from "lucide-react";

const DispatcherDashboard = () => {
  const navigate = useNavigate();
  const { orders, drivers } = useApp();

  const pendingOrders = orders.filter(o => o.status === "pending");
  const inProgressOrders = orders.filter(
    o => o.status === "assigned" || o.status === "picked-up" || o.status === "in-transit"
  );
  const completedOrders = orders.filter(
    o => o.status === "delivered" || o.status === "completed"
  );
  const availableDrivers = drivers.filter(d => d.status === "available");
  const completionRate = orders.length > 0
    ? Math.round((completedOrders.length / orders.length) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                <p className="text-3xl font-bold">{pendingOrders.length}</p>
              </div>
              <Package className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                <p className="text-3xl font-bold">{inProgressOrders.length}</p>
              </div>
              <Truck className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Drivers</p>
                <p className="text-3xl font-bold">{availableDrivers.length}</p>
              </div>
              <User className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-3xl font-bold">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...orders]
                .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                .slice(0, 6)
                .map(order => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {order.dropoffAddress.split(",")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {order.status}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-between"
                variant="outline"
                onClick={() => navigate("/dispatcher/orders")}
              >
                <span>Assign Driver</span>
                <Clock className="h-4 w-4" />
              </Button>
              <Button
                className="w-full justify-between"
                variant="outline"
                onClick={() => navigate("/dispatcher/orders")}
              >
                <span>Dispatch Order</span>
                <Truck className="h-4 w-4" />
              </Button>
              <Button
                className="w-full justify-between"
                variant="outline"
                onClick={() => navigate("/dispatcher/map")}
              >
                <span>Map View</span>
                <MapPin className="h-4 w-4" />
              </Button>
              <Button
                className="w-full justify-between"
                variant="outline"
                onClick={() => navigate("/dispatcher/drivers")}
              >
                <span>View Drivers</span>
                <User className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DispatcherDashboard;


