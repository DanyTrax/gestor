import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { sendEmail, loadEmailConfig } from '../../../services/emailService';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';

function UserActivationModal({ isOpen, onClose, user, onActivate, companySettings }) {
  const { addNotification } = useNotification();
  const [message, setMessage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const defaultMessage = `Hola ${user?.fullName || user?.email},

Tu cuenta ha sido activada exitosamente en {companyName}.

Ahora puedes:
• Ver tus servicios contratados
• Crear tickets de soporte
• Gestionar tu perfil

Para acceder, simplemente inicia sesión con tu email y contraseña.

¡Bienvenido!

Equipo de Soporte`;

  // Cargar plantillas para clientes
  useEffect(() => {
    if (!isOpen) return;
    
    const templatesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'messageTemplates');
    // Cargar todas las plantillas y filtrar en el cliente (por si algunas no tienen category)
    const allTemplatesQuery = query(templatesCollection, orderBy('name'));
    
    const unsubscribe = onSnapshot(allTemplatesQuery, (snapshot) => {
      const allTemplates = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      // Filtrar solo plantillas para clientes (por defecto 'client' si no tiene category)
      const clientTemplates = allTemplates.filter(t => (t.category || 'client') === 'client');
      setTemplates(clientTemplates);
    }, (error) => {
      console.error('Error loading templates:', error);
      setTemplates([]);
    });
    
    return () => unsubscribe();
  }, [isOpen]);

  // Aplicar plantilla seleccionada
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        // Reemplazar variables básicas
        let templateBody = template.body;
        let templateSubject = template.subject;
        
        const replacements = {
          '{clientName}': user?.fullName || user?.email || '',
          '{clientEmail}': user?.email || '',
          '{companyName}': companySettings?.companyName || ''
        };
        
        Object.entries(replacements).forEach(([key, value]) => {
          templateBody = templateBody.replace(new RegExp(key, 'g'), value);
          templateSubject = templateSubject.replace(new RegExp(key, 'g'), value);
        });
        
        setMessage(templateBody);
      }
    }
  }, [selectedTemplateId, templates, user, companySettings]);

  const handleActivate = async () => {
    setLoading(true);
    try {
      console.log('📧 [USUARIOS] Activando usuario y enviando notificación');
      
      // Activar el usuario
      await onActivate();
      
      // Cargar configuración de email
      await loadEmailConfig();
      
      // Preparar mensaje
      let emailMessage = message || defaultMessage;
      let emailSubject = `Cuenta Activada - ${companySettings?.companyName || 'Sistema de Gestión de Cobros'}`;
      
      // Si hay una plantilla seleccionada, usar su asunto
      if (selectedTemplateId) {
        const template = templates.find(t => t.id === selectedTemplateId);
        if (template) {
          // Reemplazar variables en el asunto
          let templateSubject = template.subject;
          const replacements = {
            '{clientName}': user?.fullName || user?.email || '',
            '{clientEmail}': user?.email || '',
            '{companyName}': companySettings?.companyName || ''
          };
          Object.entries(replacements).forEach(([key, value]) => {
            templateSubject = templateSubject.replace(new RegExp(key, 'g'), value);
          });
          emailSubject = templateSubject;
        }
      }
      
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
            Seleccionar Plantilla (Opcional)
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => {
              setSelectedTemplateId(e.target.value);
              if (!e.target.value) {
                setMessage('');
              }
            }}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 mb-3"
          >
            <option value="">-- Sin plantilla (usar mensaje por defecto) --</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          {selectedTemplateId && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Plantilla seleccionada:</strong> {templates.find(t => t.id === selectedTemplateId)?.name || 'N/A'}
              </p>
            </div>
          )}
          
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje de Notificación
          </label>
          <textarea 
            value={message || defaultMessage} 
            onChange={(e) => setMessage(e.target.value)} 
            rows="8" 
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder={defaultMessage}
          />
          <p className="text-sm text-gray-500 mt-1">
            {selectedTemplateId 
              ? 'Puedes editar el mensaje de la plantilla seleccionada o dejarlo como está.'
              : 'Si no seleccionas una plantilla, se enviará el mensaje por defecto. Puedes personalizarlo aquí.'}
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






