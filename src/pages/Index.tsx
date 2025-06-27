
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchLocation.trim()) {
      navigate(`/busca?location=${encodeURIComponent(searchLocation)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection 
        searchLocation={searchLocation}
        setSearchLocation={setSearchLocation}
        onSearch={handleSearch}
      />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
