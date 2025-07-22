import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
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

const queryClient = new QueryClient();

// Component to handle page view tracking
const PageViewTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Get the current route name for analytics
    const getPageTitle = (pathname: string) => {
      const route = pathname.split('/')[1] || 'home';
      return route.charAt(0).toUpperCase() + route.slice(1);
    };
    
    const pageTitle = getPageTitle(location.pathname);
    logPageView(pageTitle, location.pathname);
  }, [location]);
  
  return null;
};

const App = () => (
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
