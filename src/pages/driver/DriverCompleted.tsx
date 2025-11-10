import { DashboardLayout } from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const DriverCompleted = () => {
  const navigate = useNavigate();
  const { currentUser, orders } = useApp();
  if (!currentUser) return null;

  const completedJobs = orders.filter(
    o => o.driverId === currentUser.id && (o.status === "delivered" || o.status === "completed")
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Completed Deliveries</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No completed deliveries yet
                </p>
              ) : (
                completedJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{job.dropoffAddress.split(",")[0]}</p>
                      <p className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Delivered
                    </Badge>
                  </div>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverCompleted;


