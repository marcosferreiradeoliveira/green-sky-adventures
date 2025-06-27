
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">GS</span>
            </div>
            <span className="font-heading font-bold text-xl text-greensky-800">Green Sky</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/busca" className="text-gray-600 hover:text-greensky-600 transition-colors">
              Encontrar Pilotos
            </a>
            <a href="/perfil" className="text-gray-600 hover:text-greensky-600 transition-colors">
              Minhas Milhas
            </a>
            <a href="#impacto" className="text-gray-600 hover:text-greensky-600 transition-colors">
              Nosso Impacto
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="hidden sm:flex bg-greensky-100 text-greensky-800">
              🌱 Carbono Neutro
            </Badge>
            <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity">
              Entrar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
