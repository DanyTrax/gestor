# 🔧 Actualizar PHP a 8.2 en cPanel/WHM

## 🎯 Objetivo

Actualizar PHP de 8.1.33 a 8.2+ para poder usar Laravel 10/12 sin problemas.

## 📋 Métodos Disponibles

### Método 1: cPanel - Select PHP Version (Más Fácil)

1. Iniciar sesión en **cPanel**
2. Buscar **"Select PHP Version"**
3. Seleccionar **PHP 8.2** (o la versión más reciente disponible)
4. Hacer clic en **"Set as current"**
5. Verificar extensiones necesarias:
   - ✅ `fileinfo`
   - ✅ `pdo_mysql`
   - ✅ `mbstring`
   - ✅ `openssl`
   - ✅ `curl`
   - ✅ `zip`

### Método 2: WHM - EasyApache 4 (Recomendado si eres root)

1. Iniciar sesión en **WHM** como root
2. Ir a **Software → EasyApache 4**
3. Seleccionar **PHP Version**
4. Elegir **PHP 8.2** (o superior)
5. Hacer clic en **Review** y luego **Provision**
6. Esperar a que termine la instalación (5-10 minutos)

### Método 3: Terminal WHM (Si eres root)

```bash
# Instalar PHP 8.2
/usr/local/cpanel/scripts/installphp --php 82

# O si tienes EasyApache 4:
/usr/local/cpanel/scripts/eainstall --install ea-php82
```

## ✅ Verificar Instalación

### Verificar versión de PHP:

```bash
php -v
# Debe mostrar: PHP 8.2.x
```

### Verificar desde cPanel:

1. Ir a **Select PHP Version**
2. Debe mostrar **PHP 8.2** como versión actual

### Verificar extensiones:

```bash
php -m | grep -E "(fileinfo|pdo_mysql|mbstring|openssl)"
```

## 🔧 Después de Actualizar PHP

### 1. Verificar Composer

```bash
composer --version
```

Si Composer no funciona, reinstalar:

```bash
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer
```

### 2. Actualizar Laravel (si quieres usar Laravel 12)

```bash
cd ~/clients.dowgroupcol.com/new

# Actualizar composer.json para Laravel 12
# (O mantener Laravel 10 que también funciona con 8.2)
```

### 3. Reinstalar Dependencias

```bash
cd ~/clients.dowgroupcol.com/new
rm -f composer.lock
composer install --no-dev --optimize-autoloader
```

## 📝 Nota sobre Laravel

- **Laravel 10** funciona perfectamente con PHP 8.2
- **Laravel 12** requiere PHP 8.2+ (ahora que tienes 8.2, puedes usarlo)
- Ambas son válidas para producción

## ⚠️ Importante

Después de actualizar PHP:
1. Verificar que todas las aplicaciones PHP funcionen
2. El sistema React actual NO se verá afectado (es JavaScript)
3. Solo Laravel necesita PHP 8.2

## 🔍 Verificar que Todo Funciona

```bash
# Verificar PHP
php -v

# Verificar extensiones
php -m

# Probar Laravel
cd ~/clients.dowgroupcol.com/new
php artisan --version
```

## 🆘 Solución de Problemas

### Si algunas extensiones faltan:

Desde **Select PHP Version** en cPanel:
1. Seleccionar PHP 8.2
2. Hacer clic en **"Extensions"**
3. Activar las extensiones necesarias
4. Guardar

### Si Composer no funciona:

```bash
# Reinstalar Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Verificar
composer --version
```

