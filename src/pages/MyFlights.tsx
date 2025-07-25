import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc,
  orderBy,
  limit,
  getCountFromServer 
} from "firebase/firestore";
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
import { Star } from "lucide-react";

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
  const [pilotContactsCount, setPilotContactsCount] = useState<number | null>(null);

  const [realizedFlightsCount, setRealizedFlightsCount] = useState(0);
  const [pilotRating, setPilotRating] = useState<number | null>(null);
  const [clientes, setClientes] = useState<{ name: string; email: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showRating, setShowRating] = useState<string | null>(null); // contactId
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingText, setRatingText] = useState("");
  const [showRewards, setShowRewards] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  // Carrega os cupons do usuário
  useEffect(() => {
    if (!user) return;
    
    const loadCoupons = async () => {
      try {
        console.log('Iniciando carregamento de cupons para o usuário:', user.uid);
        setLoadingCoupons(true);
        
        // Primeiro, verifica se o usuário tem permissão para acessar a coleção
        console.log('Verificando permissões...');
        
        // Tenta fazer uma consulta simples para ver se há algum problema de permissão
        const testQuery = query(collection(db, 'coupons'), limit(1));
        const testSnapshot = await getCountFromServer(testQuery);
        console.log('Teste de permissão bem-sucedido. Total de cupons na coleção:', testSnapshot.data().count);
        
        // Agora busca os cupons do usuário
        console.log('Buscando cupons para o usuário:', user.uid);
        const q = query(
          collection(db, 'coupons'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        console.log('Consulta criada, executando...');
        const querySnapshot = await getDocs(q);
        console.log('Documentos encontrados:', querySnapshot.docs.length);
        
        const userCoupons = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Processando cupom:', doc.id, data);
          
          // Função auxiliar para converter Firestore Timestamp para Date
          const toDate = (timestamp: any) => {
            try {
              if (!timestamp) return null;
              // Se for um objeto Timestamp do Firestore
              if (typeof timestamp.toDate === 'function') {
                return timestamp.toDate();
              }
              // Se já for um objeto Date (pode acontecer em alguns casos)
              if (timestamp instanceof Date) {
                return timestamp;
              }
              // Se for um timestamp em milissegundos
              if (typeof timestamp === 'number') {
                return new Date(timestamp);
              }
              return null;
            } catch (error) {
              console.error('Erro ao converter timestamp:', timestamp, error);
              return null;
            }
          };
          
          return {
            id: doc.id,
            ...data,
            // Converte os timestamps do Firestore para objetos Date do JavaScript
            createdAt: toDate(data.createdAt) || new Date(),
            expiresAt: toDate(data.expiresAt),
            usedAt: data.usedAt ? toDate(data.usedAt) : null
          };
        });
        
        console.log('Cupons processados com sucesso:', userCoupons);
        setCoupons(userCoupons);
      } catch (error) {
        console.error('Erro detalhado ao carregar cupons:');
        console.error('Tipo de erro:', typeof error);
        console.error('Mensagem de erro:', error instanceof Error ? error.message : 'Erro desconhecido');
        console.error('Objeto de erro completo:', error);
        
        if (error instanceof Error) {
          console.error('Stack trace:', error.stack);
          
          // Verifica se é um erro de permissão
          if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
            console.error('ERRO DE PERMISSÃO: O usuário não tem permissão para acessar a coleção de cupons');
            window.alert('Você não tem permissão para visualizar os cupons. Por favor, entre em contato com o suporte.');
            return;
          }
        }
        
        window.alert('Não foi possível carregar seus cupons. Por favor, tente novamente mais tarde.');
      } finally {
        setLoadingCoupons(false);
      }
    };
    
    loadCoupons();
  }, [user]);

  // Função para formatar a data
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Erro ao formatar data:', date, error);
      return 'Data inválida';
    }
  };

  // Função para obter o status do cupom
  const getCouponStatus = (coupon: any) => {
    if (coupon.used) return { text: 'Utilizado', className: 'bg-gray-100 text-gray-800' };
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { text: 'Expirado', className: 'bg-red-100 text-red-800' };
    }
    return { text: 'Ativo', className: 'bg-green-100 text-green-800' };
  };

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
          let pilot = null;
          if (data.pilotId) {
            console.log('[DEBUG] Buscando piloto para pilotId:', data.pilotId);
            // Buscar pelo campo uid, já que pilotId nos contatos contém o UID do piloto
            const qPilot = query(collection(db, "pilots"), where("uid", "==", data.pilotId));
            const snapPilot = await getDocs(qPilot);
            if (!snapPilot.empty) {
              const pilotDoc = snapPilot.docs[0];
              pilot = pilotDoc.data();
              console.log('[DEBUG] Piloto encontrado:', pilot);
            } else {
              console.warn('[DEBUG] Nenhum piloto encontrado para pilotId:', data.pilotId);
            }
          } else {
            console.warn('[DEBUG] Contato sem pilotId:', data);
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
      console.log('[DEBUG PILOT] Buscando contatos para piloto UID:', user.uid);
      const q = query(collection(db, "contacts"), where("pilotId", "==", user.uid));
      const snapContacts = await getDocs(q);
      console.log('[DEBUG PILOT] Contatos encontrados:', snapContacts.docs.length);
      const contactsArr = [];
      for (const c of snapContacts.docs) {
        const data = c.data();
        console.log('[DEBUG PILOT] Contato:', { id: c.id, pilotId: data.pilotId, userId: data.userId, realized: data.realized });
        // Busca dados do usuário que fez o contato
        let contactUser = null;
        if (data.userId) {
          try {
            const userSnap = await getDoc(doc(db, "users", data.userId));
            if (userSnap.exists()) {
              contactUser = userSnap.data();
            } else {
              console.log('[DEBUG PILOT] Usuário não encontrado:', data.userId);
            }
          } catch (error) {
            console.log('[DEBUG PILOT] Erro de permissão ao buscar usuário:', data.userId, error);
            // Criar um objeto básico com informações limitadas
            contactUser = {
              firstName: 'Usuário',
              lastName: '',
              email: data.userId // Usar o ID como fallback
            };
          }
        }
        contactsArr.push({ ...data, id: c.id, contactUser });
      }
      console.log('[DEBUG PILOT] Array final de contatos:', contactsArr);
      setPilotContacts(contactsArr);
      setLoadingPilotContacts(false);
    };
    fetchPilotContacts();
  }, [user, profile]);

  useEffect(() => {
    if (!user || !profile || !profile.pilot) return;
    const fetchRealizedFlights = async () => {
      console.log('UID do piloto logado:', user.uid);
      const q = query(collection(db, "contacts"), where("pilotId", "==", user.uid));
      const snap = await getDocs(q);
      snap.docs.forEach(docSnap => {
        const data = docSnap.data();
        console.log('Contato:', { id: docSnap.id, pilotId: data.pilotId, realized: data.realized });
      });
      const realizedCount = snap.docs.filter(doc => doc.data().realized === true).length;
      setRealizedFlightsCount(realizedCount);
    };
    fetchRealizedFlights();
  }, [user, profile]);

  useEffect(() => {
    if (!user || !profile || !profile.pilot) return;
    const fetchPilotInfo = async () => {
      const q = query(collection(db, "pilots"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setPilotRating(typeof data.rating === 'number' ? data.rating : null);
        setPilotContactsCount(Array.isArray(data.contacts) ? data.contacts.length : 0);
      } else {
        setPilotRating(null);
        setPilotContactsCount(null);
      }
    };
    fetchPilotInfo();
  }, [user, profile]);

  useEffect(() => {
    if (!user || !profile || !profile.pilot) return;
    const fetchClientes = async () => {
      console.log('[DEBUG CLIENTES] Buscando clientes para piloto UID:', user.uid);
      const q = query(collection(db, "contacts"), where("pilotId", "==", user.uid));
      const snap = await getDocs(q);
      console.log('[DEBUG CLIENTES] Contatos encontrados para clientes:', snap.docs.length);
      const clientesArr: { name: string; email: string }[] = [];
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        console.log('[DEBUG CLIENTES] Processando contato:', { id: docSnap.id, userId: data.userId, pilotId: data.pilotId });
        if (data.userId) {
          try {
            const userSnap = await getDoc(doc(db, "users", data.userId));
            if (userSnap.exists()) {
              const userData = userSnap.data();
              const name = (userData.firstName || "") + (userData.lastName ? " " + userData.lastName : "");
              console.log('[DEBUG CLIENTES] Dados do usuário:', { name: name.trim() || userData.email, email: userData.email });
              clientesArr.push({ name: name.trim() || userData.email, email: userData.email });
            } else {
              console.log('[DEBUG CLIENTES] Usuário não encontrado para userId:', data.userId);
            }
          } catch (error) {
            console.log('[DEBUG CLIENTES] Erro de permissão ao buscar usuário:', data.userId, error);
            // Adicionar cliente com informações limitadas
            clientesArr.push({ 
              name: `Cliente ${data.userId.substring(0, 8)}...`, 
              email: 'Email não disponível' 
            });
          }
        } else {
          console.log('[DEBUG CLIENTES] Contato sem userId:', docSnap.id);
        }
      }
      console.log('[DEBUG CLIENTES] Array final de clientes:', clientesArr);
      setClientes(clientesArr);
    };
    fetchClientes();
  }, [user, profile]);

  useEffect(() => {
    if (profile) {
      console.log('=== DEBUG: Profile Data ===');
      console.log('Profile:', profile);
      console.log('Profile miles (raw):', profile.miles, 'Type:', typeof profile.miles);
      console.log('Realized contacts count:', contacts.filter(c => c.realized).length);
      
      // Check if miles is a string and log its value
      if (typeof profile.miles === 'string') {
        console.log('Profile miles as number:', Number(profile.miles));
      } else if (typeof profile.miles === 'number') {
        console.log('Profile miles is already a number');
      } else {
        console.log('No valid miles found in profile');
      }
    }
  }, [profile, contacts]);

  // Calculate miles - prioritize profile.miles if it exists
  const calculateMiles = () => {
    // Debug: Log profile data for troubleshooting
    console.log('=== DEBUG: Calculating Miles ===');
    console.log('Profile miles (raw):', profile?.miles, 'Type:', typeof profile?.miles);
    console.log('Realized contacts count:', contacts.filter(c => c.realized).length);
    
    // If profile has miles defined and it's not null/undefined
    if (profile?.miles != null) {
      const profileMiles = Number(profile.miles);
      console.log('Using profile miles:', profileMiles);
      return isNaN(profileMiles) ? 0 : profileMiles;
    }
    
    // Fallback to calculation based on realized contacts
    const calculated = contacts.filter(c => c.realized).length * 250;
    console.log('Calculating miles from contacts:', calculated);
    return calculated;
  };

  // Calculate miles once at the top level
  const miles = calculateMiles();
  console.log('Final miles value:', miles, 'Type:', typeof miles);
  
  const treesPlanted = Math.floor(miles / 250);
  const co2Compensated = treesPlanted * 150;

  // Função para feedback dos botões de milhas
  const handleMilesAction = async (action: string) => {
    if (action === 'Converter em voo') {
      // Verifica se o usuário tem milhas suficientes (1000 milhas para um voo duplo)
      if (miles < 1000) {
        window.alert(`Você precisa de pelo menos 1000 milhas para converter em um voo duplo. Você tem ${miles} milhas.`);
        return;
      }

      try {
        // Atualiza o perfil do usuário subtraindo as milhas
        const user = auth.currentUser;
        if (!user) {
          window.alert('Usuário não autenticado');
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const newMiles = Math.max(0, miles - 1000); // Garante que não fique negativo
        const currentDate = new Date();
        
        // Gera um número de cupom único
        const couponNumber = `GS-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`;
        
        // Cria o documento do cupom na coleção 'coupons'
        const couponData = {
          userId: user.uid,
          userEmail: user.email || '',
          couponNumber: couponNumber,
          type: 'dual_flight',
          value: 1, // 1 voo duplo
          used: false,
          createdAt: currentDate,
          expiresAt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, currentDate.getDate()), // Expira em 6 meses
          usedAt: null
        };
        
        // Adiciona o cupom à coleção 'coupons'
        await addDoc(collection(db, 'coupons'), couponData);
        
        // Atualiza o perfil do usuário
        await updateDoc(userRef, {
          miles: newMiles,
          hasDualFlight: true,
          dualFlightDate: currentDate,
          lastCouponNumber: couponNumber
        });

        // Atualiza o estado local
        setProfile(prev => ({
          ...prev,
          miles: newMiles,
          hasDualFlight: true,
          dualFlightDate: currentDate,
          lastCouponNumber: couponNumber
        }));

        window.alert(`Parabéns! Você converteu 1000 milhas em 1 voo duplo!\nSeu número do cupom: ${couponNumber}`);
      } catch (error) {
        console.error('Erro ao converter milhas:', error);
        window.alert('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
      }
    } else {
      // Mantém o comportamento original para outras ações
      window.alert(`${action} em desenvolvimento!`);
    }
  };

  // Função para exportar clientes como CSV
  function exportClientesCSV(clientes: { name: string; email: string }[]) {
    if (!clientes.length) return;
    const header = 'Nome,Email\n';
    const rows = clientes.map(c => `"${c.name}","${c.email}"`).join('\n');
    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'clientes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Função para copiar texto para a área de transferência
  function copyToClipboard(text: string, idx?: number) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      // Fallback para navegadores antigos
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    if (typeof idx === 'number') {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1200);
    }
  }

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
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-2xl mx-auto">
            <h1 className="font-heading font-bold text-2xl md:text-3xl mb-6">Faça login para ver suas milhas</h1>
            <div className="space-y-4">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-6 text-lg w-full md:w-auto"
                onClick={() => navigate("/login")}
              >
                Entrar
              </Button>
              <div className="text-gray-600">
                <p>Não tem conta? <button 
                  onClick={() => navigate("/register")} 
                  className="text-green-600 hover:text-green-800 font-semibold underline"
                >
                  Crie agora
                </button> e gere propósito desde já!</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Versão para pilotos
  if (profile && profile.pilot) {
    const treesPlanted = realizedFlightsCount;
    const co2Compensated = realizedFlightsCount * 50;
    const efetividade = pilotContactsCount && pilotContactsCount > 0 ? Math.round((realizedFlightsCount / pilotContactsCount) * 100) : 0;
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
                  <div className="grid grid-cols-2 grid-rows-2 gap-6 mb-2 text-center place-items-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-heading font-semibold text-gray-700 text-base mb-1 flex items-center gap-1 justify-center"><span>✈️</span>Voos</span>
                      <span className="font-heading font-extrabold text-4xl text-green-700 leading-tight">{realizedFlightsCount}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-heading font-semibold text-gray-700 text-base mb-1 flex items-center gap-1 justify-center"><span>👥</span>Contatos</span>
                      <span className="font-heading font-extrabold text-4xl text-green-700 leading-tight">{pilotContactsCount ?? 0}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-heading font-semibold text-gray-700 text-base mb-1 flex items-center gap-1 justify-center"><span>📈</span>Efetividade</span>
                      <span className="font-extrabold text-3xl text-green-700 leading-tight">{efetividade}%</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-heading font-semibold text-gray-700 text-base mb-1 flex items-center gap-1 justify-center"><span>⭐</span>Rating</span>
                      <span className="font-bold text-green-700 text-3xl">{(pilotRating ?? 0).toFixed(1)} <span className="text-gray-500 text-lg">/ 5.0</span></span>
                    </div>
                  </div>
                  <CardTitle className="font-heading text-xl text-gray-900 flex items-center mt-2">
                    {/* Ícone removido */}
                  </CardTitle>

                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                  {/* Aqui você pode exibir uma lista de voos realizados, contatos, etc. */}
                  {/* Texto 'Em breve' removido */}
                </CardContent>
              </Card>
            </div>
            {/* Seu Impacto Green Sky */}
            <Card className="bg-white border-0 shadow-lg flex flex-col h-full">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-gray-900">Seu Impacto</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col gap-6 items-center text-center">
                  <div className="bg-greensky-50 rounded-lg p-6 w-full max-w-xs">
                    <div className="text-2xl mb-2">🌳</div>
                    <div className="font-bold text-xl text-greensky-700">{treesPlanted}</div>
                    <div className="text-sm text-gray-600">Árvores Plantadas</div>
                  </div>
                  <div className="bg-skyblue-50 rounded-lg p-6 w-full max-w-xs">
                    <div className="text-2xl mb-2">💚</div>
                    <div className="font-bold text-xl text-skyblue-700">0</div>
                    <div className="text-sm text-gray-600">Sonho Realizado</div>
                  </div>
                  <div className="bg-sunset-50 rounded-lg p-6 w-full max-w-xs">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-bold text-xl text-sunset-700">{co2Compensated}kg</div>
                    <div className="text-sm text-gray-600">CO₂ Compensado</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col h-full bg-white border-0 shadow-lg rounded-lg p-6">
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-4 text-left">Meus clientes</h3>
              {clientes.length === 0 ? (
                <div className="text-gray-500 text-center">Nenhum cliente ainda.</div>
              ) : (
                <>
                  <ul className="divide-y divide-gray-200 text-left">
                    {clientes.map((c, i) => (
                      <li key={i} className="py-2 flex flex-col gap-1">
                        <div className="font-semibold text-gray-900">{c.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-sm">{c.email}</span>
                          <button
                            className="text-green-700 hover:text-green-900 text-xs border border-green-200 rounded px-2 py-0.5 transition-colors"
                            title="Copiar email"
                            onClick={() => copyToClipboard(c.email, i)}
                          >
                            Copiar
                          </button>
                          {copiedIndex === i && (
                            <span className="text-green-600 text-xs ml-1">Copiado!</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                    onClick={() => exportClientesCSV(clientes)}
                  >
                    Exportar como csv
                  </button>
                </>
              )}
            </div>
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
                        {c.realized ? (
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
                                  await updateDoc(doc(db, "contacts", c.id), { realized: true });
                                  setPilotContacts(prev => prev.map(x => x.id === c.id ? { ...x, realized: true } : x));
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
                  <div className="font-bold text-xl text-greensky-700">{treesPlanted}</div>
                  <div className="text-sm text-gray-600">Árvores Plantadas</div>
                </div>
                <div className="bg-skyblue-50 rounded-lg p-6 w-full max-w-xs">
                  <div className="text-2xl mb-2">💚</div>
                  <div className="font-bold text-xl text-skyblue-700">0</div>
                  <div className="text-sm text-gray-600">Sonho Realizado</div>
                </div>
                <div className="bg-sunset-50 rounded-lg p-6 w-full max-w-xs">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-bold text-xl text-sunset-700">{co2Compensated}kg</div>
                  <div className="text-sm text-gray-600">CO₂ Compensado</div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Meus Cupons */}
          <Card className="bg-white border-0 shadow-lg flex flex-col h-full">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-gray-900 flex items-center">
                <span className="mr-2">🎫</span>
                Meus Cupons
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              {loadingCoupons ? (
                <div className="text-center p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-greensky-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Carregando seus cupons...</p>
                </div>
              ) : coupons.length > 0 ? (
                <div className="space-y-4">
                  {coupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <div key={coupon.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-blue-600">
                              {coupon.type === 'dual_flight' ? '1 Voo Duplo' : 'Cupom'}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              Nº: {coupon.couponNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              Criado em: {formatDate(coupon.createdAt)}
                            </div>
                            {coupon.expiresAt && (
                              <div className="text-xs text-gray-500">
                                Válido até: {formatDate(coupon.expiresAt)}
                              </div>
                            )}
                          </div>
                          <div className={`text-xs font-medium px-2 py-1 rounded-full ${status.className}`}>
                            {status.text}
                          </div>
                        </div>
                        {!coupon.used && status.text === 'Ativo' && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full text-sm"
                              onClick={() => {
                                navigator.clipboard.writeText(coupon.couponNumber);
                                window.alert(`Código do cupom copiado: ${coupon.couponNumber}`);
                              }}
                            >
                              Copiar Código
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-2">🎁</div>
                  <div className="font-medium text-gray-700 mb-2">Nenhum cupom disponível</div>
                  <p className="text-sm text-gray-500 mb-4">Converta suas milhas em voos ou descontos especiais</p>
                  <Button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="bg-gradient-primary text-white"
                  >
                    Ver opções de conversão
                  </Button>
                </div>
              )}
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
                                setShowRating(c.id); // Abre modal de avaliação
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
      {/* Modal de avaliação após confirmação */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Avalie seu voo</h2>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setRatingValue(star)}>
                  <Star className={`w-8 h-8 ${star <= ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} fill={star <= ratingValue ? '#facc15' : 'none'} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={3}
              placeholder="Deixe um comentário (opcional)"
              value={ratingText}
              onChange={e => setRatingText(e.target.value)}
            />
            <div className="flex gap-2 w-full">
              <Button className="flex-1" variant="outline" onClick={() => setShowRating(null)}>Cancelar</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={async () => {
                await updateDoc(doc(db, "contacts", showRating), { rating: ratingValue, review: ratingText });
                // Atualizar piloto: realized +1 e rating média ponderada
                // Buscar pilotId do contato
                const contact = contacts.find(c => c.id === showRating);
                if (contact && contact.pilotId) {
                  // Buscar piloto pelo campo pilotId
                  const qPilot = query(collection(db, "pilots"), where("pilotId", "==", contact.pilotId));
                  const snapPilot = await getDocs(qPilot);
                  if (!snapPilot.empty) {
                    const pilotDoc = snapPilot.docs[0];
                    const pilotRef = doc(db, "pilots", pilotDoc.id);
                    const pilotData = pilotDoc.data();
                    const realized = typeof pilotData.realized === 'number' ? pilotData.realized + 1 : 1;
                    const oldRating = typeof pilotData.rating === 'number' ? pilotData.rating : 0;
                    const oldCount = typeof pilotData.ratingCount === 'number' ? pilotData.ratingCount : 0;
                    const newCount = oldCount + 1;
                    const newRating = ((oldRating * oldCount) + ratingValue) / newCount;
                    await updateDoc(pilotRef, { realized, rating: newRating, ratingCount: newCount });
                  }
                }
                setShowRating(null);
                setRatingValue(0);
                setRatingText("");
                setShowRewards(true);
              }}>Enviar Avaliação</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Popup de Recompensas */}
      {showRewards && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4 flex flex-col items-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2 text-center">Parabéns!</h2>
            <p className="text-gray-600 mb-6 text-center">Você ganhou recompensas incríveis por sua aventura sustentável!</p>
            
            <div className="w-full space-y-4 mb-6">
              {/* Milhas */}
              <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4">
                <div className="text-3xl">✈️</div>
                <div className="flex-1">
                  <div className="font-bold text-blue-600">
                    250 Milhas
                  </div>
                  <div className="text-blue-500 text-sm">
                    Adicionadas à sua conta
                  </div>
                </div>
              </div>
              
              {/* Árvore */}
              <div className="bg-green-50 rounded-xl p-4 flex items-center gap-4">
                <div className="text-3xl">🌳</div>
                <div className="flex-1">
                  <div className="font-bold text-green-600 text-lg">
                    1 Árvore Plantada
                  </div>
                  <div className="text-green-500 text-sm">
                    Contribuindo para o reflorestamento
                  </div>
                </div>
              </div>
              
              {/* CO2 */}
              <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-4">
                <div className="text-3xl">🌱</div>
                <div className="flex-1">
                  <div className="font-bold text-emerald-600 text-lg">
                    300kg CO2 Compensado
                  </div>
                  <div className="text-emerald-500 text-sm">
                    Reduzindo sua pegada de carbono
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
              onClick={() => setShowRewards(false)}
            >
              Continuar Aventurando! 🌱
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFlights; 