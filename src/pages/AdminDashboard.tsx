import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, updateDoc, where, onSnapshot, orderBy } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { RefreshCw, Check } from "lucide-react";

interface Contact {
  id: string;
  confirmed: boolean;
  pilotId: string;
  rating: number;
  realized: boolean;
  review: string;
  timestamp: any;
  userId: string;
}

interface User {
  id: string;
  admin: boolean;
  city: string;
  contacts: string[];
  country: string;
  email: string;
  firstName: string;
  lastName: string;
  photo: string;
  state: string;
}

interface Pilot {
  id: string;
  uid: string;
  name: string;
  city: string;
  state: string;
  description: string;
  experience: string;
  location: string;
  photo: string;
  price: string;
  rating: number;
  school: string;
  type: string;
  whatsapp: string;
  status?: 'pending' | 'approved' | 'rejected';
  contacts?: string[];
  demoPhotos?: string[];
}

interface Coupon {
  id: string;
  couponNumber: string;
  userId: string;
  userEmail: string;
  recipientEmail?: string;
  type: string;
  value: number;
  used: boolean;
  recipientType: 'proprio' | 'indicacao' | 'banco_de_sonhos';
  createdAt: any;
  expiresAt: any;
  usedAt: any | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [currentContactsPage, setCurrentContactsPage] = useState(1);
  const itemsPerPage = 10;

  const [stats, setStats] = useState({
    totalPilots: 0,
    activePilots: 0,
    pendingPilots: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalContacts: 0,
    realizedContacts: 0,
    totalCoupons: 0,
    usedCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0
  });

