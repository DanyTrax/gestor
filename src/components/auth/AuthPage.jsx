import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { collection, getDocs, setDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { auth, db, appId } from '../../config/firebase';
import { createPasswordResetToken } from '../../utils/passwordResetToken';
import { getTemplateByName } from '../../utils/initializePasswordTemplates';
import { replaceTemplateVariables } from '../../utils/templateVariables';
import { sendEmail, loadEmailConfig } from '../../services/emailService';

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
      // Buscar el usuario por email en Firestore
      const usersQuery = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'users'),
        where('email', '==', resetEmail)
      );
      const userDocs = await getDocs(usersQuery);

      if (userDocs.empty) {
        addNotification('No se encontró una cuenta con ese email.', "error");
        setResetLoading(false);
        return;
      }

      const userDoc = userDocs.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Verificar que el usuario esté activo
      if (userData.status === 'pending' || userData.status === 'disabled') {
        addNotification('Tu cuenta está pendiente de activación o ha sido deshabilitada. Contacta al administrador.', "error");
        setResetLoading(false);
        return;
      }

      // Generar token personalizado para restablecimiento de contraseña
      const token = await createPasswordResetToken(userId, resetEmail, 24); // 24 horas de validez
      const loginUrl = `${window.location.origin}${window.location.pathname}`;
      const resetLink = `${loginUrl}?token=${token}`;

      // Cargar configuración de email
      await loadEmailConfig();

      // Obtener plantilla de restablecimiento de contraseña
      const template = await getTemplateByName('Restablecer Contraseña');
      
      let emailSubject, emailBody;
      
      if (template) {
        // Usar plantilla
        const replacementData = {
          clientName: userData.fullName || resetEmail || 'Usuario',
          clientEmail: resetEmail,
          resetPasswordUrl: resetLink,
          ...userData
        };
        
        emailSubject = replaceTemplateVariables(template.subject, replacementData, { companySettings });
        emailBody = replaceTemplateVariables(template.body, replacementData, { companySettings });
      } else {
        // Fallback si no existe la plantilla
        emailSubject = `Restablecer tu contraseña - ${companySettings?.companyName || 'Sistema de Gestión'}`;
        emailBody = `Hola ${userData.fullName || resetEmail},

Has solicitado restablecer tu contraseña en ${companySettings?.companyName || 'nuestro sistema'}.

📝 INSTRUCCIONES:

1. Haz clic en el siguiente enlace para restablecer tu contraseña:
   ${resetLink}

2. En la página de restablecimiento, ingresa una contraseña segura (mínimo 6 caracteres)

3. Confirma tu contraseña ingresándola nuevamente

4. Haz clic en "Restablecer Contraseña"

5. Una vez restablecida tu contraseña, serás redirigido automáticamente al inicio de sesión

⚠️ IMPORTANTE:
- El enlace expirará en 24 horas
- Si no solicitaste este restablecimiento, ignora este email
- Si tienes problemas, contacta con soporte

🔗 ENLACE DIRECTO AL SISTEMA:
${loginUrl}

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.

Equipo de Soporte
${companySettings?.companyName || 'Sistema de Gestión'}`;
      }

      // Enviar email usando el servicio de mensajería actual
      await sendEmail({
        to: resetEmail,
        toName: userData.fullName || resetEmail,
        subject: emailSubject,
        html: emailBody.replace(/\n/g, '<br>'),
        text: emailBody,
        type: 'Restablecimiento de Contraseña',
        recipientType: 'Cliente',
        module: 'auth',
        event: 'passwordReset',
        metadata: {
          userId: userId,
          userEmail: resetEmail
        }
      });

      addNotification(`Se ha enviado un enlace de restablecimiento a ${resetEmail}. Revisa tu correo.`, "success");
      setShowResetModal(false);
      setResetEmail('');
    } catch (error) {
      console.error('Error enviando email de reset:', error);
      let errorMessage = 'Error al enviar el email de restablecimiento.';
      if (error.message.includes('no encontrado')) {
        errorMessage = 'No se encontró una cuenta con ese email.';
      } else if (error.message.includes('inválido')) {
        errorMessage = 'El email proporcionado no es válido.';
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

