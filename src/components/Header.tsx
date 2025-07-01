import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    navigate("/");
  };

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

          <div className="flex items-center space-x-3 relative">
            <Badge variant="secondary" className="hidden sm:flex bg-greensky-100 text-greensky-800">
              🌱 Carbono Neutro
            </Badge>
            {user ? (
              <div className="relative">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors shadow" onClick={() => setMenuOpen((v) => !v)}>
                  {user.email?.split("@")[0] || "Perfil"}
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => { setMenuOpen(false); navigate("/perfil"); }}
                    >
                      Meu Perfil
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      onClick={handleLogout}
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors shadow" onClick={() => navigate("/login")}>Entrar</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
