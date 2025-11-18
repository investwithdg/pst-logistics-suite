import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const Quote = lazy(() => import("./pages/Quote"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Track = lazy(() => import("./pages/Track"));
const RouteReplay = lazy(() => import("./pages/RouteReplay"));
const SignIn = lazy(() => import("./pages/SignIn"));
const CustomerDashboard = lazy(() => import("./pages/customer/CustomerDashboard"));
const CustomerOrders = lazy(() => import("./pages/customer/CustomerOrders"));
const CustomerTrack = lazy(() => import("./pages/customer/CustomerTrack"));
const CustomerInvoices = lazy(() => import("./pages/customer/CustomerInvoices"));
const CustomerSettings = lazy(() => import("./pages/customer/CustomerSettings"));
const DispatcherOrders = lazy(() => import("./pages/dispatcher/DispatcherOrders"));
const DispatcherDashboard = lazy(() => import("./pages/dispatcher/DispatcherDashboard"));
const DispatcherMap = lazy(() => import("./pages/dispatcher/DispatcherMap"));
const DispatcherDrivers = lazy(() => import("./pages/dispatcher/DispatcherDrivers"));
const DispatcherAnalytics = lazy(() => import("./pages/dispatcher/DispatcherAnalytics"));
const DispatcherNotifications = lazy(() => import("./pages/dispatcher/DispatcherNotifications"));
const DispatcherSettings = lazy(() => import("./pages/dispatcher/DispatcherSettings"));
const DriverJobs = lazy(() => import("./pages/driver/DriverJobs"));
const DriverDashboard = lazy(() => import("./pages/driver/DriverDashboard"));
const DriverAvailable = lazy(() => import("./pages/driver/DriverAvailable"));
const DriverCompleted = lazy(() => import("./pages/driver/DriverCompleted"));
const DriverEarnings = lazy(() => import("./pages/driver/DriverEarnings"));
const DriverProfile = lazy(() => import("./pages/driver/DriverProfile"));
const DriverSettings = lazy(() => import("./pages/driver/DriverSettings"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminWebhooks = lazy(() => import("./pages/admin/AdminWebhooks"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminCompany = lazy(() => import("./pages/admin/AdminCompany"));
const AdminSystem = lazy(() => import("./pages/admin/AdminSystem"));
const AdminAudit = lazy(() => import("./pages/admin/AdminAudit"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
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
                  <Route path="/customer/track" element={<ProtectedRoute allowedRoles={['customer']}><CustomerTrack /></ProtectedRoute>} />
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
                  <Route path="/admin/webhooks" element={<ProtectedRoute allowedRoles={['admin']}><AdminWebhooks /></ProtectedRoute>} />
                  <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
                  <Route path="/admin/company" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompany /></ProtectedRoute>} />
                  <Route path="/admin/system" element={<ProtectedRoute allowedRoles={['admin']}><AdminSystem /></ProtectedRoute>} />
                  <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['admin']}><AdminAudit /></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
          </ErrorBoundary>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
