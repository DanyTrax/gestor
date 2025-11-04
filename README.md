# Gestor de Cobros

Sistema de gestión de cobros y pagos con React + Firebase.

## 🚀 Tecnologías

- **Frontend:** React 18 + Vite
- **Backend:** Firebase (Firestore + Authentication)
- **Estilos:** Tailwind CSS
- **PDFs:** jsPDF
- **Email:** PHP + PHPMailer
- **Uploads:** PHP

## 📁 Estructura del Proyecto

```
gestor-cobros/
├── src/              ← Código fuente React
├── dist/             ← Build compilado (producción)
├── functions/        ← Firebase Functions
├── uploads/          ← Archivos subidos
├── send-email.php    ← Endpoint PHP para emails
├── upload.php        ← Endpoint PHP para uploads
├── firebase.json     ← Configuración Firebase
└── package.json      ← Dependencias npm
```

## 🛠️ Instalación

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
```

### Producción

```bash
# Compilar
npm run build

# Los archivos compilados estarán en dist/
# Configurar servidor web para servir dist/
```

## 🔧 Configuración

### Firebase

Configura las credenciales en `src/config/firebase.js`

### PHP (Emails y Uploads)

- `send-email.php` - Configuración SMTP en el código
- `upload.php` - Permisos de escritura en `uploads/`

## 📚 Documentación

La documentación está en el directorio `docs/`:
- Configuración de Firebase
- Configuración de SMTP
- Guías de despliegue
- etc.

## 🚀 Despliegue

### Docker

```bash
docker-compose up -d
```

### cPanel

1. Subir archivos a servidor
2. Ejecutar `npm run build`
3. Configurar servidor web para servir `dist/`
4. Configurar permisos en `uploads/`

## 📝 Notas

- El build se genera en `dist/`
- Los uploads se guardan en `uploads/`
- Las credenciales de Firebase deben estar en `src/config/firebase.js`
