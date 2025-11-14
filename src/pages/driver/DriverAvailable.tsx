import { DashboardLayout } from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import OrderCard from "@/components/OrderCard";
import { ClipboardList, ArrowRight } from "lucide-react";

const DriverAvailable = () => {
  const navigate = useNavigate();
  const { orders } = useApp();

  const availableJobs = orders.filter(o => o.status === "pending");

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Job Board</h1>
        <p className="text-muted-foreground">Available deliveries assigned by dispatchers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Open Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No available jobs at the moment
                </p>
              ) : (
                availableJobs.map(order => (
                  <OrderCard key={order.id} order={order} role="driver" />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-between" variant="outline" onClick={() => navigate("/driver/jobs")}>
                <span>Go to Active Jobs</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline" onClick={() => navigate("/driver/dashboard")}>
                <span>Back to Dashboard</span>
                <ClipboardList className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverAvailable;


