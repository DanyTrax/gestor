import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, updatePassword } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db, appId } from './config/firebase';
import { useNotification, NotificationProvider } from './contexts/NotificationContext';
import { LogoutIcon } from './components/icons';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ClientDashboard from './components/dashboard/ClientDashboard';
import AuthPage from './components/auth/AuthPage';
import PasswordChangeModal from './components/auth/PasswordChangeModal';

function AppContent() {
  const { addNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [companySettings, setCompanySettings] = useState({ companyName: 'Gestor de Cobros' });

  useEffect(() => {
    // Configuración básica sin Firebase
    setCompanySettings({ companyName: 'Gestor de Cobros' });

    if (isDemoMode) {
      setUser({ email: 'superadmin@demo.com', uid: 'demouser' });
      setUserProfile({ role: 'superadmin' });
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            // Permitir acceso si está activo o si es superadmin
            if (userData.status === 'active' || userData.role === 'superadmin') {
              setUserProfile(userData);
              setUser(currentUser);
            } else {
              signOut(auth);
            }
          } else {
            signOut(auth);
          }
          setLoading(false);
        }, (error) => {
          console.warn("Error fetching user data:", error);
          setLoading(false);
        });
        return () => unsubscribeUser();
      } else {
        setUser(null); 
        setUserProfile(null); 
        setLoading(false);
      }
    });
    
    return () => {
      unsubscribeAuth();
    };
  }, [isDemoMode]);

  const handlePasswordSave = async (newPassword) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      await updatePassword(currentUser, newPassword);
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.uid);
      await updateDoc(userDocRef, { requiresPasswordChange: false });
    } catch (error) {
      console.error("Error updating password:", error);
      addNotification("Hubo un error al cambiar la contraseña.", "error");
      signOut(auth);
    }
  };

  const handleLogout = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
    } else {
      signOut(auth);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  
  const effectiveUser = isDemoMode ? { email: 'superadmin@demo.com', uid: 'demouser' } : user;
  const effectiveRole = isDemoMode ? 'superadmin' : userProfile?.role;
  
  if (userProfile?.requiresPasswordChange && !isDemoMode) {
    return <PasswordChangeModal isOpen={true} onSave={handlePasswordSave} />
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      {effectiveUser ? (
        <>
          <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{companySettings.companyName}</h1>
              <div className="flex items-center gap-4">
                 <span className="text-sm text-gray-600 hidden sm:block">{effectiveUser.email}</span>
                 <button onClick={handleLogout} className="text-gray-500 hover:text-red-600"><LogoutIcon /></button>
              </div>
            </div>
          </header>
          {isDemoMode && <div className="bg-yellow-400 text-center p-2 text-sm font-semibold">MODO DE PRUEBA ACTIVO</div>}
          {effectiveRole === 'superadmin' || effectiveRole === 'admin' ? 
            <AdminDashboard user={effectiveUser} isDemo={isDemoMode} setIsDemoMode={setIsDemoMode} userRole={effectiveRole} companySettings={companySettings} /> : 
            <ClientDashboard user={effectiveUser} isDemo={isDemoMode} userProfile={userProfile} />
          }
        </>
      ) : (
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
               <AuthPage companySettings={companySettings} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}






