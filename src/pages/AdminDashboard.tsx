
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, updateDoc, where, getCountFromServer, serverTimestamp, limit, setDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast";
import { onAuthStateChanged, User } from "firebase/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Type for the permission check result
type PermissionResult = {
  isAdmin: boolean;
  userData?: any;
  error?: string;
  readError?: string;
};
import { AlertCircle, X, Phone, Mail, MapPin, Calendar, Clock, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pilots, setPilots] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingPilots, setLoadingPilots] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const itemsPerPage = 10;

  // Estado para armazenar a lista de pilotos
  
  // Estado para o modal de detalhes
  const [selectedPilot, setSelectedPilot] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Alternar status de aprovação do piloto
  const toggleApproval = async (pilotId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'pilots', pilotId), {
        approved: !currentStatus,
        updatedAt: serverTimestamp()
      });
      
      toast({
        title: 'Status atualizado',
        description: `Piloto ${!currentStatus ? 'aprovado' : 'desaprovado'} com sucesso.`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do piloto.',
        variant: 'destructive',
      });
    }
  };

  // Obter pilotos da página atual
  const indexOfLastPilot = currentPage * itemsPerPage;
  const indexOfFirstPilot = indexOfLastPilot - itemsPerPage;
  const currentPilots = pilots.slice(indexOfFirstPilot, indexOfLastPilot);
  const totalPages = Math.ceil(pilots.length / itemsPerPage);
  
  // Obter usuários da página atual
  const indexOfLastUser = currentUsersPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalUsersPages = Math.ceil(users.length / itemsPerPage);
  
  // Mudar de página de pilotos
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Mudar de página de usuários
  const paginateUsers = (pageNumber: number) => setCurrentUsersPage(pageNumber);
  
  // Abrir modal de detalhes
  const openPilotDetails = (pilot: any) => {
    setSelectedPilot(pilot);
    setIsDetailsOpen(true);
  };
  
  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Verificar permissões do usuário
  // Moved to the more comprehensive implementation below
  
  // Buscar lista de usuários com listener em tempo real
  const fetchUsers = () => {
    setLoadingUsers(true);
    
    // Verificar se o usuário está autenticado
    if (!auth.currentUser) {
      setLoadingUsers(false);
      return () => {}; // Retorna uma função vazia para unsubscribe
    }
    
    // Criar a query para buscar os usuários (excluindo admins)
    const usersQuery = query(
      collection(db, 'users'),
      where('admin', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    // Configurar o listener em tempo real
    const unsubscribe = onSnapshot(
      usersQuery,
      (querySnapshot) => {
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersData);
        setLoadingUsers(false);
      },
      (error) => {
        console.error('Erro ao buscar usuários:', error);
        setLoadingUsers(false);
        
        toast({
          title: 'Erro ao carregar usuários',
          description: 'Não foi possível carregar a lista de usuários.',
          variant: 'destructive',
        });
      }
    );
    
    // Retornar a função de unsubscribe para limpar o listener
    return unsubscribe;
  };

  // Buscar lista de pilotos com listener em tempo real
  const fetchPilots = () => {
    console.log('fetchPilots chamado');
    setLoadingPilots(true);
    
    // Verificar se o usuário está autenticado
    if (!auth.currentUser) {
      console.log('Usuário não autenticado');
      setLoadingPilots(false);
      return () => {}; // Retorna uma função vazia para unsubscribe
    }
    
    try {
      // Verificar se o Firestore está inicializado
      if (!db) {
        console.error('Firestore não está inicializado');
        throw new Error('O banco de dados não está disponível');
      }
      
      // Criar a query para buscar os pilotos
      const pilotsQuery = query(
        collection(db, 'pilots'),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Query criada:', pilotsQuery);
      
      // Configurar o listener em tempo real
      const unsubscribe = onSnapshot(
        pilotsQuery,
        (querySnapshot) => {
          try {
            console.log('Snapshot recebido, documentos:', querySnapshot.docs.length);
            
            if (!querySnapshot || !querySnapshot.docs) {
              console.error('Dados de pilotos inválidos recebidos:', querySnapshot);
              throw new Error('Dados recebidos são inválidos');
            }
            
            const pilotsData = querySnapshot.docs.map(doc => {
              if (!doc.exists) {
                console.warn('Documento não existe:', doc.id);
                return null;
              }
              
              const data = doc.data();
              console.log('Documento processado:', doc.id, data);
              
              return {
                id: doc.id,
                ...data
              };
            }).filter(Boolean); // Remove quaisquer entradas nulas
            
            console.log(`${pilotsData.length} pilotos processados com sucesso`);
            setPilots(pilotsData);
          } catch (processingError) {
            console.error('Erro ao processar dados dos pilotos:', processingError);
            toast({
              title: 'Erro de processamento',
              description: 'Ocorreu um erro ao processar os dados dos pilotos.',
              variant: 'destructive',
            });
          } finally {
            setLoadingPilots(false);
          }
        },
        (error) => {
          console.error('Erro no listener de pilotos:', error);
          setLoadingPilots(false);
          
          toast({
            title: 'Erro ao carregar pilotos',
            description: error.message || 'Não foi possível carregar a lista de pilotos.',
            variant: 'destructive',
          });
        }
      );
      
      console.log('Listener configurado, retornando unsubscribe');
      return unsubscribe;
      
    } catch (error) {
      console.error('Erro ao configurar listener de pilotos:', error);
      setLoadingPilots(false);
      
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível configurar a busca por pilotos.',
        variant: 'destructive',
      });
      
      // Retorna uma função vazia para manter a assinatura consistente
      return () => {};
    }
  };

  // Buscar métricas do dashboard
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Buscar contagem de pilotos ativos
      const pilotsQuery = query(collection(db, 'pilots'), where('approved', '==', true));
      const pilotsSnapshot = await getCountFromServer(pilotsQuery);
      
      // Buscar contagem de usuários ativos (excluindo admins)
      const usersQuery = query(collection(db, 'users'), where('admin', '==', false));
      const usersSnapshot = await getCountFromServer(usersQuery);
      
      // Buscar contagem de voos confirmados
      const flightsQuery = query(
        collection(db, 'contacts'), 
        where('confirmed', '==', true),
        where('realized', '==', true)
      );
      const flightsSnapshot = await getCountFromServer(flightsQuery);
      
      setMetrics({
        activePilots: pilotsSnapshot.data().count,
        activeUsers: usersSnapshot.data().count,
        confirmedFlights: flightsSnapshot.data().count,
        couponsIssued: 0, // Será implementado posteriormente
        loading: false
      });
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      setMetrics(prev => ({ ...prev, loading: false }));
      setLoading(false);
    }
  };
  
  // Função para testar a conexão com o Firestore e buscar pilotos diretamente
  const testFirestoreConnection = async () => {
    try {
      console.log('Testando conexão com o Firestore...');
      
      // Testar conexão básica
      console.log('Testando conexão básica com o Firestore...');
      const testDocRef = doc(db, 'test', 'connection');
      const testDoc = await getDoc(testDocRef);
      console.log('Conexão com Firestore bem-sucedida');
      
      // Testar busca direta por pilotos
      console.log('Testando busca direta por pilotos...');
      try {
        const pilotsQuery = query(collection(db, 'pilots'), limit(5));
        const querySnapshot = await getDocs(pilotsQuery);
        
        console.log(`Encontrados ${querySnapshot.size} pilotos na busca direta`);
        
        if (querySnapshot.size === 0) {
          console.warn('Nenhum piloto encontrado na coleção "pilots"');
          
          // Verificar se a coleção existe tentando adicionar um documento de teste
          console.log('Verificando permissões de escrita...');
          const testPilotRef = doc(collection(db, 'pilots'));
          try {
            await setDoc(testPilotRef, {
              test: true,
              timestamp: serverTimestamp()
            });
            console.log('Permissão de escrita confirmada para a coleção "pilots"');
            
            // Remover o documento de teste
            await deleteDoc(testPilotRef);
          } catch (writeError) {
            console.error('Erro ao tentar escrever na coleção "pilots":', writeError);
          }
        } else {
          querySnapshot.forEach((doc) => {
            console.log('Piloto direto:', {
              id: doc.id,
              data: doc.data(),
              hasUid: !!doc.data().uid,
              hasPilotId: !!doc.data().pilotId
            });
          });
        }
      } catch (pilotsError) {
        console.error('Erro ao buscar pilotos:', pilotsError);
        
        // Tentar buscar a coleção de usuários para verificar permissões
        try {
          console.log('Testando acesso à coleção "users"...');
          const usersQuery = query(collection(db, 'users'), limit(1));
          const usersSnapshot = await getDocs(usersQuery);
          console.log(`Acesso à coleção "users" bem-sucedido, ${usersSnapshot.size} usuários encontrados`);
        } catch (usersError) {
          console.error('Erro ao acessar coleção "users":', usersError);
        }
        
        throw pilotsError; // Relançar o erro para ser tratado no catch externo
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao conectar ao Firestore ou buscar pilotos:', error);
      
      // Verificar se é um erro de permissão
      if (error.code === 'permission-denied') {
        console.error('Permissão negada para acessar o Firestore');
        toast({
          title: 'Permissão negada',
          description: 'Você não tem permissão para acessar os dados. Verifique se está autenticado como administrador.',
          variant: 'destructive',
        });
      } else {
        // Mostrar erro genérico para outros tipos de erro
        toast({
          title: 'Erro de conexão',
          description: `Não foi possível conectar ao banco de dados: ${error.message}`,
          variant: 'destructive',
        });
      }
      
      return false;
    }
  };

  // Verificar permissões do usuário no Firestore
  const checkUserPermissions = useCallback(async (userId: string): Promise<PermissionResult> => {
    try {
      console.log('Verificando permissões do usuário:', userId);
      
      // 1. Verificar se o documento do usuário existe
      const userDoc = await getDoc(doc(db, 'users', userId));
      console.log('Documento do usuário encontrado:', userDoc.exists());
      
      if (!userDoc.exists()) {
        console.error('Documento do usuário não encontrado no Firestore');
        return { isAdmin: false, error: 'Usuário não encontrado' };
      }
      
      const userData = userDoc.data();
      console.log('Dados do usuário:', userData);
      
      // 2. Verificar se o usuário é admin
      const isAdmin = !!(userData?.admin);
      console.log('Usuário é admin?', isAdmin);
      
      // 3. Verificar permissões de leitura/escrita
      try {
        console.log('Testando leitura da coleção de usuários...');
        const testQuery = query(collection(db, 'users'), limit(1));
        const testSnapshot = await getDocs(testQuery);
        console.log('Leitura de usuários bem-sucedida, documentos encontrados:', testSnapshot.size);
      } catch (readError) {
        console.error('Erro ao ler dados do Firestore:', readError);
        return { isAdmin, readError: (readError as Error).message };
      }
      
      return { isAdmin, userData };
      
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return { isAdmin: false, error: (error as Error).message };
    }
  }, []);

  // Efeito para gerenciar autenticação e carregamento inicial
  useEffect(() => {
    console.log('useEffect de autenticação iniciado');
    let unsubPilots: (() => void) | undefined;
    let unsubUsers: (() => void) | undefined;
    let mounted = true;
    
    const initializeAdminDashboard = async (currentUser: User) => {
      if (!mounted) return;
      
      console.log('Usuário autenticado, verificando permissões...');
      setUser(currentUser);
      
      try {
        // Verificar permissões do usuário
        const permissionResult = await checkUserPermissions(currentUser.uid);
        
        if (permissionResult.error || permissionResult.readError) {
          console.error('Erro nas permissões do usuário:', permissionResult.error || permissionResult.readError);
          toast({
            title: 'Erro de permissão',
            description: 'Não foi possível verificar suas permissões de administrador. Por favor, tente novamente mais tarde.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
        
        if (!permissionResult.isAdmin) {
          console.log('Usuário não é administrador, redirecionando...');
          toast({
            title: 'Acesso negado',
            description: 'Você precisa ser um administrador para acessar esta página.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
        
        // Se chegou aqui, o usuário é admin e tem permissões
        console.log('Usuário é administrador, carregando dados...');
        setProfile(permissionResult.userData);
        
        try {
          // Testar conexão com Firestore
          console.log('Testando conexão com o Firestore...');
          const isConnected = await testFirestoreConnection();
          
          if (!mounted) return;
          
          if (!isConnected) {
            throw new Error('Falha na conexão com o banco de dados');
          }
          
          console.log('Conexão com Firestore bem-sucedida, carregando dados...');
          
          // Carregar métricas e dados
          console.log('Chamando fetchMetrics...');
          await fetchMetrics();
          
          if (!mounted) return;
          
          console.log('fetchMetrics concluído, chamando fetchPilots...');
          unsubPilots = fetchPilots();
          
          console.log('fetchPilots chamado, chamando fetchUsers...');
          unsubUsers = fetchUsers();
          
          console.log('Todos os dados foram solicitados');
          setLoading(false);
          
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
          if (mounted) {
            setLoading(false);
            toast({
              title: 'Erro ao carregar dados',
              description: error.message || 'Não foi possível carregar os dados do painel.',
              variant: 'destructive',
            });
          }
        }
        
      } catch (error) {
        console.error('Erro ao verificar permissões de administrador:', error);
        if (mounted) {
          setLoading(false);
          toast({
            title: 'Erro',
            description: 'Ocorreu um erro ao verificar suas permissões.',
            variant: 'destructive',
          });
        }
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('onAuthStateChanged chamado, usuário:', currentUser ? 'autenticado' : 'não autenticado');
      
      if (currentUser) {
        initializeAdminDashboard(currentUser);
      } else {
        console.log('Nenhum usuário autenticado, redirecionando para login...');
        navigate('/login');
      }
    });

    // Função de limpeza
    return () => {
      console.log('Limpando listeners...');
      if (unsubPilots) unsubPilots();
      if (unsubUsers) unsubUsers();
      unsubscribe();
      mounted = false;
    };
  }, [navigate]);
  
  // Atualizar métricas a cada 30 segundos
  useEffect(() => {
    if (profile?.admin) {
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [profile]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-greensky-600 mx-auto mb-4"></div>
            <p>Carregando...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!user || !profile?.admin) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Acesso Negado</AlertTitle>
              <AlertDescription>
                Você não tem permissão para acessar esta área.
              </AlertDescription>
            </Alert>
            <Button 
              className="mt-4 w-full" 
              onClick={() => navigate("/")}
            >
              Voltar para a página inicial
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const dreamBankQueue = [
    { id: 1, name: "Ana Silva", story: "Sonha em voar desde criança", waitTime: "3 meses" },
    { id: 2, name: "Pedro Santos", story: "Pessoa com deficiência que quer superar limites", waitTime: "2 meses" },
    { id: 3, name: "Maria José", story: "Idosa de 68 anos com sonho de voar", waitTime: "1 mês" }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Bem-vindo(a) ao painel de controle da plataforma</p>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="pilots">Pilotos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="dreams">Sonhos</TabsTrigger>
            <TabsTrigger value="carbon">Impacto Ambiental</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Visão Geral do Sistema</h2>
            
            {/* Métricas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Pilotos Ativos</p>
                      {metrics.loading ? (
                        <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mt-1"></div>
                      ) : (
                        <p className="text-3xl font-bold text-greensky-700">{metrics.activePilots}</p>
                      )}
                      <p className="text-gray-500 text-xs">Cadastrados na plataforma</p>
                    </div>
                    <div className="p-3 bg-greensky-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-greensky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Usuários Ativos</p>
                      {metrics.loading ? (
                        <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mt-1"></div>
                      ) : (
                        <p className="text-3xl font-bold text-blue-600">{metrics.activeUsers}</p>
                      )}
                      <p className="text-gray-500 text-xs">Cadastrados na plataforma</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Voos Confirmados</p>
                      {metrics.loading ? (
                        <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mt-1"></div>
                      ) : (
                        <p className="text-3xl font-bold text-purple-600">{metrics.confirmedFlights}</p>
                      )}
                      <p className="text-gray-500 text-xs">Realizados com sucesso</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Cupons Ativos</p>
                      {metrics.loading ? (
                        <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mt-1"></div>
                      ) : (
                        <p className="text-3xl font-bold text-green-600">{metrics.couponsIssued}</p>
                      )}
                      <p className="text-gray-500 text-xs">Em breve</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2m5-10a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-xl">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-greensky-50 rounded-lg">
                    <div className="w-2 h-2 bg-greensky-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Novo contato com piloto Carlos Silva</p>
                      <p className="text-sm text-gray-600">há 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-sunset-50 rounded-lg">
                    <div className="w-2 h-2 bg-sunset-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Voo confirmado - 200 milhas creditadas</p>
                      <p className="text-sm text-gray-600">há 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-skyblue-50 rounded-lg">
                    <div className="w-2 h-2 bg-skyblue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Sonho realizado através do Banco de Sonhos</p>
                      <p className="text-sm text-gray-600">há 1 dia</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-heading">Lista de Usuários</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                >
                  {loadingUsers ? 'Atualizando...' : 'Atualizar Lista'}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-greensky-500"></div>
                  </div>
                ) : users.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Nenhum usuário encontrado</AlertTitle>
                    <AlertDescription>
                      Não há usuários cadastrados no momento.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data de Cadastro
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.slice(
                          (currentUsersPage - 1) * itemsPerPage,
                          currentUsersPage * itemsPerPage
                        ).map((user) => {
                          const registerDate = user.createdAt?.toDate ? 
                            new Date(user.createdAt.toDate()).toLocaleDateString('pt-BR') : 
                            'Data não disponível';
                            
                          return (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.firstName} {user.lastName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{registerDate}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {users.length > itemsPerPage && (
                      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
                        <div className="flex-1 flex justify-between sm:hidden">
                          <button
                            onClick={() => setCurrentUsersPage(p => Math.max(p - 1, 1))}
                            disabled={currentUsersPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                          >
                            Anterior
                          </button>
                          <button
                            onClick={() => setCurrentUsersPage(p => Math.min(p + 1, Math.ceil(users.length / itemsPerPage)))}
                            disabled={currentUsersPage >= Math.ceil(users.length / itemsPerPage)}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                          >
                            Próximo
                          </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Mostrando <span className="font-medium">
                                {Math.min((currentUsersPage - 1) * itemsPerPage + 1, users.length)}
                              </span> a{' '}
                              <span className="font-medium">
                                {Math.min(currentUsersPage * itemsPerPage, users.length)}
                              </span>{' '}
                              de <span className="font-medium">{users.length}</span> usuários
                            </p>
                          </div>
                          <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              <button
                                onClick={() => setCurrentUsersPage(p => Math.max(p - 1, 1))}
                                disabled={currentUsersPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <span className="sr-only">Anterior</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              
                              {Array.from({ length: Math.min(5, Math.ceil(users.length / itemsPerPage)) }, (_, i) => {
                                let pageNumber;
                                const totalPages = Math.ceil(users.length / itemsPerPage);
                                if (totalPages <= 5) {
                                  pageNumber = i + 1;
                                } else if (currentUsersPage <= 3) {
                                  pageNumber = i + 1;
                                } else if (currentUsersPage >= totalPages - 2) {
                                  pageNumber = totalPages - 4 + i;
                                } else {
                                  pageNumber = currentUsersPage - 2 + i;
                                }
                                
                                return (
                                  <button
                                    key={pageNumber}
                                    onClick={() => setCurrentUsersPage(pageNumber)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                      currentUsersPage === pageNumber
                                        ? 'bg-greensky-50 border-greensky-500 text-greensky-600 z-10'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {pageNumber}
                                  </button>
                                );
                              })}
                              
                              <button
                                onClick={() => setCurrentUsersPage(p => Math.min(p + 1, Math.ceil(users.length / itemsPerPage)))}
                                disabled={currentUsersPage >= Math.ceil(users.length / itemsPerPage)}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <span className="sr-only">Próximo</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dreams" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Dream Bank Stats */}
              <Card className="bg-gradient-primary text-white border-0">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">✈️</div>
                  <div className="text-2xl font-bold mb-2">{metrics.confirmedFlights}</div>
                  <div className="text-white/80">Voos Confirmados</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-sunset text-white border-0">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">👥</div>
                  <div className="text-2xl font-bold mb-2">{metrics.activeUsers}</div>
                  <div className="text-white/80">Usuários Ativos</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">✨</div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">12</div>
                  <div className="text-gray-600">Sonhos Realizados</div>
                </CardContent>
              </Card>
            </div>

            {/* Dream Queue */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-xl">Fila do Banco de Sonhos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dreamBankQueue.map((person) => (
                    <div key={person.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{person.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{person.story}</p>
                        <Badge variant="secondary">Aguardando há {person.waitTime}</Badge>
                      </div>
                      <Button className="bg-gradient-primary">
                        Conceder Voo
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="carbon" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-primary text-white border-0">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-4">✈️</div>
                  <div className="text-3xl font-bold mb-2">{metrics.confirmedFlights}</div>
                  <div className="text-white/80 text-lg">Voos Confirmados</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-4">👥</div>
                  <div className="text-3xl font-bold text-greensky-700 mb-2">{metrics.activeUsers}</div>
                  <div className="text-gray-600 text-lg">Usuários Ativos</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading text-xl">Projetos de Sustentabilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-greensky-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-greensky-800 mb-2">Reflorestamento Amazônia</h3>
                    <p className="text-gray-600 text-sm mb-3">Parceria para plantio de árvores nativas</p>
                    <div className="text-2xl font-bold text-greensky-700">847 créditos</div>
                  </div>
                  <div className="bg-skyblue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-skyblue-800 mb-2">Energia Solar</h3>
                    <p className="text-gray-600 text-sm mb-3">Investimento em energia limpa</p>
                    <div className="text-2xl font-bold text-skyblue-700">393 créditos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pilots" className="space-y-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-heading text-xl">Gerenciamento de Pilotos</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchPilots}
                        disabled={loadingPilots}
                        className="flex items-center gap-1"
                      >
                        {loadingPilots ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Carregando...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Recarregar
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500">
                      Mostrando todos os pilotos cadastrados
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPilots ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-greensky-500"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            E-mail
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Telefone
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cidade/UF
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Ações</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentPilots.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-gray-500">
                                  {loadingPilots ? (
                                    <p>Carregando pilotos...</p>
                                  ) : pilots.length === 0 ? (
                                    <p>Nenhum piloto cadastrado no sistema.</p>
                                  ) : (
                                    <p>Nenhum piloto encontrado com os filtros atuais.</p>
                                  )}
                                </div>
                                {!loadingPilots && pilots.length === 0 && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={fetchPilots}
                                    className="mt-2"
                                  >
                                    Tentar novamente
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : (
                          currentPilots.map((pilot) => (
                            <tr key={pilot.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-600">👨‍✈️</span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{pilot.name}</div>
                                    <div className="text-sm text-gray-500">{pilot.aircraftType || 'Não informado'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{pilot.email}</div>
                                <div className="text-sm text-gray-500">ID: {pilot.uid?.substring(0, 8)}...</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{pilot.phone || 'Não informado'}</div>
                                <div className="text-sm text-gray-500">WhatsApp: {pilot.whatsapp || 'Não informado'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{pilot.city || 'Não informada'}</div>
                                <div className="text-sm text-gray-500">{pilot.state || 'UF não informada'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={pilot.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {pilot.approved ? 'Aprovado' : 'Pendente'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <Button 
                                  variant={pilot.approved ? 'outline' : 'default'}
                                  size="sm" 
                                  className={pilot.approved ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}
                                  onClick={() => toggleApproval(pilot.id, pilot.approved)}
                                >
                                  {pilot.approved ? 'Desaprovar' : 'Aprovar'}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-greensky-600 hover:text-greensky-900"
                                  onClick={() => openPilotDetails(pilot)}
                                >
                                  Detalhes
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    
                    {/* Paginação */}
                    {pilots.length > itemsPerPage && (
                      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                          >
                            Anterior
                          </button>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                          >
                            Próximo
                          </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Mostrando <span className="font-medium">{indexOfFirstPilot + 1}</span> a{' '}
                              <span className="font-medium">
                                {Math.min(indexOfLastPilot, pilots.length)}
                              </span>{' '}
                              de <span className="font-medium">{pilots.length}</span> pilotos
                            </p>
                          </div>
                          <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <span className="sr-only">Anterior</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Mostrar páginas próximas à página atual
                                let pageNumber;
                                if (totalPages <= 5) {
                                  pageNumber = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNumber = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNumber = totalPages - 4 + i;
                                } else {
                                  pageNumber = currentPage - 2 + i;
                                }
                                
                                return (
                                  <button
                                    key={pageNumber}
                                    onClick={() => paginate(pageNumber)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                      currentPage === pageNumber
                                        ? 'bg-greensky-50 border-greensky-500 text-greensky-600 z-10'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {pageNumber}
                                  </button>
                                );
                              })}
                              
                              <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                              >
                                <span className="sr-only">Próximo</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      {/* Modal de Detalhes do Piloto */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Detalhes do Piloto
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Informações detalhadas sobre o cadastro do piloto
            </DialogDescription>
          </DialogHeader>
          
          {selectedPilot && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-500">
                    {selectedPilot.name?.charAt(0) || 'P'}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedPilot.name}</h3>
                  <p className="text-sm text-gray-500">{selectedPilot.aircraftType || 'Tipo de aeronave não informado'}</p>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-2">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">E-mail</p>
                        <p className="text-sm text-gray-900 break-all">{selectedPilot.email || 'Não informado'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Telefone</p>
                        <p className="text-sm text-gray-900">
                          {selectedPilot.phone || 'Não informado'}
                          {selectedPilot.whatsapp && ` (WhatsApp: ${selectedPilot.whatsapp})`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Localização</p>
                        <p className="text-sm text-gray-900">
                          {selectedPilot.city || 'Cidade não informada'}{selectedPilot.state ? ` - ${selectedPilot.state}` : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Cadastrado em</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedPilot.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-greensky-600" />
                  Informações Adicionais
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo de Aeronave</p>
                    <p className="text-sm text-gray-900">{selectedPilot.aircraftType || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Horas de Voo</p>
                    <p className="text-sm text-gray-900">{selectedPilot.flightHours || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Licença</p>
                    <p className="text-sm text-gray-900">{selectedPilot.licenseNumber || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge className={selectedPilot.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {selectedPilot.approved ? 'Aprovado' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
                
                {selectedPilot.bio && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Sobre</p>
                    <p className="text-sm text-gray-900 whitespace-pre-line">{selectedPilot.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
