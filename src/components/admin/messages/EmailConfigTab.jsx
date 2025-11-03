import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { testEmailConfig } from '../../../services/emailService';

function EmailConfigTab({ isDemo }) {
  const { addNotification } = useNotification();
  const [config, setConfig] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    enabled: false
  });
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    if (isDemo) {
      setConfig({
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: 'demo@example.com',
        smtpPassword: '****',
        fromEmail: 'noreply@empresa.com',
        fromName: 'Gestor de Cobros',
        enabled: false
      });
      return;
    }

    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'email_config');
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setConfig(doc.data());
      }
    });

    return () => unsubscribe();
  }, [isDemo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleSave = async () => {
    if (isDemo) {
      addNotification('Función no disponible en modo demo', 'error');
      return;
    }

    try {
      const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'email_config');
      await setDoc(configRef, {
        ...config,
        updatedAt: new Date()
      }, { merge: true });
      addNotification('Configuración de email guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error saving email config:', error);
      addNotification('Error al guardar la configuración', 'error');
    }
  };

  const handleTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      addNotification('Ingresa un email válido para probar', 'error');
      return;
    }

    setTesting(true);
    try {
      // Guardar configuración primero
      const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'email_config');
      await setDoc(configRef, config, { merge: true });

      // Esperar un momento para que Firestore se actualice
      await new Promise(resolve => setTimeout(resolve, 500));

      // Probar envío
      const result = await testEmailConfig(testEmail);
      
      if (result.success) {
        addNotification(`Email de prueba enviado a ${testEmail}. Revisa tu bandeja de entrada.`, 'success');
      } else {
        addNotification(`Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error testing email:', error);
      addNotification('Error al enviar email de prueba: ' + error.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Configuración SMTP</h3>
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servidor SMTP
              </label>
              <input
                type="text"
                name="smtpHost"
                value={config.smtpHost}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
                className="w-full p-2 border rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">Ejemplo: smtp.gmail.com, smtp.outlook.com</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puerto SMTP
              </label>
              <input
                type="number"
                name="smtpPort"
                value={config.smtpPort}
                onChange={handleChange}
                placeholder="587"
                className="w-full p-2 border rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">Puerto común: 587 (TLS) o 465 (SSL)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario SMTP
              </label>
              <input
                type="text"
                name="smtpUser"
                value={config.smtpUser}
                onChange={handleChange}
                placeholder="tu-email@dominio.com"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña SMTP
              </label>
              <input
                type="password"
                name="smtpPassword"
                value={config.smtpPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full p-2 border rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">Para Gmail: usa una "Contraseña de aplicación"</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Remitente
              </label>
              <input
                type="email"
                name="fromEmail"
                value={config.fromEmail}
                onChange={handleChange}
                placeholder="noreply@tuempresa.com"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Remitente
              </label>
              <input
                type="text"
                name="fromName"
                value={config.fromName}
                onChange={handleChange}
                placeholder="Gestor de Cobros"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="smtpSecure"
              name="smtpSecure"
              checked={config.smtpSecure}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="smtpSecure" className="text-sm font-medium text-gray-700">
              Usar conexión segura (SSL/TLS)
            </label>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              checked={config.enabled}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
              Habilitar servicio de email
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>

      {/* Testeador de Email */}
      <div>
        <h3 className="text-xl font-bold mb-4">Probar Configuración</h3>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-600 mb-4">
            Envía un email de prueba para verificar que la configuración SMTP está funcionando correctamente.
          </p>
          <div className="flex gap-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="flex-1 p-2 border rounded-md"
            />
            <button
              onClick={handleTest}
              disabled={testing || !config.enabled}
              className={`px-6 py-2 rounded-md ${
                testing || !config.enabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {testing ? 'Enviando...' : 'Enviar Email de Prueba'}
            </button>
          </div>
          {!config.enabled && (
            <p className="text-sm text-yellow-600 mt-2">
              ⚠️ Debes habilitar el servicio de email primero para poder enviar pruebas.
            </p>
          )}
        </div>
      </div>

      {/* Información de ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">📧 Configuración de SMTP</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>Gmail:</strong> smtp.gmail.com:587, usa "Contraseña de aplicación"</li>
          <li><strong>Outlook:</strong> smtp-mail.outlook.com:587</li>
          <li><strong>Yahoo:</strong> smtp.mail.yahoo.com:587</li>
          <li><strong>Servidor propio:</strong> Consulta con tu proveedor de hosting</li>
        </ul>
      </div>
    </div>
  );
}

export default EmailConfigTab;

