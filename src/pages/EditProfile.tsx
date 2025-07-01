import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

const EditProfile = () => {
  const [form, setForm] = useState({
    photo: "",
    firstName: "",
    lastName: "",
    city: "",
    state: "",
    country: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            photo: data.photo || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            city: data.city || "",
            state: data.state || "",
            country: data.country || ""
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    if (!user) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }
    try {
      await setDoc(doc(db, "users", user.uid), form, { merge: true });
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-lg p-6">
          <CardContent>
            <h2 className="text-2xl font-bold mb-6 text-center">Completar Perfil</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                {form.photo ? (
                  <img src={form.photo} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-2" />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center mb-2">
                    <UserCircle className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>
              <Input name="photo" placeholder="URL da foto de perfil" value={form.photo} onChange={handleChange} />
              <Input name="firstName" placeholder="Nome" value={form.firstName} onChange={handleChange} required />
              <Input name="lastName" placeholder="Sobrenome" value={form.lastName} onChange={handleChange} required />
              <Input name="city" placeholder="Cidade" value={form.city} onChange={handleChange} required />
              <Input name="state" placeholder="Estado" value={form.state} onChange={handleChange} required />
              <Input name="country" placeholder="País" value={form.country} onChange={handleChange} required />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </form>
            <div className="text-center mt-4">
              <Button variant="link" className="p-0 h-auto text-greensky-800" onClick={() => navigate("/perfil")}>Voltar ao Perfil</Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfile; 