
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import PilotCard from "@/components/PilotCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') || '';
  const [searchTerm, setSearchTerm] = useState(location);

  // Mock pilots data
  const pilots = [
    {
      id: 1,
      name: "Carlos Silva",
      school: "Voo Livre Rio",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      type: "Parapente",
      location: "Rio de Janeiro, RJ",
      price: "A partir de R$ 800",
      rating: 4.9,
      experience: "15 anos"
    },
    {
      id: 2,
      name: "Maria Santos",
      school: "Asa Delta SP",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=300&h=300&fit=crop&crop=face",
      type: "Asa Delta",
      location: "São Paulo, SP",
      price: "A partir de R$ 650",
      rating: 4.8,
      experience: "12 anos"
    },
    {
      id: 3,
      name: "João Pereira",
      school: "Aventura Vertical",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      type: "Parapente",
      location: "Minas Gerais, MG",
      price: "A partir de R$ 750",
      rating: 4.7,
      experience: "10 anos"
    }
  ];

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
          {pilots.map((pilot) => (
            <PilotCard key={pilot.id} pilot={pilot} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="border-greensky-600 text-greensky-600 hover:bg-greensky-50"
          >
            Carregar Mais Pilotos
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
