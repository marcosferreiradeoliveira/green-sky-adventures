
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Index = () => {
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pilots"), (snapshot) => {
      setPilots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection hideSearchBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-8">Pilotos em destaque</h1>
        {loading ? (
          <div className="text-center text-gray-500">Carregando pilotos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pilots.map((pilot) => (
              <Card key={pilot.id} className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative h-32 w-full overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
                  {pilot.demoPhotos && pilot.demoPhotos.length > 0 ? (
                    <img src={pilot.demoPhotos[0]} alt={pilot.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-6xl">📷</span>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full px-3 py-1 flex items-center gap-1 shadow text-yellow-500 font-bold text-base">
                    <span>⭐</span> {typeof pilot.rating === 'number' ? pilot.rating.toFixed(1) : 'N/A'}
                  </div>
                </div>
                <CardContent className="p-6 flex flex-col gap-2">
                  <div className="mb-2">
                    <span className="font-bold text-lg text-gray-900 block">{pilot.school}</span>
                    <span className="text-gray-500 font-semibold block text-base mt-1">{pilot.type}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {/* Rating agora está sobre a imagem */}
                  </div>
                  <div className="text-gray-700 text-sm mb-2">
                    {pilot.description ? pilot.description.slice(0, 100) + (pilot.description.length > 100 ? '...' : '') : 'Sem descrição.'}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                    <span className="bg-gray-100 rounded px-2 py-1">{pilot.state}</span>
                    <span className="bg-gray-100 rounded px-2 py-1">{pilot.city}</span>
                  </div>
                  <Button className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={() => navigate(`/piloto/${pilot.id}`)}>
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
