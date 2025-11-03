# Migración Completa a Laravel - Plan Detallado

## 🎯 Objetivo

Migrar completamente el sistema actual (React + Firebase) a **Laravel MVC + API** manteniendo **TODAS** las funcionalidades actuales, migrando Firebase a MySQL/PostgreSQL.

## 📋 Funcionalidades Actuales (A Migrar)

### ✅ Módulos Identificados:
1. **Autenticación** (Firebase Auth → Laravel Auth)
2. **Usuarios** (CRUD completo)
3. **Servicios** (CRUD, renovaciones, vencimientos)
4. **Pagos** (CRUD, comprobantes, facturas PDF)
5. **Tickets** (Sistema completo)
6. **Mensajería** (SMTP, notificaciones, historial)
7. **Configuración** (Empresa, seguridad, branding)
8. **Plantillas** (Mensajes)
9. **Renovaciones** (Solicitudes y gestión)

## 🗄️ Estructura de Base de Datos Firebase → SQL

### Colecciones Firebase Actuales:

```
artifacts/{appId}/public/data/
├── users/{userId}
├── services/{serviceId}
├── payments/{paymentId}
├── tickets/{ticketId}
├── settings/
│   ├── company_info
│   ├── email_config
│   └── notification_settings
├── messageHistory/{messageId}
└── messageTemplates/{templateId}
```

### Tablas SQL Equivalentes:

```sql
-- Usuarios
users
- id (bigint, primary)
- email (string, unique)
- password (string, hashed)
- full_name (string)
- identification (string)
- role (enum: superadmin, admin, client)
- status (enum: active, inactive, pending)
- phone (string, nullable)
- address (text, nullable)
- created_at, updated_at
- is_profile_complete (boolean)
- requires_password_change (boolean)

-- Servicios
services
- id (bigint, primary)
- user_id (foreign key -> users)
- service_number (string, unique)
- service_name (string)
- service_type (string)
- service_description (text)
- currency (enum: COP, USD)
- amount (decimal)
- start_date (date)
- end_date (date)
- renewal_period (string)
- status (enum: activo, vencido, suspendido)
- auto_renew (boolean)
- created_at, updated_at

-- Pagos
payments
- id (bigint, primary)
- user_id (foreign key -> users)
- service_id (foreign key -> services)
- payment_number (string, unique)
- amount (decimal)
- currency (enum: COP, USD)
- gateway (string)
- payment_method (string)
- status (enum: Pendiente, Procesando, Completado, Fallido, Cancelado)
- proof_url (string, nullable)
- invoice_url (string, nullable)
- invoice_number (string, nullable)
- payment_date (datetime)
- created_at, updated_at

-- Tickets
tickets
- id (bigint, primary)
- user_id (foreign key -> users)
- ticket_number (string, unique)
- subject (string)
- status (enum: abierto, en_proceso, resuelto, cerrado)
- priority (enum: baja, media, alta, urgente)
- created_at, updated_at, closed_at (nullable)

-- Mensajes de Tickets
ticket_messages
- id (bigint, primary)
- ticket_id (foreign key -> tickets)
- user_id (foreign key -> users)
- message (text)
- attachment_url (string, nullable)
- is_admin (boolean)
- created_at, updated_at

-- Historial de Mensajes
message_history
- id (bigint, primary)
- to (string)
- to_name (string, nullable)
- subject (string)
- body (text)
- type (string)
- recipient_type (enum: admin, client)
- status (enum: Enviado, Fallido, Cancelado)
- module (string)
- event (string)
- metadata (json, nullable)
- sent_at (datetime, nullable)
- error_message (text, nullable)
- created_at, updated_at

-- Configuración de Email
email_config
- id (bigint, primary)
- smtp_host (string)
- smtp_port (integer)
- smtp_secure (boolean)
- smtp_user (string)
- smtp_password (string, encrypted)
- from_email (string)
- from_name (string)
- enabled (boolean)
- updated_at

-- Configuración de Notificaciones
notification_settings
- id (bigint, primary)
- role (enum: admin, client)
- module (string)
- event (string)
- enabled (boolean)
- created_at, updated_at

-- Configuración de Empresa
company_settings
- id (bigint, primary)
- company_name (string)
- identification (string)
- address (text)
- phone (string)
- email (string)
- website (string)
- logo_url (string, nullable)
- inactivity_timeout_minutes (integer, default: 10)
- created_at, updated_at

-- Plantillas de Mensajes
message_templates
- id (bigint, primary)
- name (string)
- type (string)
- subject (string)
- body (text)
- variables (json, nullable)
- created_at, updated_at
```

## 📁 Estructura Laravel Completa

