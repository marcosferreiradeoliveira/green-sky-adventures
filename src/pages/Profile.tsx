import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Register from "./Register";

const Profile = () => {
  const [milesBalance, setMilesBalance] = useState(0);
  const [referralLink] = useState("https://greensky.com/ref/user123");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setLoadingProfile(true);
        const docRef = doc(db, "users", u.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          // Atualiza o saldo de milhas do estado local
          setMilesBalance(data.miles || 0);
          if (!data.firstName || !data.lastName || !data.photo) {
            setRedirecting(true);
            navigate("/editar-perfil");
          }
        } else {
          setProfile(null);
          setRedirecting(true);
          navigate("/editar-perfil");
        }
        setLoadingProfile(false);
      } else {
        setLoadingProfile(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link copiado! 📋",
      description: "Compartilhe com seus amigos e ganhe mais milhas!",
    });
  };

  const convertMilesToCoupon = async () => {
    if (!user) return;
    
    setIsConverting(true);
    try {
      // 1. Verificar se o usuário tem milhas suficientes
      if (milesBalance < 1000) {
        toast({
          title: "Milhas insuficientes",
          description: "Você precisa de pelo menos 1.000 milhas para gerar um cupom de voo duplo.",
          variant: "destructive",
        });
        return;
      }

      // 2. Criar o documento do cupom
      const couponData = {
        userId: user.uid,
        recipientId: user.uid, // O próprio usuário é o destinatário
        amount: 1, // 1 voo duplo
        used: false,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Expira em 1 ano
        type: "double_flight"
      };

      // 3. Adicionar o cupom à coleção 'coupons'
      const docRef = await addDoc(collection(db, "coupons"), couponData);

      // 4. Atualizar as milhas do usuário
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        miles: (profile?.miles || 0) - 1000
      });

      // 5. Atualizar o estado local
      setMilesBalance(prev => prev - 1000);
      setProfile((prev: any) => ({
        ...prev,
        miles: (prev?.miles || 0) - 1000
      }));

      // 6. Mostrar mensagem de sucesso
      toast({
        title: "Cupom gerado com sucesso! 🎉",
        description: (
          <div className="space-y-2">
            <p>Seu cupom de voo duplo foi gerado com sucesso!</p>
            <p className="text-sm">
              <span>Você pode visualizá-lo na seção </span>
              <button 
                onClick={() => navigate('/meus-cupons')}
                className="text-blue-600 hover:underline font-medium"
              >
                Meus Cupons
              </button>.
            </p>
          </div>
        ),
      });
    } catch (error) {
      console.error("Erro ao converter milhas:", error);
      toast({
        title: "Erro ao gerar cupom",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleMilesAction = (action: string, callback?: () => void) => {
    if (!user) {
      toast({
        title: "Ação não autorizada",
        description: "Você precisa estar logado para realizar esta ação.",
        variant: "destructive",
      });
      return;
    }

    if (action === "Converter em voo") {
      setShowConfirmDialog(true);
    } else {
      toast({
        title: `${action} em desenvolvimento! ⏳`,
        description: "Esta funcionalidade estará disponível em breve.",
      });
      callback?.();
    }
  };

  if (redirecting) return null;

  if (!user && !loadingProfile) {
    return <Register />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            {loadingProfile ? (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center animate-pulse">
                <UserCircle className="w-20 h-20 text-gray-300" />
              </div>
            ) : profile && profile.photo ? (
              <img
                src={profile.photo}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                <UserCircle className="w-20 h-20 text-gray-400" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-gradient-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              ✨
            </div>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">
            {profile && profile.firstName
              ? `${profile.firstName} ${profile.lastName}`
              : loadingProfile
                ? "Carregando..."
                : "Olá, Aventureiro! 👋"}
            {profile && profile.pilot && (
              <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded align-middle">Perfil de Piloto</span>
            )}
          </h1>
          {profile && (
            <div className="text-gray-600 text-sm mb-2 flex flex-col items-center gap-1">
              {profile.email && (
                <span><b>Email:</b> {profile.email}</span>
              )}
              {profile.city && profile.state && profile.country && (
                <span><b>Localização:</b> {profile.city}, {profile.state}, {profile.country}</span>
              )}
            </div>
          )}
          <Button className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold mr-2" onClick={() => navigate("/editar-perfil")}>Editar Perfil</Button>
          {profile && profile.pilot && (
            <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={() => navigate("/editar-oferta")}>Editar Oferta</Button>
          )}
        </div>

        {/* Miles Balance */}
        <Card className="mb-8 bg-gradient-primary text-white border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-2">
                {milesBalance.toLocaleString()} ✈️
              </h2>
              <p className="text-white/90 text-lg">Milhas</p>
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
                  disabled={isConverting || milesBalance < 1000}
                  title={milesBalance < 1000 ? "Você precisa de pelo menos 1.000 milhas para gerar um cupom" : ""}
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 mb-1">
                      {isConverting ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </span>
                      ) : (
                        <span>🚁 Converter em um voo duplo para você</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      1.000 milhas = 1 voo duplo
                      {milesBalance < 1000 && (
                        <div className="text-amber-600 text-xs mt-1">
                          Você precisa de mais {1000 - milesBalance} milhas para gerar um cupom
                        </div>
                      )}
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

        {/* Diálogo de Confirmação */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Conversão de Milhas</DialogTitle>
              <DialogDescription className="pt-4">
                Você está prestes a converter 1.000 milhas em um cupom de voo duplo. 
                Tem certeza que deseja continuar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                disabled={isConverting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={convertMilesToCoupon}
                disabled={isConverting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Convertendo...
                  </>
                ) : 'Confirmar Conversão'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
