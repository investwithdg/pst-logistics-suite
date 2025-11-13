import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
        <AuthProvider>
          <ErrorBoundary>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/track" element={<Track />} />
          <Route path="/route-replay" element={<RouteReplay />} />
          <Route path="/sign-in" element={<SignIn />} />
          
          {/* Customer routes */}
          <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={['customer']}><CustomerOrders /></ProtectedRoute>} />
          <Route path="/customer/invoices" element={<ProtectedRoute allowedRoles={['customer']}><CustomerInvoices /></ProtectedRoute>} />
          <Route path="/customer/settings" element={<ProtectedRoute allowedRoles={['customer']}><CustomerSettings /></ProtectedRoute>} />
          
          {/* Dispatcher routes */}
          <Route path="/dispatcher" element={<Navigate to="/dispatcher/dashboard" replace />} />
          <Route path="/dispatcher/dashboard" element={<ProtectedRoute allowedRoles={['dispatcher', 'admin']}><DispatcherDashboard /></ProtectedRoute>} />
          <Route path="/dispatcher/orders" element={<ProtectedRoute allowedRoles={['dispatcher', 'admin']}><DispatcherOrders /></ProtectedRoute>} />
          <Route path="/dispatcher/map" element={<ProtectedRoute allowedRoles={['dispatcher', 'admin']}><DispatcherMap /></ProtectedRoute>} />
          <Route path="/dispatcher/drivers" element={<ProtectedRoute allowedRoles={['dispatcher', 'admin']}><DispatcherDrivers /></ProtectedRoute>} />
          <Route path="/dispatcher/analytics" element={<ProtectedRoute allowedRoles={['dispatcher', 'admin']}><DispatcherAnalytics /></ProtectedRoute>} />
          <Route path="/dispatcher/notifications" element={<ProtectedRoute allowedRoles={['dispatcher', 'admin']}><DispatcherNotifications /></ProtectedRoute>} />
          <Route path="/dispatcher/settings" element={<ProtectedRoute allowedRoles={['dispatcher', 'admin']}><DispatcherSettings /></ProtectedRoute>} />
          
          {/* Driver routes */}
          <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
          <Route path="/driver/dashboard" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
          <Route path="/driver/jobs" element={<ProtectedRoute allowedRoles={['driver']}><DriverJobs /></ProtectedRoute>} />
          <Route path="/driver/available" element={<ProtectedRoute allowedRoles={['driver']}><DriverAvailable /></ProtectedRoute>} />
          <Route path="/driver/completed" element={<ProtectedRoute allowedRoles={['driver']}><DriverCompleted /></ProtectedRoute>} />
          <Route path="/driver/earnings" element={<ProtectedRoute allowedRoles={['driver']}><DriverEarnings /></ProtectedRoute>} />
          <Route path="/driver/profile" element={<ProtectedRoute allowedRoles={['driver']}><DriverProfile /></ProtectedRoute>} />
          <Route path="/driver/settings" element={<ProtectedRoute allowedRoles={['driver']}><DriverSettings /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/pricing" element={<ProtectedRoute allowedRoles={['admin']}><AdminPricing /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/company" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompany /></ProtectedRoute>} />
          <Route path="/admin/system" element={<ProtectedRoute allowedRoles={['admin']}><AdminSystem /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['admin']}><AdminAudit /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
