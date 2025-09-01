import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import PlaidButton from "./AppPlaidTesting";
import Quiltt from "./Quiltt";
// import Dashboard from "./pages/Dashboard";
// import Bills from "./pages/Bills";
// import Rewards from "./pages/Rewards";
// import Pricing from "./pages/Pricing";
// import UserDashboard from "./pages/UserDashboard";
// import NotFound from "./pages/NotFound";
// import ProtectedRoute from "./components/ProtectedRoute";
// Mobile pages
// import MobileDashboard from "./pages/mobile/MobileDashboard";
// import MobileBills from "./pages/mobile/MobileBills";
// import MobileRewards from "./pages/mobile/MobileRewards";
// import MobilePayments from "./pages/mobile/MobilePayments";
// import MobileProfile from "./pages/mobile/MobileProfile";

const queryClient = new QueryClient();

const AppContent = () => {
  // const isMobile = useIsMobile();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
    <Route path="/quiltt" element={<Quiltt />} />
      {/* <Route path="/dashboard" element={
        <ProtectedRoute>
          {isMobile ? <MobileDashboard /> : <Dashboard />}
        </ProtectedRoute>
      } /> */}
      {/* <Route path="/bills" element={
        <ProtectedRoute>
          {isMobile ? <MobileBills /> : <Bills />}
        </ProtectedRoute>
      } /> */}
      {/* <Route path="/rewards" element={
        <ProtectedRoute>
          {isMobile ? <MobileRewards /> : <Rewards />}
        </ProtectedRoute>
      } /> */}
      {/* <Route path="/payments" element={
        <ProtectedRoute>
          <MobilePayments />
        </ProtectedRoute>
      } /> */}
      {/* <Route path="/profile" element={
        <ProtectedRoute>
          <MobileProfile />
        </ProtectedRoute>
      } /> */}
      {/* <Route path="/pricing" element={<Pricing />} /> */}
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </TooltipProvider>
  </QueryClientProvider>
);

export default App;
