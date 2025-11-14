import { User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function UserProfileMenu() {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-500",
      dispatcher: "bg-blue-500",
      driver: "bg-green-500",
      customer: "bg-purple-500",
    };
    return colors[role] || "bg-gray-500";
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Admin",
      dispatcher: "Dispatcher",
      driver: "Driver",
      customer: "Customer",
    };
    return labels[role] || role;
  };

  const handleProfile = () => {
    if (!userRole) return;
    const routes: Record<string, string> = {
      customer: "/customer/dashboard",
      dispatcher: "/dispatcher/dashboard",
      driver: "/driver/profile",
      admin: "/admin/dashboard",
    };
    navigate(routes[userRole]);
  };

  const handleSettings = () => {
    if (!userRole) return;
    const routes: Record<string, string> = {
      customer: "/customer/settings",
      dispatcher: "/dispatcher/settings",
      driver: "/driver/settings",
      admin: "/admin/settings",
    };
    navigate(routes[userRole]);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user || !userRole) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 transition-colors cursor-pointer">
          <Avatar className="h-9 w-9">
            <AvatarFallback className={getRoleColor(userRole)}>
              {getInitials(user.email || "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{user.email}</span>
            <Badge variant="secondary" className="text-xs">
              {getRoleLabel(userRole)}
            </Badge>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
