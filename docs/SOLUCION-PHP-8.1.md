# 🔧 Solución: PHP 8.1 vs Laravel 12

## ❌ Problema

Laravel 12 requiere **PHP 8.2+**, pero el servidor tiene **PHP 8.1.33**.

## ✅ Solución: Usar Laravel 10

Laravel 10 es compatible con PHP 8.1 y tiene todas las funcionalidades necesarias.

### Opción 1: Actualizar composer.json (Ya hecho)

El `composer.json` ya está actualizado para usar Laravel 10. Ahora necesitas:

```bash
cd ~/clients.dowgroupcol.com/new

# Eliminar composer.lock (si existe)
rm -f composer.lock

# Instalar dependencias compatibles con PHP 8.1
composer install --no-dev --optimize-autoloader
```

### Opción 2: Si ya existe composer.lock

```bash
cd ~/clients.dowgroupcol.com/new

# Eliminar lock file
rm composer.lock

# Actualizar dependencias
composer update --no-dev --optimize-autoloader
```

## 📋 Cambios Realizados

- `"php": "^8.2"` → `"php": "^8.1"`
- `"laravel/framework": "^12.0"` → `"laravel/framework": "^10.0"`
- `"laravel/sanctum": "^4.2"` → `"laravel/sanctum": "^3.3"`
- `"barryvdh/laravel-dompdf": "^3.1"` → `"barryvdh/laravel-dompdf": "^2.0"`
- `"intervention/image": "^3.11"` → `"intervention/image": "^2.7"`

## ⚠️ Importante

Después de hacer `git pull`, siempre ejecuta:

```bash
cd ~/clients.dowgroupcol.com/new
rm -f composer.lock  # Si existe
composer install --no-dev --optimize-autoloader
```

## 🎯 Alternativa: Actualizar PHP a 8.2

Si prefieres usar Laravel 12, actualiza PHP:

### Desde cPanel:
1. Ir a **Select PHP Version**
2. Cambiar a PHP 8.2 o superior
3. Asegurar que `ext-fileinfo` esté habilitado

### Desde WHM (root):
```bash
# Instalar PHP 8.2
/usr/local/cpanel/scripts/installphp --php 82

# O usar EasyApache 4
```

## ✅ Verificación

Después de instalar:

```bash
php artisan --version
# Debe mostrar: Laravel Framework 10.x.x
```

## 📝 Nota

Laravel 10 es una versión LTS (Long Term Support) y es perfectamente adecuada para producción. Todas las funcionalidades que necesitamos funcionan igual en Laravel 10.

