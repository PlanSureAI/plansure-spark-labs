import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Compliance from "./pages/Compliance";
import Investment from "./pages/Investment";
import Energy from "./pages/Energy";
import SharedAnalysis from "./pages/SharedAnalysis";
import Workspaces from "./pages/Workspaces";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log("[App] Initializing application");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OnboardingProvider>
              <WorkspaceProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/share/:shareToken" element={<SharedAnalysis />} />
                  
                  {/* Authenticated routes with layout */}
                  <Route element={<AuthenticatedLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/compliance" element={<Compliance />} />
                    <Route path="/investment" element={<Investment />} />
                    <Route path="/energy" element={<Energy />} />
                    <Route path="/workspaces" element={<Workspaces />} />
                  </Route>
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </WorkspaceProvider>
            </OnboardingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
