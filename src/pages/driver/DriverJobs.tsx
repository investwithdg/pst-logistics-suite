import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation as NavigationIcon, CheckCircle, Camera, FileSignature } from "lucide-react";

const mockActiveJob = {
  id: "DEL-2025-001",
  customer: "John Doe",
  customerPhone: "(555) 123-4567",
  pickup: "123 Main St, Chicago, IL 60601",
  dropoff: "456 Oak Ave, Naperville, IL 60540",
  distance: "18.5 mi",
  status: "picked-up",
  amount: 52.50,
  instructions: "Please call upon arrival. Fragile items.",
};

const mockAvailableJobs = [
  {
    id: "DEL-2025-005",
    customer: "Alice Cooper",
    pickup: "789 Elm St, Chicago, IL",
    dropoff: "321 Pine Rd, Aurora, IL",
    distance: "12.3 mi",
    amount: 45.75,
  },
];

const DriverJobs = () => {
  const [showPOD, setShowPOD] = useState(false);
  const [podNotes, setPodNotes] = useState("");

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation userRole="driver" />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">My Jobs</h1>
          <p className="text-sm text-muted-foreground">Manage your delivery assignments</p>
        </div>

        {/* Active Job Card */}
        {mockActiveJob && (
          <Card className="mb-6 border-primary">
            <CardHeader className="bg-primary/5">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-info/10 text-info border-info/20 mb-2">Active Delivery</Badge>
                  <CardTitle className="text-xl">Order #{mockActiveJob.id}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Customer: {mockActiveJob.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">${mockActiveJob.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{mockActiveJob.distance}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Pickup Location</p>
                    <p className="text-sm text-muted-foreground">{mockActiveJob.pickup}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Dropoff Location</p>
                    <p className="text-sm text-muted-foreground">{mockActiveJob.dropoff}</p>
                  </div>
                </div>
              </div>

              {mockActiveJob.instructions && (
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Special Instructions</p>
                  <p className="text-sm text-muted-foreground">{mockActiveJob.instructions}</p>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Customer Contact</p>
                <p className="text-sm text-muted-foreground">{mockActiveJob.customerPhone}</p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button size="lg" className="w-full">
                  <NavigationIcon className="h-5 w-5 mr-2" />
                  Navigate to Dropoff
                </Button>
                
                {mockActiveJob.status === "picked-up" ? (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full border-success text-success hover:bg-success hover:text-success-foreground"
                    onClick={() => setShowPOD(true)}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Mark as Delivered
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" className="w-full">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Mark as Picked Up
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Jobs */}
        <Tabs defaultValue="available" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="available" className="flex-1">
              Available Jobs ({mockAvailableJobs.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Completed Today (3)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-3">
            {mockAvailableJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold mb-1">Order #{job.id}</p>
                      <p className="text-sm text-muted-foreground">Customer: {job.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">${job.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{job.distance}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{job.pickup}</p>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{job.dropoff}</p>
                    </div>
                  </div>

                  <Button className="w-full">Accept Job</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">You've completed 3 deliveries today</p>
                <p className="text-sm text-muted-foreground mt-2">Total earnings: $145.25</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

            <Button className="w-full" size="lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Complete Delivery
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverJobs;
