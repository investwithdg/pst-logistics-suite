import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const AdminPricing = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pricing</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="baseRate">Base Rate ($)</Label>
                  <Input id="baseRate" type="number" defaultValue="25.00" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perMile">Per Mile Rate ($)</Label>
                  <Input id="perMile" type="number" defaultValue="2.50" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perPound">Per Pound Rate ($)</Label>
                  <Input id="perPound" type="number" defaultValue="0.50" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgentSurcharge">Urgent Delivery Surcharge (%)</Label>
                  <Input id="urgentSurcharge" type="number" defaultValue="25" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button>Save Pricing Settings</Button>
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
              <Button className="w-full" variant="outline">Reset Defaults</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPricing;


