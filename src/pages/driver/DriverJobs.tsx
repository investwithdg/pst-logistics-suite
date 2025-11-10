import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "@/components/OrderCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Order } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Camera, FileSignature } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const DriverJobs = () => {
  const navigate = useNavigate();
  const { orders, currentUser, updateOrderStatus, updateOrder } = useApp();
  const [loading, setLoading] = useState(false);
  const [showPOD, setShowPOD] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [podNotes, setPodNotes] = useState("");

  if (!currentUser) {
    navigate("/sign-in");
    return null;
  }

  const myJobs = orders.filter(o => o.driverId === currentUser.id);
  const activeJob = myJobs.find(o => ['assigned', 'picked-up', 'in-transit'].includes(o.status));
  const completedJobs = myJobs.filter(o => ['delivered', 'completed'].includes(o.status));

  const handleOrderAction = async (action: string, order: Order) => {
    setLoading(true);

    try {
      if (action === "pickup") {
        toast({
          title: "Marking as picked up...",
          description: "Updating order status",
        });
        
        const response = await api.updatePickup({ orderId: order.id });
        if (response.success) {
          updateOrderStatus(order.id, "picked-up");
          toast({
            title: "Package picked up",
            description: "Status updated successfully",
          });
        }
      } else if (action === "transit") {
        const response = await api.updateStatus({ orderId: order.id, status: "in-transit" });
        if (response.success) {
          updateOrderStatus(order.id, "in-transit");
          toast({
            title: "En route to destination",
            description: "Status updated to in transit",
          });
        }
      } else if (action === "deliver") {
        setSelectedOrder(order);
        setShowPOD(true);
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPOD = async () => {
    if (!selectedOrder) return;

    setLoading(true);
    toast({
      title: "Submitting proof of delivery...",
      description: "Processing delivery confirmation",
    });

    try {
      const response = await api.submitProof({
        orderId: selectedOrder.id,
        notes: podNotes,
        timestamp: new Date().toISOString(),
      });

      if (response.success) {
        updateOrder(selectedOrder.id, {
          status: "delivered",
          proofOfDelivery: {
            notes: podNotes,
            timestamp: new Date().toISOString(),
          },
        });
        
        toast({
          title: "Delivery completed!",
          description: `Order ${selectedOrder.id} marked as delivered`,
        });
        
        setShowPOD(false);
        setSelectedOrder(null);
        setPodNotes("");
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">My Jobs</h1>
        <p className="text-sm text-muted-foreground">Manage your delivery assignments</p>
      </div>

      {loading && <LoadingSpinner message="Processing..." />}

        {/* Active Job */}
        {activeJob && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Active Delivery</h2>
            <OrderCard 
              order={activeJob} 
              role="driver"
              onAction={handleOrderAction}
            />
          </div>
        )}

        {/* Available & Completed Jobs */}
        <Tabs defaultValue="completed" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="completed" className="flex-1">
              Completed Today ({completedJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="completed">
            {completedJobs.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No completed deliveries today</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedJobs.map((job) => (
                  <OrderCard 
                    key={job.id} 
                    order={job} 
                    role="driver"
                  />
                ))}
                <Card>
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                    <p className="font-semibold mb-2">Great work today!</p>
                    <p className="text-sm text-muted-foreground">
                      Total earnings: ${completedJobs.reduce((sum, j) => sum + j.totalPrice, 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

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
