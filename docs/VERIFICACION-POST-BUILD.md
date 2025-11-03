# Verificación Post-Build - Gestor de Cobros

## ✅ Checklist de Verificación

### 1. Archivos PHP en la Raíz

Verifica que estos archivos estén en `/home/dowgroupcol/clients.dowgroupcol.com/`:

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com/
ls -la send-email.php upload.php composer.json
```

**Si faltan**, cópialos desde el repositorio.

### 2. Instalar Dependencias PHP (Composer)

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com/

# Si Composer no está instalado globalmente:
php -r "copy('https://getcomposer.org/installer', 'composer.phar');"
php composer.phar install

# Si Composer está instalado globalmente:
composer install
```

Esto instalará PHPMailer en `vendor/`.

### 3. Verificar Directorio `uploads/`

```bash
# Crear directorios si no existen
mkdir -p uploads/payments
mkdir -p uploads/tickets

# Permisos correctos
chmod -R 755 uploads/
chown -R dowgroupcol:nobody uploads/
```

### 4. Verificar Permisos de Archivos

```bash
# Archivos PHP ejecutables
chmod 644 send-email.php upload.php
chown dowgroupcol:nobody send-email.php upload.php

# Directorio dist con permisos de lectura
chmod -R 755 dist/
chown -R dowgroupcol:nobody dist/
```

### 5. Verificar `.htaccess`

El `.htaccess` en la raíz debe estar presente y tener permisos correctos:

```bash
ls -la .htaccess
chmod 644 .htaccess
chown dowgroupcol:nobody .htaccess
```

### 6. Probar Endpoints PHP

#### Probar `upload.php`:
```bash
# Crear un archivo de prueba
echo "test" > /tmp/test.txt

# Probar (desde el navegador o curl)
curl -X POST https://clients.dowgroupcol.com/upload.php \
  -F "file=@/tmp/test.txt"
```

#### Probar `send-email.php`:
Desde el panel de administración → **Mensajes** → **Configuración de Email** → **Probar Configuración**

### 7. Verificar Logs de Errores

Si hay problemas, revisa los logs:

```bash
# Logs de Apache (si tienes acceso)
tail -f /usr/local/apache/logs/error_log

# Logs de PHP (si están configurados)
tail -f /home/dowgroupcol/logs/error_log
```

## 🔧 Problemas Comunes

### Error: "Class 'PHPMailer\PHPMailer\PHPMailer' not found"

**Solución:**
```bash
cd /home/dowgroupcol/clients.dowgroupcol.com/
composer install
```

### Error: "Permission denied" al subir archivos

**Solución:**
```bash
chmod -R 755 uploads/
chown -R dowgroupcol:nobody uploads/
```

### Error: "send-email.php not found" o 404

**Solución:**
- Verifica que `send-email.php` está en la raíz del dominio (no en `dist/`)
- Verifica que el `.htaccess` permite ejecutar PHP

### Email sigue marcado como "Simulado"

**Solución:**
1. Verifica que `send-email.php` está accesible
2. Verifica que `vendor/autoload.php` existe (Composer instalado)
3. Revisa los logs de errores de PHP
4. Verifica la configuración SMTP en el panel de administración

## ✅ Verificación Final

1. ✅ Build completado: `dist/` contiene los archivos
2. ✅ Archivos PHP en raíz: `send-email.php`, `upload.php`
3. ✅ Composer instalado: `vendor/` existe
4. ✅ Directorio `uploads/` con permisos correctos
5. ✅ `.htaccess` configurado correctamente
6. ✅ Aplicación accesible: `https://clients.dowgroupcol.com/dist/`
7. ✅ Subida de archivos funciona
8. ✅ Envío de emails funciona

## 🚀 Siguiente Paso

Una vez verificado todo, prueba:
1. Subir un comprobante de pago (debería funcionar)
2. Configurar SMTP y enviar un email de prueba (debería enviarse realmente)

