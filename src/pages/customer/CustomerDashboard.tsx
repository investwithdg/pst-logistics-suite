import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import OrderCard from "@/components/OrderCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useApp } from "@/contexts/AppContext";
import { Order } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { orders, currentUser } = useApp();
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    navigate("/sign-in");
    return null;
  }

  const customerOrders = orders.filter(o => o.customerId === currentUser.id);
  const activeOrders = customerOrders.filter(o => 
    !['delivered', 'completed'].includes(o.status)
  );
  const completedOrders = customerOrders.filter(o => 
    ['delivered', 'completed'].includes(o.status)
  );

  const handleOrderAction = async (action: string, order: Order) => {
    setLoading(true);
    
    try {
      if (action === "track") {
        navigate(`/track?order=${order.id}`);
      } else if (action === "pay") {
        toast({
          title: "Processing payment...",
          description: "Redirecting to payment page",
        });
        setTimeout(() => navigate(`/quote?orderId=${order.id}`), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation userRole="customer" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Deliveries</h1>
          <p className="text-muted-foreground">Track and manage all your delivery orders</p>
        </div>

        {loading && <LoadingSpinner message="Loading order details..." />}

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
            {activeOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active orders</p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  role="customer"
                  onAction={handleOrderAction}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed orders</p>
              </div>
            ) : (
              completedOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  role="customer"
                  onAction={handleOrderAction}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;
