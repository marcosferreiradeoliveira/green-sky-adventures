import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useCallback, useRef } from "react";
import { logPageView } from "@/lib/firebase";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AddPilot from "./pages/AddPilot";
import EditProfile from "./pages/EditProfile";
import MyFlights from "./pages/MyFlights";
import EditarOferta from "./pages/EditarOferta";
import ProfilePilot from "./pages/ProfilePilot";
import NossoImpacto from "./pages/NossoImpacto";
import BancoDeSonhos from './pages/BancodeSonhos';

// Create QueryClient with stable configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Component to handle page view tracking
const PageViewTracker = () => {
  const location = useLocation();
  const lastLoggedPath = useRef<string>('');
  
  const getPageTitle = useCallback((pathname: string) => {
    const route = pathname.split('/')[1] || 'home';
    return route.charAt(0).toUpperCase() + route.slice(1);
  }, []);
  
  useEffect(() => {
    // Prevent duplicate logs for the same path
    if (location.pathname === lastLoggedPath.current) {
      return;
    }
    
    lastLoggedPath.current = location.pathname;
    
    try {
      const pageTitle = getPageTitle(location.pathname);
      logPageView(pageTitle, location.pathname);
    } catch (error) {
      // Silently handle analytics errors to prevent crashes
      console.warn('Analytics error:', error);
    }
  }, [location.pathname, getPageTitle]);
  
  return null;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageViewTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/busca" element={<SearchResults />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/add-pilot" element={<AddPilot />} />
            <Route path="/editar-perfil" element={<EditProfile />} />
            <Route path="/minhas-milhas" element={<MyFlights />} />
            <Route path="/editar-oferta" element={<EditarOferta />} />
            <Route path="/piloto/:id" element={<ProfilePilot />} />
            <Route path="/nosso-impacto" element={<NossoImpacto />} />
            <Route path="/banco-de-sonhos" element={<BancoDeSonhos />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;