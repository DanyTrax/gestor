/**
 * Utilidad para generar enlace de restablecimiento de contraseña
 * Usa el endpoint PHP que usa Firebase Admin SDK para no exponer Firebase
 */

/**
 * Generar enlace de restablecimiento de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<string>} - Enlace de restablecimiento
 */
export const generatePasswordResetLink = async (email) => {
  try {
    const response = await fetch('/generate-reset-link.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error al generar enlace de restablecimiento');
    }

    return data.resetLink;
  } catch (error) {
    console.error('Error generando enlace de reset:', error);
    throw error;
  }
};

