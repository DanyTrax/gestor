# Verificar que send-email.php esté funcionando

## Problema

Si ves el mensaje "⚠️ Email SIMULADO" en producción (cPanel), significa que el endpoint PHP no está funcionando correctamente.

## Verificación Rápida

### 1. Verificar que el archivo existe

En cPanel, verifica que `send-email.php` esté en el mismo directorio que `index.html`:

```
public_html/
├── index.html
├── send-email.php  ← Debe estar aquí
├── upload.php
└── assets/
```

### 2. Verificar que PHPMailer esté instalado

Abre el Terminal de cPanel o SSH y ejecuta:

```bash
cd public_html  # o tu directorio web
ls -la vendor/autoload.php
```

Si no existe, instala PHPMailer:

```bash
composer require phpmailer/phpmailer
```

### 3. Probar el endpoint directamente

Abre tu navegador y visita:

```
https://tu-dominio.com/send-email.php
```

**Esperado:** Deberías ver un error JSON que dice "Campo requerido faltante" (esto es normal, significa que PHP está funcionando).

**Si ves HTML o página en blanco:** PHP no está configurado correctamente o el archivo no existe.

### 4. Verificar permisos

```bash
chmod 644 send-email.php
chmod 755 public_html
```

### 5. Verificar logs de PHP

En cPanel, ve a:
- **Errores** → **Registros de Errores**
- Busca errores relacionados con `send-email.php`

O revisa el log de Apache:
```bash
tail -f /var/log/apache2/error.log
```

### 6. Verificar versión de PHP

En cPanel, verifica que PHP sea 7.4 o superior:
- **Select PHP Version** → Selecciona PHP 7.4 o superior

## Solución de Problemas Comunes

### Error: "El archivo send-email.php no se encontró (404)"

**Solución:**
1. Sube `send-email.php` al directorio raíz de tu sitio web
2. Asegúrate de que esté en la misma ubicación que `index.html`

### Error: "Class 'PHPMailer\PHPMailer\PHPMailer' not found"

**Solución:**
```bash
cd public_html
composer require phpmailer/phpmailer
```

### Error: "El servidor devolvió HTML en lugar de JSON"

**Causa:** PHP no está procesando el archivo, o hay un error de sintaxis.

**Solución:**
1. Verifica que el archivo termine en `.php` (no `.html`)
2. Revisa la sintaxis PHP en `send-email.php`
3. Verifica que PHP esté habilitado para ese directorio

### Error: "SMTP connect() failed"

**Causa:** Configuración SMTP incorrecta o servidor bloqueado.

**Solución:**
1. Verifica la configuración SMTP en el panel
2. Asegúrate de que el servidor SMTP sea correcto (ej: `mail.tu-dominio.com`)
3. Verifica usuario y contraseña
4. Intenta con puerto 587 (TLS) o 465 (SSL)

## Prueba Manual del Endpoint

Puedes probar el endpoint directamente con `curl`:

```bash
curl -X POST https://tu-dominio.com/send-email.php \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@ejemplo.com",
    "subject": "Prueba",
    "html": "<p>Test</p>",
    "smtpConfig": {
      "smtpHost": "mail.tu-dominio.com",
      "smtpPort": 587,
      "smtpSecure": true,
      "smtpUser": "noreply@tu-dominio.com",
      "smtpPassword": "tu-password",
      "fromEmail": "noreply@tu-dominio.com",
      "fromName": "Tu Empresa"
    }
  }'
```

**Esperado:** Deberías recibir un JSON con `{"success": true, ...}` o `{"success": false, "error": "..."}`

## Verificación Final

Después de verificar todo:

1. **Limpia la caché del navegador** (Ctrl+Shift+R)
2. **Intenta enviar un email de prueba** desde el panel
3. **Revisa la consola del navegador** (F12) para ver errores
4. **Revisa el historial de mensajes** para ver el estado real

Si el email aparece como "Fallido" en lugar de "Simulado", significa que el sistema está intentando enviar realmente, pero hay un error. Revisa el `errorMessage` en el historial para ver el detalle.

