import { useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useGetMe } from "@/lib/api";
import { AdminLanguageProvider } from "@/hooks/use-admin-language";

import LoginPage from "./pages/login";
import DashboardOverview from "./pages/dashboard/overview";
import DashboardProducts from "./pages/dashboard/products";
import DashboardCategories from "./pages/dashboard/categories";
import DashboardInquiries from "./pages/dashboard/inquiries";
import DashboardOrders from "./pages/dashboard/orders";
import DashboardSiteImages from "./pages/dashboard/site-images";
import { DashboardLayout } from "./components/layout/dashboard-layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function useAuth() {
  return useGetMe({ query: { retry: false } });
}

function LoadingSpinner() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading, isError } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!isLoading && (isError || !user)) setLocation("/login");
  }, [isLoading, isError, user]);
  if (isLoading) return <LoadingSpinner />;
  if (isError || !user) return null;
  return <Component />;
}

function DashboardRoutes() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardOverview} />} />
        <Route path="/dashboard/products" component={() => <ProtectedRoute component={DashboardProducts} />} />
        <Route path="/dashboard/categories" component={() => <ProtectedRoute component={DashboardCategories} />} />
        <Route path="/dashboard/inquiries" component={() => <ProtectedRoute component={DashboardInquiries} />} />
        <Route path="/dashboard/orders" component={() => <ProtectedRoute component={DashboardOrders} />} />
        <Route path="/dashboard/site-images" component={() => <ProtectedRoute component={DashboardSiteImages} />} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch base="/admin">
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardRoutes} />
      <Route path="/dashboard/*" component={DashboardRoutes} />
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AdminLanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AdminLanguageProvider>
  );
}

export default App;
