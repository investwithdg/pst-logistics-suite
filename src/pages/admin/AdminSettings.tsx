import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [autoApproveInvoices, setAutoApproveInvoices] = useState(false);
  const [supportEmail, setSupportEmail] = useState("support@preferred.com");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_key', 'invoice_auto_approve')
        .single();

      if (error) throw error;
      
      if (data?.setting_value) {
        const settingValue = data.setting_value as { enabled: boolean; description: string };
        setAutoApproveInvoices(settingValue.enabled || false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveInvoiceSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({
          setting_value: {
            enabled: autoApproveInvoices,
            description: 'Automatically approve invoices after delivery'
          }
        })
        .eq('setting_key', 'invoice_auto_approve');

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Invoice approval settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input 
                  id="supportEmail" 
                  type="email" 
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button>Save</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>
                Configure how invoices are handled after delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoApprove">Auto-approve invoices</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve invoices after delivery is completed. When disabled, dispatchers must manually approve each invoice.
                  </p>
                </div>
                <Switch
                  id="autoApprove"
                  checked={autoApproveInvoices}
                  onCheckedChange={setAutoApproveInvoices}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={saveInvoiceSettings} disabled={loading}>
                  {loading ? "Saving..." : "Save Invoice Settings"}
                </Button>
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
              <Button className="w-full" variant="outline">Clear Cache</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;


