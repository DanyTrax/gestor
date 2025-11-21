# 📁 Resumen Completo de la Estructura del Proyecto

## 🎯 Gestor de Cobros - Sistema de Gestión de Servicios y Pagos

**Versión:** 1.0.0  
**Stack Principal:** React 18 + Vite + Firebase + PHP  
**Fecha de Resumen:** 2024

---

## 📊 Estructura General del Proyecto

```
gestor-cobros/
├── 📂 src/                    # Código fuente React (Frontend)
├── 📂 docs/                   # Documentación completa (70+ archivos)
├── 📂 scripts/                # Scripts de utilidad y automatización
├── 📂 functions/              # Firebase Functions
├── 📂 shared/                 # Recursos compartidos
├── 📄 Archivos de configuración
├── 📄 Archivos PHP (Backend)
└── 📄 Documentación raíz
```

---

## 🎨 Frontend (React + Vite)

### 📂 `src/` - Código Fuente Principal

#### **Archivos Principales:**
- `App.jsx` - Componente principal de la aplicación
- `main.jsx` - Punto de entrada de React
- `index.css` - Estilos globales
- `App-backup.jsx`, `App-new.jsx`, `App-old.jsx` - Versiones de respaldo

#### **📂 `src/components/` - Componentes React (41 archivos .jsx)**

**Admin Components (Panel de Administración):**
- `admin/messages/` - Sistema de mensajería
  - `AdminMessagesDashboard.jsx` - Dashboard principal de mensajes
  - `EmailConfigTab.jsx` - Configuración de email (SMTP/Zoho)
  - `NotificationSettingsTab.jsx` - Configuración de notificaciones
  
- `admin/payments/` - Gestión de pagos
  - `AdminPaymentsDashboard.jsx` - Dashboard de pagos
  - `PaymentConfigDashboard.jsx` - Configuración de pagos
  - `PaymentMessageModal.jsx` - Modal de mensajes de pago
  - `RenewalConfigDashboard.jsx` - Configuración de renovaciones
  
- `admin/services/` - Gestión de servicios
  - `AdminServicesDashboard.jsx` - Dashboard de servicios
  - `ServiceModal.jsx` - Modal de servicios
  - `ManualReminderModal.jsx` - Recordatorios manuales
  
- `admin/users/` - Gestión de usuarios
  - `AdminUsersDashboard.jsx` - Dashboard de usuarios
  - `CreateUserModal.jsx` - Crear usuario
  - `UserModal.jsx` - Editar usuario
  - `UserActivationModal.jsx` - Activar/desactivar usuarios
  
- `admin/tickets/` - Sistema de tickets
  - `AdminTicketsDashboard.jsx` - Dashboard de tickets
  
- `admin/settings/` - Configuración general
  - `AdminSettingsDashboard.jsx` - Panel de configuración
  
- `admin/templates/` - Plantillas
  - `AdminTemplatesDashboard.jsx` - Gestión de plantillas

**Client Components (Panel de Cliente):**
- `client/ClientPaymentsDashboard.jsx` - Pagos del cliente
- `client/ClientServicesDashboard.jsx` - Servicios del cliente
- `client/ClientTicketsDashboard.jsx` - Tickets del cliente
- `client/ClientRenewalDashboard.jsx` - Renovaciones del cliente

**Auth Components (Autenticación):**
- `auth/AuthPage.jsx` - Página de login
- `auth/InitialSetupModal.jsx` - Configuración inicial
- `auth/PasswordChangeModal.jsx` - Cambio de contraseña
- `auth/CompleteProfileModal.jsx` - Completar perfil
- `auth/TestModeLogin.jsx` - Modo de prueba

**Common Components (Comunes):**
- `common/ActionDropdown.jsx` - Dropdown de acciones
- `common/PaymentConfirmationModal.jsx` - Confirmación de pago

**Dashboard Components:**
- `dashboard/AdminDashboard.jsx` - Dashboard principal admin
- `dashboard/ClientDashboard.jsx` - Dashboard principal cliente

**Otros:**
- `debug/FirebaseDebugger.jsx` - Herramientas de debug
- `icons/index.jsx` - Iconos del sistema
- `payments/BankTransferInstructions.jsx` - Instrucciones de transferencia
- `setup/InitialSetup.jsx` - Configuración inicial
- `tickets/TicketMessagesHistory.jsx` - Historial de mensajes de tickets

#### **📂 `src/services/` - Servicios**
- `emailService.js` - Servicio de email (SMTP + Zoho Mail API)

#### **📂 `src/utils/` - Utilidades (10 archivos .js)**
- `alertSystem.js` - Sistema de alertas
- `authCheck.js` - Verificación de autenticación
- `createTestUsers.js` - Crear usuarios de prueba
- `deleteUser.js` - Eliminar usuario
- `deleteUserAuth.js` - Eliminar autenticación
- `firebaseDebug.js` - Debug de Firebase
- `firebaseDiagnostic.js` - Diagnóstico de Firebase

