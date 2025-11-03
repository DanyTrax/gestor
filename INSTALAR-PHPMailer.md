# Instalar PHPMailer en el Servidor

## Para cPanel (Directo en el servidor)

Si estás usando cPanel directamente (no Docker), necesitas instalar PHPMailer en el servidor:

### Opción 1: Usar Composer (Recomendado)

1. **SSH al servidor** o usa el **Terminal de cPanel**

2. Navega al directorio donde está tu aplicación:
   ```bash
   cd public_html  # o donde tengas tu aplicación
   ```

3. Si no tienes Composer, instálalo:
   ```bash
   php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
   php composer-setup.php
   php -r "unlink('composer-setup.php');"
   ```

4. Instala PHPMailer:
   ```bash
   composer require phpmailer/phpmailer
   ```

5. Verifica que se creó `vendor/autoload.php`:
   ```bash
   ls -la vendor/autoload.php
   ```

### Opción 2: Descargar PHPMailer Manualmente

Si no puedes usar Composer:

1. Descarga PHPMailer desde: https://github.com/PHPMailer/PHPMailer/releases
2. Extrae el archivo ZIP
3. Sube la carpeta `PHPMailer-6.x.x/src` a tu servidor en `vendor/phpmailer/phpmailer/src`
4. Crea `vendor/autoload.php` manualmente o modifica `send-email.php` para cargar PHPMailer directamente

### Opción 3: Modificar send-email.php para usar mail() nativa

Si no puedes instalar PHPMailer, puedes modificar `send-email.php` para usar la función `mail()` nativa de PHP, aunque es menos robusta.

---

## Para Docker (Dockge)

Si usas Docker/Dockge, el `Dockerfile` ya está configurado para instalar PHPMailer automáticamente durante el build.

Solo necesitas reconstruir la imagen:

```bash
docker-compose build --no-cache
docker-compose up -d
```

O desde Dockge:
1. Ve al stack
2. Click en "Rebuild"
3. Espera a que termine el build
4. Reinicia el contenedor si es necesario

---

## Verificar Instalación

Después de instalar, verifica que funciona:

1. **Verifica que `vendor/autoload.php` existe:**
   ```bash
   ls -la vendor/autoload.php
   ```

2. **Prueba desde el panel:**
   - Ve a **Mensajes** → **Configuración de Email**
   - Completa la configuración SMTP
   - Envía un email de prueba
   - Si funciona, verás "✅ Email de prueba enviado exitosamente"

3. **Si hay errores:**
   - Revisa los logs de PHP en cPanel
   - Verifica que la configuración SMTP sea correcta
   - Asegúrate de que `send-email.php` esté en el mismo directorio que `index.html`

---

## Estructura de Archivos Esperada

```
public_html/  (o tu directorio web)
├── index.html
├── assets/
├── send-email.php
├── upload.php
├── composer.json
├── vendor/
│   └── autoload.php
└── uploads/
    └── payments/
```

---

## Solución de Problemas

### Error: "require_once vendor/autoload.php failed"

**Causa:** PHPMailer no está instalado o la ruta es incorrecta.

**Solución:**
1. Verifica que `vendor/autoload.php` existe
2. Si usas cPanel, asegúrate de que la ruta en `send-email.php` sea correcta
3. Si usas Docker, reconstruye la imagen

### Error: "Class 'PHPMailer\PHPMailer\PHPMailer' not found"

**Causa:** PHPMailer no está instalado correctamente.

**Solución:**
1. Ejecuta `composer install` en el directorio de la aplicación
2. Verifica que `vendor/phpmailer/phpmailer/src/PHPMailer.php` existe

### Error: "SMTP connect() failed"

**Causa:** Configuración SMTP incorrecta o puerto bloqueado.

**Solución:**
1. Verifica el servidor SMTP (ej: `mail.tu-dominio.com`)
2. Verifica el puerto (587 para TLS, 465 para SSL)
3. Verifica usuario y contraseña
4. Si usas puerto 587, asegúrate de marcar "Usar conexión segura (TLS)"

---

## Notas Importantes

- **PHPMailer requiere PHP 7.4+**
- **El servidor SMTP debe permitir conexiones desde tu hosting**
- **Algunos hosts bloquean puertos. Verifica con soporte si tienes problemas**

