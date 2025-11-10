import { useNavigate, useLocation } from "react-router-dom";
import { Home, Package, Mail, MapPin, FileText, Settings, LayoutDashboard, ClipboardList, Map, Users, BarChart3, Bell, Truck, CheckCircle, DollarSign, UserCircle, Building, Wrench, ScrollText, LogOut } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { UserRole } from "@/types";
import { Sidebar as SidebarUI, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
interface NavItem {
  title: string;
  url: string;
  icon: any;
  badge?: number;
}
const navigationItems: Record<UserRole, NavItem[]> = {
  customer: [{
    title: "Dashboard",
    url: "/customer/dashboard",
    icon: Home
  }, {
    title: "My Orders",
    url: "/customer/orders",
    icon: Package
  }, {
    title: "Get a Quote",
    url: "/quote",
    icon: Mail
  }, {
    title: "Track Delivery",
    url: "/track",
    icon: MapPin
  }, {
    title: "Invoices",
    url: "/customer/invoices",
    icon: FileText
  }, {
    title: "Settings",
    url: "/customer/settings",
    icon: Settings
  }],
  dispatcher: [{
    title: "Dashboard",
    url: "/dispatcher/dashboard",
    icon: LayoutDashboard
  }, {
    title: "Order Queue",
    url: "/dispatcher/orders",
    icon: ClipboardList
  }, {
    title: "Map View",
    url: "/dispatcher/map",
    icon: Map
  }, {
    title: "Drivers",
    url: "/dispatcher/drivers",
    icon: Users
  }, {
    title: "Analytics",
    url: "/dispatcher/analytics",
    icon: BarChart3
  }, {
    title: "Notifications",
    url: "/dispatcher/notifications",
    icon: Bell
  }, {
    title: "Settings",
    url: "/dispatcher/settings",
    icon: Settings
  }],
  driver: [{
    title: "Dashboard",
    url: "/driver/dashboard",
    icon: Home
  }, {
    title: "Active Jobs",
    url: "/driver/jobs",
    icon: Truck
  }, {
    title: "Available Jobs",
    url: "/driver/available",
    icon: ClipboardList
  }, {
    title: "Completed",
    url: "/driver/completed",
    icon: CheckCircle
  }, {
    title: "Earnings",
    url: "/driver/earnings",
    icon: DollarSign
  }, {
    title: "Profile",
    url: "/driver/profile",
    icon: UserCircle
  }, {
    title: "Settings",
    url: "/driver/settings",
    icon: Settings
  }],
  admin: [{
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard
  }, {
    title: "Users",
    url: "/admin/users",
    icon: Users
  }, {
    title: "Pricing",
    url: "/admin/pricing",
    icon: DollarSign
  }, {
    title: "Reports",
    url: "/admin/reports",
    icon: BarChart3
  }, {
    title: "Company",
    url: "/admin/company",
    icon: Building
  }, {
    title: "System",
    url: "/admin/system",
    icon: Wrench
  }, {
    title: "Audit Log",
    url: "/admin/audit",
    icon: ScrollText
  }, {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings
  }]
};
const roleColors: Record<UserRole, string> = {
  customer: "bg-primary text-primary-foreground",
  dispatcher: "bg-purple-500 text-white",
  driver: "bg-green-500 text-white",
  admin: "bg-destructive text-destructive-foreground"
};
const roleLabels: Record<UserRole, string> = {
  customer: "Customer",
  dispatcher: "Dispatcher",
  driver: "Driver",
  admin: "Administrator"
};
export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    setCurrentUser,
    orders
  } = useApp();
  const {
    open
  } = useSidebar();
  if (!currentUser) return null;
  const menuItems = navigationItems[currentUser.role];

  // Calculate badges
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeJobs = orders.filter(o => o.driverId === currentUser.id && (o.status === 'assigned' || o.status === 'picked-up' || o.status === 'in-transit')).length;

  // Add badge counts
  const itemsWithBadges = menuItems.map(item => {
    if (currentUser.role === 'dispatcher' && item.title === 'Order Queue') {
      return {
        ...item,
        badge: pendingOrders
      };
    }
    if (currentUser.role === 'driver' && item.title === 'Active Jobs') {
      return {
        ...item,
        badge: activeJobs
      };
    }
    return item;
  });
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };
  const handleSignOut = () => {
    setCurrentUser(null);
    navigate("/sign-in");
  };
  const isActive = (url: string) => location.pathname === url;
  return <SidebarUI className="border-r border-border" collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-primary rounded-full" />
          {open && <div>
              <h2 className="font-bold text-slate-50">Preferred Solutions Transport</h2>
              
            </div>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsWithBadges.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => navigate(item.url)} isActive={isActive(item.url)} tooltip={item.title} className="relative">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                    {item.badge && item.badge > 0 && open && <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {item.badge}
                      </Badge>}
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4 bg-slate-50">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={roleColors[currentUser.role]}>
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              {open && <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[currentUser.role]}</p>
                </div>}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </SidebarUI>;
}