
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PilotCardProps {
  pilot: {
    id: number;
    name: string;
    school: string;
    photo: string;
    type: string;
    location: string;
    price: string;
    rating: number;
    experience: string;
  };
}

const PilotCard = ({ pilot }: PilotCardProps) => {
  const { toast } = useToast();

  const handleContact = () => {
    toast({
      title: "Contato Iniciado! 🚁",
      description: `Você será direcionado para conversar com ${pilot.name}. Confirme seu voo e ganhe milhas bônus!`,
      duration: 5000,
    });
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
              ⭐ {pilot.rating}
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
          className="w-full bg-gradient-sunset hover:opacity-90 transition-opacity font-semibold"
          size="lg"
        >
          Entrar em Contato
        </Button>
      </CardContent>
    </Card>
  );
};

export default PilotCard;
