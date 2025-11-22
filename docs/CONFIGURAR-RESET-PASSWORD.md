# Configurar Sistema de Restablecimiento de Contraseña

## 📋 Descripción

Este sistema genera enlaces de restablecimiento de contraseña desde la plataforma, sin exponer que Firebase es el proveedor de autenticación. Los enlaces se incluyen directamente en los emails personalizados de la plataforma.

## 🔧 Requisitos

1. **Firebase Admin SDK para PHP** (Kreait\Firebase)
2. **Archivo de credenciales de Firebase Admin SDK**

## 📦 Instalación

### Paso 1: Instalar Firebase Admin SDK

En el servidor, en el directorio raíz del proyecto:

```bash
cd ~/clients.dowgroupcol.com
composer require kreait/firebase-php
```

### Paso 2: Obtener Credenciales de Firebase Admin SDK

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Configuración del proyecto** (ícono de engranaje)
4. Ve a la pestaña **Cuentas de servicio**
5. Haz clic en **Generar nueva clave privada**
6. Descarga el archivo JSON
7. Renómbralo a `firebase-credentials.json`
8. Súbelo al servidor en: `~/clients.dowgroupcol.com/firebase-credentials.json`

**⚠️ IMPORTANTE:** Este archivo contiene credenciales sensibles. Asegúrate de:
- No subirlo al repositorio Git (debe estar en `.gitignore`)
- Configurar permisos restrictivos: `chmod 600 firebase-credentials.json`
- Mantenerlo seguro y no compartirlo

### Paso 3: Verificar que el archivo existe

```bash
cd ~/clients.dowgroupcol.com
ls -la firebase-credentials.json
```

Deberías ver el archivo con permisos `-rw-------` (600).

## ✅ Verificación

### Probar el endpoint manualmente

```bash
curl -X POST https://clients.dowgroupcol.com/generate-reset-link.php \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com"}'
```

Deberías recibir una respuesta JSON con:
```json
{
  "success": true,
  "resetLink": "https://clients.dowgroupcol.com/?oobCode=...",
  "email": "usuario@ejemplo.com"
}
```

## 🔄 Flujo de Funcionamiento

1. **Usuario nuevo creado con notificación:**
   - El sistema llama a `generate-reset-link.php`
   - El endpoint genera el enlace usando Firebase Admin SDK
   - El enlace se incluye directamente en el email personalizado
   - El usuario recibe UN SOLO email de la plataforma con el enlace

2. **Notificación de activación:**
   - Similar al anterior, el enlace se genera y se incluye en el email personalizado
   - El usuario puede editar el mensaje antes de enviarlo

3. **Fallback:**
   - Si el endpoint PHP falla, el sistema usa Firebase directamente como respaldo
   - En este caso, el usuario recibirá el email de Firebase además del personalizado

## 🐛 Troubleshooting

### Error: "firebase-credentials.json no encontrado"

**Solución:**
1. Verifica que el archivo existe en la raíz del proyecto
2. Verifica los permisos: `chmod 600 firebase-credentials.json`
3. Verifica la ruta en `generate-reset-link.php`

### Error: "Class 'Kreait\Firebase\Factory' not found"

**Solución:**
```bash
cd ~/clients.dowgroupcol.com
composer install
# O si no existe composer.json:
composer require kreait/firebase-php
```

### Error: "Permission denied" al acceder al archivo

**Solución:**
```bash
chmod 600 firebase-credentials.json
chown tu-usuario:tu-grupo firebase-credentials.json
```

### El enlace no funciona

**Verifica:**
1. Que el dominio esté autorizado en Firebase Console
2. Que el enlace no haya expirado (válido por 1 hora)
3. Que la URL base en el endpoint sea correcta

## 📝 Notas

- Los enlaces generados son válidos por **1 hora**
- El sistema usa Firebase Admin SDK solo en el backend
- Los usuarios no ven referencias a Firebase en los emails
- El branding es completamente de la plataforma

