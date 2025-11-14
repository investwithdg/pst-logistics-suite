import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import { useApp } from "@/contexts/AppContext";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { refreshData, lastUpdated } = useApp();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-6">
            <SidebarTrigger />
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshData}
                className="h-9 w-9"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <NotificationBell />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
