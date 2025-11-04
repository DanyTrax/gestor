import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, updatePassword } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { auth, db, appId } from './config/firebase';
import { diagnosticFirebaseStructure, findOldestUser } from './utils/firebaseDiagnostic';
import { checkUsersInAuth } from './utils/authCheck';
import { useNotification, NotificationProvider } from './contexts/NotificationContext';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { LogoutIcon } from './components/icons';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ClientDashboard from './components/dashboard/ClientDashboard';
import AuthPage from './components/auth/AuthPage';
import TestModeLogin from './components/auth/TestModeLogin';
import PasswordChangeModal from './components/auth/PasswordChangeModal';
import CompleteProfileModal from './components/auth/CompleteProfileModal';
import InitialSetup from './components/setup/InitialSetup';
import FirebaseDebugger from './components/debug/FirebaseDebugger';

function AppContent() {
  const { addNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    // Cargar el estado del modo demo desde localStorage
    const savedDemoMode = localStorage.getItem('isDemoMode');
    return savedDemoMode === 'true';
  });
  const [companySettings, setCompanySettings] = useState({ companyName: 'Gestor de Cobros' });
  const [showInitialSetup, setShowInitialSetup] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);

  // Sincronizar el estado del modo demo con localStorage
  useEffect(() => {
    localStorage.setItem('isDemoMode', isDemoMode.toString());
  }, [isDemoMode]);

  // Función para verificar si el sistema ya está configurado
  const checkSystemConfigured = async () => {
    try {
      console.log('🔍 Verificando si el sistema está configurado...');
      
      // Primero intentar verificar usuarios en Firestore
      try {
        const diagnostic = await diagnosticFirebaseStructure();
        if (diagnostic.hasUsers) {
          console.log('✅ Usuarios encontrados en Firestore');
          return true;
        }
      } catch (firestoreError) {
        console.warn('⚠️ Error accediendo a Firestore:', firestoreError.message);
      }
      
      // Si Firestore falla, verificar Authentication
      const hasAuthUsers = await checkUsersInAuth();
      if (hasAuthUsers) {
        console.log('✅ Usuarios encontrados en Authentication');
        return true;
      }
      
      // Si ambos fallan, asumir que el sistema está configurado si hay errores de permisos
      console.log('⚠️ Asumiendo que el sistema está configurado (hay errores de permisos)');
      return true;
      
    } catch (error) {
      console.error('❌ Error verificando configuración:', error);
      // En caso de error, asumir que está configurado para evitar setup innecesario
      return true;
    }
  };

  // Verificar si el sistema está configurado
  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        console.log('🔧 Iniciando verificación de configuración...');
        
        // Verificar si hay configuración de empresa primero
        console.log('🏢 Verificando configuración de empresa...');
        const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'company_info');
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          console.log('✅ Configuración de empresa encontrada');
          const settings = settingsDoc.data();
          console.log('📋 Configuración:', settings);
          setCompanySettings(settings);
          setIsDemoMode(settings.isDemoMode || false);
          setIsConfigured(true);
          setShowInitialSetup(false);
          console.log('✅ Sistema configurado con configuración existente');
          return;
        }
        
        // Si no hay configuración, verificar si el sistema está configurado
        console.log('👥 No hay configuración, verificando si hay usuarios...');
        const isConfigured = await checkSystemConfigured();
        
        if (isConfigured) {
          console.log('✅ Sistema ya configurado, saltando setup inicial');
          setCompanySettings({ companyName: 'Gestor de Cobros', isDemoMode: false });
          setIsConfigured(true);
          setShowInitialSetup(false);
        } else {
          console.log('❌ Sistema no configurado, mostrando setup inicial');
          setShowInitialSetup(true);
        }
        
      } catch (error) {
        console.error("❌ Error checking configuration:", error);
        
        // Si es error de permisos, mostrar mensaje más específico
        if (error.code === 'permission-denied') {
          console.error('🔐 Error de permisos de Firestore. Verifica que las reglas estén configuradas correctamente.');
          console.error('📋 Consulta firebase-rules.txt para las reglas necesarias.');
        }
        
        // En caso de cualquier error, asumir que está configurado
        console.log('⚠️ Error en verificación, asumiendo que el sistema está configurado');
        setCompanySettings({ companyName: 'Gestor de Cobros', isDemoMode: false });
        setIsConfigured(true);
        setShowInitialSetup(false);
      }
    };

    checkConfiguration();
  }, []);

  useEffect(() => {
    if (!isConfigured) return;

    if (isDemoMode) {
      setUser({ email: 'superadmin@demo.com', uid: 'demouser' });
      setUserProfile({ role: 'superadmin' });
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, async (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            if (userData.status === 'active' || userData.role === 'superadmin') {
              setUserProfile(userData);
              setUser(currentUser);
            } else {
              console.warn("Usuario inactivo o sin permisos:", userData);
              addNotification("Tu cuenta no está activa. Contacta al administrador.", "error");
              signOut(auth);
            }
          } else {
            console.warn("No se encontró el perfil de usuario en la base de datos");
            console.log("Usuario no tiene perfil en Firestore, cerrando sesión...");
            
            // Si no hay perfil en Firestore, cerrar sesión
            addNotification("Usuario no encontrado en el sistema. Contacta al administrador.", "error");
            signOut(auth);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          if (error.code === 'permission-denied') {
            console.error('🔐 Error de permisos de Firestore al obtener datos del usuario.');
            console.error('📋 Verifica que las reglas de Firestore permitan lectura/escritura para usuarios autenticados.');
            addNotification("Error de permisos al acceder a datos del usuario. Verifica las reglas de Firestore.", "error");
          }
          // Solo mostrar error si el usuario sigue autenticado
          if (currentUser) {
            addNotification("Error al cargar el perfil de usuario. Intenta nuevamente.", "error");
          }
          setLoading(false);
        });
        return () => unsubscribeUser();
      } else {
        // Usuario desautenticado, limpiar estado sin mostrar errores
        setUser(null); 
        setUserProfile(null); 
        setLoading(false);
      }
    });
    
    return () => {
      unsubscribeAuth();
    };
  }, [isConfigured, isDemoMode]);

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
      // En modo demo, solo cerrar la sesión simulada, mantener el modo demo activo
      setUser(null);
      setUserProfile(null);
    } else {
      signOut(auth);
    }
  };

  // Cerrar sesión por inactividad
  // Obtener el timeout desde companySettings (default: 10 minutos)
  const inactivityTimeoutMinutes = companySettings?.inactivityTimeoutMinutes || 10;
  const isUserLoggedIn = !!(user && !isDemoMode);
  
  useInactivityTimeout(
    () => {
      // Mostrar notificación antes de cerrar sesión
      addNotification(`Sesión cerrada por inactividad (${inactivityTimeoutMinutes} minutos sin actividad)`, 'warning');
      setTimeout(() => {
        handleLogout();
      }, 1000); // Esperar 1 segundo para que se vea la notificación
    },
    inactivityTimeoutMinutes,
    isUserLoggedIn // Solo activo cuando hay usuario autenticado (no en demo)
  );

  const handleTestModeLogin = (user, role) => {
    setUser(user);
    setUserProfile({ role, status: 'active' });
  };


  const handleInitialSetupComplete = () => {
    setShowInitialSetup(false);
    setIsConfigured(true);
    // Recargar la página para aplicar la configuración
    window.location.reload();
  };

  if (showInitialSetup) {
    return <InitialSetup onComplete={handleInitialSetupComplete} />;
  }

  if (showDebugger) {
    return <FirebaseDebugger onClose={() => setShowDebugger(false)} />;
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  
  const effectiveUser = isDemoMode ? { email: 'superadmin@demo.com', uid: 'demouser' } : user;
  const effectiveRole = isDemoMode ? 'superadmin' : userProfile?.role;
  
  if (userProfile?.requiresPasswordChange && !isDemoMode) {
    return <PasswordChangeModal isOpen={true} onSave={handlePasswordSave} />
  }

  // Verificar si hay parámetros de activación en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const activationUid = urlParams.get('uid');
  const isActivationLink = activationUid && activationUid === user?.uid;

  // Mostrar modal de completar perfil si:
  // 1. Es cliente y no tiene perfil completo Y no es demo mode
  // 2. O si viene de un link de activación (incluso si ya tiene perfil completo)
  if (userProfile?.role === 'client' && !isDemoMode && 
      ((!userProfile?.isProfileComplete && userProfile?.requiresPasswordChange === false) || isActivationLink)) {
    return <CompleteProfileModal isOpen={true} onComplete={() => {
      // Actualizar el perfil local sin recargar la página
      setUserProfile(prev => ({ ...prev, isProfileComplete: true }));
      // Limpiar parámetros de URL después de completar
      if (isActivationLink) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }} user={user} userProfile={userProfile} />
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      {effectiveUser ? (
        <>
          <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              {companySettings.logoUrl ? (
                <img src={companySettings.logoUrl} alt={companySettings.companyName} className="max-h-10" />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{companySettings.companyName}</h1>
              )}
              <div className="flex items-center gap-4">
                 <span className="text-sm text-gray-600 hidden sm:block">{effectiveUser.email}</span>
                 <button onClick={handleLogout} className="text-gray-500 hover:text-red-600"><LogoutIcon /></button>
              </div>
            </div>
          </header>
          {isDemoMode && <div className="bg-yellow-400 text-center p-2 text-sm font-semibold">MODO DE PRUEBA ACTIVO</div>}
          {effectiveRole === 'superadmin' || effectiveRole === 'admin' ? 
            <AdminDashboard user={effectiveUser} isDemo={isDemoMode} setIsDemoMode={setIsDemoMode} userRole={effectiveRole} companySettings={companySettings} onLogout={handleLogout} /> : 
            <ClientDashboard user={effectiveUser} isDemo={isDemoMode} userProfile={userProfile} />
          }
        </>
      ) : (
        <div className="flex flex-col min-h-screen">
          {isDemoMode && (
            <div className="bg-yellow-400 text-center p-3 text-sm font-semibold">
              🟡 MODO DEMO ACTIVO - Usa los botones de prueba para acceder
            </div>
          )}
          <div className="flex-grow">
            {isDemoMode ? (
              <TestModeLogin companySettings={companySettings} onLogin={handleTestModeLogin} />
            ) : (
              <AuthPage companySettings={companySettings} />
            )}
          </div>
          {/* Mostrar botones de demo y debug solo si está habilitado desde la configuración de empresa */}
          {(companySettings.isDemoMode || companySettings.allowDemoMode) && (
            <div className="fixed bottom-4 right-4 flex flex-col gap-2">
              <button 
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors ${
                  isDemoMode 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
                title={isDemoMode ? "Cambiar a modo Live" : "Cambiar a modo Demo"}
              >
                {isDemoMode ? '🟢 Live' : '🟡 Demo'}
              </button>
              <button 
                onClick={() => setShowDebugger(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 text-sm"
                title="Diagnóstico de Firebase"
              >
                🔧 Debug
              </button>
            </div>
          )}
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
