# Integración Zoho Mail API - Documentación Técnica

## 🎯 Objetivo

Integrar Zoho Mail API como método alternativo de envío de emails, manteniendo compatibilidad con el sistema SMTP actual.

---

## 📋 Arquitectura de la Solución

### Diseño de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │      emailService.js (Servicio Unificado)        │   │
│  │  - Detecta proveedor configurado                 │   │
│  │  - Enruta a SMTP o Zoho Mail API                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (PHP Endpoints)                    │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │ send-email.php   │      │ send-zoho.php    │       │
│  │ (SMTP - Actual)  │      │ (Zoho API - New)│       │
│  └──────────────────┘      └──────────────────┘       │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        ▼                                     ▼
┌──────────────┐                    ┌──────────────┐
│   SMTP       │                    │ Zoho Mail    │
│   Server     │                    │   API        │
│ (PHPMailer)  │                    │ (REST API)   │
└──────────────┘                    └──────────────┘
```

---

## 🔧 Componentes a Modificar/Crear

### 1. Estructura de Configuración en Firestore

```javascript
{
  provider: 'smtp' | 'zoho',  // Nuevo campo
  enabled: true,
  
  // Configuración SMTP (existente)
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: '',
  smtpPassword: '',
  
  // Configuración Zoho Mail (nuevo)
  zohoClientId: '',
  zohoClientSecret: '',
  zohoRefreshToken: '',
  zohoAccessToken: '',  // Se renueva automáticamente
  zohoAccessTokenExpiry: null,
  zohoFromEmail: '',
  zohoFromName: '',
  
  // Configuración común
  fromEmail: '',
  fromName: ''
}
```

### 2. Flujo de Autenticación OAuth 2.0

```
1. Usuario registra app en Zoho Developer Console
2. Obtiene Client ID y Client Secret
3. Genera Refresh Token (una vez)
4. Sistema usa Refresh Token para obtener Access Token
5. Access Token se renueva automáticamente cuando expira
```

---

## 📝 Implementación

### Paso 1: Actualizar emailService.js
- Agregar detección de proveedor
- Enrutar según proveedor configurado
- Mantener compatibilidad con SMTP actual

### Paso 2: Crear send-zoho.php
- Endpoint PHP para Zoho Mail API
- Manejo de OAuth 2.0
- Renovación automática de tokens
- Envío de emails vía REST API

### Paso 3: Actualizar EmailConfigTab.jsx
- Selector de proveedor (SMTP / Zoho Mail)
- Campos condicionales según proveedor
- Validación específica por proveedor

### Paso 4: Actualizar estructura de datos
- Agregar campo `provider` a configuración
- Migrar datos existentes (default: 'smtp')

---

## 🔐 Seguridad

- **Tokens:** Almacenados en Firestore (encriptados en producción)
- **Refresh Token:** Se genera una vez, nunca expira (hasta revocación)
- **Access Token:** Se renueva automáticamente cada hora
- **Validación:** Verificar permisos antes de enviar

---

## 📊 Ventajas de Zoho Mail API

1. **No requiere servidor SMTP:** Envío directo vía API
2. **Mejor deliverability:** Zoho maneja reputación de dominio
3. **Analytics:** Tracking de emails enviados
4. **Escalabilidad:** Sin límites de conexiones SMTP
5. **Manejo de errores:** Respuestas más detalladas

---

## ⚠️ Consideraciones

- **Límites de API:** Zoho tiene límites de rate (consultar documentación)
- **Costo:** Puede requerir plan de Zoho Mail
- **Complejidad:** OAuth 2.0 más complejo que SMTP
- **Dependencia:** Requiere conexión a internet para API

---

## 🚀 Próximos Pasos

1. Implementar arquitectura base
2. Crear endpoint PHP para Zoho
3. Actualizar interfaz de configuración
4. Probar integración completa
5. Documentar proceso de configuración

