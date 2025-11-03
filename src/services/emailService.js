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

    // Enviar email real usando el endpoint PHP
    try {
      const response = await fetch('/send-email.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          toName,
          subject,
          html,
          text,
          smtpConfig: {
            smtpHost: emailConfig.smtpHost,
            smtpPort: emailConfig.smtpPort,
            smtpSecure: emailConfig.smtpSecure,
            smtpUser: emailConfig.smtpUser,
            smtpPassword: emailConfig.smtpPassword,
            fromEmail: emailConfig.fromEmail,
            fromName: emailConfig.fromName
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        // Registrar mensaje como enviado exitosamente
        const messageId = await registerMessage({
          to,
          toName,
          subject,
          body: text || html,
          type,
          recipientType,
          status: 'Enviado',
          module,
          event,
          metadata
        });

        return { success: true, messageId, sent: true };
      } else {
        // Error al enviar
        const messageId = await registerMessage({
          to,
          toName,
          subject,
          body: text || html,
          type,
          recipientType,
          status: 'Fallido',
          errorMessage: result.error || 'Error desconocido al enviar email',
          module,
          event,
          metadata
        });

        return { success: false, error: result.error || 'Error al enviar email', messageId };
      }
    } catch (fetchError) {
      // Error de conexión o red
      console.error('Error al llamar a send-email.php:', fetchError);
      
      const messageId = await registerMessage({
        to,
        toName,
        subject,
        body: text || html,
        type,
        recipientType,
        status: 'Fallido',
        errorMessage: `Error de conexión: ${fetchError.message}`,
        module,
        event,
        metadata
      });

      return { success: false, error: `Error de conexión: ${fetchError.message}`, messageId };
    }
    
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

    const testSubject = '✅ Prueba de Configuración - Gestor de Cobros';
    const testDate = new Date().toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
    
    const testHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .success-badge { display: inline-block; background-color: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
          .info-box { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .config-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .config-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .config-table td:first-child { font-weight: bold; color: #374151; width: 40%; }
          .config-table td:last-child { color: #6b7280; font-family: monospace; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .highlight { background-color: #fef3c7; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">📧 Prueba de Configuración</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Gestor de Cobros - Sistema de Email</p>
          </div>
          
          <div class="content">
            <div class="success-badge">✅ Configuración Exitosa</div>
            
            <h2 style="color: #1f2937; margin-top: 0;">¡Email de Prueba Enviado Correctamente!</h2>
            
            <p>Este es un email de prueba para verificar que tu configuración SMTP está funcionando correctamente.</p>
            
            <div class="info-box">
              <strong>📌 Información Importante:</strong><br>
              Si recibiste este email, significa que tu servidor SMTP está configurado y funcionando perfectamente.
              Los emails del sistema ahora se enviarán realmente a tus clientes y administradores.
            </div>
            
            <h3 style="color: #374151; margin-top: 30px;">🔧 Detalles de Configuración SMTP</h3>
            
            <table class="config-table">
              <tr>
                <td>Servidor SMTP:</td>
                <td><span class="highlight">${emailConfig.smtpHost || 'No configurado'}</span></td>
              </tr>
              <tr>
                <td>Puerto:</td>
                <td><span class="highlight">${emailConfig.smtpPort || 'No configurado'}</span></td>
              </tr>
              <tr>
                <td>Seguridad:</td>
                <td><span class="highlight">${emailConfig.smtpSecure ? 'SSL/TLS ✓' : 'No seguro'}</span></td>
              </tr>
              <tr>
                <td>Usuario SMTP:</td>
                <td><span class="highlight">${emailConfig.smtpUser || 'No configurado'}</span></td>
              </tr>
              <tr>
                <td>Email Remitente:</td>
                <td><span class="highlight">${emailConfig.fromEmail || 'No configurado'}</span></td>
              </tr>
              <tr>
                <td>Nombre Remitente:</td>
                <td><span class="highlight">${emailConfig.fromName || 'No configurado'}</span></td>
              </tr>
            </table>
            
            <h3 style="color: #374151; margin-top: 30px;">📊 Información del Envío</h3>
            
            <table class="config-table">
              <tr>
                <td>Destinatario:</td>
                <td><span class="highlight">${testEmail}</span></td>
              </tr>
              <tr>
                <td>Fecha y Hora:</td>
                <td>${testDate}</td>
              </tr>
              <tr>
                <td>Estado:</td>
                <td><strong style="color: #10b981;">✓ Enviado Exitosamente</strong></td>
              </tr>
            </table>
            
            <div class="info-box" style="background-color: #f0fdf4; border-left-color: #10b981; margin-top: 30px;">
              <strong>✨ Próximos Pasos:</strong><br>
              <ul style="margin: 10px 0 0 20px; padding-left: 0;">
                <li>Verifica que este email llegó correctamente (revisa también spam)</li>
                <li>Los emails del sistema ahora se enviarán automáticamente</li>
                <li>Puedes verificar el historial de mensajes en el panel de administración</li>
                <li>Si necesitas cambiar la configuración, ve a <strong>Mensajes → Configuración de Email</strong></li>
              </ul>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">
                <strong>Gestor de Cobros</strong><br>
                Sistema de Gestión de Servicios y Pagos<br>
                ${new Date().getFullYear()} © Todos los derechos reservados
              </p>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #9ca3af;">
                Este es un email automático del sistema. Por favor, no respondas a este mensaje.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const testText = `
═══════════════════════════════════════════════════════
  PRUEBA DE CONFIGURACIÓN - GESTOR DE COBROS
═══════════════════════════════════════════════════════

¡Email de Prueba Enviado Correctamente!

Este es un email de prueba para verificar que tu configuración SMTP está funcionando correctamente.

📌 INFORMACIÓN IMPORTANTE:
───────────────────────────────────────────────────────
Si recibiste este email, significa que tu servidor SMTP está configurado y funcionando perfectamente. Los emails del sistema ahora se enviarán realmente a tus clientes y administradores.

🔧 DETALLES DE CONFIGURACIÓN SMTP:
───────────────────────────────────────────────────────
Servidor SMTP: ${emailConfig.smtpHost || 'No configurado'}
Puerto: ${emailConfig.smtpPort || 'No configurado'}
Seguridad: ${emailConfig.smtpSecure ? 'SSL/TLS ✓' : 'No seguro'}
Usuario SMTP: ${emailConfig.smtpUser || 'No configurado'}
Email Remitente: ${emailConfig.fromEmail || 'No configurado'}
Nombre Remitente: ${emailConfig.fromName || 'No configurado'}

📊 INFORMACIÓN DEL ENVÍO:
───────────────────────────────────────────────────────
Destinatario: ${testEmail}
Fecha y Hora: ${testDate}
Estado: ✓ Enviado Exitosamente

✨ PRÓXIMOS PASOS:
───────────────────────────────────────────────────────
• Verifica que este email llegó correctamente (revisa también spam)
• Los emails del sistema ahora se enviarán automáticamente
• Puedes verificar el historial de mensajes en el panel de administración
• Si necesitas cambiar la configuración, ve a Mensajes → Configuración de Email

───────────────────────────────────────────────────────
Gestor de Cobros
Sistema de Gestión de Servicios y Pagos
${new Date().getFullYear()} © Todos los derechos reservados

Este es un email automático del sistema. Por favor, no respondas a este mensaje.
═══════════════════════════════════════════════════════
    `;

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

