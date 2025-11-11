import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Truck, ClipboardList } from "lucide-react";
import { DriverTrackingMap } from "@/components/DriverTrackingMap";

const DispatcherMap = () => {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Map View</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Driver Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] rounded-lg overflow-hidden">
                <DriverTrackingMap />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-between" variant="outline" onClick={() => navigate("/dispatcher/orders")}>
                <span>Order Queue</span>
                <ClipboardList className="h-4 w-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline" onClick={() => navigate("/dispatcher/drivers")}>
                <span>View Drivers</span>
                <Truck className="h-4 w-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline" onClick={() => navigate("/dispatcher/dashboard")}>
                <span>Back to Dashboard</span>
                <MapPin className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DispatcherMap;


