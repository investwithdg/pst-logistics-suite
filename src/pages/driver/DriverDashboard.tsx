import { DashboardLayout } from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Truck, CheckCircle, DollarSign, TrendingUp, Navigation, ClipboardList, MapPin, Package, Briefcase } from "lucide-react";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, orders } = useApp();

  if (!currentUser) {
    return null;
  }

  const myJobs = orders.filter(o => o.driverId === currentUser.id);
  const activeJobs = myJobs.filter(
    o => o.status === "assigned" || o.status === "picked-up" || o.status === "in-transit"
  );
  const completedJobs = myJobs.filter(o => o.status === "delivered" || o.status === "completed");
  const todayEarnings = activeJobs.reduce((sum, job) => sum + (job.totalPrice || 0), 0);
  const totalEarnings = myJobs.reduce((sum, job) => sum + (job.totalPrice || 0), 0);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

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
        <div className="lg:col-span-2 space-y-6">
          <Card>
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
                  <div
                    key={job.id}
                    className="flex items-start gap-3 py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{job.dropoffAddress.split(",")[0]}</p>
                      <p className="text-xs text-muted-foreground">{job.dropoffAddress}</p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {job.status}
                    </Badge>
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
              <Button
                className="w-full justify-between"
                variant="outline"
                onClick={() => navigate("/driver/available")}
              >
                <span>View Job Board</span>
                <ClipboardList className="h-4 w-4" />
              </Button>
              <Button
                className="w-full justify-between"
                variant="outline"
                onClick={() => navigate("/driver/jobs")}
              >
                <span>Go to Active Jobs</span>
                <Navigation className="h-4 w-4" />
              </Button>
              <Button
                className="w-full justify-between"
                variant="outline"
                disabled={activeJobs.length === 0}
                onClick={() => {
                  const nextJob = activeJobs.sort((a, b) => 
                    new Date(a.assignedAt || 0).getTime() - new Date(b.assignedAt || 0).getTime()
                  )[0];
                  
                  if (nextJob) {
                    const destination = nextJob.status === 'assigned' 
                      ? `${nextJob.pickupLat},${nextJob.pickupLng}`
                      : `${nextJob.dropoffLat},${nextJob.dropoffLng}`;
                    
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
                  }
                }}
              >
                <span>Navigate to Next Stop</span>
                <MapPin className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;


