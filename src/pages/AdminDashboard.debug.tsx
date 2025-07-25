import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from "@/lib/firebase";

const AdminDashboardDebug = () => {
  const [status, setStatus] = useState('Verificando permissões...');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [pilots, setPilots] = useState<any[]>([]);

  const checkPermissions = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      // 1. Verificar dados do usuário atual
      setStatus('Buscando dados do usuário...');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        setError('Documento do usuário não encontrado');
        return;
      }

      const userData = userDoc.data();
      setUserData(userData);

      if (!userData.admin) {
        setError('Acesso negado: você não é um administrador');
        return;
      }

      // 2. Tentar ler a coleção de pilotos
      setStatus('Buscando pilotos...');
      const pilotsQuery = collection(db, 'pilots');
      const snapshot = await getDocs(pilotsQuery);
      
      if (snapshot.empty) {
        setStatus('Nenhum piloto encontrado');
      } else {
        setPilots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setStatus(`Encontrados ${snapshot.size} pilotos`);
      }

    } catch (error) {
      console.error('Erro:', error);
      setError(`Erro: ${error.message}`);
      if (error.code === 'permission-denied') {
        setError('Permissão negada pelo Firestore. Verifique as regras de segurança.');
      }
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Debug Admin Dashboard</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Status:</h2>
        <p>{status}</p>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {userData && (
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <h2 className="font-semibold mb-2">Dados do Usuário:</h2>
          <pre className="text-xs">{JSON.stringify(userData, null, 2)}</pre>
        </div>
      )}

      {pilots.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Pilotos ({pilots.length}):</h2>
          <div className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-60">
            <pre>{JSON.stringify(pilots, null, 2)}</pre>
          </div>
        </div>
      )}

      <button 
        onClick={checkPermissions}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Verificar Novamente
      </button>
    </div>
  );
};

export default AdminDashboardDebug;
