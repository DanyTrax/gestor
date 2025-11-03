/**
 * Servicio centralizado para enviar emails
 * Sincroniza con la configuración de mensajería
 */

import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

// Variable para almacenar la configuración
let emailConfig = null;

/**
 * Cargar configuración de email desde Firestore
 */
export const loadEmailConfig = async () => {
  try {
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'email_config');
    const configDoc = await getDoc(configRef);
    
    if (configDoc.exists()) {
      emailConfig = configDoc.data();
      return emailConfig;
    }
    
    // Valores por defecto
    emailConfig = {
      smtpHost: '',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: '',
      enabled: false
    };
    
    return emailConfig;
  } catch (error) {
    console.error('Error loading email config:', error);
    return null;
  }
};

/**
 * Obtener configuración de notificaciones por módulo
 */
export const getNotificationSettings = async () => {
  try {
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'notification_settings');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return settingsDoc.data();
    }
    
    // Configuración por defecto: todas activas
    const defaultSettings = {
      // Notificaciones para Admin
      admin: {
        payments: {
          approval: true,
          rejection: true,
          newPayment: true
        },
        services: {
          expirationReminder: true,
          newService: true
        },
        users: {
          newUser: true,
          userActivation: true
        },
        tickets: {
          newTicket: true,
          ticketUpdate: true
        },
        renewals: {
          renewalRequest: true
        }
      },
      // Notificaciones para Cliente
      client: {
        payments: {
          approval: true,
          rejection: true,
          pendingPayment: true
        },
        services: {
          expirationReminder: true,
          serviceActivated: true,
          serviceExpired: true
        },
        tickets: {
          ticketReply: true,
          ticketResolved: true
        },
        renewals: {
          renewalReminder: true,
          renewalConfirmed: true
        }
      }
    };
    
    return defaultSettings;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return null;
  }
};

/**
 * Verificar si una notificación está habilitada
 */
export const isNotificationEnabled = async (role, module, event) => {
  const settings = await getNotificationSettings();
  if (!settings) return true; // Por defecto activo
  
  return settings[role]?.[module]?.[event] ?? true;
};

/**
 * Enviar email (función principal)
 */
export const sendEmail = async ({
  to,
  toName,
  subject,
  html,
  text,
  type = 'Notificación',
  recipientType = 'Cliente',
  module = 'system',
  event = 'notification',
  metadata = {}
}) => {
  try {
    // Verificar si el email está habilitado
    if (!emailConfig || !emailConfig.enabled) {
      console.warn('Email service not configured or disabled');
      
      // Aún registrar el mensaje en Firestore para historial
      await registerMessage({
        to,
        toName,
        subject,
        body: text || html,
        type,
        recipientType,
        status: 'Fallido',
        errorMessage: 'Servicio de email no configurado',
        module,
        event,
        metadata
      });
      
      return { success: false, error: 'Email service not configured' };
    }

    // Verificar notificaciones por módulo
    const notificationEnabled = await isNotificationEnabled(
      recipientType === 'Cliente' ? 'client' : 'admin',
      module,
      event
    );

    if (!notificationEnabled) {
      console.log(`Notification disabled: ${recipientType}/${module}/${event}`);
      
      // Registrar como deshabilitada
      await registerMessage({
        to,
        toName,
        subject,
        body: text || html,
        type,
        recipientType,
        status: 'Cancelado',
        errorMessage: 'Notificación deshabilitada por configuración',
        module,
        event,
        metadata
      });
      
      return { success: false, error: 'Notification disabled' };
    }

    // Aquí iría la lógica de envío real con SMTP
    // Por ahora, simulamos el envío y registramos en Firestore
    
    // TODO: Implementar envío real con nodemailer o similar
    // const result = await sendEmailViaSMTP({ to, subject, html, text });
    
    // Registrar mensaje exitoso
    const messageId = await registerMessage({
      to,
      toName,
      subject,
      body: text || html,
      type,
      recipientType,
      status: 'Enviado', // Cambiar a 'Entregado' cuando se implemente SMTP real
      module,
      event,
      metadata
    });

    return { success: true, messageId };
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Registrar error
    await registerMessage({
      to,
      toName,
      subject,
      body: text || html,
      type,
      recipientType,
      status: 'Fallido',
      errorMessage: error.message,
      module,
      event,
      metadata
    });
    
    return { success: false, error: error.message };
  }
};

/**
 * Registrar mensaje en Firestore
 */
const registerMessage = async (messageData) => {
  try {
    const messageRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
    const docRef = await addDoc(messageRef, {
      ...messageData,
      channel: 'email',
      sentAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error registering message:', error);
    return null;
  }
};

/**
 * Probar configuración de email
 */
export const testEmailConfig = async (testEmail) => {
  try {
    // Recargar configuración antes de probar
    await loadEmailConfig();
    
    if (!emailConfig || !emailConfig.enabled) {
      return { success: false, error: 'Email service not configured or disabled' };
    }

    if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.fromEmail) {
      return { success: false, error: 'Configuración SMTP incompleta. Verifica todos los campos.' };
    }

    const testSubject = 'Prueba de Configuración - Gestor de Cobros';
    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">Prueba de Configuración de Email</h2>
        <p>Este es un email de prueba para verificar la configuración SMTP.</p>
        <p><strong>Configuración:</strong></p>
        <ul>
          <li>Servidor: ${emailConfig.smtpHost}</li>
          <li>Puerto: ${emailConfig.smtpPort}</li>
          <li>Desde: ${emailConfig.fromEmail}</li>
        </ul>
        <p style="color: #059669; margin-top: 20px;">
          Si recibes este email, la configuración está funcionando correctamente.
        </p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Enviado desde Gestor de Cobros - ${new Date().toLocaleString('es-ES')}
        </p>
      </div>
    `;
    const testText = 'Prueba de Configuración de Email\n\nEste es un email de prueba para verificar la configuración SMTP.\n\nSi recibes este email, la configuración está funcionando correctamente.';

    // Enviar email de prueba
    const result = await sendEmail({
      to: testEmail,
      toName: 'Usuario de Prueba',
      subject: testSubject,
      html: testHtml,
      text: testText,
      type: 'Sistema',
      recipientType: 'Administrador',
      module: 'system',
      event: 'test',
      metadata: { isTest: true }
    });

    return result;
  } catch (error) {
    console.error('Error testing email:', error);
    return { success: false, error: error.message };
  }
};

// Cargar configuración al importar
loadEmailConfig().then(config => {
  emailConfig = config;
});

