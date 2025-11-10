import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Quote from "./pages/Quote";
import ThankYou from "./pages/ThankYou";
import Track from "./pages/Track";
import SignIn from "./pages/SignIn";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import DispatcherOrders from "./pages/dispatcher/DispatcherOrders";
import DriverJobs from "./pages/driver/DriverJobs";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/track" element={<Track />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/dispatcher/orders" element={<DispatcherOrders />} />
          <Route path="/driver/jobs" element={<DriverJobs />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
