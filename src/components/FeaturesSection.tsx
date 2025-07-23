
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const FeaturesSection = () => {
  const features = [
    {
      icon: "🎯",
      title: "Milhas Green Sky",
      description: "Acumule milhas a cada voo e troque por novas aventuras ou doe para nosso Banco de Sonhos.",
      color: "bg-greensky-50 border-greensky-200"
    },
    {
      icon: "💝",
      title: "Banco de Sonhos",
      description: "Suas milhas podem realizar o sonho de voar de pessoas que não têm condições financeiras.",
      color: "bg-sunset-50 border-sunset-200"
    },
    {
      icon: "🌱",
      title: "Créditos de Carbono",
      description: "Cada voo gera créditos que investimos em projetos de reflorestamento e energia limpa.",
      color: "bg-skyblue-50 border-skyblue-200"
    }
  ];

  return (
    <section id="impacto" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-5xl mb-6 text-gray-900">
            Sua Aventura
            <span className="bg-gradient-to-r from-greensky-600 to-skyblue-600 bg-clip-text text-transparent"> Transforma </span>
            o Mundo
          </h2>
          <p className="text-xl text-gray-600">
            Na nossa plataforma, cada voo é uma oportunidade de criar impacto positivo. 
            Descubra como sua paixão pela aventura pode fazer a diferença.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.color} border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-2`}>
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle className="text-xl font-heading font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-greensky-600 text-greensky-600 hover:bg-greensky-600 hover:text-white transition-colors px-8 py-3"
            onClick={() => window.location.href = '/nosso-impacto'}
          >
            Saiba Mais Sobre Nosso Impacto
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
