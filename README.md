# Gestor de Cobros - Sistema Modular

Sistema de gestión de cobros y pagos refactorizado con una arquitectura modular para mejor mantenibilidad y escalabilidad.

## Estructura del Proyecto

```
src/
├── components/
│   ├── admin/
│   │   ├── services/
│   │   │   ├── AdminServicesDashboard.jsx
│   │   │   ├── ServiceModal.jsx
│   │   │   └── ManualReminderModal.jsx
│   │   ├── users/
│   │   │   ├── AdminUsersDashboard.jsx
│   │   │   ├── UserModal.jsx
│   │   │   └── CreateUserModal.jsx
│   │   └── settings/
│   │       └── AdminSettingsDashboard.jsx
│   ├── auth/
│   │   ├── AuthPage.jsx
│   │   └── PasswordChangeModal.jsx
│   ├── common/
│   │   └── ActionDropdown.jsx
│   ├── dashboard/
│   │   ├── AdminDashboard.jsx
│   │   └── ClientDashboard.jsx
│   └── icons/
│       └── index.jsx
├── config/
│   └── firebase.js
├── contexts/
│   └── NotificationContext.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Módulos Principales

### 1. Configuración (config/)
- **firebase.js**: Configuración de Firebase y exportación de servicios

### 2. Contextos (contexts/)
- **NotificationContext.jsx**: Sistema de notificaciones global

### 3. Componentes Comunes (components/common/)
- **ActionDropdown.jsx**: Dropdown reutilizable para acciones

### 4. Iconos (components/icons/)
- **index.jsx**: Todos los iconos SVG del sistema

### 5. Autenticación (components/auth/)
- **AuthPage.jsx**: Página de login/registro
- **PasswordChangeModal.jsx**: Modal para cambio de contraseña

### 6. Dashboard de Administrador (components/admin/)
- **services/**: Gestión de servicios
- **users/**: Gestión de usuarios
- **settings/**: Configuración de la empresa

### 7. Dashboards (components/dashboard/)
- **AdminDashboard.jsx**: Dashboard principal para administradores
- **ClientDashboard.jsx**: Dashboard para clientes

## Características

- ✅ Arquitectura modular y escalable
- ✅ Separación de responsabilidades
- ✅ Componentes reutilizables
- ✅ Context API para estado global
- ✅ Configuración centralizada de Firebase
- ✅ Sistema de notificaciones
- ✅ Modo demo integrado
- ✅ Responsive design con Tailwind CSS

## Instalación

```bash
npm install
npm run dev
```

## Tecnologías

- React 18
- Firebase (Auth + Firestore)
- Tailwind CSS
- Vite

## Próximos Pasos

- [ ] Implementar módulos de plantillas de mensajes
- [ ] Completar módulo de historial de mensajes
- [ ] Desarrollar sistema de tickets
- [ ] Añadir tests unitarios
- [ ] Implementar TypeScript
- [ ] Añadir documentación de API







