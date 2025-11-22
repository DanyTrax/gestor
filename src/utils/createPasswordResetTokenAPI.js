/**
 * Utilidad para crear token de restablecimiento de contraseña usando el endpoint PHP
 * Esto evita problemas de permisos de Firestore para usuarios no autenticados
 */

export const createPasswordResetTokenAPI = async (email, appId, expiresInHours = 24) => {
  try {
    // Obtener la URL base del sistema
    const protocol = window.location.protocol;
    const host = window.location.host;
    const path = window.location.pathname.split('/').slice(0, -1).join('/') || '';
    const baseUrl = `${protocol}//${host}${path}`;
    
    const response = await fetch(`${baseUrl}/create-password-reset-token.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        appId,
        expiresInHours
      })
    });

    // Verificar si la respuesta es JSON válido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Error del servidor (${response.status}): ${text.substring(0, 200)}`);
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error al crear token de restablecimiento');
    }

    return {
      token: data.token,
      userId: data.userId,
      userData: data.userData || {}
    };
  } catch (error) {
    console.error('Error creating password reset token via API:', error);
    throw error;
  }
};

