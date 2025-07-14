import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth, storage } from "@/lib/firebase";
import { onAuthStateChanged, User, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth, deleteUser } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

const AddPilot = () => {
  const [form, setForm] = useState({
    name: "",
    school: "",
    photo: "",
    type: "",
    location: "",
    price: "",
    rating: "",
    experience: "",
    state: "", // Adicionado para armazenar o estado
    city: "", // Adicionado para armazenar a cidade
    whatsapp: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const [pilotAuth, setPilotAuth] = useState({ email: "", password: "", repeatPassword: "" });
  const [pilotUserId, setPilotUserId] = useState<string | null>(null);
  const [step, setStep] = useState<"auth" | "data">("auth");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/", { replace: true });
        return;
      }
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data().admin === true) {
        setIsAdmin(true);
      } else {
        navigate("/", { replace: true });
      }
      setCheckingAdmin(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (step === "data") {
      setLoading(false);
      setUploadingPhoto(false);
    }
  }, [step]);

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-600">Verificando permissões...</span>
      </div>
    );
  }
  if (!isAdmin) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Cadastro de piloto no Auth sem deslogar admin
  const handlePilotAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (pilotAuth.password !== pilotAuth.repeatPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }
    // Instância secundária do Firebase
    const secondaryApp = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    }, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, pilotAuth.email, pilotAuth.password);
      setPilotUserId(cred.user.uid);
      setStep("data");
      setSuccess("Conta criada! Agora preencha os dados do piloto.");
      // Desloga o usuário criado na instância secundária
      await secondaryAuth.signOut();
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta do piloto");
    } finally {
      // Remove a instância secundária
      await (secondaryApp as any).delete();
      setLoading(false);
    }
  };

  // Função para upload da foto do piloto
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pilotUserId) return;
    setUploadingPhoto(true);
    setError("");
    try {
      const storageRef = ref(storage, `pilots/${pilotUserId}/profile.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm((prev) => ({ ...prev, photo: url }));
      setPhotoPreview(url);
      setSuccess("Foto enviada com sucesso!");
    } catch (err: any) {
      setError("Erro ao enviar foto: " + (err.message || ""));
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Função para aplicar máscara automática no WhatsApp
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for dígito
    if (value.length > 13) value = value.slice(0, 13);
    // Monta a máscara: +55 21 99999-9999
    let masked = "+";
    if (value.length > 0) masked += value.slice(0, 2); // País
    if (value.length > 2) masked += " " + value.slice(2, 4); // DDD
    if (value.length > 4) masked += " " + value.slice(4, 9); // Prefixo
    if (value.length > 9) masked += "-" + value.slice(9, 13); // Sufixo
    setForm({ ...form, whatsapp: masked });
  };

  // Cadastro dos dados do piloto no Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!pilotUserId) {
        setError("Crie a conta do piloto primeiro.");
        setLoading(false);
        return;
      }
      await addDoc(collection(db, "pilots"), {
        ...form,
        email: pilotAuth.email,
        uid: pilotUserId,
        pilotId: pilotUserId, // Adicionado para referência cruzada
        rating: Number(form.rating),
        pilot: true
      });
      // Salva também na coleção users
      const nameParts = form.name.trim().split(" ");
      await setDoc(doc(db, "users", pilotUserId), {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: pilotAuth.email,
        photo: form.photo,
        city: form.city, // ajuste se necessário
        state: form.state, // ajuste se adicionar campo no form
        country: "", // ajuste se adicionar campo no form
        pilot: true,
        whatsapp: form.whatsapp
      });
      setSuccess("Piloto adicionado com sucesso!");
      setForm({ name: "", school: "", photo: "", type: "", location: "", price: "", rating: "", experience: "", state: "", city: "", whatsapp: "" });
      setPilotAuth({ email: "", password: "", repeatPassword: "" });
      setPilotUserId(null);
      setStep("auth");
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar piloto");
    } finally {
      setLoading(false);
    }
  };

  // Lista de estados e cidades do Brasil (exemplo reduzido)
  const estados = [
    { uf: "RJ", nome: "Rio de Janeiro" },
    { uf: "SP", nome: "São Paulo" },
    { uf: "MG", nome: "Minas Gerais" },
    { uf: "RS", nome: "Rio Grande do Sul" },
    // Adicione mais estados se quiser
  ];
  const cidadesPorEstado: Record<string, string[]> = {
    RJ: ["Rio de Janeiro", "Niterói", "Petrópolis", "Angra dos Reis"],
    SP: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto"],
    MG: ["Belo Horizonte", "Uberlândia", "Ouro Preto", "Juiz de Fora"],
    RS: ["Porto Alegre", "Caxias do Sul", "Gramado", "Pelotas"],
  };
  const cidades = form.state ? cidadesPorEstado[form.state] || [] : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-lg p-6">
          <CardContent>
            <h2 className="text-2xl font-bold mb-6 text-center">Adicionar Piloto</h2>
            {step === "auth" ? (
              <form onSubmit={handlePilotAuth} className="space-y-4">
                <Input
                  type="email"
                  placeholder="E-mail do piloto"
                  value={pilotAuth.email}
                  onChange={e => setPilotAuth({ ...pilotAuth, email: e.target.value })}
                  required
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={pilotAuth.password}
                  onChange={e => setPilotAuth({ ...pilotAuth, password: e.target.value })}
                  required
                />
                <Input
                  type="password"
                  placeholder="Repita a senha"
                  value={pilotAuth.repeatPassword}
                  onChange={e => setPilotAuth({ ...pilotAuth, repeatPassword: e.target.value })}
                  required
                />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={loading}>
                  {loading ? "Criando..." : "Cadastrar Piloto"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <Input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
                <Input name="school" placeholder="Escola" value={form.school} onChange={handleChange} required />
                {/* <Input name="photo" placeholder="URL da Foto" value={form.photo} onChange={handleChange} required /> */}
                <Select
                  name="type"
                  value={form.type}
                  onValueChange={value => setForm({ ...form, type: value })}
                  required
                >
                  <SelectTrigger className="w-full" aria-label="Tipo de Voo">
                    {form.type ? (form.type === "parapente" ? "Parapente" : "Asa Delta") : "Selecione o tipo"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parapente">Parapente</SelectItem>
                    <SelectItem value="asa-delta">Asa Delta</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  name="state"
                  value={form.state}
                  onValueChange={value => setForm({ ...form, state: value, city: "" })}
                  required
                >
                  <SelectTrigger className="w-full" aria-label="Estado">
                    {form.state ? estados.find(e => e.uf === form.state)?.nome : "Selecione o estado"}
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map(e => (
                      <SelectItem key={e.uf} value={e.uf}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  name="city"
                  value={form.city}
                  onValueChange={value => setForm({ ...form, city: value })}
                  required
                  disabled={!form.state}
                >
                  <SelectTrigger className="w-full" aria-label="Cidade">
                    {form.city || (!form.state ? "Selecione o estado primeiro" : "Selecione a cidade")}
                  </SelectTrigger>
                  <SelectContent>
                    {cidades.map(cidade => (
                      <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input name="price" placeholder="Preço (ex: A partir de R$ 800)" value={form.price} onChange={handleChange} required />
                <Input name="rating" type="number" step="0.1" min="0" max="5" placeholder="Nota (ex: 4.9)" value={form.rating} onChange={handleChange} required />
                <Input name="experience" placeholder="Experiência (ex: 10 anos)" value={form.experience} onChange={handleChange} required />
                <Input name="whatsapp" placeholder="WhatsApp (+55 21 99999-9999)" value={form.whatsapp} onChange={handleWhatsappChange} required pattern="^\+55 \d{2} \d{5}-\d{4}$" maxLength={17} />
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={loading || uploadingPhoto || !form.photo}>
                  {loading ? "Adicionando..." : "Salvar Dados do Piloto"}
                </Button>
              </form>
            )}
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