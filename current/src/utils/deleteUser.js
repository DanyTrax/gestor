// Función para eliminar usuario de Firebase Authentication
// Requiere configuración del Admin SDK en el backend

export const deleteUserFromAuth = async (uid) => {
  try {
    // Esta función debe ser llamada desde el backend con Admin SDK
    // Por ahora, retornamos un error indicando que se necesita configuración
    throw new Error('Esta función requiere configuración del Admin SDK en el backend');
  } catch (error) {
    console.error('Error deleting user from Auth:', error);
    throw error;
  }
};

// Función alternativa usando la API REST de Firebase
export const deleteUserViaAPI = async (uid, idToken) => {
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${process.env.REACT_APP_FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: idToken,
        localId: uid
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al eliminar usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting user via API:', error);
    throw error;
  }
};





