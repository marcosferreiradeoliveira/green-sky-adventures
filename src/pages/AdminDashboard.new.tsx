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
        orderBy('createdAt', 'desc'),
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

  // Check if user is admin
  const checkAdminAccess = async (userId: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', userId), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return false;
      return querySnapshot.docs[0].data()?.admin === true;
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
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

  // Auth and permission check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const isAdmin = await checkAdminAccess(user.uid);
      if (!isAdmin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this page',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      // Load data if user is admin
      await fetchPilots();
    });

    return () => unsubscribe();
  }, [navigate, toast]);

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
  }}
