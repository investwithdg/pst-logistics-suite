import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "@/components/OrderCard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, User, Truck, TrendingUp, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const DispatcherOrders = () => {
  const navigate = useNavigate();
  const { orders, drivers, assignDriver, updateOrderStatus } = useApp();
  const [loading, setLoading] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const assignedOrders = orders.filter(o => o.status === 'assigned' || o.status === 'picked-up' || o.status === 'in-transit');
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed');
  const availableDrivers = drivers.filter(d => d.status === 'available');

  const handleAssignClick = (order: Order) => {
    setSelectedOrder(order);
    setAssignDialogOpen(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedOrder || !selectedDriverId) return;

    setLoading(true);
    try {
      await api.assignDriver({ orderId: selectedOrder.id, driverId: selectedDriverId });
      assignDriver(selectedOrder.id, selectedDriverId);
      
      toast({
        title: "Driver Assigned",
        description: `Order ${selectedOrder.id} assigned successfully`,
      });
      
      setAssignDialogOpen(false);
      setSelectedOrder(null);
      setSelectedDriverId("");
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Could not assign driver. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (action: string, order: Order) => {
    if (action === "assign") {
      handleAssignClick(order);
    } else if (action === "view") {
      navigate(`/track?order=${order.id}`);
    }
  };

  const completionRate = orders.length > 0 
    ? Math.round((completedOrders.length / orders.length) * 100) 
    : 0;

  return (
    <DashboardLayout>
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
                <p className="text-3xl font-bold">{assignedOrders.length}</p>
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
        {/* Order Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Order Queue</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Map View
              </Button>
            </div>
          </div>

          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-warning flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Awaiting Assignment ({pendingOrders.length})
              </h3>
              {pendingOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  role="dispatcher"
                  onAction={handleOrderAction}
                />
              ))}
            </div>
          )}

          {/* In Progress Orders */}
          {assignedOrders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-info flex items-center gap-2">
                <Truck className="h-4 w-4" />
                In Progress ({assignedOrders.length})
              </h3>
              {assignedOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  role="dispatcher"
                  onAction={handleOrderAction}
                />
              ))}
            </div>
          )}

          {pendingOrders.length === 0 && assignedOrders.length === 0 && (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No orders in queue</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Driver List & Quick Actions */}
        <div className="space-y-6">
          {/* Available Drivers */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Available Drivers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableDrivers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No available drivers
                </p>
              ) : (
                availableDrivers.slice(0, 8).map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">{driver.vehicleType}</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Available
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Completions */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Completions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{order.dropoffAddress.split(',')[0]}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Delivered
                  </Badge>
                </div>
              ))}
              {completedOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No completed orders yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
            <DialogDescription>
              Select an available driver for order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name} - {driver.vehicleType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setAssignDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssignDriver}
                disabled={!selectedDriverId || loading}
                className="flex-1"
              >
                {loading ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DispatcherOrders;
