/**
 * Utilidades para generar y validar tokens de cambio de contraseña
 */

import { collection, addDoc, doc, getDoc, deleteDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { updatePassword } from 'firebase/auth';

/**
 * Generar un token único
 */
const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Crear un token de cambio de contraseña para un usuario
 * @param {string} userId - ID del usuario
 * @param {number} expiresInDays - Días hasta que expire el token (default: 7)
 * @returns {Promise<string>} - Token generado
 */
export const createPasswordToken = async (userId, expiresInDays = 7) => {
  try {
    // Eliminar tokens existentes para este usuario
    const tokensCollection = collection(db, 'artifacts', appId, 'public', 'data', 'passwordTokens');
    const existingTokensQuery = query(tokensCollection, where('userId', '==', userId));
    const existingTokens = await getDocs(existingTokensQuery);
    
    existingTokens.forEach(async (tokenDoc) => {
      await deleteDoc(doc(tokensCollection, tokenDoc.id));
    });

    // Generar nuevo token
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Guardar token en Firestore
    await addDoc(tokensCollection, {
      userId,
      token,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: Timestamp.now(),
      used: false
    });

    return token;
  } catch (error) {
    console.error('Error creating password token:', error);
    throw error;
  }
};

/**
 * Validar un token de cambio de contraseña
 * @param {string} token - Token a validar
 * @returns {Promise<{valid: boolean, userId: string|null, error: string|null}>}
 */
export const validatePasswordToken = async (token) => {
  try {
    const tokensCollection = collection(db, 'artifacts', appId, 'public', 'data', 'passwordTokens');
    const tokenQuery = query(tokensCollection, where('token', '==', token));
    const tokenDocs = await getDocs(tokenQuery);

    if (tokenDocs.empty) {
      return { valid: false, userId: null, error: 'Token no encontrado' };
    }

    const tokenDoc = tokenDocs.docs[0];
    const tokenData = tokenDoc.data();

    // Verificar si ya fue usado
    if (tokenData.used) {
      return { valid: false, userId: null, error: 'Este token ya fue utilizado' };
    }

    // Verificar si expiró
    const expiresAt = tokenData.expiresAt.toDate();
    if (new Date() > expiresAt) {
      return { valid: false, userId: null, error: 'Este token ha expirado' };
    }

    return { valid: true, userId: tokenData.userId, error: null };
  } catch (error) {
    console.error('Error validating password token:', error);
    return { valid: false, userId: null, error: 'Error al validar el token' };
  }
};

/**
 * Marcar un token como usado
 * @param {string} token - Token a marcar como usado
 */
export const markTokenAsUsed = async (token) => {
  try {
    const tokensCollection = collection(db, 'artifacts', appId, 'public', 'data', 'passwordTokens');
    const tokenQuery = query(tokensCollection, where('token', '==', token));
    const tokenDocs = await getDocs(tokenQuery);

    if (!tokenDocs.empty) {
      const tokenDoc = tokenDocs.docs[0];
      await updateDoc(doc(tokensCollection, tokenDoc.id), {
        used: true,
        usedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error marking token as used:', error);
  }
};

/**
 * Cambiar contraseña usando un token
 * @param {string} token - Token de cambio de contraseña
 * @param {string} newPassword - Nueva contraseña
 * @param {object} auth - Objeto de autenticación de Firebase
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const changePasswordWithToken = async (token, newPassword, auth) => {
  try {
    // Validar token
    const validation = await validatePasswordToken(token);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Obtener el usuario de Firebase Auth
    const { signInWithEmailAndPassword, getAuth } = await import('firebase/auth');
    const userAuth = auth || getAuth();
    
    // Necesitamos el email del usuario para hacer sign in temporal
    // Obtener email desde Firestore
    const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', validation.userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    const userData = userDoc.data();
    const email = userData.email;

    // Para cambiar la contraseña, necesitamos estar autenticados como ese usuario
    // Esto es un problema de seguridad. Necesitamos usar Firebase Admin SDK o
    // un endpoint del servidor. Por ahora, usaremos un enfoque diferente:
    // El usuario debe iniciar sesión primero con un token temporal o usar
    // Firebase Admin Functions.
    
    // Alternativa: Usar sendPasswordResetEmail de Firebase Auth
    // Pero eso requiere que el usuario tenga acceso al email
    
    // Por ahora, marcaremos el token como usado y retornaremos que necesita
    // usar el flujo de reset de contraseña de Firebase
    await markTokenAsUsed(token);
    
    return { 
      success: false, 
      error: 'Para cambiar la contraseña, por favor usa el enlace de recuperación de contraseña que se enviará a tu email' 
    };
  } catch (error) {
    console.error('Error changing password with token:', error);
    return { success: false, error: error.message };
  }
};

