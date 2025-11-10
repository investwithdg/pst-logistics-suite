import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, User, LogOut } from "lucide-react";

interface NavigationProps {
  userRole?: "customer" | "dispatcher" | "driver" | "admin" | null;
}

const Navigation = ({ userRole = null }: NavigationProps) => {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Preferred Solutions Transport</span>
          </Link>

          <div className="flex items-center gap-4">
            {!userRole ? (
              <>
                <Link to="/track">
                  <Button variant="ghost">Track Order</Button>
                </Link>
                <Link to="/quote">
                  <Button variant="ghost">Get a Quote</Button>
                </Link>
                <Link to="/sign-in">
                  <Button variant="outline">Sign In</Button>
                </Link>
              </>
            ) : (
              <>
                {userRole === "customer" && (
                  <Link to="/customer/dashboard">
                    <Button variant="ghost">My Orders</Button>
                  </Link>
                )}
                {userRole === "dispatcher" && (
                  <Link to="/dispatcher/orders">
                    <Button variant="ghost">Order Queue</Button>
                  </Link>
                )}
                {userRole === "driver" && (
                  <Link to="/driver/jobs">
                    <Button variant="ghost">My Jobs</Button>
                  </Link>
                )}
                {userRole === "admin" && (
                  <>
                    <Link to="/admin/dashboard">
                      <Button variant="ghost">Dashboard</Button>
                    </Link>
                    <Link to="/admin/pricing">
                      <Button variant="ghost">Pricing</Button>
                    </Link>
                    <Link to="/admin/users">
                      <Button variant="ghost">Users</Button>
                    </Link>
                  </>
                )}
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
