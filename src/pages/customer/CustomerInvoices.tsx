import { DashboardLayout } from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CustomerInvoices = () => {
  const navigate = useNavigate();
  const { currentUser, orders } = useApp();
  if (!currentUser) return null;

  const invoices = orders
    .filter(o => o.customerId === currentUser.id && (o.status === "delivered" || o.status === "completed"))
    .map(o => ({
      id: o.id,
      amount: o.totalPrice || 0,
      date: new Date(o.createdAt),
    }));

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Invoices</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No invoices yet</p>
              ) : (
                invoices.slice(0, 12).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">Invoice #{inv.id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.date.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${inv.amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-between" variant="outline" onClick={() => navigate("/quote")}>
                <span>Get a Quote</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline" onClick={() => navigate("/customer/orders")}>
                <span>View Orders</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerInvoices;


