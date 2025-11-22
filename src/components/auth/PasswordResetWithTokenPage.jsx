import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { validatePasswordResetToken } from '../../utils/passwordResetToken';

function PasswordResetWithTokenPage({ companySettings, onResetComplete }) {
  const { addNotification } = useNotification();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const handlePasswordReset = async () => {
      // Obtener token de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      if (!tokenFromUrl) {
        setError('Token no encontrado en la URL. Por favor, usa el enlace completo que recibiste por correo.');
        setVerifying(false);
        return;
      }

      setToken(tokenFromUrl);

      try {
        // Validar el token
        const validation = await validatePasswordResetToken(tokenFromUrl);
        
        if (!validation.valid) {
          setError(validation.error || 'Token inválido o expirado');
          setVerifying(false);
          return;
        }

        setEmail(validation.email);
        setTokenValid(true);
        setVerifying(false);
      } catch (error) {
        console.error('Error validando token:', error);
        setError('Error al validar el token. Por favor, intenta nuevamente.');
        setVerifying(false);
      }
    };

    handlePasswordReset();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!token) {
      setError('Token no encontrado.');
      return;
    }

    setLoading(true);
    try {
      // Llamar al endpoint PHP para cambiar la contraseña
      const response = await fetch('/reset-password-with-token.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: password
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al restablecer la contraseña');
      }

      addNotification('Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.', 'success');

      // Limpiar URL y notificar que el reset está completo
      window.history.replaceState({}, document.title, window.location.pathname);
      if (onResetComplete) {
        setTimeout(() => {
          onResetComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      setError(error.message || 'Error al restablecer la contraseña. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-xl max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando token de restablecimiento...</p>
        </div>
      </div>
    );
  }

  if (error && !tokenValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center mb-6">
            {companySettings?.logoUrl ? (
              <img src={companySettings.logoUrl} alt="Logo" className="max-h-16 mx-auto mb-4" />
            ) : (
              <h1 className="text-2xl font-bold mb-4">{companySettings?.companyName || 'Gestor de Pagos'}</h1>
            )}
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => {
              window.history.replaceState({}, document.title, window.location.pathname);
              if (onResetComplete) onResetComplete();
            }}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Volver al Inicio de Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          {companySettings?.logoUrl ? (
            <img src={companySettings.logoUrl} alt="Logo" className="max-h-16 mx-auto mb-4" />
          ) : (
            <h1 className="text-2xl font-bold mb-4">{companySettings?.companyName || 'Gestor de Pagos'}</h1>
          )}
          <h2 className="text-2xl font-bold">Restablecer Contraseña</h2>
          <p className="text-gray-600 mt-2">Ingresa tu nueva contraseña para {email}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Restableciendo...
              </>
            ) : (
              'Restablecer Contraseña'
            )}
          </button>
        </form>

        <button
          onClick={() => {
            window.history.replaceState({}, document.title, window.location.pathname);
            if (onResetComplete) onResetComplete();
          }}
          className="w-full mt-4 text-sm text-blue-600 hover:underline"
        >
          Volver al Inicio de Sesión
        </button>
      </div>
    </div>
  );
}

export default PasswordResetWithTokenPage;

