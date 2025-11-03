# 🔧 Habilitar Extensión OpenSSL en cPanel

## 🎯 Método 1: Desde cPanel (Recomendado)

### Paso 1: Acceder a Select PHP Version

1. Iniciar sesión en **cPanel**
2. Buscar **"Select PHP Version"** o **"Select PHP Version"**
3. Seleccionar tu versión de PHP (8.1 o 8.2)

### Paso 2: Habilitar OpenSSL

1. Hacer clic en **"Extensions"** o **"Extensiones"**
2. Buscar **`openssl`** en la lista
3. Activar el checkbox
4. Hacer clic en **"Save"** o **"Guardar"**

### Paso 3: Verificar

```bash
php -m | grep openssl
# Debe mostrar: openssl
```

## 🎯 Método 2: Desde WHM (Si eres root)

### Opción A: EasyApache 4

1. Iniciar sesión en **WHM**
2. Ir a **Software → EasyApache 4**
3. Seleccionar **PHP Extensions**
4. Buscar **openssl**
5. Activar
6. **Review** y **Provision**

### Opción B: Terminal como root

```bash
# Para PHP 8.1
/usr/local/cpanel/scripts/ea_install_extension --install openssl --ea-php81

# Para PHP 8.2
/usr/local/cpanel/scripts/ea_install_extension --install openssl --ea-php82
```

### Opción C: Editar php.ini directamente

```bash
# Encontrar el php.ini
php --ini

# Editar el php.ini
nano /opt/cpanel/ea-php81/root/etc/php.ini

# Buscar y descomentar (quitar el ;)
extension=openssl

# Guardar y reiniciar Apache
/scripts/restartsrv_httpd
```

## 🔍 Verificar si OpenSSL está habilitado

### Desde Terminal:

```bash
php -m | grep openssl
```

Si aparece `openssl`, está habilitado.

### Desde PHP:

```bash
php -r "echo extension_loaded('openssl') ? 'OpenSSL habilitado' : 'OpenSSL NO habilitado';"
```

### Ver todas las extensiones:

```bash
php -m
```

## ⚠️ Nota Importante

**OpenSSL es crítico para Laravel** porque se usa para:
- Encriptación de sesiones
- Tokens de seguridad
- Conexiones seguras

**Si no puedes habilitarlo**, Laravel puede tener problemas con:
- Sesiones
- Autenticación
- Tokens CSRF

## 🆘 Si No Aparece en la Lista

### Opción 1: Instalar via EasyApache 4

1. WHM → **EasyApache 4**
2. **Currently Installed Packages** → **PHP Extensions**
3. Buscar **openssl**
4. Si no está, instalarlo desde **Available Packages**

### Opción 2: Contactar al Proveedor

Si no tienes acceso root, contacta a tu proveedor de hosting para que habilite OpenSSL.

## ✅ Después de Habilitar

1. Verificar que funciona:
   ```bash
   php -m | grep openssl
   ```

2. Probar Laravel:
   ```bash
   cd ~/clients.dowgroupcol.com/new
   php artisan key:generate
   ```

3. Si funciona, OpenSSL está bien configurado.

## 📝 Extensiones Mínimas para Laravel

- ✅ `openssl` - Encriptación
- ✅ `pdo` - Base de datos
- ✅ `pdo_mysql` - MySQL
- ✅ `mbstring` - Strings multibyte
- ✅ `tokenizer` - Parser
- ✅ `xml` - XML
- ✅ `ctype` - Validación
- ✅ `json` - JSON
- ✅ `fileinfo` - Detección de tipos de archivo