```
gestor-cobros-laravel/
├── app/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Service.php
│   │   ├── Payment.php
│   │   ├── Ticket.php
│   │   ├── TicketMessage.php
│   │   ├── MessageHistory.php
│   │   ├── EmailConfig.php
│   │   ├── NotificationSetting.php
│   │   ├── CompanySetting.php
│   │   └── MessageTemplate.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Web/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── LoginController.php
│   │   │   │   │   └── RegisterController.php
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── UserController.php
│   │   │   │   │   ├── ServiceController.php
│   │   │   │   │   ├── PaymentController.php
│   │   │   │   │   ├── TicketController.php
│   │   │   │   │   ├── MessageController.php
│   │   │   │   │   ├── SettingsController.php
│   │   │   │   │   └── DashboardController.php
│   │   │   │   └── Client/
│   │   │   │       ├── PaymentController.php
│   │   │   │       ├── ServiceController.php
│   │   │   │       ├── TicketController.php
│   │   │   │       └── RenewalController.php
│   │   │   │
│   │   │   └── Api/
│   │   │       └── v1/
│   │   │           ├── AuthController.php
│   │   │           ├── UserController.php
│   │   │           ├── ServiceController.php
│   │   │           ├── PaymentController.php
│   │   │           └── TicketController.php
│   │   │
│   │   ├── Resources/
│   │   │   ├── UserResource.php
│   │   │   ├── ServiceResource.php
│   │   │   ├── PaymentResource.php
│   │   │   └── TicketResource.php
│   │   │
│   │   └── Middleware/
│   │       ├── CheckRole.php
│   │       └── CheckInactivity.php
│   │
│   ├── Services/
│   │   ├── EmailService.php
│   │   ├── PaymentService.php
│   │   ├── InvoiceService.php
│   │   └── NotificationService.php
│   │
│   └── Jobs/
│       └── SendEmailJob.php
│
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_users_table.php
│   │   ├── 2024_01_01_000002_create_services_table.php
│   │   ├── 2024_01_01_000003_create_payments_table.php
│   │   ├── 2024_01_01_000004_create_tickets_table.php
│   │   ├── 2024_01_01_000005_create_ticket_messages_table.php
│   │   ├── 2024_01_01_000006_create_message_history_table.php
│   │   ├── 2024_01_01_000007_create_email_config_table.php
│   │   ├── 2024_01_01_000008_create_notification_settings_table.php
│   │   ├── 2024_01_01_000009_create_company_settings_table.php
│   │   └── 2024_01_01_000010_create_message_templates_table.php
│   │
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── FirebaseDataSeeder.php (migración de datos)
│
├── routes/
│   ├── web.php (MVC)
│   └── api.php (API REST)
│
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   │   └── app.blade.php
│   │   ├── auth/
│   │   │   ├── login.blade.php
│   │   │   └── register.blade.php
│   │   ├── admin/
│   │   │   ├── dashboard.blade.php
│   │   │   ├── users/
│   │   │   ├── services/
│   │   │   ├── payments/
│   │   │   ├── tickets/
│   │   │   ├── messages/
│   │   │   └── settings/
│   │   └── client/
│   │       ├── dashboard.blade.php
│   │       ├── payments/
│   │       ├── services/
│   │       └── tickets/
│   │
│   └── js/ (opcional: Alpine.js para interactividad)
│
├── public/
│   ├── uploads/
│   │   ├── payments/
│   │   └── tickets/
│   └── invoices/
│
└── scripts/
    └── migrate-firebase-to-sql.php (script de migración)
```

## 🚀 Plan de Migración Paso a Paso

### Fase 1: Setup Inicial Laravel (1 semana)

1. **Instalar Laravel**
```bash
composer create-project laravel/laravel gestor-cobros-laravel
cd gestor-cobros-laravel
```

2. **Configurar Base de Datos**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestor_cobros
DB_USERNAME=root
DB_PASSWORD=
```

3. **Instalar Paquetes Necesarios**
```bash
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image
```

### Fase 2: Migraciones de Base de Datos (1 semana)

1. Crear todas las migraciones
2. Ejecutar migraciones
3. Crear relaciones entre tablas
4. Crear índices necesarios

### Fase 3: Modelos y Relaciones (1 semana)

1. Crear todos los modelos
2. Definir relaciones (User hasMany Services, etc.)
3. Definir accesores y mutadores
4. Definir scopes útiles

### Fase 4: Autenticación (3 días)

1. Migrar Firebase Auth → Laravel Auth
2. Crear Login/Register
3. Implementar middleware de roles
4. Implementar timeout de inactividad

### Fase 5: Módulo de Usuarios (1 semana)

1. CRUD de usuarios (web)
2. API REST de usuarios
3. Activación/desactivación
4. Cambio de contraseña

### Fase 6: Módulo de Servicios (1 semana)

1. CRUD de servicios
2. Renovaciones
3. Recordatorios de vencimiento
4. API REST

### Fase 7: Módulo de Pagos (1.5 semanas)

1. CRUD de pagos
2. Subida de comprobantes
3. Generación de facturas PDF
4. Aprobación/rechazo
5. Conversión de moneda (USD → COP)
6. API REST

### Fase 8: Módulo de Tickets (1 semana)

1. CRUD de tickets
2. Sistema de mensajes
3. Adjuntos
4. API REST

### Fase 9: Módulo de Mensajería (1 semana)

1. Configuración SMTP
2. Historial de mensajes
3. Configuración de notificaciones
4. Envío de emails
5. Plantillas

### Fase 10: Configuración (3 días)

1. Configuración de empresa
2. Configuración de seguridad
3. Branding

### Fase 11: Migración de Datos Firebase → SQL (1 semana)

1. Script para exportar datos de Firebase
2. Script para importar a MySQL
3. Migrar usuarios
4. Migrar servicios
5. Migrar pagos
6. Migrar tickets
7. Migrar configuraciones
8. Validar integridad de datos

### Fase 12: Testing y Ajustes (1 semana)

1. Testing de funcionalidades
2. Corrección de bugs
3. Optimización
4. Documentación

**Total estimado: 10-12 semanas**

## 📝 Script de Migración Firebase → SQL

### Concepto General:

```php
// scripts/migrate-firebase-to-sql.php

