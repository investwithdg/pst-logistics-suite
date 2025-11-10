import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "@/components/OrderCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Camera, FileSignature, Truck, Package, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const DriverJobs = () => {
  const navigate = useNavigate();
  const { currentUser, orders, updateOrderStatus } = useApp();
  const [loading, setLoading] = useState(false);
  const [showPOD, setShowPOD] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [podNotes, setPodNotes] = useState("");

  if (!currentUser) {
    navigate("/sign-in");
    return null;
  }

  const myJobs = orders.filter(o => o.driverId === currentUser.id);
  const activeJobs = myJobs.filter(o => 
    o.status === 'assigned' || o.status === 'picked-up' || o.status === 'in-transit'
  );
  const completedJobs = myJobs.filter(o => 
    o.status === 'delivered' || o.status === 'completed'
  );

  const todayEarnings = activeJobs.reduce((sum, job) => sum + (job.totalPrice || 0), 0);
  const totalEarnings = myJobs.reduce((sum, job) => sum + (job.totalPrice || 0), 0);

  const handleMarkPickedUp = async (order: Order) => {
    setLoading(true);
    try {
      await api.updateStatus({ orderId: order.id, status: 'picked-up' });
      updateOrderStatus(order.id, 'picked-up');
      toast({
        title: "Order Picked Up",
        description: `Order ${order.id} marked as picked up`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInTransit = async (order: Order) => {
    setLoading(true);
    try {
      await api.updateStatus({ orderId: order.id, status: 'in-transit' });
      updateOrderStatus(order.id, 'in-transit');
      toast({
        title: "In Transit",
        description: `Order ${order.id} is now in transit`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverClick = (order: Order) => {
    setSelectedOrder(order);
    setShowPOD(true);
  };

  const handleSubmitPOD = async () => {
    if (!selectedOrder) return;

    setLoading(true);
    try {
      await api.submitProof({ orderId: selectedOrder.id, notes: podNotes });
      updateOrderStatus(selectedOrder.id, 'delivered');
      
      toast({
        title: "Delivery Complete",
        description: "Proof of delivery submitted successfully",
      });
      
      setShowPOD(false);
      setSelectedOrder(null);
      setPodNotes("");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not submit proof of delivery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (action: string, order: Order) => {
    if (action === "pickup") {
      await handleMarkPickedUp(order);
    } else if (action === "transit") {
      await handleMarkInTransit(order);
    } else if (action === "deliver") {
      handleDeliverClick(order);
    } else if (action === "navigate") {
      window.open(`https://maps.google.com/?q=${order.dropoffAddress}`, '_blank');
    }
  };

  return (
    <DashboardLayout>
      {loading && <LoadingSpinner message="Processing..." />}

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Jobs</p>
                <p className="text-3xl font-bold">{activeJobs.length}</p>
              </div>
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold">{completedJobs.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Earnings</p>
                <p className="text-3xl font-bold">${todayEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Deliveries</h2>
          </div>

          {activeJobs.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No active jobs</p>
                <Button onClick={() => navigate("/driver/available")}>
                  View Available Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeJobs.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                role="driver"
                onAction={handleOrderAction}
              />
            ))
          )}
        </div>

        {/* Sidebar - Quick Stats & Recent */}
        <div className="space-y-6">
          {/* Today's Route */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today's Route</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No deliveries scheduled
                </p>
              ) : (
                activeJobs.map((job, index) => (
                  <div key={job.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{job.dropoffAddress.split(',')[0]}</p>
                      <p className="text-xs text-muted-foreground">{job.dropoffAddress}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {job.status}
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
              {completedJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{job.dropoffAddress.split(',')[0]}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success">${job.totalPrice?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {completedJobs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No completed deliveries yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Proof of Delivery Dialog */}
      <Dialog open={showPOD} onOpenChange={setShowPOD}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Proof of Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Upload Photo</label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Tap to take photo</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Signature</label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <FileSignature className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Tap to capture signature</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Delivery Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about the delivery..."
                value={podNotes}
                onChange={(e) => setPodNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPOD(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitPOD}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Complete Delivery"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DriverJobs;
