import React, { useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { sendEmail, loadEmailConfig } from '../../../services/emailService';

function UserActivationModal({ isOpen, onClose, user, onActivate, companySettings }) {
  const { addNotification } = useNotification();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultMessage = `Hola ${user?.fullName || user?.email},

Tu cuenta ha sido activada exitosamente en nuestro sistema de gestión de cobros.

Ahora puedes:
• Ver tus servicios contratados
• Crear tickets de soporte
• Gestionar tu perfil

Para acceder, simplemente inicia sesión con tu email y contraseña.

¡Bienvenido!

Equipo de Soporte`;

  const handleActivate = async () => {
    setLoading(true);
    try {
      console.log('📧 [USUARIOS] Activando usuario y enviando notificación');
      
      // Activar el usuario
      await onActivate();
      
      // Cargar configuración de email
      await loadEmailConfig();
      
      // Preparar mensaje
      const emailMessage = message || defaultMessage;
      const emailSubject = `Cuenta Activada - ${companySettings?.companyName || 'Sistema de Gestión de Cobros'}`;
      
      // Enviar email usando el servicio
      await sendEmail({
        to: user.email,
        toName: user.fullName || user.email,
        subject: emailSubject,
        html: emailMessage.replace(/\n/g, '<br>'),
        text: emailMessage,
        type: 'Activación',
        recipientType: 'Cliente',
        module: 'users',
        event: 'userActivation',
        metadata: {
          userId: user.id,
          userEmail: user.email,
          userRole: user.role
        }
      });

      addNotification(`Usuario ${user.email} activado y notificado exitosamente`, "success");
      onClose();
    } catch (error) {
      console.error("Error activating user:", error);
      addNotification(`Error al activar usuario: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Activar Usuario</h2>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Usuario a Activar:</h3>
          <p className="text-blue-700">
            <strong>Email:</strong> {user?.email}<br/>
            <strong>Nombre:</strong> {user?.fullName || 'Sin especificar'}<br/>
            <strong>Rol:</strong> {user?.role || 'Cliente'}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje de Notificación (Opcional)
          </label>
          <textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            rows="8" 
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder={defaultMessage}
          />
          <p className="text-sm text-gray-500 mt-1">
            Si no escribes un mensaje personalizado, se enviará el mensaje por defecto.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-yellow-800 mb-2">¿Qué sucederá?</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• El usuario será activado inmediatamente</li>
            <li>• Se enviará una notificación por email</li>
            <li>• El usuario podrá iniciar sesión</li>
            <li>• Si es cliente, deberá completar su perfil</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button 
            onClick={handleActivate}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Activando...
              </>
            ) : (
              'Activar y Notificar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserActivationModal;






