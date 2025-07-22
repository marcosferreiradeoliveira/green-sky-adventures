import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { useState, useEffect } from "react";

interface PilotCardProps {
  pilot: {
    id: string;
    pilotId?: string;
    uid: string;
    name: string;
    school: string;
    photo: string;
    type: string;
    location: string;
    price: string;
    rating: number;
    experience: string;
    whatsapp?: string;
  };
}

const PilotCard = ({ pilot }: PilotCardProps) => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
        toast({ title: "Erro ao registrar contato", description: String(err), duration: 5000 });
      }
      const msg = encodeURIComponent(`Olá ${pilot.name}, encontrei seu perfil no Green Sky e gostaria de saber mais sobre voos!`);
      const phone = pilot.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    } else {
      toast({
        title: "Contato Iniciado! 🚁",
        description: `Você será direcionado para conversar com ${pilot.name}. Confirme seu voo e ganhe milhas bônus!`,
        duration: 5000,
      });
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-md overflow-hidden">
      <CardHeader className="p-0 relative">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={pilot.photo} 
            alt={pilot.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-gray-800 hover:bg-white">
              ⭐ {pilot.rating.toFixed(1)}
            </Badge>
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-greensky-100 text-greensky-800">
              {pilot.type}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="font-heading font-semibold text-xl text-gray-900 mb-1">
            {pilot.name}
          </h3>
          <p className="text-greensky-600 font-medium mb-2">{pilot.school}</p>
          <p className="text-gray-600 text-sm mb-2">{pilot.location}</p>
          <p className="text-gray-500 text-sm">📅 {pilot.experience} de experiência</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">{pilot.price}</p>
            <p className="text-sm text-gray-500">por pessoa</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-greensky-600">+50 milhas</span>
            <span className="text-greensky-600">✨</span>
          </div>
        </div>

        <Button 
          onClick={handleContact}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors shadow mt-4"
          size="lg"
        >
          Entrar em Contato
        </Button>
      </CardContent>
    </Card>
  );
};

export default PilotCard;
