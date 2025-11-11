import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Quote from "./pages/Quote";
import ThankYou from "./pages/ThankYou";
import Track from "./pages/Track";
import RouteReplay from "./pages/RouteReplay";
import SignIn from "./pages/SignIn";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerInvoices from "./pages/customer/CustomerInvoices";
import CustomerSettings from "./pages/customer/CustomerSettings";
import DispatcherOrders from "./pages/dispatcher/DispatcherOrders";
import DispatcherDashboard from "./pages/dispatcher/DispatcherDashboard";
import DispatcherMap from "./pages/dispatcher/DispatcherMap";
import DispatcherDrivers from "./pages/dispatcher/DispatcherDrivers";
import DispatcherAnalytics from "./pages/dispatcher/DispatcherAnalytics";
import DispatcherNotifications from "./pages/dispatcher/DispatcherNotifications";
import DispatcherSettings from "./pages/dispatcher/DispatcherSettings";
import DriverJobs from "./pages/driver/DriverJobs";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverAvailable from "./pages/driver/DriverAvailable";
import DriverCompleted from "./pages/driver/DriverCompleted";
import DriverEarnings from "./pages/driver/DriverEarnings";
import DriverProfile from "./pages/driver/DriverProfile";
import DriverSettings from "./pages/driver/DriverSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminReports from "./pages/admin/AdminReports";
import AdminCompany from "./pages/admin/AdminCompany";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/track" element={<Track />} />
          <Route path="/route-replay" element={<RouteReplay />} />
          <Route path="/sign-in" element={<SignIn />} />
          
          {/* top-level role aliases */}
          <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/invoices" element={<CustomerInvoices />} />
          <Route path="/customer/settings" element={<CustomerSettings />} />
          
          <Route path="/dispatcher" element={<Navigate to="/dispatcher/dashboard" replace />} />
          <Route path="/dispatcher/dashboard" element={<DispatcherDashboard />} />
          <Route path="/dispatcher/orders" element={<DispatcherOrders />} />
          <Route path="/dispatcher/map" element={<DispatcherMap />} />
          <Route path="/dispatcher/drivers" element={<DispatcherDrivers />} />
          <Route path="/dispatcher/analytics" element={<DispatcherAnalytics />} />
          <Route path="/dispatcher/notifications" element={<DispatcherNotifications />} />
          <Route path="/dispatcher/settings" element={<DispatcherSettings />} />
          
          <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/jobs" element={<DriverJobs />} />
          <Route path="/driver/available" element={<DriverAvailable />} />
          <Route path="/driver/completed" element={<DriverCompleted />} />
          <Route path="/driver/earnings" element={<DriverEarnings />} />
          <Route path="/driver/profile" element={<DriverProfile />} />
          <Route path="/driver/settings" element={<DriverSettings />} />
          
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/pricing" element={<AdminPricing />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/company" element={<AdminCompany />} />
          <Route path="/admin/system" element={<AdminSystem />} />
          <Route path="/admin/audit" element={<AdminAudit />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
