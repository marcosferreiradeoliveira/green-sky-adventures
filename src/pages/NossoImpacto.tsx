import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Leaf, Heart, TreePine, Users, Target, Award } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NossoImpacto = () => {
  const impactStats = [
    {
      icon: TreePine,
      title: "Árvores Plantadas",
      value: "2,847",
      description: "Através dos nossos créditos de carbono"
    },
    {
      icon: Users,
      title: "Sonhos Realizados",
      value: "143",
      description: "Voos doados pelo Banco de Sonhos"
    },
    {
      icon: Target,
      title: "Toneladas de CO²",
      value: "18.2",
      description: "Compensadas em projetos ambientais"
    },
    {
      icon: Award,
      title: "Milhas Doadas",
      value: "89,340",
      description: "Convertidas em impacto social"
    }
  ];

  const sustainabilityProjects = [
    {
      title: "Reflorestamento da Mata Atlântica",
      location: "Serra da Mantiqueira, SP",
      progress: 78,
      description: "Plantio de espécies nativas em parceria com o Instituto Florestal",
      impact: "450 árvores plantadas este ano"
    },
    {
      title: "Energia Solar Comunitária",
      location: "Vale do Paraíba, RJ",
      progress: 45,
      description: "Instalação de painéis solares em comunidades rurais",
      impact: "12 famílias beneficiadas"
    },
    {
      title: "Preservação de Nascentes",
      location: "Chapada Diamantina, BA",
      progress: 92,
      description: "Proteção e recuperação de mananciais naturais",
      impact: "3 nascentes recuperadas"
    }
  ];

  const dreamsBankStories = [
    {
      name: "Maria Santos",
      age: 67,
      story: "Sempre sonhou em voar, mas nunca teve condições. Após aposentadoria, realizou o sonho através do Banco de Sonhos.",
      location: "Rio de Janeiro, RJ"
    },
    {
      name: "João Oliveira",
      age: 12,
      story: "Criança de comunidade carente que ganhou um voo duplo e descobriu sua paixão pela aviação.",
      location: "São Paulo, SP"
    },
    {
      name: "Ana Costa",
      age: 34,
      story: "Mãe solo que recebeu um voo como presente depois de um período difícil em sua vida.",
      location: "Minas Gerais, MG"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-heading font-bold text-4xl md:text-6xl mb-6 text-gray-900">
              Nosso
              <span className="bg-gradient-to-r from-greensky-600 to-skyblue-600 bg-clip-text text-transparent"> Impacto </span>
              no Mundo
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Cada voo no Green Sky gera um impacto positivo real. Conheça como transformamos 
              aventuras em ações concretas para o meio ambiente e a sociedade.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-3">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sustentabilidade Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 text-gray-900">
              Compromisso com a Sustentabilidade
            </h2>
            <p className="text-lg text-gray-600">
              Nossos créditos de carbono financiam projetos reais de preservação e recuperação ambiental 
              em todo o Brasil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sustainabilityProjects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-heading text-gray-900">
                    {project.title}
                  </CardTitle>
                  <p className="text-sm text-primary font-medium">{project.location}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progresso</span>
                        <span className="font-medium text-gray-900">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <p className="text-sm font-medium text-primary">
                        {project.impact}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Banco de Sonhos Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Heart className="w-12 h-12 text-sunset-500 mx-auto mb-4" />
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 text-gray-900">
              Banco de Sonhos
            </h2>
            <p className="text-lg text-gray-600">
              Histórias reais de pessoas que realizaram o sonho de voar através da 
              generosidade da nossa comunidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dreamsBankStories.map((story, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-sunset-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-sunset-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">✈️</span>
                  </div>
                  <CardTitle className="text-lg font-heading text-gray-900">
                    {story.name}, {story.age} anos
                  </CardTitle>
                  <p className="text-sm text-sunset-600 font-medium">{story.location}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed text-center italic">
                    "{story.story}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-sunset-500 hover:bg-sunset-600 text-white px-8 py-3"
            >
              Contribute para o Banco de Sonhos
            </Button>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 text-gray-900">
              Como Seu Voo Gera Impacto
            </h2>
            <p className="text-lg text-gray-600">
              Entenda o processo transparente de como cada reserva se transforma em ação positiva.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3 text-gray-900">
                  Você Voa
                </h3>
                <p className="text-gray-600">
                  Cada voo reservado automaticamente destina uma porcentagem para nossos projetos de impacto.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3 text-gray-900">
                  Geramos Créditos
                </h3>
                <p className="text-gray-600">
                  Convertemos parte do valor em créditos de carbono e milhas para o Banco de Sonhos.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3 text-gray-900">
                  Impacto Real
                </h3>
                <p className="text-gray-600">
                  Investimos em projetos ambientais verificados e realizamos sonhos através do Banco de Sonhos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 text-gray-900">
              Pronto para Voar com Propósito?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Faça parte da nossa comunidade e transforme sua aventura em impacto positivo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-3">
                Buscar Voos
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3">
                Seja um Piloto Parceiro
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NossoImpacto;