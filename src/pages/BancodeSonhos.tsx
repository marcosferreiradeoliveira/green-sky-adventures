import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Plane, TreePine, GraduationCap, Hospital, Home, HandHeart } from "lucide-react";

// Error boundary to catch and display errors
class BancoDeSonhosErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Error in BancoDeSonhos:', error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Algo deu errado</h2>
          <p className="mb-4">Por favor, recarregue a página ou tente novamente mais tarde.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const BancoDeSonhos = () => {
  // Track render count to prevent infinite loops
  const renderCount = useRef(0);
  
  // Debug: Log component mount
  useEffect(() => {
    console.log('BancoDeSonhos component mounted');
    renderCount.current = 0; // Reset on mount
    
    return () => {
      console.log('BancoDeSonhos component unmounted');
    };
  }, []);
  
  // Track renders and prevent infinite loops
  useEffect(() => {
    renderCount.current += 1;
    console.log(`BancoDeSonhos render #${renderCount.current}`);
    
    if (renderCount.current > 20) {
      console.error('Possible infinite loop detected in BancoDeSonhos');
      // Force an error to be caught by the error boundary
      throw new Error('Possible infinite loop detected');
    }
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");

  const categories = [
    { id: "todas", label: "Todas as categorias", icon: HandHeart },
    { id: "viagem", label: "Viagem", icon: Plane },
    { id: "meio-ambiente", label: "Meio Ambiente", icon: TreePine },
    { id: "educacao", label: "Educação", icon: GraduationCap },
    { id: "saude", label: "Saúde", icon: Hospital },
    { id: "habitacao", label: "Habitação", icon: Home },
  ];

  const organizations = [
    {
      id: 1,
      name: "Sonhos de Voar",
      description: "Realizamos o sonho de voar de crianças em tratamento médico",
      category: "viagem",
      logo: "✈️",
      pointsNeeded: 500,
      totalDonated: "12.450",
      beneficiaries: "45 crianças",
      color: "bg-skyblue-50 border-skyblue-200"
    },
    {
      id: 2,
      name: "Planeta Verde",
      description: "Reflorestamento e proteção de áreas de preservação ambiental",
      category: "meio-ambiente",
      logo: "🌳",
      pointsNeeded: 1000,
      totalDonated: "8.720",
      beneficiaries: "2.500 árvores plantadas",
      color: "bg-greensky-50 border-greensky-200"
    },
    {
      id: 3,
      name: "Educação para Todos",
      description: "Bolsas de estudo para jovens de baixa renda",
      category: "educacao",
      logo: "📚",
      pointsNeeded: 750,
      totalDonated: "15.300",
      beneficiaries: "128 estudantes",
      color: "bg-sunset-50 border-sunset-200"
    },
    {
      id: 4,
      name: "Saúde Solidária",
      description: "Tratamentos médicos para famílias em situação vulnerável",
      category: "saude",
      logo: "🏥",
      pointsNeeded: 1500,
      totalDonated: "22.180",
      beneficiaries: "89 famílias",
      color: "bg-sky-50 border-sky-200"
    },
    {
      id: 5,
      name: "Teto para Todos",
      description: "Construção de moradias populares em comunidades carentes",
      category: "habitacao",
      logo: "🏠",
      pointsNeeded: 2000,
      totalDonated: "31.560",
      beneficiaries: "18 casas construídas",
      color: "bg-purple-50 border-purple-200"
    },
    {
      id: 6,
      name: "Asas da Esperança",
      description: "Voos gratuitos para reunir famílias em momentos especiais",
      category: "viagem",
      logo: "🕊️",
      pointsNeeded: 800,
      totalDonated: "9.890",
      beneficiaries: "67 famílias reunidas",
      color: "bg-blue-50 border-blue-200"
    }
  ];

  // Memoize the filtered organizations with a limit on the number of items
  const filteredOrganizations = useCallback(() => {
    console.log('Filtering organizations...');
    try {
      const result = organizations.filter(org => {
        const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            org.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "todas" || org.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
      
      // Safety check
      if (!Array.isArray(result)) {
        console.error('Filtered organizations is not an array:', result);
        return [];
      }
      
      return result;
    } catch (error) {
      console.error('Error filtering organizations:', error);
      return [];
    }
  }, [searchTerm, selectedCategory]);

  const handleDonate = (orgId: number, points: number) => {
    // Aqui seria implementada a lógica de doação
    alert(`Obrigado por doar ${points} milhas para esta causa! 💝`);
  };

  return (
    <BancoDeSonhosErrorBoundary>
      <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4 text-gray-900">
              <Heart className="inline-block mr-3 text-sunset-600" size={48} />
              Banco de Sonhos
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Transforme suas milhas em sorrisos. Doe para organizações que fazem a diferença 
              e ajude a realizar sonhos de pessoas que precisam.
            </p>
            <div className="bg-gradient-to-r from-greensky-50 to-skyblue-50 p-6 rounded-lg border border-greensky-200">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                💰 Total arrecadado: <span className="text-greensky-600">127.450 milhas</span>
              </p>
              <p className="text-sm text-gray-600">
                Mais de 350 vidas já foram impactadas pelas suas doações
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Buscar organizações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-sm"
                >
                  <category.icon className="mr-2" size={16} />
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations().map((org) => (
            <Card key={org.id} className={`${org.color} border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden`}>
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4">{org.logo}</div>
                <CardTitle className="text-xl font-heading font-semibold text-gray-900 mb-2">
                  {org.name}
                </CardTitle>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {org.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Impacto</span>
                    <Badge variant="secondary" className="text-xs">
                      {org.beneficiaries}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    💝 Total doado: <span className="font-semibold text-greensky-600">{org.totalDonated} milhas</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    {org.pointsNeeded} milhas
                  </div>
                  <Button 
                    onClick={() => handleDonate(org.id, org.pointsNeeded)}
                    className="bg-gradient-to-r from-greensky-600 to-skyblue-600 hover:from-greensky-700 hover:to-skyblue-700 text-white"
                  >
                    Doar Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrganizations().length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhuma organização encontrada
            </h3>
            <p className="text-gray-600">
              Tente ajustar seus filtros ou termo de busca
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
              Quer cadastrar sua organização?
            </h3>
            <p className="text-gray-600 mb-6">
              Se você representa uma organização sem fins lucrativos e gostaria de participar 
              do nosso Banco de Sonhos, entre em contato conosco.
            </p>
            <Button size="lg" variant="outline" className="border-2 border-greensky-600 text-greensky-600 hover:bg-greensky-600 hover:text-white">
              Cadastrar Organização
            </Button>
          </div>
        </div>
      </div>
    </div>
  </BancoDeSonhosErrorBoundary>
  );
};

export default BancoDeSonhos;