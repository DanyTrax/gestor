# Módulo de Mensajería y Notificaciones - Documentación Completa

## 📋 Resumen

El módulo de mensajería centraliza toda la gestión de emails y notificaciones del sistema, permitiendo:
- Configurar el servidor SMTP desde donde se envían los correos
- Activar/desactivar notificaciones por módulo (admin y cliente)
- Ver historial completo de todos los mensajes enviados
- Probar la configuración de email

## 🎯 Características Implementadas

### 1. Historial de Mensajes
- ✅ Tabla completa de todos los correos generados por la plataforma
- ✅ Filtros por tipo, estado, destinatario y módulo
- ✅ Visualización de detalles completos de cada mensaje
- ✅ Columna "Módulo" que muestra de dónde proviene el email

### 2. Configuración de Email SMTP
- ✅ Configuración completa de servidor SMTP
- ✅ Campos: Host, Puerto, Usuario, Contraseña, Email/Nombre remitente
- ✅ Opción de conexión segura (SSL/TLS)
- ✅ Habilitar/deshabilitar servicio de email

### 3. Testeador de Email
- ✅ Envío de email de prueba
- ✅ Verificación de configuración SMTP
- ✅ Validación de campos antes de probar

### 4. Configuración de Notificaciones por Módulo

#### Módulos Configurables:

**Pagos (payments):**
- Admin: Aprobación, Rechazo, Nuevo pago recibido
- Cliente: Pago aprobado, Pago rechazado, Recordatorio de pago pendiente

**Servicios (services):**
- Admin: Recordatorio de vencimiento, Nuevo servicio creado
- Cliente: Recordatorio de vencimiento, Servicio activado, Servicio vencido

**Usuarios (users):**
- Admin: Nuevo usuario registrado, Activación de usuario

**Tickets:**
- Admin: Nuevo ticket creado, Actualización de ticket
- Cliente: Respuesta a ticket, Ticket resuelto

**Renovaciones (renewals):**
- Admin: Solicitud de renovación
- Cliente: Recordatorio de renovación, Renovación confirmada

## 📍 Ubicación

**Acceso:** Admin Dashboard → Pestaña "Mensajes" → 3 sub-pestañas:
1. **Historial de Mensajes** - Ver todos los emails enviados
2. **Configuración de Email** - Configurar SMTP
3. **Notificaciones por Módulo** - Activar/desactivar notificaciones

## 🔧 Configuración Inicial

### Paso 1: Configurar SMTP

1. Ve a **Mensajes** → **Configuración de Email**
2. Completa los campos:
   - **Servidor SMTP:** `smtp.gmail.com` (ejemplo Gmail)
   - **Puerto:** `587` (TLS) o `465` (SSL)
   - **Usuario:** Tu email
   - **Contraseña:** Contraseña de aplicación (para Gmail)
   - **Email Remitente:** `noreply@tuempresa.com`
   - **Nombre Remitente:** `Tu Empresa`
3. Marca "Habilitar servicio de email"
4. Click en **Guardar Configuración**

### Paso 2: Probar Configuración

1. En la misma sección, ingresa un email de prueba
2. Click en **Enviar Email de Prueba**
3. Revisa tu bandeja de entrada

### Paso 3: Configurar Notificaciones

1. Ve a **Mensajes** → **Notificaciones por Módulo**
2. Activa/desactiva las notificaciones según necesites
3. Click en **Guardar Configuración**

## 🔄 Integración con Módulos

El servicio de email está integrado en:

### ✅ Módulo de Pagos
- **Aprobación:** Cuando un pago se marca como "Completado", se envía email automáticamente
- **Rechazo:** Cuando un pago se marca como "Fallido" o "Cancelado", se envía email al cliente

### 📝 Próximas Integraciones
Los siguientes módulos pueden integrarse usando `sendEmail()`:

```javascript
import { sendEmail } from '../../../services/emailService';

await sendEmail({
  to: 'cliente@ejemplo.com',
  toName: 'Nombre Cliente',
  subject: 'Asunto del Email',
  html: '<p>Contenido HTML</p>',
  text: 'Contenido texto plano',
  type: 'Tipo de Mensaje',
  recipientType: 'Cliente', // o 'Administrador'
  module: 'payments', // 'services', 'users', 'tickets', 'renewals'
  event: 'approval', // evento específico del módulo
  metadata: { /* datos adicionales */ }
});
```

## 📊 Estructura de Datos

### Mensajes en Firestore
```javascript
{
  to: 'email@ejemplo.com',
  toName: 'Nombre',
  subject: 'Asunto',
  body: 'Contenido',
  type: 'Aprobación',
  recipientType: 'Cliente',
  status: 'Enviado',
  module: 'payments',
  event: 'approval',
  channel: 'email',
  sentAt: Timestamp,
  deliveredAt: Timestamp,
  readAt: Timestamp,
  metadata: { /* datos adicionales */ }
}
```

### Configuración de Email
```javascript
{
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: 'tu@email.com',
  smtpPassword: '****',
  fromEmail: 'noreply@empresa.com',
  fromName: 'Gestor de Cobros',
  enabled: true
}
```

### Configuración de Notificaciones
```javascript
{
  admin: {
    payments: { approval: true, rejection: true, newPayment: true },
    services: { expirationReminder: true, newService: true },
    // ... más módulos
  },
  client: {
    payments: { approval: true, rejection: true, pendingPayment: true },
    // ... más módulos
  }
}
```

## 🔒 Seguridad

- Las contraseñas SMTP se almacenan en Firestore (considera usar Firebase Functions para mayor seguridad)
- Las notificaciones se verifican antes de enviar
- Todos los emails se registran en Firestore para auditoría

## 📝 Notas Importantes

1. **SMTP Real:** Actualmente el servicio registra los mensajes en Firestore pero no envía emails reales. Para envío real, necesitarás implementar un backend (Firebase Functions o servidor Node.js) con nodemailer.

2. **Configuración Gmail:** 
   - Usa "Contraseñas de aplicación" (no tu contraseña normal)
   - Activa "Acceso de aplicaciones menos seguras" o usa OAuth2

3. **Historial:** Todos los emails (enviados, fallidos, cancelados) se registran en el historial para auditoría completa.

## 🚀 Próximos Pasos

Para implementar envío real de emails:
1. Crear Firebase Function o servidor Node.js
2. Usar nodemailer con la configuración SMTP
3. Llamar a la función desde el frontend o usar webhooks

El sistema ya está preparado para integrar el envío real fácilmente.

