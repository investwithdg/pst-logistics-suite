import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { UserRole } from "@/types";

const SignIn = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication - set user and redirect based on role
    const userMapping: Record<UserRole, { id: string; name: string }> = {
      customer: { id: "C1", name: "John Smith" },
      dispatcher: { id: "DISP1", name: "Sarah Admin" },
      driver: { id: "D1", name: "Mike Johnson" },
      admin: { id: "ADM1", name: "Admin User" },
    };

    const userData = userMapping[role];
    setCurrentUser({ ...userData, role });
    
    // Navigate based on role
    switch (role) {
      case "customer":
        navigate("/customer/dashboard");
        break;
      case "dispatcher":
        navigate("/dispatcher/dashboard");
        break;
      case "driver":
        navigate("/driver/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <p className="text-center text-muted-foreground">
              Access your delivery platform
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Sign in as</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="dispatcher">Dispatcher</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Demo: Select a role and use any email/password to test
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
