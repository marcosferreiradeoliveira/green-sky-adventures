import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Country, State, City } from "country-state-city";

const EditProfile = () => {
  const [form, setForm] = useState({
    photo: "",
    firstName: "",
    lastName: "",
    city: "",
    cityCode: "",
    state: "",
    stateCode: "",
    country: "",
    countryCode: ""
  });
  
  // Get all countries
  const countries = useMemo(() => Country.getAllCountries(), []);
  
  // Get states based on selected country
  const states = useMemo(() => {
    if (!form.countryCode) return [];
    return State.getStatesOfCountry(form.countryCode);
  }, [form.countryCode]);
  
  // Get cities based on selected state and country
  const cities = useMemo(() => {
    if (!form.countryCode || !form.stateCode) return [];
    return City.getCitiesOfState(form.countryCode, form.stateCode);
  }, [form.countryCode, form.stateCode]);
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
            cityCode: data.cityCode || "",
            state: data.state || "",
            stateCode: data.stateCode || "",
            country: data.country || "",
            countryCode: data.countryCode || ""
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleCountryChange = (value: string) => {
    const country = countries.find(c => c.isoCode === value);
    if (country) {
      setForm(prev => ({
        ...prev,
        country: country.name,
        countryCode: country.isoCode,
        state: "",
        stateCode: "",
        city: "",
        cityCode: ""
      }));
    }
  };
  
  const handleStateChange = (value: string) => {
    const state = states.find(s => s.isoCode === value);
    if (state) {
      setForm(prev => ({
        ...prev,
        state: state.name,
        stateCode: state.isoCode,
        city: "",
        cityCode: ""
      }));
    }
  };
  
  const handleCityChange = (value: string) => {
    const city = cities.find(c => c.name === value);
    if (city) {
      setForm(prev => ({
        ...prev,
        city: city.name,
        cityCode: city.stateCode
      }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLoading(true);
    setError("");
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm((prev) => ({ ...prev, photo: url }));
      setSuccess("Foto enviada com sucesso!");
    } catch (err: any) {
      setError("Erro ao enviar foto: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
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
    
    // Validate location data
    if (!form.country || !form.state || !form.city) {
      setError("Por favor, selecione país, estado e cidade");
      setLoading(false);
      return;
    }
    
    try {
      const userData = {
        ...form,
        email: user.email,
        // Keep the existing fields and add the new ones
        countryCode: form.countryCode,
        stateCode: form.stateCode,
        cityCode: form.cityCode
      };
      
      await setDoc(doc(db, "users", user.uid), userData, { merge: true });
      setSuccess("Perfil atualizado com sucesso!");
      setTimeout(() => {
        navigate("/perfil");
      }, 1200);
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
                <label htmlFor="photo-upload" className="mt-2 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded cursor-pointer transition-colors shadow">
                  {loading ? "Enviando..." : "Trocar Foto"}
                </label>
                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              </div>
              <Input name="firstName" placeholder="Nome" value={form.firstName} onChange={handleChange} required />
              <Input name="lastName" placeholder="Sobrenome" value={form.lastName} onChange={handleChange} required />
              {/* Country Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">País</label>
                <Select onValueChange={handleCountryChange} value={form.countryCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um país" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* State Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <Select 
                  onValueChange={handleStateChange} 
                  value={form.stateCode}
                  disabled={!form.countryCode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.countryCode ? "Selecione um estado" : "Selecione um país primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* City Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cidade</label>
                <Select 
                  onValueChange={handleCityChange} 
                  value={form.city}
                  disabled={!form.stateCode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.stateCode ? "Selecione uma cidade" : "Selecione um estado primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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