use App\Models\User;
use App\Models\Service;
use App\Models\Payment;
// ... otros modelos

// 1. Conectar a Firebase (usar SDK de Firebase Admin)
// 2. Obtener todos los documentos de cada colección
// 3. Convertir a formato SQL
// 4. Insertar en MySQL usando modelos Laravel
```

## 🔧 Configuraciones Necesarias

### .env
```env
APP_NAME="Gestor de Cobros"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://tu-dominio.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestor_cobros
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=mail.dvsystemsas.com
MAIL_PORT=465
MAIL_USERNAME=no_reply@dvsystemsas.com
MAIL_PASSWORD=
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=no_reply@dvsystemsas.com
MAIL_FROM_NAME="Gestor de Cobros"
```

## ✅ Checklist de Funcionalidades a Migrar

### Autenticación
- [ ] Login
- [ ] Registro
- [ ] Cambio de contraseña
- [ ] Timeout de inactividad
- [ ] Roles y permisos

### Usuarios
- [ ] Listar usuarios
- [ ] Crear usuario
- [ ] Editar usuario
- [ ] Eliminar usuario
- [ ] Activar/desactivar
- [ ] Perfil completo

### Servicios
- [ ] Listar servicios
- [ ] Crear servicio
- [ ] Editar servicio
- [ ] Eliminar servicio
- [ ] Renovaciones
- [ ] Recordatorios

### Pagos
- [ ] Listar pagos
- [ ] Crear pago
- [ ] Subir comprobante
- [ ] Aprobar/rechazar
- [ ] Generar factura PDF
- [ ] Conversión de moneda

### Tickets
- [ ] Crear ticket
- [ ] Responder ticket
- [ ] Adjuntar archivos
- [ ] Cerrar ticket
- [ ] Historial

### Mensajería
- [ ] Configuración SMTP
- [ ] Envío de emails
- [ ] Historial de mensajes
- [ ] Notificaciones
- [ ] Plantillas

### Configuración
- [ ] Configuración de empresa
- [ ] Configuración de seguridad
- [ ] Branding

## 🎯 Resultado Final

Al final tendrás:

1. ✅ **Laravel MVC** (sin compilación) - Web app completa
2. ✅ **API REST** - Para apps móviles
3. ✅ **MySQL/PostgreSQL** - Base de datos SQL
4. ✅ **Todas las funcionalidades** actuales
5. ✅ **Mejor rendimiento** y escalabilidad
6. ✅ **Mantenimiento más fácil**

## 📦 Paquetes Laravel Recomendados

- `laravel/sanctum` - Autenticación API
- `barryvdh/laravel-dompdf` - Generación de PDFs
- `intervention/image` - Manipulación de imágenes
- `spatie/laravel-permission` - Roles y permisos (opcional)
- `maatwebsite/excel` - Exportación de datos (opcional)

## 🚨 Consideraciones Importantes

1. **Migración de Contraseñas**: Las contraseñas de Firebase están hasheadas diferente. Necesitarás resetear todas las contraseñas o usar Firebase Auth durante la transición.

2. **Archivos**: Los archivos en Firebase Storage deben migrarse al sistema de archivos local o S3.

3. **Autenticación**: Puedes mantener Firebase Auth temporalmente o migrar completamente a Laravel Auth.

4. **Testing**: Probar cada módulo antes de migrar al siguiente.

## 📞 Próximos Pasos

1. Crear proyecto Laravel
2. Configurar base de datos
3. Crear migraciones
4. Crear modelos
5. Empezar con módulo de autenticación
6. Continuar módulo por módulo

¿Quieres que empiece a crear la estructura base de Laravel con las migraciones y modelos?

