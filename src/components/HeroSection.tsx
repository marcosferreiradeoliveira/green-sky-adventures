
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface HeroSectionProps {
  searchLocation: string;
  setSearchLocation: (value: string) => void;
  onSearch: () => void;
}

const HeroSection = ({ searchLocation, setSearchLocation, onSearch }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
            Voe com Aventura,
            <br />
            <span className="bg-gradient-to-r from-greensky-400 to-skyblue-400 bg-clip-text text-transparent">
              Voe com Propósito
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Conectamos você aos melhores pilotos de voo livre. 
            Cada aventura gera impacto positivo no mundo.
          </p>

          {/* Search Bar */}
          <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl mb-8">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Para onde você quer voar? (Cidade/Estado)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="flex-1 h-12 text-lg border-0 bg-transparent placeholder:text-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                />
                <Button 
                  onClick={onSearch}
                  size="lg"
                  className="h-12 px-8 bg-gradient-sunset hover:opacity-90 transition-opacity font-semibold"
                >
                  Buscar Voos
                </Button>
              </div>
            </div>
          </Card>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm font-medium">Pilotos Certificados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌍</div>
              <div className="text-sm font-medium">Impacto Sustentável</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✨</div>
              <div className="text-sm font-medium">+1000 Voos Realizados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
