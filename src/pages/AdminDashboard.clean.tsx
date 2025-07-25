import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, limit, doc, updateDoc } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

interface Pilot {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch pilots data
  const fetchPilots = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'pilots'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      const pilotsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Pilot));
      
      setPilots(pilotsData);
    } catch (error) {
      console.error('Error fetching pilots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pilots data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      } else {
        fetchPilots();
      }
      return;
    });

    return () => unsubscribe();
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
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="pilots">Pilotos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

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
                              {pilot.email || 'N/A'}
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
