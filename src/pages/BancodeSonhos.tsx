import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import Header from "@/components/Header";

const BancoDeSonhos = () => {
  const [selectedCategory] = useState("todas");

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

  const handleDonate = (orgId: number, points: number) => {
    // Aqui seria implementada a lógica de doação
    alert(`Obrigado por doar ${points} milhas para esta causa! 💝`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
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

        {/* Organizations Grid */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations
              .filter(org => selectedCategory === 'todas' || org.category === selectedCategory)
              .map((org) => (
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

          {organizations.filter(org => selectedCategory === 'todas' || org.category === selectedCategory).length === 0 && (
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
        </div>
      </main>
    </div>
  );
};

export default BancoDeSonhos;