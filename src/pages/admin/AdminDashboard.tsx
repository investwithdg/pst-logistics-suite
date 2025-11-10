import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Users, Package, TrendingUp, Settings } from "lucide-react";

const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "customer", status: "active" },
  { id: "2", name: "Mike Johnson", email: "mike@example.com", role: "driver", status: "active" },
  { id: "3", name: "Sarah Williams", email: "sarah@example.com", role: "driver", status: "active" },
  { id: "4", name: "Admin User", email: "admin@preferred.com", role: "admin", status: "active" },
];

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation userRole="admin" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage system settings, users, and pricing</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">$12,458</p>
                      <p className="text-xs text-success mt-1">+15.3% from last month</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">247</p>
                      <p className="text-xs text-success mt-1">+23 new this month</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Deliveries</p>
                      <p className="text-2xl font-bold">1,428</p>
                      <p className="text-xs text-success mt-1">+8.7% from last month</p>
                    </div>
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Drivers</p>
                      <p className="text-2xl font-bold">18</p>
                      <p className="text-xs text-muted-foreground mt-1">Out of 24 total</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Chart placeholder - Revenue over time</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">Set base rates and charges for deliveries</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="baseRate">Base Rate ($)</Label>
                    <Input
                      id="baseRate"
                      type="number"
                      defaultValue="25.00"
                      step="0.01"
                    />
                    <p className="text-sm text-muted-foreground">Flat fee charged for every delivery</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perMile">Per Mile Rate ($)</Label>
                    <Input
                      id="perMile"
                      type="number"
                      defaultValue="2.50"
                      step="0.01"
                    />
                    <p className="text-sm text-muted-foreground">Charge per mile of distance</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perPound">Per Pound Rate ($)</Label>
                    <Input
                      id="perPound"
                      type="number"
                      defaultValue="0.50"
                      step="0.01"
                    />
                    <p className="text-sm text-muted-foreground">Additional charge per pound of weight</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgentSurcharge">Urgent Delivery Surcharge (%)</Label>
                    <Input
                      id="urgentSurcharge"
                      type="number"
                      defaultValue="25"
                    />
                    <p className="text-sm text-muted-foreground">Percentage surcharge for urgent deliveries</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button>Save Pricing Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <p className="text-sm text-muted-foreground">Manage users and assign roles</p>
                  </div>
                  <Button>Add New User</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-success/10 text-success border-success/20 capitalize">
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">Configure general system preferences</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      defaultValue="Preferred Solutions Transport"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      defaultValue="support@preferred.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      type="tel"
                      defaultValue="(800) 555-0123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="cst">
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
