
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const [metrics] = useState({
    newContacts: 15,
    confirmedFlights: 8,
    registeredPilots: 42,
    dreamBankCredits: 2850,
    peopleInQueue: 7,
    carbonCredits: 1240,
    treesEquivalent: 31
  });

  const dreamBankQueue = [
    { id: 1, name: "Ana Silva", story: "Sonha em voar desde criança", waitTime: "3 meses" },
    { id: 2, name: "Pedro Santos", story: "Pessoa com deficiência que quer superar limites", waitTime: "2 meses" },
    { id: 3, name: "Maria José", story: "Idosa de 68 anos com sonho de voar", waitTime: "1 mês" }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-3xl text-gray-900 mb-2">
              Painel Administrativo Green Sky
            </h1>
            <p className="text-gray-600">Dashboard de controle e métricas</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">GS</span>
            </div>
            <span className="font-semibold text-greensky-800">Admin</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="pilots">Pilotos</TabsTrigger>
            <TabsTrigger value="dreams">Banco de Sonhos</TabsTrigger>
            <TabsTrigger value="carbon">Créditos de Carbono</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-primary text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Novos Contatos</p>
                      <p className="text-3xl font-bold">{metrics.newContacts}</p>
                      <p className="text-white/80 text-xs">Últimas 24h</p>
                    </div>
                    <div className="text-4xl">📞</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-sunset text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Voos Confirmados</p>
                      <p className="text-3xl font-bold">{metrics.confirmedFlights}</p>
                      <p className="text-white/80 text-xs">Este mês</p>
                    </div>
                    <div className="text-4xl">✈️</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Pilotos Cadastrados</p>
                      <p className="text-3xl font-bold text-gray-900">{metrics.registeredPilots}</p>
                      <p className="text-gray-500 text-xs">Total ativo</p>
                    </div>
                    <div className="text-4xl">👨‍✈️</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-xl">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-greensky-50 rounded-lg">
                    <div className="w-2 h-2 bg-greensky-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Novo contato com piloto Carlos Silva</p>
                      <p className="text-sm text-gray-600">há 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-sunset-50 rounded-lg">
                    <div className="w-2 h-2 bg-sunset-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Voo confirmado - 200 milhas creditadas</p>
                      <p className="text-sm text-gray-600">há 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-skyblue-50 rounded-lg">
                    <div className="w-2 h-2 bg-skyblue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Sonho realizado através do Banco de Sonhos</p>
                      <p className="text-sm text-gray-600">há 1 dia</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dreams" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Dream Bank Stats */}
              <Card className="bg-gradient-primary text-white border-0">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">💝</div>
                  <div className="text-2xl font-bold mb-2">{metrics.dreamBankCredits}</div>
                  <div className="text-white/80">Créditos Acumulados</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-sunset text-white border-0">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">⏰</div>
                  <div className="text-2xl font-bold mb-2">{metrics.peopleInQueue}</div>
                  <div className="text-white/80">Pessoas na Fila</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">✨</div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">12</div>
                  <div className="text-gray-600">Sonhos Realizados</div>
                </CardContent>
              </Card>
            </div>

            {/* Dream Queue */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-xl">Fila do Banco de Sonhos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dreamBankQueue.map((person) => (
                    <div key={person.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{person.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{person.story}</p>
                        <Badge variant="secondary">Aguardando há {person.waitTime}</Badge>
                      </div>
                      <Button className="bg-gradient-primary">
                        Conceder Voo
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="carbon" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-primary text-white border-0">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-4">🌱</div>
                  <div className="text-3xl font-bold mb-2">{metrics.carbonCredits}</div>
                  <div className="text-white/80 text-lg">Créditos de Carbono Gerados</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-4">🌳</div>
                  <div className="text-3xl font-bold text-greensky-700 mb-2">{metrics.treesEquivalent}</div>
                  <div className="text-gray-600 text-lg">Equivalente a árvores plantadas</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-xl">Projetos de Sustentabilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-greensky-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-greensky-800 mb-2">Reflorestamento Amazônia</h3>
                    <p className="text-gray-600 text-sm mb-3">Parceria para plantio de árvores nativas</p>
                    <div className="text-2xl font-bold text-greensky-700">847 créditos</div>
                  </div>
                  <div className="bg-skyblue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-skyblue-800 mb-2">Energia Solar</h3>
                    <p className="text-gray-600 text-sm mb-3">Investimento em energia limpa</p>
                    <div className="text-2xl font-bold text-skyblue-700">393 créditos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pilots" className="space-y-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-xl">Gerenciamento de Pilotos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚁</div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-2">
                    Seção em Desenvolvimento
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Aqui você poderá gerenciar todos os pilotos cadastrados, aprovar novos registros e monitorar avaliações.
                  </p>
                  <Button className="bg-gradient-primary">
                    Em Breve
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
