import { DashboardLayout } from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OrderCard from "@/components/OrderCard";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { currentUser, orders } = useApp();
  if (!currentUser) return null;

  const customerOrders = orders.filter(o => o.customerId === currentUser.id);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">All Deliveries</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/quote")}>
              New Order <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {customerOrders.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button onClick={() => navigate("/quote")}>Create New Order</Button>
              </CardContent>
            </Card>
          ) : (
            customerOrders.map(order => (
              <OrderCard key={order.id} order={order} role="customer" />
            ))
          )}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerOrders;


