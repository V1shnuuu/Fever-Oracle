import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import LiveMap from "./pages/LiveMap";
import PatientRisk from "./pages/PatientRisk";
import KafkaExport from "./pages/KafkaExport";
import Alerts from "./pages/Alerts";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import Chatbot from "./components/Chatbot";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
    <>
      <Navigation />
      {children}
      <Chatbot />
    </>
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><DashboardLayout><LiveMap /></DashboardLayout></ProtectedRoute>} />
              <Route path="/kafka" element={<ProtectedRoute><DashboardLayout><KafkaExport /></DashboardLayout></ProtectedRoute>} />
              <Route path="/patient-risk" element={<ProtectedRoute><DashboardLayout><PatientRisk /></DashboardLayout></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><DashboardLayout><Alerts /></DashboardLayout></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
