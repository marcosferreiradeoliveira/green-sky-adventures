import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import logo from "@/assets/logo.png";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    setShowLogoutDialog(false);
    navigate("/");
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
            <img 
              src={logo} 
              alt="Green Sky Logo" 
              className="w-auto" 
              style={{ height: '50px' }}
            />
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/busca" className="text-gray-600 hover:text-greensky-600 transition-colors">
              Encontrar Pilotos
            </a>
            <a
              className="text-gray-600 hover:text-greensky-600 transition-colors cursor-pointer"
              onClick={e => { e.preventDefault(); navigate("/minhas-milhas"); }}
            >
              {profile && profile.pilot ? "Meus Vôos" : "Minhas Milhas"}
            </a>
            <a
              className="text-gray-600 hover:text-greensky-600 transition-colors cursor-pointer"
              onClick={e => { e.preventDefault(); navigate("/banco-de-sonhos"); }}
            >
              Banco de Sonhos
            </a>
            <a
              className="text-gray-600 hover:text-greensky-600 transition-colors cursor-pointer"
              onClick={e => { e.preventDefault(); navigate("/nosso-impacto"); }}
            >
              Nosso Impacto
            </a>
          </nav>

          <div className="flex items-center space-x-3 relative">
            <Badge variant="secondary" className="hidden sm:flex bg-greensky-100 text-greensky-800">
              🌱 Carbono Neutro
            </Badge>
            {profile?.admin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex border-greensky-300 hover:bg-greensky-50 text-greensky-700 font-medium"
                onClick={() => navigate("/admin")}
              >
                Área Administrativa
              </Button>
            )}
            {user ? (
              <div className="relative">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors shadow" onClick={() => setMenuOpen((v) => !v)}>
                  {profile && profile.firstName ? profile.firstName : (user.email?.split("@")[0] || "Perfil")}
                  {profile && profile.pilot && (
                    <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded align-middle">Piloto</span>
                  )}
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => { setMenuOpen(false); navigate("/editar-perfil"); }}
                    >
                      Editar Perfil
                    </button>
                    {profile?.admin && (
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-greensky-700 font-medium"
                        onClick={() => { setMenuOpen(false); navigate("/admin"); }}
                      >
                        Área Administrativa
                      </button>
                    )}
                    {profile && profile.pilot && (
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => { setMenuOpen(false); navigate("/editar-oferta"); }}
                      >
                        Editar Oferta
                      </button>
                    )}
                    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                      <AlertDialogTrigger asChild>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                          onClick={() => setShowLogoutDialog(true)}
                        >
                          Sair
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deseja realmente sair?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Você será deslogado da sua conta e precisará fazer login novamente para acessar funcionalidades exclusivas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout}>Sair</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