  // Busca usuários com atualização em tempo real
  const fetchUsers = () => {
    setLoading(true);
    const q = collection(db, 'users');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        admin: doc.data().admin || false,
        city: doc.data().city || '',
        contacts: doc.data().contacts || [],
        country: doc.data().country || '',
        email: doc.data().email || '',
        firstName: doc.data().firstName || '',
        lastName: doc.data().lastName || '',
        photo: doc.data().photo || '',
        state: doc.data().state || ''
      } as User));
      
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users data',
        variant: 'destructive',
      });
      setLoading(false);
    });
    
    return unsubscribe;
  };

  // Busca contatos com atualização em tempo real
  const fetchContacts = () => {
    setLoading(true);
    const q = query(collection(db, 'contacts'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        confirmed: doc.data().confirmed || false,
        pilotId: doc.data().pilotId || '',
        rating: doc.data().rating || 0,
        realized: doc.data().realized || false,
        review: doc.data().review || '',
        timestamp: doc.data().timestamp || null,
        userId: doc.data().userId || ''
      } as Contact));
      
      setContacts(contactsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Falha ao carregar contatos',
        variant: 'destructive',
      });
      setLoading(false);
    });
    
    return unsubscribe;
  };

  // Busca pilotos com atualização em tempo real
  const fetchPilots = () => {
    setLoading(true);
    const q = collection(db, 'pilots');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pilotsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid || '',
          name: data.name || '',
          city: data.city || '',
          state: data.state || '',
          description: data.description || '',
          experience: data.experience || '',
          location: data.location || '',
          photo: data.photo || '',
          price: data.price || '',
          rating: data.rating || 0,
          school: data.school || '',
          type: data.type || '',
          whatsapp: data.whatsapp || '',
          status: data.status || 'pending',
          contacts: data.contacts || [],
          demoPhotos: data.demoPhotos || []
        } as Pilot;
      });
      
      setPilots(pilotsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching pilots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pilots data',
        variant: 'destructive',
      });
      setLoading(false);
    });
    
    // Return the unsubscribe function to clean up the listener
    return unsubscribe;
  };

  // Fetch coupons with real-time updates
  const fetchCoupons = () => {
    setLoadingCoupons(true);
    const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const couponsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
        usedAt: doc.data().usedAt?.toDate() || null
      } as Coupon));
      
      setCoupons(couponsData);
      setLoadingCoupons(false);
    }, (error) => {
      console.error('Error fetching coupons:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar cupons',
        variant: 'destructive',
      });
      setLoadingCoupons(false);
    });
    
    return unsubscribe;
  };

  // Handle pilot status change
  const handleStatusChange = async (pilotId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'pilots', pilotId), { status: newStatus });
      setPilots(pilots.map(pilot => 
        pilot.id === pilotId ? { ...pilot, status: newStatus } : pilot
      ));
      toast({
        title: 'Success',
        description: `Pilot ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Error updating pilot status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update pilot status',
        variant: 'destructive',
      });
    }
  };

  // Handle mark as used functionality
  const handleMarkAsUsed = async (couponId: string, currentStatus: boolean) => {
    if (!window.confirm(`Tem certeza que deseja marcar este cupom como ${currentStatus ? 'não utilizado' : 'utilizado'}?`)) {
      return;
    }

    try {
      const couponRef = doc(db, 'coupons', couponId);
      const updateData = {
        used: !currentStatus,
        usedAt: currentStatus ? null : new Date()
      };

      await updateDoc(couponRef, updateData);
      
      toast({
        title: 'Sucesso!',
        description: `Cupom marcado como ${currentStatus ? 'não utilizado' : 'utilizado'} com sucesso.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Erro ao atualizar status do cupom:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do cupom. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Check authentication and set up real-time listeners
  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      } else {
        // Set up the real-time listeners for pilots, users, and contacts
        const pilotsUnsubscribe = fetchPilots();
        const usersUnsubscribe = fetchUsers();
        const contactsUnsubscribe = fetchContacts();
        const couponsUnsubscribe = fetchCoupons();
        
        // Clean up the listeners when component unmounts or auth changes
        return () => {
          if (pilotsUnsubscribe) pilotsUnsubscribe();
          if (usersUnsubscribe) usersUnsubscribe();
          if (contactsUnsubscribe) contactsUnsubscribe();
          if (couponsUnsubscribe) couponsUnsubscribe();
        };
      }
    });

    // Clean up the auth listener when component unmounts
    return () => {
      authUnsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (pilots.length > 0 || users.length > 0 || contacts.length > 0 || coupons.length > 0) {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      // Helper function to safely convert Firestore timestamps
      const toDate = (timestamp: any) => {
        if (!timestamp) return null;
        return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      };
      
      const newStats = {
        // Pilots
        totalPilots: pilots.length,
        activePilots: pilots.filter(p => p.status === 'approved').length,
        pendingPilots: pilots.filter(p => p.status === 'pending').length,
        
        // Users
        totalUsers: users.length,
        newUsersThisMonth: users.filter(u => {
          const userDate = toDate(u.createdAt);
          return userDate && userDate >= firstDayOfMonth;
        }).length,
        
        // Contacts
        totalContacts: contacts.length,
        realizedContacts: contacts.filter(c => c.realized).length,
        
        // Coupons
        totalCoupons: coupons.length,
        usedCoupons: coupons.filter(c => c.used).length,
        activeCoupons: coupons.filter(c => {
          const expiresAt = toDate(c.expiresAt);
          return !c.used && (!expiresAt || expiresAt >= currentDate);
        }).length,
        expiredCoupons: coupons.filter(c => {
          const expiresAt = toDate(c.expiresAt);
          return expiresAt && expiresAt < currentDate;
        }).length
      };
      
      setStats(newStats);
    
    }
  }, [pilots, users, contacts, coupons]);

  // Pagination logic
  const indexOfLastPilot = currentPage * itemsPerPage;
  const indexOfFirstPilot = indexOfLastPilot - itemsPerPage;
  const currentPilots = pilots.slice(indexOfFirstPilot, indexOfLastPilot);
  const totalPages = Math.ceil(pilots.length / itemsPerPage);

  // Format date helper function
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    
    try {
      // If it's a Firestore timestamp, convert it to a Date
      const dateObj = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date);
      
      if (isNaN(dateObj.getTime())) return 'Data inválida';
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Erro ao formatar data:', date, error);
      return 'Data inválida';
    }
  };

  // Get coupon status
  const getCouponStatus = (coupon: Coupon) => {
    if (coupon.used) return { text: 'Utilizado', className: 'bg-gray-100 text-gray-800' };
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { text: 'Expirado', className: 'bg-red-100 text-red-800' };
    }
    return { text: 'Ativo', className: 'bg-green-100 text-green-800' };
  };

  // Get recipient type display
  const getRecipientTypeDisplay = (type: string) => {
    switch (type) {
      case 'proprio':
        return { text: 'Próprio Uso', className: 'bg-blue-100 text-blue-800' };
      case 'indicacao':
        return { text: 'Indicação', className: 'bg-purple-100 text-purple-800' };
      case 'banco_de_sonhos':
        return { text: 'Banco de Sonhos', className: 'bg-yellow-100 text-yellow-800' };
      default:
        return { text: type, className: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Bem-vindo(a) ao painel de controle da plataforma</p>
        </div>

        <Tabs defaultValue="pilots" className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="pilots">Pilotos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Gerenciar Usuários</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {users.length} usuários cadastrados
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Localização
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contatos
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            Nenhum usuário cadastrado
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-full" src={user.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.firstName + ' ' + user.lastName)} alt="" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.city}, {user.state}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.admin ? 'Sim' : 'Não'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.contacts?.length || 0} contatos
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Gerenciar Contatos</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {contacts.length} contatos registrados
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Piloto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avaliação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contacts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            Nenhum contato registrado
                          </td>
                        </tr>
                      ) : (
                        contacts.map((contact) => {
                          const user = users.find(u => u.id === contact.userId);
                          const pilot = pilots.find(p => p.uid === contact.pilotId);
                          const date = contact.timestamp ? new Date(contact.timestamp.seconds * 1000).toLocaleDateString('pt-BR') : 'N/A';
                          
                          return (
                            <tr key={contact.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img 
                                      className="h-10 w-10 rounded-full" 
                                      src={user?.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user?.firstName || '') + ' ' + (user?.lastName || ''))} 
                                      alt="" 
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user ? `${user.firstName} ${user.lastName}` : 'Usuário não encontrado'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {user?.email || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {pilot?.name || 'Piloto não encontrado'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {pilot?.city || 'N/A'}, {pilot?.state || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`h-5 w-5 ${star <= contact.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                {contact.review && (
                                  <div className="mt-1 text-sm text-gray-500 line-clamp-2">
                                    "{contact.review}"
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  contact.confirmed 
                                    ? 'bg-green-100 text-green-800' 
                                    : contact.realized 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {contact.confirmed 
                                    ? 'Confirmado' 
                                    : contact.realized 
                                      ? 'Realizado' 
                                      : 'Pendente'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {date}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pilots Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-900">Pilotos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalPilots}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    <div className="flex justify-between">
                      <span>Ativos:</span>
                      <span className="font-medium">{stats.activePilots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pendentes:</span>
                      <span className="font-medium">{stats.pendingPilots}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-900">Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    <div className="flex justify-between">
                      <span>Novos este mês:</span>
                      <span className="font-medium">{stats.newUsersThisMonth}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contacts Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-900">Contatos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalContacts}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    <div className="flex justify-between">
                      <span>Realizados:</span>
                      <span className="font-medium">{stats.realizedContacts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de conversão:</span>
                      <span className="font-medium">
                        {stats.totalContacts > 0 
                          ? `${Math.round((stats.realizedContacts / stats.totalContacts) * 100)}%` 
                          : '0%'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coupons Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-900">Cupons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalCoupons}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    <div className="flex justify-between">
                      <span>Ativos:</span>
                      <span className="font-medium">{stats.activeCoupons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilizados:</span>
                      <span className="font-medium">{stats.usedCoupons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expirados:</span>
                      <span className="font-medium">{stats.expiredCoupons}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="pilots" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Gerenciar Pilotos</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {pilots.length} pilotos cadastrados
                    </p>
                  </div>
                  <Button onClick={fetchPilots} disabled={loading}>
                    {loading ? 'Atualizando...' : 'Atualizar Lista'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentPilots.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            Nenhum piloto cadastrado
                          </td>
                        </tr>
                      ) : (
                        currentPilots.map((pilot) => (
                          <tr key={pilot.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {pilot.name || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {pilot.whatsapp || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                pilot.status === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : pilot.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {pilot.status === 'approved' ? 'Aprovado' : 
                                 pilot.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {pilot.status !== 'approved' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mr-2"
                                  onClick={() => handleStatusChange(pilot.id, 'approved')}
                                >
                                  Aprovar
                                </Button>
                              )}
                              {pilot.status !== 'rejected' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(pilot.id, 'rejected')}
                                >
                                  Rejeitar
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{indexOfFirstPilot + 1}</span> a{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastPilot, pilots.length)}
                      </span>{' '}
                      de <span className="font-medium">{pilots.length}</span> pilotos
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Gerenciar Cupons</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {coupons.length} cupons cadastrados
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingCoupons ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Código
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuário
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Destinatário
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Criado em
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expira em
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {coupons.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                              Nenhum cupom encontrado
                            </td>
                          </tr>
                        ) : (
                          coupons.map((coupon) => {
                            const status = getCouponStatus(coupon);
                            const recipientInfo = getRecipientTypeDisplay(coupon.recipientType);
                            
                            return (
                              <tr key={coupon.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {coupon.couponNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex flex-col">
                                    <span>{coupon.userEmail || 'N/A'}</span>
                                    {coupon.recipientEmail && (
                                      <span className="text-xs text-gray-400">Para: {coupon.recipientEmail}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${recipientInfo.className}`}>
                                    {recipientInfo.text}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                                    {status.text}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(coupon.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(coupon.expiresAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleMarkAsUsed(coupon.id, coupon.used)}
                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                                      coupon.used 
                                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                                        : 'bg-green-600 hover:bg-green-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                      coupon.used ? 'focus:ring-yellow-500' : 'focus:ring-green-500'
                                    }`}
                                  >
                                    {coupon.used ? (
                                      <>
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        Reativar
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-3 h-3 mr-1" />
                                        Marcar como Usado
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
