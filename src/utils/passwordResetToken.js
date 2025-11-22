/**
 * Sistema de tokens personalizado para restablecimiento de contraseña
 * Genera tokens únicos y los almacena en Firestore
 */

import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { updatePassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Generar un token único para restablecimiento de contraseña
 */
const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Crear un token de restablecimiento de contraseña para un usuario
 * @param {string} userId - ID del usuario en Firestore
 * @param {string} email - Email del usuario
 * @param {number} expiresInHours - Horas hasta que expire (default: 24)
 * @returns {Promise<string>} - Token generado
 */
export const createPasswordResetToken = async (userId, email, expiresInHours = 24) => {
  try {
    // Eliminar tokens existentes para este usuario
    const tokensCollection = collection(db, 'artifacts', appId, 'public', 'data', 'passwordResetTokens');
    const existingTokensQuery = query(tokensCollection, where('userId', '==', userId), where('used', '==', false));
    const existingTokens = await getDocs(existingTokensQuery);
    
    existingTokens.forEach(async (tokenDoc) => {
      await deleteDoc(doc(tokensCollection, tokenDoc.id));
    });

    // Generar nuevo token
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Guardar token en Firestore
    await addDoc(tokensCollection, {
      userId,
      email,
      token,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: Timestamp.now(),
      used: false
    });

    return token;
  } catch (error) {
    console.error('Error creating password reset token:', error);
    throw error;
  }
};

/**
 * Validar un token de restablecimiento de contraseña
 * @param {string} token - Token a validar
 * @returns {Promise<{valid: boolean, userId: string|null, email: string|null, error: string|null}>}
 */
export const validatePasswordResetToken = async (token) => {
  try {
    const tokensCollection = collection(db, 'artifacts', appId, 'public', 'data', 'passwordResetTokens');
    const tokenQuery = query(tokensCollection, where('token', '==', token));
    const tokenDocs = await getDocs(tokenQuery);

    if (tokenDocs.empty) {
      return { valid: false, userId: null, email: null, error: 'Token no encontrado' };
    }

    const tokenDoc = tokenDocs.docs[0];
    const tokenData = tokenDoc.data();

    // Verificar si ya fue usado
    if (tokenData.used) {
      return { valid: false, userId: null, email: null, error: 'Este token ya fue utilizado' };
    }

    // Verificar si expiró
    const expiresAt = tokenData.expiresAt.toDate();
    if (new Date() > expiresAt) {
      return { valid: false, userId: null, email: null, error: 'Este token ha expirado' };
    }

    return { 
      valid: true, 
      userId: tokenData.userId, 
      email: tokenData.email, 
      error: null,
      tokenDocId: tokenDoc.id
    };
  } catch (error) {
    console.error('Error validating password reset token:', error);
    return { valid: false, userId: null, email: null, error: 'Error al validar el token' };
  }
};

/**
 * Marcar un token como usado
 * @param {string} tokenDocId - ID del documento del token
 */
export const markTokenAsUsed = async (tokenDocId) => {
  try {
    const tokensCollection = collection(db, 'artifacts', appId, 'public', 'data', 'passwordResetTokens');
    await updateDoc(doc(tokensCollection, tokenDocId), {
      used: true,
      usedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking token as used:', error);
  }
};

/**
 * Cambiar contraseña usando un token
 * @param {string} token - Token de restablecimiento
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const resetPasswordWithToken = async (token, newPassword) => {
  try {
    // Validar token
    const validation = await validatePasswordResetToken(token);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Obtener el email del usuario desde Firestore
    const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', validation.userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    const userData = userDoc.data();
    const email = userData.email;

    // Para cambiar la contraseña, necesitamos autenticarnos temporalmente como el usuario
    // Esto requiere que el usuario tenga una contraseña temporal o que usemos Firebase Admin SDK
    // Por ahora, usaremos un enfoque alternativo: crear una nueva sesión temporal
    
    // Intentar iniciar sesión con una contraseña temporal (si existe) o usar Admin SDK
    // Como no tenemos Admin SDK en el frontend, usaremos un enfoque diferente:
    // El usuario debe iniciar sesión con su email y una contraseña temporal que se le proporcionó
    
    // Alternativa: Usar Firebase Admin SDK en el backend para cambiar la contraseña
    // Por ahora, retornamos que necesita usar el endpoint PHP
    
    // Marcar token como usado
    await markTokenAsUsed(validation.tokenDocId);
    
    return { 
      success: false, 
      error: 'Para cambiar la contraseña, por favor contacta con soporte o usa el enlace de Firebase' 
    };
  } catch (error) {
    console.error('Error resetting password with token:', error);
    return { success: false, error: error.message };
  }
};

