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
import { Textarea } from "@/components/ui/textarea";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

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

  const handleFotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploadingPhoto(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const storage = getStorage();
        const storageRef = ref(storage, `pilots/${user.uid}/demo_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }
      setForm((prev: any) => ({ ...prev, demoPhotos: urls }));
      setSuccess("Fotos enviadas com sucesso!");
    } catch (err: any) {
      setError("Erro ao enviar fotos: " + (err.message || ""));
    } finally {
      setUploadingPhoto(false);
    }
  };
  const handleVideoChange = (idx: number, value: string) => {
    const arr = Array.isArray(form.demoVideos) ? [...form.demoVideos] : [];
    arr[idx] = value;
    setForm({ ...form, demoVideos: arr });
  };
  const addVideoField = () => {
    const arr = Array.isArray(form.demoVideos) ? [...form.demoVideos] : [];
    arr.push("");
    setForm({ ...form, demoVideos: arr });
  };
  const removeVideoField = (idx: number) => {
    const arr = Array.isArray(form.demoPhotos) ? [...form.demoPhotos] : [];
    arr.splice(idx, 1);
    setForm({ ...form, demoPhotos: arr });
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
        city: form.city,
        description: form.description,
        demoPhotos: form.demoPhotos,
        meetingPoint: form.meetingPoint,
        demoVideos: form.demoVideos
      });
      setSuccess("Oferta atualizada com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar oferta");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!form) return null;

  // Estados e cidades exemplo
  const estados = [
    { uf: "RJ", nome: "Rio de Janeiro", cidades: ["Rio de Janeiro", "Niterói", "Petrópolis"] },
    { uf: "SP", nome: "São Paulo", cidades: ["São Paulo", "Campinas", "Santos"] },
    { uf: "MG", nome: "Minas Gerais", cidades: ["Belo Horizonte", "Uberlândia", "Juiz de Fora"] },
  ];
  const cidadesEstado = estados.find(e => e.uf === form?.state)?.cidades || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-start justify-start w-full px-0 md:px-8">
        <h2 className="text-2xl font-bold mb-6 mt-8 ml-8">Editar Oferta</h2>
        <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 md:grid-cols-3 gap-10 px-4 md:px-8">
          {/* Coluna 1: Dados principais */}
          <div className="flex flex-col gap-4 justify-start bg-white rounded-lg p-6 shadow">
            <div className="flex flex-col items-center mb-4">
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
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm mb-1">Nome</label>
              <Input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required className="h-8 text-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm mb-1">Escola</label>
              <Input name="school" placeholder="Escola" value={form.school} onChange={handleChange} required className="h-8 text-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm mb-1">Tipo</label>
              <Input name="type" placeholder="Tipo" value={form.type} onChange={handleChange} required className="h-8 text-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm mb-1">Preço</label>
              <Input name="price" placeholder="Preço" value={form.price} onChange={handleChange} required className="h-8 text-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm mb-1">Experiência</label>
              <Input name="experience" placeholder="Experiência" value={form.experience} onChange={handleChange} required className="h-8 text-sm" />
            </div>
          </div>
          {/* Coluna 2: Descrição + Estado/Cidade/Localização/WhatsApp */}
          <div className="flex flex-col gap-4 justify-start bg-white rounded-lg p-6 shadow">
            <label className="font-semibold mb-1">Descrição</label>
            <Textarea name="description" placeholder="Descreva sua oferta..." value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} rows={8} required className="h-full min-h-[100px] text-sm" />
            <div className="flex flex-col gap-2 mt-2">
              <label className="font-semibold text-sm mb-1">Estado</label>
              <select
                name="state"
                value={form.state}
                onChange={e => setForm({ ...form, state: e.target.value, city: "" })}
                className="border rounded px-3 py-1 h-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 w-full"
                required
              >
                <option value="">Selecione o estado</option>
                {estados.map(e => (
                  <option key={e.uf} value={e.uf}>{e.nome}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm mb-1">Cidade</label>
              <select
                name="city"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="border rounded px-3 py-1 h-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 w-full"
                required
                disabled={!form.state}
              >
                <option value="">Selecione a cidade</option>
                {cidadesEstado.map(cidade => (
                  <option key={cidade} value={cidade}>{cidade}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm mb-1">Localização</label>
              <Input name="meetingPoint" placeholder="Ex: Praia de Botafogo, Rio de Janeiro" value={form.meetingPoint || ""} onChange={handleChange} required className="h-8 text-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm mb-1">WhatsApp</label>
              <Input name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={handleChange} required className="h-8 text-sm" />
            </div>
          </div>
          {/* Coluna 3: Fotos demonstrativas em carrossel + vídeos */}
          <div className="flex flex-col gap-4 items-start justify-start bg-white rounded-lg p-6 shadow">
            <label className="font-semibold mb-1">Fotos demonstrativas</label>
            <label htmlFor="demo-photos-upload" className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded cursor-pointer transition-colors shadow mb-2">
              {uploadingPhoto ? "Enviando..." : "Enviar Fotos Demonstrativas"}
            </label>
            <input id="demo-photos-upload" type="file" accept="image/*" multiple onChange={handleFotosUpload} className="hidden" />
            {form.demoPhotos && form.demoPhotos.length > 0 ? (
              <Carousel key={form.demoPhotos.join(',')} className="w-full max-w-xs">
                <CarouselContent>
                  {form.demoPhotos.map((url: string, i: number) => (
                    <CarouselItem key={i} className="flex flex-col items-start justify-center relative">
                      <img src={url} alt="Foto demonstrativa" className="w-60 h-60 object-cover rounded border mb-2" />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-red-100 text-red-600 rounded-full p-1 shadow"
                        onClick={() => removeVideoField(i)}
                        title="Excluir foto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="w-60 h-60 flex items-center justify-center bg-gray-100 rounded border">
                <img src="/placeholder.svg" alt="Sem fotos" className="w-24 h-24 opacity-40" />
              </div>
            )}
            {/* Vídeos demonstrativos */}
            <div className="flex flex-col mt-4 w-full">
              <label className="font-semibold mb-1">Vídeos demonstrativos (YouTube)</label>
              {(Array.isArray(form.demoVideos) ? form.demoVideos : [""]).map((v: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="URL do vídeo do YouTube"
                    value={v}
                    onChange={e => handleVideoChange(idx, e.target.value)}
                  />
                  <button type="button" className="text-red-500 text-xs" onClick={() => removeVideoField(idx)}>Remover</button>
                </div>
              ))}
              <button type="button" className="text-green-700 hover:text-green-900 text-xs border border-green-200 rounded px-2 py-1 mt-1 w-fit" onClick={addVideoField}>Adicionar vídeo</button>
            </div>
          </div>
          <div className="col-span-1 md:col-span-3">
            {success && <div className="text-green-600 text-sm">{success}</div>}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold mt-4">Salvar Oferta</Button>
          </div>
        </form>
        <div className="text-center mt-4 mb-8 w-full">
          <Button variant="link" className="p-0 h-auto text-greensky-800" onClick={() => navigate("/perfil")}>Voltar ao Perfil</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditarOferta; 