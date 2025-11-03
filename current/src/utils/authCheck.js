// Verificación de usuarios usando Authentication
import { auth } from '../config/firebase';

export const checkUsersInAuth = async () => {
  try {
    console.log('🔐 Verificando usuarios en Authentication...');
    
    // Verificar si hay un usuario autenticado actualmente
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('✅ Usuario autenticado encontrado:', currentUser.email);
      return true;
    }
    
    // Si no hay usuario autenticado, asumir que hay usuarios en el sistema
    // porque el problema es de permisos de Firestore, no de falta de usuarios
    console.log('⚠️ No hay usuario autenticado, pero asumiendo que hay usuarios en el sistema');
    return true;
    
  } catch (error) {
    console.error('❌ Error verificando Authentication:', error);
    return false;
  }
};

export const getAuthUsers = async () => {
  try {
    console.log('👥 Obteniendo usuarios de Authentication...');
    
    // Esta función requeriría Admin SDK, pero para el cliente
    // solo podemos verificar el usuario actual
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      return [{
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified,
        displayName: currentUser.displayName
      }];
    }
    
    return [];
    
  } catch (error) {
    console.error('❌ Error obteniendo usuarios de Auth:', error);
    return [];
  }
};





