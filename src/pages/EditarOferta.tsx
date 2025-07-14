import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const EditarOferta = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Busca o documento do piloto pelo pilotId (uid do user logado)
        const q = query(collection(db, "pilots"), where("pilotId", "==", u.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          setForm({ ...docData, docId: snap.docs[0].id });
        } else {
          setError("Oferta de piloto não encontrada.");
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPhoto(true);
    setError("");
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `pilots/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm((prev: any) => ({ ...prev, photo: url }));
      setPhotoPreview(url);
      setSuccess("Foto enviada com sucesso!");
    } catch (err: any) {
      setError("Erro ao enviar foto: " + (err.message || ""));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!form || !form.docId) return;
    try {
      await updateDoc(doc(db, "pilots", form.docId), {
        name: form.name,
        school: form.school,
        type: form.type,
        location: form.location,
        price: form.price,
        rating: Number(form.rating),
        experience: form.experience,
        photo: form.photo,
        whatsapp: form.whatsapp,
        state: form.state,
        city: form.city
      });
      setSuccess("Oferta atualizada com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar oferta");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!form) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-lg p-6">
          <CardContent>
            <h2 className="text-2xl font-bold mb-6 text-center">Editar Oferta</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2 flex flex-col items-center mb-4">
                {/* Upload da foto */}
                {form.photo || photoPreview ? (
                  <img src={form.photo || photoPreview || ""} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-2" />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center mb-2">
                    <span className="text-gray-400 text-4xl">📷</span>
                  </div>
                )}
                <label htmlFor="photo-upload" className="mt-2 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded cursor-pointer transition-colors shadow">
                  {uploadingPhoto ? "Enviando..." : "Enviar Foto"}
                </label>
                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Nome</label>
                <Input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Escola</label>
                <Input name="school" placeholder="Escola" value={form.school} onChange={handleChange} required />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Tipo</label>
                <Input name="type" placeholder="Tipo" value={form.type} onChange={handleChange} required />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Localização</label>
                <Input name="location" placeholder="Localização" value={form.location} onChange={handleChange} required />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Preço</label>
                <Input name="price" placeholder="Preço" value={form.price} onChange={handleChange} required />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Nota</label>
                <Input name="rating" type="number" step="0.1" min="0" max="5" placeholder="Nota" value={form.rating} onChange={handleChange} required />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Experiência</label>
                <Input name="experience" placeholder="Experiência" value={form.experience} onChange={handleChange} required />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">WhatsApp</label>
                <Input name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={handleChange} required />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Estado</label>
                <Input name="state" placeholder="Estado" value={form.state} onChange={handleChange} required />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Cidade</label>
                <Input name="city" placeholder="Cidade" value={form.city} onChange={handleChange} required />
              </div>
              <div className="col-span-1 md:col-span-2">
                {success && <div className="text-green-600 text-sm">{success}</div>}
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-4">Salvar Oferta</Button>
              </div>
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

export default EditarOferta; 