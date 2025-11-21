import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { testEmailConfig } from '../../../services/emailService';

function EmailConfigTab({ isDemo }) {
  const { addNotification } = useNotification();
  const [config, setConfig] = useState({
    provider: 'smtp', // 'smtp' o 'zoho'
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPassword: '',
    // Configuración Zoho Mail
    zohoClientId: '',
    zohoClientSecret: '',
    zohoRefreshToken: '',
    zohoAccessToken: '',
    zohoAccessTokenExpiry: null,
    // Configuración común
    fromEmail: '',
    fromName: '',
    enabled: false
  });
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    if (isDemo) {
      setConfig({
        provider: 'smtp',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: 'demo@example.com',
        smtpPassword: '****',
        zohoClientId: '',
        zohoClientSecret: '',
        zohoRefreshToken: '',
        fromEmail: 'noreply@empresa.com',
        fromName: 'Gestor de Cobros',
        enabled: false
      });
      return;
    }

    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'email_config');
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Limpiar espacios en blanco al cargar datos
        setConfig({
          ...data,
          smtpUser: data.smtpUser ? data.smtpUser.trim() : '',
          smtpHost: data.smtpHost ? data.smtpHost.trim() : '',
          fromEmail: data.fromEmail ? data.fromEmail.trim() : '',
        });
      }
    }, (error) => {
      console.error('Error loading email config:', error);
      if (error.code === 'permission-denied') {
        addNotification('Error de permisos al cargar configuración de email. Verifica las reglas de Firestore.', 'error');
      }
    });

    return () => unsubscribe();
  }, [isDemo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Limpiar espacios en blanco de campos críticos
    let processedValue = value;
    if (type === 'text' && (name === 'smtpUser' || name === 'smtpHost' || name === 'fromEmail')) {
      processedValue = value.trim();
    }
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : processedValue)
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
        if (result.sent) {
          addNotification(`✅ Email de prueba enviado exitosamente a ${testEmail}. Revisa tu bandeja de entrada (y spam).`, 'success');
        } else if (result.simulated) {
          const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          if (isDev) {
            addNotification(`⚠️ Modo desarrollo: El email se registró pero no se envió (servidor PHP no disponible localmente). Despliega en producción para envío real.`, 'warning');
          } else {
            addNotification(`⚠️ Email de prueba registrado en historial. Verifica la configuración SMTP si no se envió.`, 'warning');
          }
        } else {
          addNotification(`✅ Email de prueba procesado. Revisa el historial de mensajes para ver el estado.`, 'info');
        }
      } else {
        // Error detallado con sugerencias
        const errorMsg = result.error || 'Error desconocido';
        const errorDetails = result.details || '';
        let suggestion = '';
        
        if (errorMsg.includes('send-email.php') || errorMsg.includes('404') || errorMsg.includes('no se encontró')) {
          suggestion = ' Verifica que send-email.php esté en el servidor y que PHPMailer esté instalado. Consulta VERIFICAR-PHP.md';
        } else if (errorMsg.includes('PHPMailer') || errorMsg.includes('Class')) {
          suggestion = ' PHPMailer no está instalado. Ejecuta: composer require phpmailer/phpmailer';
        } else if (errorMsg.includes('Could not authenticate') || errorMsg.includes('authentication')) {
          suggestion = errorDetails || ' Verifica: 1) Usuario SMTP debe ser el email completo (ej: noreply@dominio.com), 2) Contraseña correcta, 3) Puerto y conexión segura (587/TLS o 465/SSL), 4) Servidor SMTP correcto';
        } else if (errorMsg.includes('SMTP') || errorMsg.includes('connect')) {
          suggestion = errorDetails || ' Verifica la configuración SMTP (servidor, puerto, usuario, contraseña)';
        }
        
        // Mensaje completo con detalles
        const fullMessage = errorDetails 
          ? `❌ Error al enviar email: ${errorMsg}\n\n${errorDetails}`
          : `❌ Error al enviar email: ${errorMsg}${suggestion}`;
        
        addNotification(fullMessage, 'error');
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
        <h3 className="text-xl font-bold mb-4">Configuración de Email</h3>
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          {/* Selector de Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor de Email
            </label>
            <select
              name="provider"
              value={config.provider || 'smtp'}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="smtp">SMTP (Servidor de Correo)</option>
              <option value="zoho">Zoho Mail API</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {config.provider === 'zoho' 
                ? 'Zoho Mail API: Envío directo vía API REST, mejor deliverability, sin necesidad de servidor SMTP.'
                : 'SMTP: Método tradicional, requiere servidor SMTP configurado (cPanel, Gmail, etc.).'}
            </p>
          </div>

          {/* Configuración según proveedor */}
          {config.provider === 'zoho' ? (
            // Configuración Zoho Mail API
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-800">Configuración Zoho Mail API</h4>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-800 mb-2">📋 Pasos para Configurar Zoho Mail API:</p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Registra tu aplicación en <a href="https://api-console.zoho.com" target="_blank" rel="noopener noreferrer" className="underline">Zoho API Console</a></li>
                  <li>Obtén tu Client ID y Client Secret</li>
                  <li>Genera un Refresh Token (una vez, no expira)</li>
                  <li>Configura los permisos de Zoho Mail API</li>
                  <li>Ingresa las credenciales a continuación</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client ID (Zoho)
                  </label>
                  <input
                    type="text"
                    name="zohoClientId"
                    value={config.zohoClientId}
                    onChange={handleChange}
                    placeholder="1000.XXXXXXXXXX"
                    className="w-full p-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">Obtén esto desde Zoho API Console</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Secret (Zoho)
                  </label>
                  <input
                    type="password"
                    name="zohoClientSecret"
                    value={config.zohoClientSecret}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full p-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">Secreto de tu aplicación Zoho</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refresh Token (Zoho)
                  </label>
                  <input
                    type="password"
                    name="zohoRefreshToken"
                    value={config.zohoRefreshToken}
                    onChange={handleChange}
                    placeholder="1000.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full p-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Genera este token una vez desde Zoho API Console. No expira hasta que lo revoques.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Remitente (Zoho)
                  </label>
                  <input
                    type="email"
                    name="fromEmail"
                    value={config.fromEmail}
                    onChange={handleChange}
                    placeholder="noreply@tudominio.com"
                    className="w-full p-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">Debe ser un email configurado en tu cuenta Zoho Mail</p>
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
            </div>
          ) : (
            // Configuración SMTP (existente)
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-800">Configuración SMTP</h4>
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
          )}

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
        {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Modo Desarrollo Local:</p>
            <p className="text-sm text-yellow-700">
              Estás en desarrollo local. El servidor PHP no está disponible, por lo que los emails se registrarán en el historial pero <strong>NO se enviarán realmente</strong>.
              Para probar el envío real, despliega la aplicación en producción (Dockge o cPanel).
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-green-800 mb-2">✅ Emails Reales Activados:</p>
            <p className="text-sm text-green-700">
              Los emails se están enviando realmente usando el servidor SMTP configurado.
              El email de prueba se enviará a la dirección que especifiques.
            </p>
          </div>
        )}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-600 mb-4">
            {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
              ? 'El email de prueba se registrará en el historial (modo desarrollo). En producción se enviará realmente.'
              : 'El email de prueba se enviará realmente usando tu configuración SMTP. Verifica tu bandeja de entrada.'}
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
        {config.provider === 'zoho' ? (
          <>
            <h4 className="font-semibold text-blue-800 mb-2">📧 Configuración de Zoho Mail API</h4>
            
            <div className="mb-4">
              <h5 className="font-semibold text-blue-800 mb-2">✅ Ventajas de Zoho Mail API</h5>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside mb-2">
                <li>No requiere servidor SMTP configurado</li>
                <li>Mejor deliverability (Zoho maneja la reputación)</li>
                <li>Tracking y analytics de emails</li>
                <li>Sin límites de conexiones SMTP</li>
                <li>Respuestas de error más detalladas</li>
              </ul>
            </div>

            <div className="border-t border-blue-300 pt-3 mt-3">
              <h5 className="font-semibold text-blue-800 mb-2">🔗 Enlaces Útiles:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><a href="https://api-console.zoho.com" target="_blank" rel="noopener noreferrer" className="underline">Zoho API Console</a> - Registra tu aplicación</li>
                <li><a href="https://www.zoho.com/mail/help/api/" target="_blank" rel="noopener noreferrer" className="underline">Documentación Zoho Mail API</a></li>
                <li><a href="https://www.zoho.com/mail/help/dev-platform/connectors.html" target="_blank" rel="noopener noreferrer" className="underline">Guía de OAuth 2.0</a></li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <h4 className="font-semibold text-blue-800 mb-2">📧 Configuración de SMTP</h4>
            
            <div className="mb-4">
              <h5 className="font-semibold text-blue-800 mb-2">✅ Usar cPanel (Recomendado si tienes hosting con cPanel)</h5>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside mb-2">
                <li><strong>Servidor SMTP:</strong> <code>mail.tu-dominio.com</code> o <code>smtp.tu-dominio.com</code></li>
                <li><strong>Puerto:</strong> <code>587</code> (TLS) o <code>465</code> (SSL) - Marca "Usar conexión segura"</li>
                <li><strong>Usuario:</strong> Email completo (ej: <code>noreply@tu-dominio.com</code>)</li>
                <li><strong>Contraseña:</strong> La contraseña del email creado en cPanel</li>
                <li><strong>Email Remitente:</strong> El mismo email (ej: <code>noreply@tu-dominio.com</code>)</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                💡 <strong>Ventaja:</strong> No necesitas servicios externos, emails ilimitados desde tu propio dominio.
              </p>
            </div>

            <div className="border-t border-blue-300 pt-3 mt-3">
              <h5 className="font-semibold text-blue-800 mb-2">Otros Servicios:</h5>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>Gmail:</strong> smtp.gmail.com:587, usa "Contraseña de aplicación"</li>
                <li><strong>Outlook:</strong> smtp-mail.outlook.com:587</li>
                <li><strong>Yahoo:</strong> smtp.mail.yahoo.com:587</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EmailConfigTab;

