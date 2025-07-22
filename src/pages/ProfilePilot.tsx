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

const ProfilePilot = () => {
  const { id } = useParams();
  const [pilot, setPilot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    const fetchPilot = async () => {
      const docRef = doc(db, "pilots", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const pilotData = { id: snap.id, ...snap.data() };
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
    if (pilot.whatsapp) {
      try {
        // Verificar se pilot.uid existe antes de criar o contato
        if (!pilot.uid) {
          console.error('Pilot UID is missing:', pilot);
          toast({ title: "Erro", description: "UID do piloto não encontrado. Tente novamente.", duration: 5000 });
          return;
        }
        
        const contactData = {
          userId: currentUser ? currentUser.uid : null,
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
        if (currentUser) {
          await updateDoc(doc(db, "users", currentUser.uid), {
            contacts: arrayUnion(contactRef.id)
          });
        }
      } catch (err) {
        // Pode adicionar um toast de erro se desejar
      }
      const msg = encodeURIComponent(`Olá ${pilot.name}, encontrei seu perfil no Green Sky e gostaria de saber mais sobre voos!`);
      const phone = pilot.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    } else {
      // Pode adicionar um toast de erro se desejar
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!pilot) return <div className="min-h-screen flex items-center justify-center text-red-600">Piloto não encontrado.</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full px-2 md:px-8 py-8">
        {/* Fotos demonstrativas em destaque no topo */}
        {pilot.demoPhotos && pilot.demoPhotos.length > 0 && (
          <div className="w-full mb-8 relative">
            <Carousel className="w-full max-w-5xl mx-auto">
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
            </Carousel>
          </div>
        )}
        {/* Dados principais do piloto */}
        <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4 mt-[-32px]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              {pilot.photo ? (
                <img src={pilot.photo} alt={pilot.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-5xl">📷</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 items-center md:items-start w-full">
              <span className="font-bold text-2xl text-gray-900">{pilot.name}</span>
              <span className="text-green-700 font-bold text-lg">R$ {pilot.price}</span>
              {pilot.meetingPoint && (
                <span className="text-gray-700 text-sm"><span className="font-semibold">Ponto de Encontro:</span> {pilot.meetingPoint}</span>
              )}
              <span className="text-gray-600 text-sm"><span className="font-semibold">Experiência:</span> {pilot.experience}</span>
              <Button className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold w-full md:w-fit" onClick={handleContact}>
                Entrar em Contato
              </Button>
            </div>
          </div>
          {/* Descrição */}
          <div>
            <h2 className="font-bold text-lg mb-2">Descrição</h2>
            <p className="text-gray-800 whitespace-pre-line">{pilot.description || 'Sem descrição.'}</p>
          </div>
          {/* Botão Entrar em Contato no final */}
          <Button className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold w-full md:w-fit h-16 text-xl" onClick={handleContact}>
            Entrar em Contato
          </Button>
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