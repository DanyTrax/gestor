import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, setDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { auth, db, appId } from '../../config/firebase';

function AuthPage({ companySettings }) {
  const { addNotification } = useNotification();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDocs(query(collection(db, 'artifacts', appId, 'public', 'data', 'users'), where('__name__', '==', userCredential.user.uid)));
        if (userDoc.docs.length === 0) throw new Error("No se encontró el perfil de usuario.");
        const userData = userDoc.docs[0].data();
        if (userData.status === 'pending' || userData.status === 'disabled') {
          await signOut(auth);
          throw new Error("Tu cuenta está pendiente de activación o ha sido deshabilitada.");
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        const usersCollection = collection(db, 'artifacts', appId, 'public', 'data', 'users');
        const usersSnapshot = await getDocs(usersCollection);
        let role = usersSnapshot.empty ? 'superadmin' : 'client';
        const status = role === 'superadmin' ? 'active' : 'pending';
        const requiresPasswordChange = role === 'superadmin' ? false : true;
        
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userCredential.user.uid), { 
          email, role, status, isProfileComplete: false, 
          createdAt: Timestamp.now(), fullName: '', identification: '', 
          requiresPasswordChange 
        });
        
        if (role === 'superadmin') {
          addNotification("¡Registro exitoso! Eres el primer usuario y tienes permisos de superadministrador.", "success");
        } else {
          addNotification("¡Registro exitoso! Revisa tu correo para verificar la cuenta. Un administrador debe activar tu usuario.", "success");
          await signOut(auth);
        }
      }
    } catch (err) { addNotification(err.message, "error"); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      addNotification("Por favor, ingresa tu email", "error");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail, {
        url: `${window.location.origin}${window.location.pathname}`,
        handleCodeInApp: true
      });
      addNotification(`Se ha enviado un enlace de restablecimiento a ${resetEmail}. Revisa tu correo.`, "success");
      setShowResetModal(false);
      setResetEmail('');
    } catch (error) {
      console.error('Error enviando email de reset:', error);
      let errorMessage = 'Error al enviar el email de restablecimiento.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No se encontró una cuenta con ese email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El email proporcionado no es válido.';
      } else if (error.code === 'auth/unauthorized-continue-uri') {
        errorMessage = 'El dominio no está autorizado en Firebase. Contacta al administrador para configurar el dominio en Firebase Console.';
        console.error('⚠️ IMPORTANTE: El dominio debe estar autorizado en Firebase Console:');
        console.error('1. Ve a Firebase Console → Authentication → Settings → Authorized domains');
        console.error(`2. Agrega el dominio: ${window.location.hostname}`);
      }
      addNotification(errorMessage, "error");
    } finally {
      setResetLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="flex justify-center mb-6">
          {companySettings.logoUrl ? (
            <img src={companySettings.logoUrl} alt="Logo de la Empresa" className="max-h-16" />
          ) : (
            <h1 className="text-3xl font-bold">{companySettings.companyName || 'Gestor de Pagos'}</h1>
          )}
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 mb-4 border rounded" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="w-full p-2 mb-4 border rounded" required />
          {isLogin && (
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="w-full text-sm text-blue-600 hover:underline mb-2 text-right"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">{isLogin ? 'Entrar' : 'Registrarse'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-blue-600 hover:underline">{isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}</button>
        
        {/* Modal para solicitar reset de contraseña */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Restablecer Contraseña</h3>
              <p className="text-gray-600 mb-4">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <form onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-2 mb-4 border rounded"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setResetEmail('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 p-2 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {resetLoading ? 'Enviando...' : 'Enviar Enlace'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;

