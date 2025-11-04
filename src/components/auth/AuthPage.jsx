import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { collection, getDocs, setDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { auth, db, appId } from '../../config/firebase';

function AuthPage({ companySettings }) {
  const { addNotification } = useNotification();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">{isLogin ? 'Entrar' : 'Registrarse'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-blue-600 hover:underline">{isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}</button>
      </div>
    </div>
  );
}

export default AuthPage;

