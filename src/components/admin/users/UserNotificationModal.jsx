import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { sendEmail, loadEmailConfig } from '../../../services/emailService';

function UserNotificationModal({ isOpen, onClose, user, companySettings }) {
  const { addNotification } = useNotification();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
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

  const defaultSubject = `Cuenta Activada - ${companySettings?.companyName || 'Sistema de Gestión de Cobros'}`;

  // Cargar plantillas para clientes
  useEffect(() => {
    if (!isOpen) return;
    
    const templatesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'messageTemplates');
    const allTemplatesQuery = query(templatesCollection, orderBy('name'));
    
    const unsubscribe = onSnapshot(allTemplatesQuery, (snapshot) => {
      const allTemplates = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      // Filtrar solo plantillas para clientes (por defecto 'client' si no tiene category)
      const clientTemplates = allTemplates.filter(t => (t.category || 'client') === 'client');
      setTemplates(clientTemplates);
      
      // Si hay plantillas, seleccionar la primera por defecto
      if (clientTemplates.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(clientTemplates[0].id);
      }
    }, (error) => {
      console.error('Error loading templates:', error);
      setTemplates([]);
    });
    
    return () => unsubscribe();
  }, [isOpen]);

  // Aplicar plantilla seleccionada
  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        // Reemplazar variables básicas
        let templateBody = template.body;
        let templateSubject = template.subject;
        
        const replacements = {
          '{clientName}': user?.fullName || user?.email || '',
          '{clientEmail}': user?.email || '',
          '{companyName}': companySettings?.companyName || 'Sistema de Gestión de Cobros',
          '{loginUrl}': typeof window !== 'undefined' ? window.location.origin : '',
          '{clientPortalUrl}': typeof window !== 'undefined' ? window.location.origin : ''
        };
        
        Object.entries(replacements).forEach(([key, value]) => {
          const regex = new RegExp(key.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
          templateBody = templateBody.replace(regex, value);
          templateSubject = templateSubject.replace(regex, value);
        });
        
        setBody(templateBody);
        setSubject(templateSubject);
      }
    } else if (!selectedTemplateId) {
      // Si no hay plantilla seleccionada, usar mensaje por defecto
      setBody(defaultMessage);
      setSubject(defaultSubject);
    }
  }, [selectedTemplateId, templates, user, companySettings]);

  // Resetear cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setBody(defaultMessage);
      setSubject(defaultSubject);
      setSelectedTemplateId('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      addNotification("Por favor, complete el asunto y el mensaje", "error");
      return;
    }

    setLoading(true);
    try {
      console.log('📧 [USUARIOS] Enviando notificación de activación al usuario');
      
      // Cargar configuración de email
      await loadEmailConfig();
      
      // Enviar email usando el servicio
      await sendEmail({
        to: user.email,
        toName: user.fullName || user.email,
        subject: subject.trim(),
        html: body.replace(/\n/g, '<br>'),
        text: body,
        type: 'Activación',
        recipientType: 'Cliente',
        module: 'users',
        event: 'userActivation',
        metadata: {
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          templateId: selectedTemplateId || null
        }
      });

      addNotification(`Notificación de activación enviada a ${user.email}`, "success");
      onClose();
    } catch (error) {
      console.error('Error enviando notificación de activación:', error);
      addNotification(`Error al enviar notificación: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Notificar Activación a {user?.fullName || user?.email}</h2>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Usuario:</h3>
          <p className="text-blue-700">
            <strong>Email:</strong> {user?.email}<br/>
            <strong>Nombre:</strong> {user?.fullName || 'Sin especificar'}<br/>
            <strong>Rol:</strong> {user?.role || 'Cliente'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Plantilla (Opcional)
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                if (!e.target.value) {
                  setBody(defaultMessage);
                  setSubject(defaultSubject);
                }
              }}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Sin plantilla (usar mensaje por defecto) --</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {selectedTemplateId && (
              <p className="text-sm text-blue-600 mt-1">
                Plantilla seleccionada: {templates.find(t => t.id === selectedTemplateId)?.name || 'N/A'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asunto
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Asunto del correo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuerpo del Mensaje (Editable)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows="12"
              className="w-full p-3 border rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500"
              placeholder={defaultMessage}
            />
            <p className="text-sm text-gray-500 mt-1">
              {selectedTemplateId 
                ? 'Puedes editar el mensaje de la plantilla seleccionada o dejarlo como está.'
                : 'Puedes personalizar el mensaje o usar el mensaje por defecto.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !subject.trim() || !body.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : (
              'Enviar Notificación'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserNotificationModal;

