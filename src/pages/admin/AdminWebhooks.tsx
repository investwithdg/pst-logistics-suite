import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const AdminWebhooks = () => {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch webhook configurations
    const { data: webhookData } = await supabase
      .from('webhook_config')
      .select('*')
      .order('created_at', { ascending: false });

    if (webhookData) setWebhooks(webhookData);

    // Fetch recent webhook logs
    const { data: logData } = await supabase
      .from('webhook_logs' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (logData) setLogs(logData);

    // Fetch sync status
    const { data: syncData } = await supabase
      .from('hubspot_sync_status' as any)
      .select('*, orders(order_number)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (syncData) setSyncStatus(syncData);
  };

  const testWebhooks = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('webhook-health-check');
      
      if (error) throw error;

      toast({
        title: "Webhook test complete",
        description: `Tested ${data.results?.length || 0} webhooks`,
      });

      fetchData();
    } catch (error) {
      console.error('Error testing webhooks:', error);
      toast({
        title: "Test failed",
        description: "Failed to test webhooks",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhook Management</h1>
          <p className="text-muted-foreground">Monitor webhook health and sync status</p>
        </div>
        <Button onClick={testWebhooks} disabled={testing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
          Test All Webhooks
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Webhook Status */}
        <Card>
          <CardHeader>
            <CardTitle>Configured Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <p className="text-muted-foreground">No webhooks configured</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.webhook_name}</TableCell>
                      <TableCell>{webhook.webhook_type}</TableCell>
                      <TableCell>
                        {webhook.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(webhook.updated_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* HubSpot Sync Status */}
        <Card>
          <CardHeader>
            <CardTitle>HubSpot Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            {syncStatus.length === 0 ? (
              <p className="text-muted-foreground">No sync history</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Sync Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Last Attempt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncStatus.map((sync: any) => (
                    <TableRow key={sync.id}>
                      <TableCell className="font-medium">
                        {sync.orders?.order_number || 'N/A'}
                      </TableCell>
                      <TableCell className="capitalize">{sync.sync_type.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        {sync.sync_status === 'success' ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        ) : sync.sync_status === 'failed' ? (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{sync.retry_count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sync.last_attempt_at 
                          ? formatDistanceToNow(new Date(sync.last_attempt_at), { addSuffix: true })
                          : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Webhook Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Webhook Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-muted-foreground">No webhook activity</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Webhook</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.webhook_name}</TableCell>
                      <TableCell className="capitalize">{log.direction}</TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <Badge className="bg-green-500">Success</Badge>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-sm text-destructive">
                        {log.error_message || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminWebhooks;