#### **📂 `src/config/` - Configuración**
- `firebase.js` - Configuración de Firebase

#### **📂 `src/contexts/` - Contextos React**
- `NotificationContext.jsx` - Contexto de notificaciones

#### **📂 `src/hooks/` - Custom Hooks**
- `useInactivityTimeout.js` - Hook de timeout por inactividad

---

## 🔧 Backend (PHP)

### **Archivos PHP en Raíz:**
- `send-email.php` - Endpoint para envío de emails vía SMTP
- `send-zoho.php` - Endpoint para envío de emails vía Zoho Mail API
- `upload.php` - Endpoint para subida de archivos
- `generate-zoho-token.php` - Script helper para generar tokens de Zoho

### **📂 `shared/` - Recursos Compartidos**
- `shared/invoices/` - Facturas generadas

---

## 🐳 Docker & Despliegue

### **Archivos de Docker:**
- `Dockerfile` - Imagen Docker multi-stage (Node 20 + PHP 8.2 + Apache)
- `docker-compose.yml` - Configuración de Docker Compose
- `docker-compose-git.yml` - Variante para Git Repository
- `.htaccess` - Configuración de Apache para SPA routing

### **Configuración:**
- `composer.json` - Dependencias PHP (PHPMailer)
- `package.json` - Dependencias Node.js
- `vite.config.js` - Configuración de Vite
- `tailwind.config.js` - Configuración de Tailwind CSS
- `postcss.config.js` - Configuración de PostCSS

---

## 🔥 Firebase

### **📂 `functions/` - Firebase Functions**
- `index.js` - Funciones de Firebase
- `package.json` - Dependencias de Functions

### **Archivos de Configuración:**
- `firebase.json` - Configuración de Firebase
- `firebase-rules.txt` - Reglas de Firestore (completo)
- `firebase-rules-simple.txt` - Reglas simplificadas

---

## 📚 Documentación

### **📂 `docs/` - 70+ Archivos de Documentación**

#### **Despliegue y Docker:**
- `DOCKGE-COMPONER-PASO-A-PASO.md` - Guía paso a paso Dockge
- `DOCKGE-ERROR-DOCKERFILE-NOT-FOUND.md` - Solución de errores
- `DOCKGE-INSTALACION.md` - Instalación en Dockge
- `DOCKGE-PASO-A-PASO.md` - Guía detallada
- `DOCKGE-RESETEAR-COMPLETO.md` - Resetear stack
- `DOCKGE-SETUP.md` - Configuración inicial
- `DOCKGE-UPDATE.md` - Actualizar stack
- `GUIA-DOCKGE-COMPLETA.md` - Guía completa

#### **Integración Zoho Mail:**
- `GUIA-CONFIGURACION-ZOHO.md` - Configurar Zoho Mail API
- `INTEGRACION-ZOHO-MAIL.md` - Documentación técnica

#### **Mensajería:**
- `MODULO-MENSAJERIA.md` - Documentación del módulo
- `CONFIGURAR-CPANEL-SMTP.md` - Configurar SMTP en cPanel
- `SOLUCION-AUTENTICACION-SMTP.md` - Solución de problemas SMTP
- `INSTALAR-PHPMailer.md` - Instalar PHPMailer

#### **Laravel (Migración Futura):**
- `MIGRACION-LARAVEL-COMPLETA.md` - Migración completa
- `ESTRATEGIA-MIGRACION-DATOS.md` - Estrategia de migración
- `LARAVEL-API-ARCHITECTURE.md` - Arquitectura Laravel
- `INSTALAR-LARAVEL-CPANEL.md` - Instalar Laravel en cPanel
- `INSTALAR-LARAVEL-LOCAL.md` - Instalar Laravel localmente
- Y 20+ archivos más relacionados con Laravel

#### **Solución de Problemas:**
- `SOLUCION-PHP-8.1.md` - Problemas con PHP 8.1
- `SOLUCION-ERROR-255.md` - Error 255
- `DEBUG-ERROR-500.md` - Debug error 500
- `VERIFICAR-PHP.md` - Verificar PHP
- Y más...

#### **Estructura y Organización:**
- `ESTRUCTURA-FINAL.md` - Estructura final del proyecto
- `ESTRUCTURA-PROYECTO.md` - Estructura del proyecto
- `ESTRATEGIA-MIGRACION-DATOS.md` - Estrategia de migración

