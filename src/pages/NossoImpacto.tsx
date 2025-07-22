import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TreePine, Plane, Leaf, Heart, Users, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

interface ImpactMetrics {
  treesPlanted: number;
  dreamsFulfilled: number;
  co2Compensated: number; // in kg
}

const NossoImpacto = () => {
  const [metrics, setMetrics] = useState<ImpactMetrics>({
    treesPlanted: 0,
    dreamsFulfilled: 0,
    co2Compensated: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setMetrics({
        treesPlanted: 2847,
        dreamsFulfilled: 143,
        co2Compensated: 18200 // kg
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const impactStats = [
    {
      icon: TreePine,
      title: "Árvores Plantadas",
      value: formatNumber(metrics.treesPlanted),
      description: "Plantadas através de nossos projetos de reflorestamento"
    },
    {
      icon: Users,
      title: "Sonhos Realizados",
      value: formatNumber(metrics.dreamsFulfilled),
      description: "Viagens inesquecíveis proporcionadas pelo Banco de Sonhos"
    },
    {
      icon: Target,
      title: "CO² Compensado",
      value: `${formatNumber(metrics.co2Compensated / 1000)} ton`,
      description: "De emissões de carbono neutralizadas em nossos voos"
    }
  ];

  const features = [
    {
      icon: Heart,
      title: "Missão",
      description: "Tornar a aviação acessível e sustentável, conectando pessoas a experiências inesquecíveis."
    },
    {
      icon: Leaf,
      title: "Sustentabilidade",
      description: "Compensamos 100% das emissões de carbono geradas por cada voo."
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Uma rede de pilotos apaixonados por voar e fazer a diferença."
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-green-600 to-green-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Nosso Impacto
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Cada voo no Green Sky gera um impacto positivo real. Conheça como transformamos 
              aventuras em ações concretas para o meio ambiente e a sociedade.
            </p>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossos Números</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Cada número representa uma história de impacto positivo no meio ambiente e na vida das pessoas.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {impactStats.map((stat, index) => (
                <Card key={index} className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <stat.icon className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-xl font-semibold text-gray-800 mb-3">{stat.title}</p>
                  <p className="text-gray-600">{stat.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossa Missão</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Estamos comprometidos em transformar a aviação em uma força para o bem
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Pronto para voar com propósito?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Junte-se a nós nessa jornada de transformação da aviação em uma força para o bem do planeta.
            </p>
            <div className="flex justify-center">
              <Button 
                variant="secondary" 
                className="bg-white text-green-700 hover:bg-green-50 px-8 py-6 text-lg font-semibold"
                onClick={() => window.location.href = '/busca'}
              >
                Encontrar um voo
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NossoImpacto;