import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
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

const MyFlights = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Hooks para contatos do piloto (sempre chamados)
  const [pilotContacts, setPilotContacts] = useState<any[]>([]);
  const [loadingPilotContacts, setLoadingPilotContacts] = useState(true);
  const [confirmPilotId, setConfirmPilotId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Busca perfil
        const docRef = doc(db, "users", u.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) setProfile(snap.data());
        // Busca contatos
        const q = query(collection(db, "contacts"), where("userId", "==", u.uid));
        const snapContacts = await getDocs(q);
        const contactsArr = [];
        for (const c of snapContacts.docs) {
          const data = c.data();
          // Busca dados do piloto
          let pilot = null;
          if (data.pilotId) {
            const pilotSnap = await getDoc(doc(db, "pilots", data.pilotId));
            if (pilotSnap.exists()) pilot = pilotSnap.data();
          }
          contactsArr.push({ ...data, id: c.id, pilot });
        }
        setContacts(contactsArr);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // useEffect para buscar contatos do piloto (executa só se for piloto)
  useEffect(() => {
    if (!user || !profile || !profile.pilot) return;
    const fetchPilotContacts = async () => {
      setLoadingPilotContacts(true);
      const q = query(collection(db, "contacts"), where("pilotId", "==", user.uid));
      const snapContacts = await getDocs(q);
      const contactsArr = [];
      for (const c of snapContacts.docs) {
        const data = c.data();
        // Busca dados do usuário que fez o contato
        let contactUser = null;
        if (data.userId) {
          const userSnap = await getDoc(doc(db, "users", data.userId));
          if (userSnap.exists()) contactUser = userSnap.data();
        }
        contactsArr.push({ ...data, id: c.id, contactUser });
      }
      setPilotContacts(contactsArr);
      setLoadingPilotContacts(false);
    };
    fetchPilotContacts();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center animate-pulse mt-12">
            <UserCircle className="w-20 h-20 text-gray-300" />
          </div>
          <h1 className="font-heading font-bold text-2xl mt-4">Carregando...</h1>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="font-heading font-bold text-2xl mt-4">Faça login para ver suas milhas</h1>
          <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={() => navigate("/login")}>Entrar</Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Versão para pilotos
  if (profile && profile.pilot) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
            <div className="flex flex-col h-full">
              {/* Nome e foto do perfil */}
              <div className="flex items-center mb-6">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt="Profile"
                    className="w-14 h-14 rounded-full border-2 border-white shadow object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full border-2 border-white shadow bg-gray-100 flex items-center justify-center">
                    <UserCircle className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <span className="font-heading font-semibold text-lg text-gray-900 ml-4">
                  {profile.firstName ? `${profile.firstName} ${profile.lastName}` : user.email}
                </span>
                <Button
                  className="ml-4 bg-green-600 hover:bg-green-700 text-white font-semibold"
                  onClick={() => navigate('/editar-perfil')}
                >
                  Alterar Perfil
                </Button>
              </div>
              <Card className="bg-white border-0 shadow-lg flex flex-col h-full">
                <CardHeader>
                  <div className="mb-2">
                    <span className="font-heading font-semibold text-gray-700 text-base block mb-1">Meus Vôos</span>
                  </div>
                  <CardTitle className="font-heading text-xl text-gray-900 flex items-center mt-2">
                    <span className="mr-2">✈️</span>
                    Voos realizados como piloto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                  {/* Aqui você pode exibir uma lista de voos realizados, contatos, etc. */}
                  <div className="space-y-3">
                    <div className="text-gray-600">Em breve: painel de voos realizados, avaliações e mais!</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Seu Impacto Green Sky */}
            <Card className="bg-white border-0 shadow-lg flex flex-col h-full">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-gray-900 flex items-center">
                  <span className="mr-2">🌱</span>
                  Seu Impacto Green Sky
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col gap-6 items-center text-center">
                  <div className="bg-greensky-50 rounded-lg p-6 w-full max-w-xs">
                    <div className="text-2xl mb-2">🌳</div>
                    <div className="font-bold text-xl text-greensky-700">3</div>
                    <div className="text-sm text-gray-600">Árvores Plantadas</div>
                  </div>
                  {/* Adicione mais métricas se quiser */}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Card de confirmação de voo para pilotos */}
          <Card className="mb-8 bg-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-gray-900">Voos a Confirmar</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPilotContacts ? (
                <div className="text-gray-500 text-left">Carregando contatos...</div>
              ) : pilotContacts.length === 0 ? (
                <div className="text-gray-500 text-left">Nenhum voo aguardando confirmação.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pilotContacts.map((c) => (
                    <Card key={c.id} className="border shadow p-4 flex flex-col items-center gap-4">
                      {c.contactUser && c.contactUser.photo ? (
                        <img src={c.contactUser.photo} alt={c.contactUser.firstName} className="w-16 h-16 rounded-full object-cover border-2 border-green-600" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserCircle className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 text-center">
                        <div className="font-semibold text-lg text-gray-900">{c.contactUser ? `${c.contactUser.firstName} ${c.contactUser.lastName}` : "Usuário desconhecido"}</div>
                        <div className="text-gray-600 text-sm">{c.contactUser ? c.contactUser.email : ""}</div>
                        <div className="text-gray-500 text-xs mt-1">Contato em: {c.timestamp && c.timestamp.toDate ? c.timestamp.toDate().toLocaleString() : "-"}</div>
                      </div>
                      <div className="w-full flex justify-center mt-2">
                        {c.confirmed ? (
                          <span className="text-green-600 font-semibold">Vôo confirmado!</span>
                        ) : (
                          <AlertDialog open={confirmPilotId === c.id} onOpenChange={open => setConfirmPilotId(open ? c.id : null)}>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold w-full" onClick={() => setConfirmPilotId(c.id)}>
                                Confirmar vôo realizado
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Você confirma que o voo foi realizado?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Após confirmar, o usuário receberá as milhas correspondentes.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={async () => {
                                  await updateDoc(doc(db, "contacts", c.id), { confirmed: true });
                                  setPilotContacts(prev => prev.map(x => x.id === c.id ? { ...x, confirmed: true } : x));
                                  setConfirmPilotId(null);
                                }}>Confirmar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const miles = contacts.filter(c => c.realized).length * 250;

  // Função para feedback dos botões de milhas
  const handleMilesAction = (action: string) => {
    window.alert(`${action} em desenvolvimento!`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
          <div className="flex flex-col h-full">
            {/* Nome e foto do perfil */}
            <div className="flex items-center mb-6">
              {profile && profile.photo ? (
                <img
                  src={profile.photo}
                  alt="Profile"
                  className="w-14 h-14 rounded-full border-2 border-white shadow object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-white shadow bg-gray-100 flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <span className="font-heading font-semibold text-lg text-gray-900 ml-4">
                {profile && profile.firstName ? `${profile.firstName} ${profile.lastName}` : user.email}
              </span>
              <Button
                className="ml-4 bg-green-600 hover:bg-green-700 text-white font-semibold"
                onClick={() => navigate('/editar-perfil')}
              >
                Alterar Perfil
              </Button>
            </div>
            <Card className="bg-white border-0 shadow-lg flex flex-col h-full">
              <CardHeader>
                {/* Bloco Minhas Milhas */}
                <div className="mb-2">
                  <span className="font-heading font-semibold text-gray-700 text-base block mb-1">Minhas milhas</span>
                  <span className="font-heading font-extrabold text-4xl text-green-700 leading-tight block">{miles}</span>
                </div>
                <CardTitle className="font-heading text-xl text-gray-900 flex items-center mt-2">
                  <span className="mr-2">🎯</span>
                  Como Usar Suas Milhas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                {/* Botões de uso */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleMilesAction('Converter em voo')}
                    variant="outline" 
                    className="w-full justify-start h-auto p-4 border-greensky-200 hover:bg-greensky-50 hover:border-greensky-300"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 mb-1">
                        🚁 Converter em um voo duplo para você
                      </div>
                      <div className="text-sm text-gray-600">
                        1.000 milhas = 1 voo duplo
                      </div>
                    </div>
                  </Button>
                  <Button 
                    onClick={() => handleMilesAction('Presentear amigo')}
                    variant="outline" 
                    className="w-full justify-start h-auto p-4 border-sunset-200 hover:bg-sunset-50 hover:border-sunset-300"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 mb-1">
                        🎁 Presentear um amigo com um voo
                      </div>
                      <div className="text-sm text-gray-600">
                        800 milhas = 1 voucher de presente
                      </div>
                    </div>
                  </Button>
                  <Button 
                    onClick={() => handleMilesAction('Doar para Banco de Sonhos')}
                    variant="outline" 
                    className="w-full justify-start h-auto p-4 border-skyblue-200 hover:bg-skyblue-50 hover:border-skyblue-300 relative"
                  >
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded px-2 py-1 text-xs font-bold">Destaque!</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 mb-1">
                        💝 Doar suas milhas para o Banco de Sonhos
                      </div>
                      <div className="text-sm text-gray-600">
                        Realize o sonho de alguém!
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Seu Impacto Green Sky */}
          <Card className="bg-white border-0 shadow-lg flex flex-col h-full">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-gray-900 flex items-center">
                <span className="mr-2">🌱</span>
                Seu Impacto Green Sky
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="flex flex-col gap-6 items-center text-center">
                <div className="bg-greensky-50 rounded-lg p-6 w-full max-w-xs">
                  <div className="text-2xl mb-2">🌳</div>
                  <div className="font-bold text-xl text-greensky-700">3</div>
                  <div className="text-sm text-gray-600">Árvores Plantadas</div>
                </div>
                <div className="bg-skyblue-50 rounded-lg p-6 w-full max-w-xs">
                  <div className="text-2xl mb-2">💚</div>
                  <div className="font-bold text-xl text-skyblue-700">1</div>
                  <div className="text-sm text-gray-600">Sonho Realizado</div>
                </div>
                <div className="bg-sunset-50 rounded-lg p-6 w-full max-w-xs">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-bold text-xl text-sunset-700">150kg</div>
                  <div className="text-sm text-gray-600">CO₂ Compensado</div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Indique e Ganhe */}
          <Card className="bg-white border-0 shadow-lg flex flex-col h-full">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-gray-900 flex items-center">
                <span className="mr-2">🤝</span>
                Indique e Ganhe
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="bg-gradient-hero rounded-lg p-6 mb-4">
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="font-bold text-xl text-gray-900 mb-1">
                    Ganhe 200 milhas
                  </div>
                  <div className="text-gray-600">
                    Para cada amigo que fizer seu primeiro voo
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu link de indicação:
                  </label>
                  <div className="flex gap-2">
                    <input 
                      value={profile && profile.referralLink ? profile.referralLink : 'https://greensky.com/ref/user123'}
                      readOnly 
                      className="flex-1 bg-gray-50 border rounded px-2 py-1"
                    />
                    <Button 
                      onClick={() => {navigator.clipboard.writeText(profile && profile.referralLink ? profile.referralLink : 'https://greensky.com/ref/user123')}}
                      className="bg-gradient-primary"
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Convide amigos e ganhe mais milhas! 🚀
                  </p>
                  <Button 
                    className="bg-gradient-sunset"
                    onClick={() => window.alert('Compartilhamento em desenvolvimento!')}
                  >
                    Compartilhar nas Redes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 bg-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-gray-900">Voos Contactados</CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-gray-500 text-left">
                Nenhum vôo contactado ainda. Marque sua primeira atividade agora!{' '}
                <Button variant="link" className="p-0 h-auto text-greensky-800 font-semibold" onClick={() => navigate('/busca')}>
                  Encontrar Pilotos
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map((c) => (
                  <Card key={c.id} className="border shadow p-4 flex flex-col items-center gap-4">
                    {c.pilot && c.pilot.photo ? (
                      <img src={c.pilot.photo} alt={c.pilot.name} className="w-16 h-16 rounded-full object-cover border-2 border-green-600" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserCircle className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 text-center">
                      <div className="font-semibold text-lg text-gray-900">{c.pilot ? c.pilot.name : "Piloto desconhecido"}</div>
                      <div className="text-gray-600 text-sm">{c.pilot ? c.pilot.school : ""}</div>
                      <div className="text-gray-500 text-xs mt-1">Contato em: {c.timestamp && c.timestamp.toDate ? c.timestamp.toDate().toLocaleString() : "-"}</div>
                    </div>
                    <div className="w-full flex justify-center mt-2">
                      {c.realized ? (
                        <span className="text-green-600 font-semibold">Vôo confirmado!</span>
                      ) : (
                        <AlertDialog open={confirmId === c.id} onOpenChange={open => setConfirmId(open ? c.id : null)}>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold w-full" onClick={() => setConfirmId(c.id)}>
                              Confirmar vôo feito
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você gostaria de confirmar que a atividade foi realizada?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Seus créditos serão validados em até 3 dias após confirmação do piloto
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={async () => {
                                await updateDoc(doc(db, "contacts", c.id), { realized: true });
                                setContacts(prev => prev.map(x => x.id === c.id ? { ...x, realized: true } : x));
                                setConfirmId(null);
                              }}>Confirmar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default MyFlights; 