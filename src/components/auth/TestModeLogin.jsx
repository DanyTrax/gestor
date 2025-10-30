import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

function TestModeLogin({ companySettings, onLogin }) {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      // Buscar un usuario admin en la base de datos
      const adminEmail = 'admin@test.com'; // Email por defecto para pruebas
      const adminPassword = 'admin123';
      
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      onLogin(userCredential.user, 'superadmin');
    } catch (error) {
      addNotification("Error al iniciar sesión como administrador. Verifica las credenciales.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClientLogin = async () => {
    setLoading(true);
    try {
      // Buscar un usuario cliente en la base de datos
      const clientEmail = 'cliente@test.com'; // Email por defecto para pruebas
      const clientPassword = 'cliente123';
      
      const userCredential = await signInWithEmailAndPassword(auth, clientEmail, clientPassword);
      onLogin(userCredential.user, 'client');
    } catch (error) {
      addNotification("Error al iniciar sesión como cliente. Verifica las credenciales.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          {companySettings.logoUrl ? (
            <img src={companySettings.logoUrl} alt="Logo de la Empresa" className="max-h-16" />
          ) : (
            <h1 className="text-3xl font-bold">{companySettings.companyName || 'Gestor de Cobros'}</h1>
          )}
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Modo de Prueba</h2>
          <p className="text-gray-600">Selecciona el tipo de usuario para probar el sistema</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleAdminLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>👨‍💼</span>
                <span>Entrar como Administrador</span>
              </>
            )}
          </button>

          <button 
            onClick={handleClientLogin}
            disabled={loading}
            className="w-full bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>👤</span>
                <span>Entrar como Cliente</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            <strong>Credenciales de Prueba:</strong><br/>
            Admin: admin@test.com / admin123<br/>
            Cliente: cliente@test.com / cliente123
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestModeLogin;
