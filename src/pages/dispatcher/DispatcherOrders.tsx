import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "@/components/OrderCard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Order } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Clock, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const DispatcherOrders = () => {
  const navigate = useNavigate();
  const { orders, drivers, currentUser, assignDriver } = useApp();
  const [loading, setLoading] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  if (!currentUser) {
    navigate("/sign-in");
    return null;
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const assignedOrders = orders.filter(o => ['assigned', 'picked-up', 'in-transit'].includes(o.status));
  const completedOrders = orders.filter(o => ['delivered', 'completed'].includes(o.status));
  const availableDrivers = drivers.filter(d => d.status === 'available');

  const handleOrderAction = async (action: string, order: Order) => {
    if (action === "assign") {
      setSelectedOrder(order);
      setAssignDialogOpen(true);
    } else if (action === "view") {
      toast({
        title: "Order Details",
        description: `Viewing details for ${order.id}`,
      });
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedOrder || !selectedDriverId) return;

    setLoading(true);
    toast({
      title: "Assigning driver...",
      description: "Processing assignment",
    });

    try {
      const response = await api.assignDriver({
        orderId: selectedOrder.id,
        driverId: selectedDriverId,
      });

      if (response.success) {
        assignDriver(selectedOrder.id, selectedDriverId);
        toast({
          title: "Driver assigned successfully",
          description: `Order ${selectedOrder.id} has been assigned`,
        });
        setAssignDialogOpen(false);
        setSelectedOrder(null);
        setSelectedDriverId("");
      }
    } catch (error) {
      toast({
        title: "Assignment failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
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
                  <p className="text-3xl font-bold text-warning">{pendingOrders.length}</p>
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
                  <p className="text-3xl font-bold text-info">{assignedOrders.length}</p>
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
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-3xl font-bold">{completedOrders.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Ready for Dispatch ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="assigned">
              Assigned ({assignedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders waiting for dispatch</p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  role="dispatcher"
                  onAction={handleOrderAction}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-4">
            {assignedOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders in progress</p>
              </div>
            ) : (
              assignedOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  role="dispatcher"
                  onAction={handleOrderAction}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed orders today</p>
              </div>
            ) : (
              completedOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  role="dispatcher"
                  onAction={handleOrderAction}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

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
