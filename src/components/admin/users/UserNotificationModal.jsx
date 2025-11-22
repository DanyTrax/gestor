import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { sendEmail, loadEmailConfig } from '../../../services/emailService';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../config/firebase';

function UserNotificationModal({ isOpen, onClose, user, companySettings }) {
  const { addNotification } = useNotification();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  // Generar mensaje por defecto con instrucciones de reset de contraseña
  const generateDefaultMessage = () => {
    const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
    return `Hola ${user?.fullName || user?.email},

Tu cuenta ha sido activada exitosamente en nuestro sistema de gestión de cobros.

🔐 CREAR O CAMBIAR TU CONTRASEÑA:

Para acceder al sistema, necesitas crear o cambiar tu contraseña usando el enlace que recibirás por correo.

📝 INSTRUCCIONES PASO A PASO:

1. Revisa tu correo electrónico (incluyendo la carpeta de spam)
2. Busca un email de Firebase con el asunto "Restablece tu contraseña" o "Reset your password"
3. Haz clic en el botón o enlace "Restablecer contraseña" dentro de ese email
4. Serás redirigido a nuestro sistema en: ${loginUrl}
5. En la página de restablecimiento, ingresa una contraseña segura (mínimo 6 caracteres)
6. Confirma tu contraseña ingresándola nuevamente
7. Haz clic en "Restablecer Contraseña"
8. Una vez creada tu contraseña, serás redirigido automáticamente al inicio de sesión
9. Inicia sesión con:
   - Email: ${user?.email}
   - Contraseña: La que acabas de crear

🔗 ENLACE DIRECTO AL SISTEMA:
${loginUrl}

⚠️ IMPORTANTE:
- El enlace para crear/cambiar tu contraseña expirará en 1 hora
- Si el enlace expira o no recibes el email, puedes solicitar uno nuevo desde la página de inicio de sesión haciendo clic en "¿Olvidaste tu contraseña?"
- Tu cuenta está activa y lista para usar una vez que crees tu contraseña

Una vez que inicies sesión, podrás:
• Ver tus servicios contratados
• Crear tickets de soporte
• Gestionar tu perfil y pagos
• Acceder a todas las funcionalidades del sistema

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.

¡Bienvenido!

Equipo de Soporte
${companySettings?.companyName || 'Sistema de Gestión de Cobros'}`;
  };

  const defaultMessage = generateDefaultMessage();

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
      
      // Si hay plantillas, buscar la de "Notificación de Activación" primero, sino la primera
      if (clientTemplates.length > 0 && !selectedTemplateId) {
        const activationTemplate = clientTemplates.find(t => 
          t.name.includes('Activación') || t.name.includes('activación')
        );
        if (activationTemplate) {
          setSelectedTemplateId(activationTemplate.id);
        } else {
          setSelectedTemplateId(clientTemplates[0].id);
        }
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
        
        const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
        const replacements = {
          '{clientName}': user?.fullName || user?.email || '',
          '{clientEmail}': user?.email || '',
          '{companyName}': companySettings?.companyName || 'Sistema de Gestión de Cobros',
          '{loginUrl}': loginUrl,
          '{clientPortalUrl}': loginUrl,
          '{resetPasswordUrl}': loginUrl + ' (El enlace se generará automáticamente)'
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

  // Resetear cuando se abre el modal, pero mantener la selección de plantilla si existe
  useEffect(() => {
    if (isOpen) {
      // No resetear selectedTemplateId aquí, se manejará en el otro useEffect
      // Solo resetear si no hay plantillas cargadas aún
      if (templates.length === 0) {
        setBody(defaultMessage);
        setSubject(defaultSubject);
        setSelectedTemplateId('');
      }
    }
  }, [isOpen, user, templates.length]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      addNotification("Por favor, complete el asunto y el mensaje", "error");
      return;
    }

    setLoading(true);
    try {
      console.log('📧 [USUARIOS] Enviando notificación de activación y reset de contraseña al usuario');
      
      // Generar enlace de reset de contraseña usando nuestro endpoint (sin exponer Firebase)
      let resetLink = null;
      try {
        const { generatePasswordResetLink } = await import('../../../utils/generateResetLink');
        resetLink = await generatePasswordResetLink(user.email);
        console.log('✅ Enlace de reset generado exitosamente');
      } catch (resetError) {
        console.error('Error generando enlace de reset:', resetError);
        // Si falla, intentar con Firebase directamente como fallback
        try {
          await sendPasswordResetEmail(auth, user.email, {
            url: `${window.location.origin}${window.location.pathname}`,
            handleCodeInApp: true
          });
          console.log('✅ Email de reset enviado por Firebase (fallback)');
        } catch (firebaseError) {
          console.error('Error con Firebase fallback:', firebaseError);
          addNotification('⚠️ No se pudo generar el enlace de restablecimiento. El email de notificación se enviará de todas formas.', "warning");
        }
      }
      
      // Cargar configuración de email
      await loadEmailConfig();
      
      // Preparar mensaje con instrucciones de creación de contraseña
      const loginUrl = `${window.location.origin}${window.location.pathname}`;
      let finalBody = body;
      
      // Si tenemos el enlace, incluirlo directamente en el mensaje
      if (resetLink) {
        // Reemplazar {resetPasswordUrl} si existe en la plantilla
        finalBody = finalBody.replace(/\{resetPasswordUrl\}/g, resetLink);
        
        // Si el mensaje no incluye el enlace, agregarlo
        if (!finalBody.includes(resetLink) && !finalBody.includes('{resetPasswordUrl}')) {
          const passwordInstructions = `\n\n🔐 CREAR O CAMBIAR TU CONTRASEÑA:\n\nPara acceder al sistema, necesitas crear o cambiar tu contraseña.\n\n📝 INSTRUCCIONES PASO A PASO:\n\n1. Haz clic en el siguiente enlace para crear/cambiar tu contraseña:\n   ${resetLink}\n\n2. En la página de restablecimiento, ingresa una contraseña segura (mínimo 6 caracteres)\n\n3. Confirma tu contraseña ingresándola nuevamente\n\n4. Haz clic en "Restablecer Contraseña"\n\n5. Una vez creada tu contraseña, serás redirigido automáticamente al inicio de sesión\n\n6. Inicia sesión con tu email (${user.email}) y la contraseña que acabas de crear\n\n⚠️ IMPORTANTE:\n- El enlace para crear/cambiar tu contraseña expirará en 1 hora\n- Si el enlace expira, puedes solicitar uno nuevo desde la página de inicio de sesión haciendo clic en "¿Olvidaste tu contraseña?"\n- Tu cuenta está activa y lista para usar una vez que crees tu contraseña`;
          
          finalBody += passwordInstructions;
        }
      } else {
        // Si no tenemos el enlace, agregar instrucciones genéricas
        const hasPasswordInstructions = finalBody.includes('contraseña') || finalBody.includes('password') || finalBody.includes('Password');
        const hasUrl = finalBody.includes(loginUrl) || finalBody.includes('{loginUrl}') || finalBody.includes('{resetPasswordUrl}');
        
        if (!hasPasswordInstructions || !hasUrl) {
          const passwordInstructions = `\n\n🔐 CREAR O CAMBIAR TU CONTRASEÑA:\n\nPara acceder al sistema, necesitas crear o cambiar tu contraseña usando el enlace que recibirás por correo.\n\n📝 INSTRUCCIONES PASO A PASO:\n\n1. Revisa tu correo electrónico (incluyendo la carpeta de spam)\n2. Busca un email con el asunto "Restablece tu contraseña"\n3. Haz clic en el enlace "Restablecer contraseña" dentro de ese email\n4. Serás redirigido a nuestro sistema en: ${loginUrl}\n5. En la página de restablecimiento, ingresa una contraseña segura (mínimo 6 caracteres)\n6. Confirma tu contraseña ingresándola nuevamente\n7. Haz clic en "Restablecer Contraseña"\n8. Una vez creada tu contraseña, serás redirigido automáticamente al inicio de sesión\n9. Inicia sesión con tu email (${user.email}) y la contraseña que acabas de crear\n\n⚠️ IMPORTANTE:\n- El enlace para crear/cambiar tu contraseña expirará en 1 hora\n- Si el enlace expira o no recibes el email, puedes solicitar uno nuevo desde la página de inicio de sesión haciendo clic en "¿Olvidaste tu contraseña?"\n- Tu cuenta está activa y lista para usar una vez que crees tu contraseña`;
          
          finalBody += passwordInstructions;
        }
      }
      
      // Enviar email usando el servicio
      await sendEmail({
        to: user.email,
        toName: user.fullName || user.email,
        subject: subject.trim(),
        html: finalBody.replace(/\n/g, '<br>'),
        text: finalBody,
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

      addNotification(`Notificación de activación y creación de contraseña enviadas a ${user.email}`, "success");
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

