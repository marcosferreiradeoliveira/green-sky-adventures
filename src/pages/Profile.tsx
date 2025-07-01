import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserCircle } from "lucide-react";

const Profile = () => {
  const [milesBalance] = useState(1250);
  const [referralLink] = useState("https://greensky.com/ref/user123");
  const { toast } = useToast();
  const navigate = useNavigate();

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link copiado! 📋",
      description: "Compartilhe com seus amigos e ganhe mais milhas!",
    });
  };

  const handleMilesAction = (action: string) => {
    toast({
      title: `${action} em desenvolvimento! ⏳`,
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
              <UserCircle className="w-20 h-20 text-gray-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              ✨
            </div>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">
            Olá, Aventureiro! 👋
          </h1>
          <Button className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={() => navigate("/editar-perfil")}>Completar Perfil</Button>
        </div>

        {/* Miles Balance */}
        <Card className="mb-8 bg-gradient-primary text-white border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-2">
                {milesBalance.toLocaleString()} ✈️
              </h2>
              <p className="text-white/90 text-lg">Milhas Green Sky</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold">3</div>
                <div className="text-white/80">Voos Realizados</div>
              </div>
              <div>
                <div className="font-semibold">2</div>
                <div className="text-white/80">Amigos Indicados</div>
              </div>
              <div>
                <div className="font-semibold">150kg</div>
                <div className="text-white/80">CO₂ Compensado</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Use Miles */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-gray-900 flex items-center">
                <span className="mr-2">🎯</span>
                Como Usar Suas Milhas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  onClick={() => handleMilesAction("Converter em voo")}
                  variant="outline" 
                  className="w-full justify-start h-auto p-4 border-greensky-200 hover:bg-greensky-50 hover:border-greensky-300"
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 mb-1">
                      🚁 Converter em um voo duplo para você
                    </div>
                    <div className="text-sm text-gray-600">
                      1.000 milhas = 1 voo duplo
                    </div>
                  </div>
                </Button>

                <Button 
                  onClick={() => handleMilesAction("Presentear amigo")}
                  variant="outline" 
                  className="w-full justify-start h-auto p-4 border-sunset-200 hover:bg-sunset-50 hover:border-sunset-300"
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 mb-1">
                      🎁 Presentear um amigo com um voo
                    </div>
                    <div className="text-sm text-gray-600">
                      800 milhas = 1 voucher de presente
                    </div>
                  </div>
                </Button>

                <Button 
                  onClick={() => handleMilesAction("Doar para Banco de Sonhos")}
                  variant="outline" 
                  className="w-full justify-start h-auto p-4 border-skyblue-200 hover:bg-skyblue-50 hover:border-skyblue-300 relative"
                >
                  <Badge className="absolute -top-2 -right-2 bg-gradient-sunset text-white">
                    Destaque!
                  </Badge>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 mb-1">
                      💝 Doar suas milhas para o Banco de Sonhos
                    </div>
                    <div className="text-sm text-gray-600">
                      Realize o sonho de alguém!
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Referral Program */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-gray-900 flex items-center">
                <span className="mr-2">🤝</span>
                Indique e Ganhe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="bg-gradient-hero rounded-lg p-6 mb-4">
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="font-bold text-xl text-gray-900 mb-1">
                    Ganhe 200 milhas
                  </div>
                  <div className="text-gray-600">
                    Para cada amigo que fizer seu primeiro voo
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu link de indicação:
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      value={referralLink} 
                      readOnly 
                      className="flex-1 bg-gray-50"
                    />
                    <Button 
                      onClick={copyReferralLink}
                      className="bg-gradient-primary"
                    >
                      Copiar
                    </Button>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Convide amigos e ganhe mais milhas! 🚀
                  </p>
                  <Button 
                    className="bg-gradient-sunset"
                    onClick={() => toast({
                      title: "Compartilhamento em desenvolvimento! 📱",
                      description: "Em breve você poderá compartilhar diretamente nas redes sociais."
                    })}
                  >
                    Compartilhar nas Redes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Summary */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-gray-900 flex items-center">
              <span className="mr-2">🌱</span>
              Seu Impacto Green Sky
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-greensky-50 rounded-lg p-6">
                <div className="text-2xl mb-2">🌳</div>
                <div className="font-bold text-xl text-greensky-700">3</div>
                <div className="text-sm text-gray-600">Árvores Plantadas</div>
              </div>
              <div className="bg-skyblue-50 rounded-lg p-6">
                <div className="text-2xl mb-2">💚</div>
                <div className="font-bold text-xl text-skyblue-700">1</div>
                <div className="text-sm text-gray-600">Sonho Realizado</div>
              </div>
              <div className="bg-sunset-50 rounded-lg p-6">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-bold text-xl text-sunset-700">150kg</div>
                <div className="text-sm text-gray-600">CO₂ Compensado</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
