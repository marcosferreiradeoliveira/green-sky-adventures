import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection hideSearchBar={true} />
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">
          Bem-vindo ao Green Sky Adventures
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Estamos preparando uma experiência incrível para você. Em breve, você poderá encontrar os melhores pilotos de voo livre aqui.
        </p>
      </main>
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;