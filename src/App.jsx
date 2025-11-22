import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, updatePassword } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { auth, db, appId } from './config/firebase';
import { diagnosticFirebaseStructure, findOldestUser } from './utils/firebaseDiagnostic';
import { checkUsersInAuth } from './utils/authCheck';
import { useNotification, NotificationProvider } from './contexts/NotificationContext';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { setupConsoleErrorFilter } from './utils/filterConsoleErrors';
import { initializePasswordTemplates } from './utils/initializePasswordTemplates';
import { LogoutIcon } from './components/icons';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ClientDashboard from './components/dashboard/ClientDashboard';
import AuthPage from './components/auth/AuthPage';
import PasswordChangeModal from './components/auth/PasswordChangeModal';
import PasswordResetPage from './components/auth/PasswordResetPage';
import PasswordResetWithTokenPage from './components/auth/PasswordResetWithTokenPage';
import CompleteProfileModal from './components/auth/CompleteProfileModal';
import InitialSetup from './components/setup/InitialSetup';

// Filtrar errores benignos de extensiones del navegador
// Solo en el navegador, no en Node.js
if (typeof window !== 'undefined') {
  try {
    setupConsoleErrorFilter();
  } catch (error) {
    // Si hay un error al configurar el filtro, no romper la aplicación
    console.warn('No se pudo configurar el filtro de errores:', error);
  }
}

function AppContent() {
  const { addNotification } = useNotification();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState({ companyName: 'Gestor de Cobros' });
  const [showInitialSetup, setShowInitialSetup] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

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
          setCompanySettings({ companyName: 'Gestor de Cobros' });
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
        setCompanySettings({ companyName: 'Gestor de Cobros' });
        setIsConfigured(true);
        setShowInitialSetup(false);
      }
    };

    checkConfiguration();
  }, []);

  useEffect(() => {
    if (!isConfigured) return;

    // Inicializar plantillas de contraseña automáticamente
    initializePasswordTemplates().catch(error => {
      console.error('Error inicializando plantillas de contraseña:', error);
    });

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
            // Si hay error de permisos, podría ser porque:
            // 1. El usuario recién creado no tiene permisos aún
            // 2. Las reglas de Firestore no permiten lectura
            // En este caso, simplemente cerrar sesión sin mostrar error molesto
            console.warn('🔐 Error de permisos al obtener datos del usuario. Cerrando sesión...');
            signOut(auth).catch(err => {
              console.error('Error al cerrar sesión:', err);
            });
            // No mostrar notificación de error aquí, ya que podría ser un usuario recién creado
            setLoading(false);
            return;
          }
          // Solo mostrar error si el usuario sigue autenticado y no es un error de permisos
          if (currentUser) {
            console.error('📋 Verifica que las reglas de Firestore permitan lectura/escritura para usuarios autenticados.');
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
  }, [isConfigured]);

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
    signOut(auth);
  };

  // Cerrar sesión por inactividad
  // Obtener el timeout desde companySettings (default: 10 minutos)
  const inactivityTimeoutMinutes = companySettings?.inactivityTimeoutMinutes || 10;
  const isUserLoggedIn = !!user;
  
  useInactivityTimeout(
    () => {
      // Mostrar notificación antes de cerrar sesión
      addNotification(`Sesión cerrada por inactividad (${inactivityTimeoutMinutes} minutos sin actividad)`, 'warning');
      setTimeout(() => {
        handleLogout();
      }, 1000); // Esperar 1 segundo para que se vea la notificación
    },
    inactivityTimeoutMinutes,
    isUserLoggedIn
  );


  const handleInitialSetupComplete = () => {
    setShowInitialSetup(false);
    setIsConfigured(true);
    // Recargar la página para aplicar la configuración
    window.location.reload();
  };

  if (showInitialSetup) {
    return <InitialSetup onComplete={handleInitialSetupComplete} />;
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  
  // Verificar si hay un token personalizado de reset de contraseña en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('token');
  const resetCode = urlParams.get('oobCode');
  const resetMode = urlParams.get('mode');
  const isPasswordResetWithToken = resetToken && !resetCode;
  const isPasswordResetFirebase = resetCode && resetMode === 'resetPassword';
  
  // Si hay un token personalizado, mostrar la página de reset con token
  if (isPasswordResetWithToken) {
    return (
      <PasswordResetWithTokenPage 
        companySettings={companySettings}
        onResetComplete={() => {
          // Limpiar URL y recargar para volver al login
          window.history.replaceState({}, document.title, window.location.pathname);
          window.location.reload();
        }}
      />
    );
  }
  
  // Si hay un código de Firebase, mostrar la página de reset de Firebase (fallback)
  if (isPasswordResetFirebase) {
    return (
      <PasswordResetPage 
        companySettings={companySettings}
        onResetComplete={() => {
          // Limpiar URL y recargar para volver al login
          window.history.replaceState({}, document.title, window.location.pathname);
          window.location.reload();
        }}
      />
    );
  }
  
  // Solo mostrar modal de cambio de contraseña si:
  // 1. El usuario tiene requiresPasswordChange: true
  // 2. Y NO es un admin (los admins no deberían ver este modal al crear usuarios)
  if (userProfile?.requiresPasswordChange && 
      userProfile?.role !== 'superadmin' && 
      userProfile?.role !== 'admin') {
    return <PasswordChangeModal isOpen={true} onSave={handlePasswordSave} />
  }

  // Verificar si hay parámetros de activación en la URL
  const activationUid = urlParams.get('uid');
  const isActivationLink = activationUid && activationUid === user?.uid;

  // Mostrar modal de completar perfil si:
  // 1. Es cliente y no tiene perfil completo
  // 2. O si viene de un link de activación (incluso si ya tiene perfil completo)
  if (userProfile?.role === 'client' && 
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
      {user ? (
        <>
          <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              {companySettings.logoUrl ? (
                <img src={companySettings.logoUrl} alt={companySettings.companyName} className="max-h-10" />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{companySettings.companyName}</h1>
              )}
              <div className="flex items-center gap-4">
                 <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                 <button onClick={handleLogout} className="text-gray-500 hover:text-red-600"><LogoutIcon /></button>
              </div>
            </div>
          </header>
          {userProfile?.role === 'superadmin' || userProfile?.role === 'admin' ? 
            <AdminDashboard user={user} userRole={userProfile?.role} companySettings={companySettings} onLogout={handleLogout} /> : 
            <ClientDashboard user={user} userProfile={userProfile} />
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