### **📄 Documentación en Raíz:**
- `README.md` - Documentación principal
- `DOCKGE-RESUMEN-RAPIDO.md` - Resumen rápido Dockge
- `INTEGRACION-ZOHO-COMPLETA.md` - Resumen integración Zoho
- `PLAN-PRUEBAS-COMPLETO.md` - Plan de pruebas
- `RESULTADOS-PRUEBAS.md` - Resultados de pruebas
- `RESUMEN-REVISION-COMPLETA.md` - Resumen de revisión
- `ESTRUCTURA-FINAL.md` - Estructura final

---

## 🛠️ Scripts de Utilidad

### **📂 `scripts/` - Scripts de Automatización**
- `setup-laravel.sh` - Configurar Laravel
- `setup-laravel-cpanel.sh` - Configurar Laravel en cPanel
- `setup-laravel-local.sh` - Configurar Laravel localmente
- `install-laravel-complete.sh` - Instalación completa Laravel
- `reinstalar-laravel-completo.sh` - Reinstalar Laravel
- `crear-bootstrap-laravel10.sh` - Crear bootstrap Laravel 10
- `restaurar-estructura-original.sh` - Restaurar estructura
- `verificar-bootstrap.sh` - Verificar bootstrap
- `verificar-extensiones-php.sh` - Verificar extensiones PHP
- `migrate-firebase-to-sql.php` - Migrar datos Firebase a SQL
- `crear-tabla-sessions.sql` - Crear tabla de sesiones

### **Scripts en Raíz:**
- `setup.sh` - Script de configuración inicial
- `organize-structure.sh` - Organizar estructura
- `webhook-setup.sh` - Configurar webhooks
- `webhook-server.js` - Servidor de webhooks

---

## 📦 Dependencias Principales

### **Frontend (package.json):**
- **React 18.2.0** - Framework UI
- **Vite 5.0.8** - Build tool
- **Firebase 10.7.1** - Backend (Firestore + Auth)
- **jsPDF 3.0.3** - Generación de PDFs
- **Tailwind CSS 3.3.6** - Framework CSS

### **Backend (composer.json):**
- **PHPMailer 6.9** - Envío de emails SMTP

---

## 🎯 Funcionalidades Principales

### **1. Gestión de Usuarios**
- Autenticación con Firebase
- Roles: Superadmin, Admin, Cliente
- Activación/desactivación de usuarios
- Cambio de contraseña forzado
- Timeout por inactividad

### **2. Gestión de Pagos**
- Registro de pagos
- Aprobación/Rechazo
- Notificaciones automáticas
- Instrucciones de transferencia bancaria
- Historial completo

### **3. Gestión de Servicios**
- Crear/editar servicios
- Asignación a clientes
- Recordatorios de expiración
- Renovaciones

### **4. Sistema de Tickets**
- Creación de tickets
- Mensajería entre admin y cliente
- Historial completo
- Estados de tickets

### **5. Sistema de Mensajería**
- **SMTP** - Método tradicional
- **Zoho Mail API** - Método alternativo (nuevo)
- Configuración por proveedor
- Notificaciones por módulo
- Historial de mensajes

### **6. Configuración**
- Configuración de empresa
- Plantillas personalizables
- Configuración de notificaciones
- Configuración de email

---

## 🚀 Métodos de Despliegue

### **1. Docker (Dockge) - Recomendado**
- Multi-stage build
- Node 20 + PHP 8.2 + Apache
- Volúmenes persistentes
- Auto-build desde Git

### **2. cPanel**
- Build manual
- Subida de archivos
- Configuración PHP

### **3. Desarrollo Local**
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción

---

## 📊 Estadísticas del Proyecto

- **Total de Componentes React:** 41 archivos .jsx
- **Total de Utilidades:** 10 archivos .js
- **Total de Documentación:** 70+ archivos .md
- **Scripts de Automatización:** 11 scripts
- **Endpoints PHP:** 4 archivos
- **Configuraciones:** 10+ archivos

---

## 🔐 Seguridad

- Autenticación Firebase
- Roles y permisos
- Validación de datos
- Protección de endpoints PHP
- Reglas de Firestore configuradas

---

## 📝 Notas Importantes

1. **Estructura Monorepo:** El proyecto está preparado para migración a Laravel (directorio `new/` futuro)

2. **Compatibilidad:** El sistema mantiene 100% compatibilidad hacia atrás con SMTP mientras soporta Zoho Mail API

3. **Documentación:** Extensa documentación para todos los aspectos del proyecto

4. **Docker:** Configuración optimizada para despliegue en Dockge

5. **Firebase:** Sistema actual, con plan de migración a SQL/Laravel

---

## 🎉 Estado Actual

✅ **Sistema Funcional Completo**
- Frontend React funcionando
- Backend Firebase configurado
- Sistema de email dual (SMTP + Zoho)
- Documentación completa
- Docker configurado
- Listo para producción

---

**Última Actualización:** 2024  
**Versión:** 1.0.0  
**Mantenido por:** DvSystemS

