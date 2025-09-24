import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
// import Quiltt from "./Quiltt";
import Dashboard from "./pages/Dashboard";
import Bills from "./pages/Bills";
import Rewards from "./pages/Rewards";
import Pricing from "./pages/Pricing";
// import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
// Mobile pages
import MobileDashboard from "./pages/mobile/MobileDashboard";
import MobileBills from "./pages/mobile/MobileBills";
import MobileRewards from "./pages/mobile/MobileRewards";
import MobilePayments from "./pages/mobile/MobilePayments";
import MobileProfile from "./pages/mobile/MobileProfile";
import Quiltt from "./Quiltt";
import Loading from "./pages/Loading";
import QuilttProviderGate from "./QuilttProviderGate";
import AddCard from "./pages/AddCard";

const queryClient = new QueryClient();

const AppContent = () => {
  const isMobile = useIsMobile();

  return (
    <Routes>
      {/* Public routes - no Quiltt needed */}
      <Route path="/" element={<Index />} />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route path="/quiltt" element={<Quiltt />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/loading" element={<Loading />} />

      {/* Protected routes with Quiltt */}
      <Route
        path="/dashboard"
        element={
          <QuilttProviderGate>
            <ProtectedRoute>
              {isMobile ? <MobileDashboard /> : <Dashboard />}
            </ProtectedRoute>
          </QuilttProviderGate>
        }
      />
      <Route
        path="/bills"
        element={
          <QuilttProviderGate>
            <ProtectedRoute>
              {isMobile ? <MobileBills /> : <Bills />}
            </ProtectedRoute>
          </QuilttProviderGate>
        }
      />
      <Route
        path="/rewards"
        element={
          <QuilttProviderGate>
            <ProtectedRoute>
              {isMobile ? <MobileRewards /> : <Rewards />}
            </ProtectedRoute>
          </QuilttProviderGate>
        }
      />
      <Route
        path="/payments"
        element={
          <QuilttProviderGate>
            <ProtectedRoute>
          <MobilePayments />
            </ProtectedRoute>
          </QuilttProviderGate>
        }
      >
        <Route path="addCard" element={<AddCard />} />
      </Route>

      <Route
        path="/profile"
        element={
          <QuilttProviderGate>
            <ProtectedRoute>
              <MobileProfile />
            </ProtectedRoute>
          </QuilttProviderGate>
        }
      />
      {/* <Route
        path="/addCard"
        element={
          <AddCard />
        }
      /> */}

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
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
