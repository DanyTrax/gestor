# Diagnóstico de Error 500 en Restablecimiento de Contraseña

## 🔍 Problema

Al intentar restablecer la contraseña, aparece un error **500 Internal Server Error** en el endpoint `create-password-reset-token.php`.

## ✅ Solución Paso a Paso

### Paso 1: Ejecutar Script de Diagnóstico

En el servidor, ejecuta:

```bash
cd ~/clients.dowgroupcol.com
php test-password-reset-endpoint.php
```

Este script verificará:
- ✅ Versión de PHP
- ✅ Extensiones necesarias
- ✅ Composer y dependencias
- ✅ Credenciales de Firebase
- ✅ Existencia del endpoint
- ✅ Sintaxis PHP
- ✅ Permisos de archivos
- ✅ Conexión a Firebase

### Paso 2: Verificar Requisitos

#### 2.1. PHP 7.4 o superior
```bash
php -v
```

#### 2.2. Extensiones PHP necesarias
```bash
php -m | grep -E "json|curl|openssl|mbstring"
```

Si falta alguna, instálala según tu sistema:
- **Ubuntu/Debian**: `sudo apt-get install php-json php-curl php-openssl php-mbstring`
- **CentOS/RHEL**: `sudo yum install php-json php-curl php-openssl php-mbstring`

#### 2.3. Composer instalado
```bash
composer --version
```

Si no está instalado:
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

#### 2.4. Instalar dependencias de Composer
```bash
cd ~/clients.dowgroupcol.com
composer install
```

### Paso 3: Verificar Credenciales de Firebase

```bash
cd ~/clients.dowgroupcol.com
ls -la firebase-credentials.json
```

Si no existe:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Configuración del proyecto** → **Cuentas de servicio**
4. Haz clic en **Generar nueva clave privada**
5. Descarga el archivo JSON
6. Súbelo al servidor como `firebase-credentials.json`

### Paso 4: Verificar Permisos

```bash
cd ~/clients.dowgroupcol.com
chmod 644 create-password-reset-token.php
chmod 600 firebase-credentials.json  # Solo lectura para el propietario
chmod 755 vendor/
```

### Paso 5: Probar el Endpoint Directamente

```bash
curl -X POST https://clients.dowgroupcol.com/create-password-reset-token.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","appId":"alojamientos-3c46b"}'
```

### Paso 6: Ver Logs de Errores

```bash
# Apache
tail -f /var/log/apache2/error.log

# Nginx + PHP-FPM
tail -f /var/log/nginx/error.log
tail -f /var/log/php-fpm/error.log

# O verificar logs de PHP directamente
tail -f /var/log/php_errors.log
```

## 🔧 Soluciones Comunes

### Error: "Composer autoload no encontrado"
```bash
cd ~/clients.dowgroupcol.com
composer install
```

### Error: "firebase-credentials.json no encontrado"
- Descarga las credenciales de Firebase Console
- Súbelas al servidor como `firebase-credentials.json`
- Verifica permisos: `chmod 600 firebase-credentials.json`

### Error: "Missing or insufficient permissions"
- Verifica las reglas de Firestore en Firebase Console
- Asegúrate de que las reglas permitan lectura/escritura para el servicio de Firebase Admin SDK

### Error: "Class 'Kreait\Firebase\Factory' not found"
```bash
cd ~/clients.dowgroupcol.com
composer require kreait/firebase-php
```

### Error: "Call to undefined function random_int()"
- Actualiza PHP a versión 7.0 o superior
- O instala la extensión `random_compat` vía Composer

## 📋 Checklist de Verificación

- [ ] PHP 7.4+ instalado
- [ ] Extensiones PHP necesarias instaladas
- [ ] Composer instalado
- [ ] `composer install` ejecutado
- [ ] `firebase-credentials.json` existe y es legible
- [ ] `create-password-reset-token.php` existe
- [ ] Permisos correctos en archivos
- [ ] Logs de errores revisados
- [ ] Endpoint probado con curl

## 🆘 Si el Problema Persiste

1. **Revisa los logs de errores** del servidor web
2. **Ejecuta el script de diagnóstico** y comparte la salida
3. **Verifica que el archivo PHP esté en la raíz** del dominio
4. **Confirma que el servidor web puede ejecutar PHP** (prueba con `phpinfo()`)

## 📝 Notas

- El endpoint requiere **Firebase Admin SDK** para funcionar
- Las credenciales de Firebase deben ser de tipo **Service Account**
- El `appId` por defecto es `'alojamientos-3c46b'` si no se envía en el request

