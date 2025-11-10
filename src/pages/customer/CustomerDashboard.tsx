import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "@/components/OrderCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, Clock, DollarSign, ArrowRight } from "lucide-react";
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

  const totalSpent = customerOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const avgDeliveryTime = "2.3 days";

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
    <DashboardLayout>
      {loading && <LoadingSpinner message="Loading order details..." />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Orders</p>
                <p className="text-3xl font-bold">{activeOrders.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold">{completedOrders.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Delivery</p>
                <p className="text-3xl font-bold">{avgDeliveryTime}</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Deliveries</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/quote")}>
              New Order <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {activeOrders.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No active orders</p>
                <Button onClick={() => navigate("/quote")}>Create New Order</Button>
              </CardContent>
            </Card>
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
        </div>

        {/* Quick Actions & Recent */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-between" 
                variant="outline"
                onClick={() => navigate("/quote")}
              >
                <span>Get a Quote</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                className="w-full justify-between" 
                variant="outline"
                onClick={() => navigate("/track")}
              >
                <span>Track Order</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                className="w-full justify-between" 
                variant="outline"
                onClick={() => navigate("/customer/invoices")}
              >
                <span>View Invoices</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Recent Completed */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Deliveries</CardTitle>
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
                  <div className="text-right">
                    <p className="text-sm font-semibold">${order.totalPrice?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {completedOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No completed deliveries yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
