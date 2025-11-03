// Función para eliminar usuario de Firebase Authentication usando API REST
// Requiere un token de administrador

export const deleteUserFromAuth = async (uid, adminToken) => {
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${process.env.REACT_APP_FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: adminToken,
        localId: uid
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al eliminar usuario de Authentication');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting user from Auth:', error);
    throw error;
  }
};

// Función alternativa usando Admin SDK (requiere configuración del backend)
export const deleteUserViaAdminSDK = async (uid) => {
  try {
    // Esta función debe ser implementada en el backend
    const response = await fetch('/api/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid })
    });

    if (!response.ok) {
      throw new Error('Error al eliminar usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting user via Admin SDK:', error);
    throw error;
  }
};





