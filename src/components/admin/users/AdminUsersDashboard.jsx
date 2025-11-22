import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy, addDoc, setDoc, Timestamp, getDocs, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { sendEmail, loadEmailConfig } from '../../../services/emailService';
import { auth, db, appId } from '../../../config/firebase';
import { PlusIcon, SearchIcon } from '../../icons';
import ActionDropdown from '../../common/ActionDropdown';
import UserModal from './UserModal';
import CreateUserModal from './CreateUserModal';
import UserActivationModal from './UserActivationModal';
import UserNotificationModal from './UserNotificationModal';

function AdminUsersDashboard({ userRole, companySettings }) {
  const { addNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isActivationModalOpen, setActivationModalOpen] = useState(false);
  const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activatingUser, setActivatingUser] = useState(null);
  const [notifyingUser, setNotifyingUser] = useState(null);

  useEffect(() => {
    const usersCollection = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const unsubscribe = onSnapshot(query(usersCollection, orderBy('email')), snapshot => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);
  
  const handleUpdateUser = async (userData) => {
    const { id, ...dataToSave } = userData;
    const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', id);
    await updateDoc(userDocRef, dataToSave);
  };

  const handleCreateUser = async (userData) => {
    // Guardar el UID del admin actual antes de crear el usuario
    const adminUid = auth.currentUser?.uid;
    
    try {
      // Verificar si el email ya existe en la colección de usuarios
      const usersQuery = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'users'),
        where('email', '==', userData.email)
      );
      const existingUsers = await getDocs(usersQuery);
      
      if (!existingUsers.empty) {
        addNotification("El email ya está registrado en el sistema", "error");
        return;
      }
      
      // Crear usuario en Firebase Authentication
      let user;
      if (userData.notify && !userData.password) {
        // Si se va a notificar, crear usuario con contraseña temporal aleatoria
        // Luego se enviará el email de reset de contraseña
        const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, tempPassword);
        user = userCredential.user;
      } else {
        // Si no se notifica, usar la contraseña proporcionada
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        user = userCredential.user;
      }
      
      // Crear documento en Firestore con todos los datos
      const userDocData = {
        email: userData.email,
        fullName: userData.fullName || '',
        identification: userData.identification || '',
        role: userData.role || 'client',
        status: userData.status || 'active',
        isProfileComplete: true,
        createdAt: Timestamp.now(),
        requiresPasswordChange: userData.notify ? false : true // Si se notifica, no requiere cambio (usará reset de contraseña)
      };
      
      // Crear documento con el UID específico del usuario
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
      await setDoc(userDocRef, userDocData);
      
      // IMPORTANTE: Cerrar sesión del nuevo usuario INMEDIATAMENTE después de crear el documento
      // Firebase Auth automáticamente inicia sesión cuando se crea un usuario
      // Debemos cerrar sesión ANTES de que App.jsx intente cargar el perfil del nuevo usuario
      // y ANTES de enviar los emails para evitar errores de permisos
      const currentUserAfterCreation = auth.currentUser;
      let shouldReauth = false;
      if (currentUserAfterCreation && currentUserAfterCreation.uid === user.uid) {
        // El usuario actual es el nuevo usuario creado, cerrar sesión inmediatamente
        // Esto previene que App.jsx intente cargar el perfil del nuevo usuario
        signOut(auth).catch(err => {
          console.error('Error al cerrar sesión del nuevo usuario:', err);
        });
        console.log('✅ Sesión del nuevo usuario cerrada inmediatamente');
        shouldReauth = true;
      }
      
      // Enviar notificación de email si está habilitado (después de cerrar sesión)
      if (userData.notify) {
        try {
          console.log('📧 [USUARIOS] Enviando email de bienvenida y reset de contraseña al nuevo usuario');
          
          // Enviar email de reset de contraseña de Firebase (esto genera un enlace seguro)
          // Esto funciona incluso si el usuario no está autenticado
          await sendPasswordResetEmail(auth, userData.email, {
            url: `${window.location.origin}`,
            handleCodeInApp: false
          });
          
          // Cargar configuración de email
          await loadEmailConfig();
          
          // Preparar mensaje de bienvenida con instrucciones
          const emailSubject = `Bienvenido a ${companySettings?.companyName || 'nuestro sistema'}`;
          const emailBody = `Hola ${userData.fullName || userData.email},

¡Bienvenido a ${companySettings?.companyName || 'nuestro sistema'}!

Tu cuenta ha sido creada exitosamente en nuestro sistema de gestión.

📧 Tu email de acceso: ${userData.email}

🔐 CREAR TU CONTRASEÑA:

Para completar tu registro y acceder al sistema, necesitas crear tu contraseña personal.

📝 PASOS PARA CREAR TU CONTRASEÑA:

1. Revisa tu correo electrónico, recibirás un email de Firebase con el asunto "Restablece tu contraseña"
2. Haz clic en el enlace "Restablecer contraseña" de ese email
3. Ingresa una contraseña segura (mínimo 6 caracteres)
4. Confirma tu contraseña
5. Una vez creada tu contraseña, serás redirigido al inicio de sesión
6. Inicia sesión con tu email (${userData.email}) y la contraseña que acabas de crear

⚠️ IMPORTANTE:
- El enlace para crear tu contraseña expirará en 1 hora
- Si el enlace expira, contacta con soporte para generar uno nuevo
- Tu cuenta está activa y lista para usar una vez que crees tu contraseña

Una vez que inicies sesión, podrás:
• Ver tus servicios contratados
• Crear tickets de soporte
• Gestionar tu perfil y pagos

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.

¡Bienvenido!

Equipo de Soporte
${companySettings?.companyName || 'Sistema de Gestión'}`;

          // Enviar email de bienvenida usando el servicio
          await sendEmail({
            to: userData.email,
            toName: userData.fullName || userData.email,
            subject: emailSubject,
            html: emailBody.replace(/\n/g, '<br>'),
            text: emailBody,
            type: 'Bienvenida',
            recipientType: 'Cliente',
            module: 'users',
            event: 'newUser',
            metadata: {
              userId: user.uid,
              userEmail: userData.email,
              userRole: userData.role
            }
          });
          
          if (shouldReauth) {
            addNotification(`Usuario ${userData.email} creado exitosamente. Emails enviados. Por favor, vuelve a iniciar sesión como administrador.`, "success");
          } else {
            addNotification(`Usuario ${userData.email} creado exitosamente. Emails de bienvenida y creación de contraseña enviados.`, "success");
          }
        } catch (emailError) {
          console.error('Error enviando emails:', emailError);
          if (shouldReauth) {
            addNotification(`Usuario ${userData.email} creado exitosamente, pero no se pudieron enviar los emails: ${emailError.message}. Por favor, vuelve a iniciar sesión como administrador.`, "warning");
          } else {
            addNotification(`Usuario ${userData.email} creado exitosamente, pero no se pudieron enviar los emails: ${emailError.message}`, "warning");
          }
        }
      } else {
        if (shouldReauth) {
          addNotification(`Usuario ${userData.email} creado exitosamente con contraseña temporal. Por favor, vuelve a iniciar sesión como administrador.`, "success");
        } else {
          addNotification(`Usuario ${userData.email} creado exitosamente con contraseña temporal.`, "success");
        }
      }
      
    } catch (error) {
      console.error("Error creating user:", error);
      
      let errorMessage = "Error al crear usuario";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "El email ya está registrado en el sistema";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El email no es válido";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña es muy débil";
      } else {
        errorMessage = `Error al crear usuario: ${error.message}`;
      }
      
      addNotification(errorMessage, "error");
      throw error; // Re-throw para que el modal pueda manejarlo
    }
  };

  const handleActivateUser = async () => {
    if (!activatingUser) return;
    
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', activatingUser.id);
      await updateDoc(userDocRef, { status: 'active' });
      addNotification(`Usuario ${activatingUser.email} activado exitosamente.`, "success");
    } catch (error) {
      addNotification("Error al activar usuario", "error");
      console.error("Error activating user:", error);
    }
  };

  const handleUserAction = async (user, action) => {
    if (userRole !== 'superadmin') {
      addNotification("Acción no permitida.", "error");
      return;
    }
    
    const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.id);
    
    try {
      switch (action) {
        case 'activate':
          setActivatingUser(user);
          setActivationModalOpen(true);
          break;
        case 'notify':
          setNotifyingUser(user);
          setNotificationModalOpen(true);
          break;
        case 'disable':
          if (window.confirm(`¿Deshabilitar a ${user.email}?`)) {
            await updateDoc(userDocRef, { status: 'disabled' });
            addNotification(`Usuario ${user.email} deshabilitado.`, "success");
          }
          break;
        case 'makeAdmin':
          if (window.confirm(`¿Convertir a ${user.email} en administrador?`)) {
            await updateDoc(userDocRef, { role: 'admin' });
            addNotification(`${user.email} ahora es administrador.`, "success");
          }
          break;
        case 'makeClient':
          if (window.confirm(`¿Convertir a ${user.email} en cliente?`)) {
            await updateDoc(userDocRef, { role: 'client' });
            addNotification(`${user.email} ahora es cliente.`, "success");
          }
          break;
        case 'delete':
          if (window.confirm(`¿Eliminar permanentemente a ${user.email}? Esta acción no se puede deshacer.`)) {
            try {
              // Eliminar de Firestore
              await deleteDoc(userDocRef);
              addNotification(`Usuario ${user.email} eliminado de la base de datos.`, "success");
              
              // Nota: Para eliminar de Authentication se requiere Cloud Functions o Admin SDK
              addNotification("Nota: El usuario permanece en Authentication. Contacta al administrador para eliminación completa.", "info");
            } catch (error) {
              console.error("Error deleting user:", error);
              addNotification("Error al eliminar el usuario: " + error.message, "error");
            }
          }
          break;
        default:
          addNotification("Acción no reconocida.", "error");
      }
    } catch (e) {
      addNotification("Ocurrió un error al realizar la acción.", "error");
      console.error("Error in user action:", e);
    }
  };
  
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return !search || 
           user.email.toLowerCase().includes(search) ||
           (user.fullName && user.fullName.toLowerCase().includes(search)) ||
           (user.identification && user.identification.includes(search));
  });

  const getStatusChip = (status) => {
    const statusMap = {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800', 
      'disabled': 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };
  
  const getRoleChip = (role) => {
    const roleMap = {
      'superadmin': 'bg-red-100 text-red-800 font-bold',
      'admin': 'bg-blue-100 text-blue-800 font-semibold', 
      'client': 'bg-gray-100 text-gray-800'
    };
    return roleMap[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'active': 'Activo',
      'pending': 'Pendiente',
      'disabled': 'Deshabilitado',
    };
    return statusMap[status] || status;
  };

  const getRoleText = (role) => {
    const roleMap = {
      'superadmin': 'Super Admin',
      'admin': 'Administrador',
      'client': 'Cliente'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="relative">
          <input type="text" placeholder="Buscar por email, nombre, ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-full w-full sm:w-64" />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
        </div>
        {userRole === 'superadmin' && (
          <button onClick={() => setCreateModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
            <PlusIcon /> <span className="hidden sm:inline">Crear Usuario</span>
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full text-left">
           <thead className="bg-gray-50">
             <tr>
               {['Nombre', 'Email', 'Identificación', 'Rol', 'Estado', 'Fecha Creación', 'Acciones'].map(h => 
                 <th key={h} className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
               )}
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-200">
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{u.fullName || 'Sin nombre'}</div>
                  {u.fullName && <div className="text-sm text-gray-500">ID: {u.id.slice(0, 8)}...</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{u.email}</div>
                  {u.requiresPasswordChange && <div className="text-xs text-orange-600">Requiere cambio de contraseña</div>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.identification || '--'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleChip(u.role)}`}>
                    {getRoleText(u.role)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChip(u.status)}`}>
                    {getStatusText(u.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : '--'}
                </td>
                <td className="px-6 py-4">
                  {userRole === 'superadmin' && u.role !== 'superadmin' && (
                    <ActionDropdown>
                      <button onClick={() => {setEditingUser(u); setEditModalOpen(true);}} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        ✏️ Editar Datos
                      </button>
                      <button onClick={() => handleUserAction(u, 'notify')} className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50">
                        📧 Notificar Activación
                      </button>
                      {u.status === 'pending' && (
                        <button onClick={() => handleUserAction(u, 'activate')} className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                          ✅ Activar Usuario
                        </button>
                      )}
                      {u.status === 'active' && (
                        <button onClick={() => handleUserAction(u, 'disable')} className="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50">
                          ⏸️ Deshabilitar
                        </button>
                      )}
                      {u.status === 'disabled' && (
                        <button onClick={() => handleUserAction(u, 'activate')} className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                          🔄 Re-Activar
                        </button>
                      )}
                      {u.role === 'client' ? (
                        <button onClick={() => handleUserAction(u, 'makeAdmin')} className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50">
                          👨‍💼 Hacer Administrador
                        </button>
                      ) : (
                        <button onClick={() => handleUserAction(u, 'makeClient')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          👤 Hacer Cliente
                        </button>
                      )}
                      <button onClick={() => handleUserAction(u, 'delete')} className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                        🗑️ Eliminar Permanentemente
                      </button>
                    </ActionDropdown>
                  )}
                </td>
              </tr>
            ))}
           </tbody>
        </table>
      </div>
      <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSave={handleCreateUser} />
      <UserModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSave={handleUpdateUser} user={editingUser} />
      <UserActivationModal 
        isOpen={isActivationModalOpen} 
        onClose={() => {
          setActivationModalOpen(false);
          setActivatingUser(null);
        }} 
        onActivate={handleActivateUser}
        user={activatingUser}
        companySettings={companySettings}
      />
      <UserNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setNotificationModalOpen(false);
          setNotifyingUser(null);
        }}
        user={notifyingUser}
        companySettings={companySettings}
      />
    </div>
  );
}

export default AdminUsersDashboard;

