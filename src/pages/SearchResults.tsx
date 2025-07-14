import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import PilotCard from "@/components/PilotCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Pilot {
  id: string;
  name: string;
  school: string;
  photo: string;
  type: string;
  location: string;
  price: string;
  rating: number;
  experience: string;
  whatsapp?: string;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') || '';
  const [searchTerm, setSearchTerm] = useState(location);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = collection(db, "pilots");
    // Filtro simples por localização ou nome
    if (searchTerm) {
      // Firestore não suporta contains em múltiplos campos, então filtramos no client
      onSnapshot(q, (snapshot) => {
        const all = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            pilotId: data.pilotId || '',
            name: data.name || '',
            school: data.school || '',
            photo: data.photo || '',
            type: data.type || '',
            location: data.location || '',
            price: data.price || '',
            rating: typeof data.rating === 'number' ? data.rating : 0,
            experience: data.experience || '',
            whatsapp: data.whatsapp || '',
          };
        });
        setPilots(
          all.filter(pilot =>
            pilot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pilot.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
        setLoading(false);
      });
    } else {
      onSnapshot(q, (snapshot) => {
        setPilots(snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            pilotId: data.pilotId || '',
            name: data.name || '',
            school: data.school || '',
            photo: data.photo || '',
            type: data.type || '',
            location: data.location || '',
            price: data.price || '',
            rating: typeof data.rating === 'number' ? data.rating : 0,
            experience: data.experience || '',
            whatsapp: data.whatsapp || '',
          };
        }));
        setLoading(false);
      });
    }
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">
                Pilotos em {location || 'sua região'}
              </h1>
              <p className="text-gray-600">
                {pilots.length} pilotos encontrados • Todos certificados e verificados
              </p>
            </div>
            
            <Card className="lg:w-96 bg-white border shadow-sm">
              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Refinar busca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="bg-gradient-primary">
                    Buscar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading ? (
            <div className="col-span-full text-center text-gray-500">Carregando pilotos...</div>
          ) : pilots.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">Nenhum piloto encontrado.</div>
          ) : (
            pilots.map((pilot) => (
              <PilotCard key={pilot.id} pilot={pilot} />
            ))
          )}
        </div>

        {/* Load More (desabilitado para Firestore realtime) */}
        {/* <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="border-greensky-600 text-greensky-600 hover:bg-greensky-50"
          >
            Carregar Mais Pilotos
          </Button>
        </div> */}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
