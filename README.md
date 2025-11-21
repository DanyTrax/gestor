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

#### Opción 1: Build Local (Recomendado para cPanel)

```bash
# En tu computadora local
npm install
npm run build

# Subir dist/ + archivos PHP a cPanel
# (Ver docs/EJECUTAR-NPM-EN-CPANEL.md)
```

#### Opción 2: Build en Servidor (cPanel)

```bash
# Requiere Node.js instalado en cPanel
# Ver docs/EJECUTAR-NPM-EN-CPANEL.md para instrucciones completas
npm install
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

**⚠️ IMPORTANTE:** Ver `docs/EJECUTAR-NPM-EN-CPANEL.md` para instrucciones completas.

**Método Recomendado (Build Local):**
1. Hacer build localmente: `npm run build`
2. Subir `dist/` + archivos PHP (`send-email.php`, `upload.php`, `send-zoho.php`) a `public_html/`
3. Subir `.htaccess` a `public_html/`
4. Crear `uploads/` con permisos 775
5. Configurar permisos en `uploads/`

**Método Alternativo (Build en Servidor):**
1. Instalar Node.js en cPanel (ver documentación)
2. Subir todos los archivos del proyecto
3. Ejecutar `npm install` y `npm run build` desde Terminal de cPanel
4. Configurar servidor web para servir `dist/`
5. Configurar permisos en `uploads/`

## 📝 Notas

- El build se genera en `dist/`
- Los uploads se guardan en `uploads/`
- Las credenciales de Firebase deben estar en `src/config/firebase.js`
