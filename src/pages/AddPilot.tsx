import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AddPilot = () => {
  const [form, setForm] = useState({
    name: "",
    school: "",
    photo: "",
    type: "",
    location: "",
    price: "",
    rating: "",
    experience: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await addDoc(collection(db, "pilots"), {
        ...form,
        rating: Number(form.rating)
      });
      setSuccess("Piloto adicionado com sucesso!");
      setForm({ name: "", school: "", photo: "", type: "", location: "", price: "", rating: "", experience: "" });
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar piloto");
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
            <h2 className="text-2xl font-bold mb-6 text-center">Adicionar Piloto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
              <Input name="school" placeholder="Escola" value={form.school} onChange={handleChange} required />
              <Input name="photo" placeholder="URL da Foto" value={form.photo} onChange={handleChange} required />
              <Input name="type" placeholder="Tipo (Parapente, Asa Delta, etc)" value={form.type} onChange={handleChange} required />
              <Input name="location" placeholder="Localização" value={form.location} onChange={handleChange} required />
              <Input name="price" placeholder="Preço (ex: A partir de R$ 800)" value={form.price} onChange={handleChange} required />
              <Input name="rating" type="number" step="0.1" min="0" max="5" placeholder="Nota (ex: 4.9)" value={form.rating} onChange={handleChange} required />
              <Input name="experience" placeholder="Experiência (ex: 10 anos)" value={form.experience} onChange={handleChange} required />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={loading}>
                {loading ? "Adicionando..." : "Adicionar Piloto"}
              </Button>
            </form>
            <div className="text-center mt-4">
              <Button variant="link" className="p-0 h-auto text-greensky-800" onClick={() => navigate("/busca")}>Voltar para Busca</Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AddPilot; 