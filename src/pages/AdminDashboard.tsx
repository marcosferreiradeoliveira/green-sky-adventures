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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [currentContactsPage, setCurrentContactsPage] = useState(1);
  const itemsPerPage = 10;

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
        
        // Clean up the listeners when component unmounts or auth changes
        return () => {
          if (pilotsUnsubscribe) pilotsUnsubscribe();
          if (usersUnsubscribe) usersUnsubscribe();
          if (contactsUnsubscribe) contactsUnsubscribe();
        };
      }
    });

    // Clean up the auth listener when component unmounts
    return () => {
      authUnsubscribe();
    };
  }, [navigate]);

  // Pagination logic
  const indexOfLastPilot = currentPage * itemsPerPage;
  const indexOfFirstPilot = indexOfLastPilot - itemsPerPage;
  const currentPilots = pilots.slice(indexOfFirstPilot, indexOfLastPilot);
  const totalPages = Math.ceil(pilots.length / itemsPerPage);

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pilotos</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pilots.length}</div>
                  <p className="text-xs text-muted-foreground">Pilotos cadastrados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pilots.filter(p => p.status === 'approved').length}</div>
                  <p className="text-xs text-muted-foreground">Pilotos aprovados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pilots.filter(p => p.status === 'pending').length}</div>
                  <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pilots.filter(p => p.status === 'rejected').length}</div>
                  <p className="text-xs text-muted-foreground">Pilotos rejeitados</p>
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
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
