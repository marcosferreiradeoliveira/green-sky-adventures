
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { auth } from "@/lib/firebase";
import { addDoc, collection, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Pilot {
  id: string;
  uid: string;
  name: string;
  whatsapp?: string;
  // Add other pilot properties as needed
  [key: string]: any; // For any additional properties
}

const ProfilePilot = () => {
  const { id } = useParams();
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPilot = async () => {
      const docRef = doc(db, "pilots", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const pilotData: Pilot = {
          id: snap.id,
          uid: data.uid,
          name: data.name || '',
          whatsapp: data.whatsapp,
          ...data
        };
        console.log('Pilot data fetched:', pilotData);
        console.log('Pilot UID field:', pilotData.uid);
        setPilot(pilotData);
      }
      setLoading(false);
    };
    fetchPilot();
  }, [id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setCurrentUser);
    return () => unsubscribe();
  }, []);

  const handleContact = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (pilot.whatsapp) {
      try {
        // Verificar se pilot.uid existe antes de criar o contato
        if (!pilot.uid) {
          console.error('Pilot UID is missing:', pilot);
          toast({ title: "Erro", description: "UID do piloto não encontrado. Tente novamente.", duration: 5000 });
          return;
        }
        
        const contactData = {
          userId: currentUser.uid,
          pilotId: pilot.uid, // UID do piloto da collection pilots
          timestamp: serverTimestamp(),
          realized: false,
          confirmed: false,
        };
        // Cria o contato e pega o id
        const contactRef = await addDoc(collection(db, "contacts"), contactData);
        // Salva apenas o id do contato nos arrays de contacts
        await updateDoc(doc(db, "pilots", pilot.id), {
          contacts: arrayUnion(contactRef.id)
        });
        
        await updateDoc(doc(db, "users", currentUser.uid), {
          contacts: arrayUnion(contactRef.id)
        });

        const msg = encodeURIComponent(`Olá ${pilot.name}, encontrei seu perfil na nossa plataforma e gostaria de saber mais sobre voos!`);
        const phone = pilot.whatsapp.replace(/\D/g, "");
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
        
        toast({
          title: "Contato Iniciado! 🚁",
          description: `Você será direcionado para conversar com ${pilot.name}. Confirme seu voo e ganhe milhas bônus!`,
          duration: 5000,
        });
      } catch (err) {
        console.error("Erro ao criar contato:", err);
        toast({
          title: "Erro",
          description: "Não foi possível iniciar o contato. Tente novamente.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } else {
      toast({
        title: "Ops!",
        description: "Este piloto não possui WhatsApp cadastrado.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!pilot) return <div className="min-h-screen flex items-center justify-center text-red-600">Piloto não encontrado.</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2">Cadastro Necessário</DialogTitle>
            <DialogDescription className="text-center">
              Para entrar em contato com os pilotos e começar a gerar impacto, você precisa ter uma conta na nossa plataforma.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 text-center mb-4">
              Crie sua conta gratuitamente em menos de 2 minutos e comece sua aventura sustentável!
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowAuthModal(false)}
            >
              Agora não
            </Button>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => {
                setShowAuthModal(false);
                navigate("/register");
              }}
            >
              Criar Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Header />
      <main className="flex-1 w-full px-2 md:px-8 py-8">
        {/* Fotos demonstrativas em destaque no topo */}
        {pilot.demoPhotos && pilot.demoPhotos.length > 0 && (
          <div className="w-full mb-8 relative">
            <Carousel className="w-full max-w-5xl mx-auto relative">
              <CarouselContent>
                {pilot.demoPhotos.map((url: string, i: number) => (
                  <CarouselItem key={i} className="flex flex-col items-center justify-center relative">
                    <img src={url} alt="Foto demonstrativa" className="w-full max-h-[420px] object-cover rounded border mb-2" />
                    
                    {/* Overlay com rating, type, city, state */}
                    {i === 0 && (
                      <div className="absolute left-8 bottom-4 bg-white/90 rounded-lg shadow px-6 py-3 flex flex-col gap-1">
                        <span className="text-gray-700 font-semibold text-base">{pilot.type}</span>
                        <span className="text-gray-600 text-sm">{pilot.city} - {pilot.state}</span>
                        <span className="text-yellow-500 font-bold text-lg flex items-center gap-1 mt-1">⭐ {typeof pilot.rating === 'number' ? pilot.rating.toFixed(1) : 'N/A'}</span>
                      </div>
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
              
              {/* Botão fixo no canto inferior direito dentro do carousel */}
              <div className="absolute bottom-4 right-4 z-10">
                <Button 
                  className="bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 font-medium px-12 py-8 text-xl rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 w-80"
                  onClick={handleContact}
                >
                  <span className="text-2xl">🌱</span>
                  Aventure-se com propósito!
                </Button>
              </div>
            </Carousel>
          </div>
        )}
        {/* Dados principais do piloto */}
        <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4 mt-[-32px]">
          {/* Descrição */}
          <div>
            <h2 className="font-bold text-lg mb-2">Descrição</h2>
            <p className="text-gray-800 whitespace-pre-line">{pilot.description || 'Sem descrição.'}</p>
          </div>
          {/* Card único com dados do piloto e impacto ambiental */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Foto do piloto alinhada à esquerda */}
                <div className="flex-shrink-0">
                  {pilot.photo ? (
                    <img src={pilot.photo} alt={pilot.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-5xl">📷</span>
                    </div>
                  )}
                </div>
                
                {/* Dados do piloto com espaçamento reduzido */}
                <div className="flex flex-col gap-1 justify-center flex-1">
                  <span className="font-bold text-2xl text-gray-900">{pilot.name}</span>
                  <span className="text-green-700 font-bold text-lg">R$ {pilot.price}</span>
                  {pilot.meetingPoint && (
                    <span className="text-gray-700 text-sm"><span className="font-semibold">Ponto de Encontro:</span> {pilot.meetingPoint}</span>
                  )}
                  <span className="text-gray-600 text-sm"><span className="font-semibold">Experiência:</span> {pilot.experience}</span>
                </div>
              </div>
              
              {/* Seção de impacto ambiental */}
              <div className="mt-6">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Impacto Ambiental por Voo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Milhas geradas */}
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✈️</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">Milhas</div>
                      <div className="text-blue-600 font-bold">150</div>
                    </div>
                  </div>

                  {/* Árvores plantadas */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🌳</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">Árvores</div>
                      <div className="text-green-600 font-bold">2</div>
                    </div>
                  </div>

                  {/* CO2 retirado */}
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🌍</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">CO₂ (kg)</div>
                      <div className="text-emerald-600 font-bold">25</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botão ocupando toda a largura do card, abaixo de tudo */}
              <Button className="mt-6 bg-green-600 hover:bg-green-700 text-white font-medium w-96 h-20 text-lg mx-auto" onClick={handleContact}>
                Aventure-se com propósito
              </Button>
            </CardContent>
          </Card>
          {/* Vídeos demonstrativos */}
          {pilot.demoVideos && pilot.demoVideos.length > 0 && (
            <div className="mt-6">
              <h2 className="font-bold text-lg mb-2">Vídeos demonstrativos</h2>
              <div className="flex flex-col gap-4">
                {pilot.demoVideos.map((url: string, i: number) => (
                  <div key={i} className="w-full aspect-video bg-gray-100 rounded overflow-hidden">
                    <iframe
                      src={url.replace('watch?v=', 'embed/')}
                      title={`Vídeo ${i+1}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePilot; 