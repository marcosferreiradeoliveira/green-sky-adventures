import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Pilot {
  id: string;
  name: string;
  city: string;
  state: string;
  description: string;
  rating: number;
  school: string;
  type: string;
  status?: 'pending' | 'approved' | 'rejected';
  demoPhotos?: string[];
}

const Index = () => {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Refs para controle de estado
  const isMountedRef = useRef(true);

  // Helper para verificar se o componente ainda está montado
  const safeSetState = useCallback((setter: () => void) => {
    if (isMountedRef.current) {
      try {
        setter();
      } catch (error) {
        console.warn('Error setting state:', error);
      }
    }
  }, []);

  // Função para buscar pilotos uma única vez
  const fetchPilots = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      
      // Query apenas para pilotos aprovados
      const q = query(
        collection(db, "pilots"),
        where("status", "==", "approved")
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!isMountedRef.current) return;
      
      const pilotsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          city: data.city || '',
          state: data.state || '',
          description: data.description || '',
          rating: typeof data.rating === 'number' ? data.rating : 0,
          school: data.school || '',
          type: data.type || '',
          status: data.status || 'pending',
          demoPhotos: Array.isArray(data.demoPhotos) ? data.demoPhotos : []
        } as Pilot;
      });
      
      safeSetState(() => {
        setPilots(pilotsData);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching pilots:', error);
      if (isMountedRef.current) {
        safeSetState(() => {
          setLoading(false);
        });
      }
    }
  }, [safeSetState]);

  // Efeito para carregar os pilotos quando o componente montar
  useEffect(() => {
    fetchPilots();
    
    // Cleanup no unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchPilots]);

  // Handle navigation with safety check
  const handleNavigateToPilot = useCallback((pilotId: string) => {
    if (isMountedRef.current) {
      navigate(`/piloto/${pilotId}`);
    }
  }, [navigate]);

  // Render do loading com verificação de estado
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <HeroSection hideSearchBar />
        <main className="container mx-auto px-4 py-8">
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-8">
            Pilotos em destaque
          </h1>
          <div className="text-center text-gray-500">Carregando pilotos...</div>
        </main>
        <FeaturesSection />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection hideSearchBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-8">
          Pilotos em destaque
        </h1>
        
        {pilots.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhum piloto aprovado encontrado no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pilots.map((pilot) => (
              <Card 
                key={pilot.id} 
                className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-32 w-full overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
                  {pilot.demoPhotos && pilot.demoPhotos.length > 0 ? (
                    <img 
                      src={pilot.demoPhotos[0]} 
                      alt={pilot.name || 'Piloto'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-gray-400 text-6xl">📷</span>';
                        }
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-6xl">📷</span>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full px-3 py-1 flex items-center gap-1 shadow text-yellow-500 font-bold text-base">
                    <span>⭐</span> 
                    {typeof pilot.rating === 'number' ? pilot.rating.toFixed(1) : 'N/A'}
                  </div>
                </div>
                
                <CardContent className="p-6 flex flex-col gap-2">
                  <div className="mb-2">
                    <span className="font-bold text-lg text-gray-900 block">
                      {pilot.school || 'Escola não informada'}
                    </span>
                    <span className="text-gray-500 font-semibold block text-base mt-1">
                      {pilot.type || 'Tipo não informado'}
                    </span>
                  </div>
                  
                  <div className="text-gray-700 text-sm mb-2">
                    {pilot.description 
                      ? pilot.description.slice(0, 100) + (pilot.description.length > 100 ? '...' : '') 
                      : 'Sem descrição disponível.'}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                    <span className="bg-gray-100 rounded px-2 py-1">
                      {pilot.state || 'Estado não informado'}
                    </span>
                    <span className="bg-gray-100 rounded px-2 py-1">
                      {pilot.city || 'Cidade não informada'}
                    </span>
                  </div>
                  
                  <Button 
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold" 
                    onClick={() => handleNavigateToPilot(pilot.id)}
                  >
                    Ver Perfil
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;