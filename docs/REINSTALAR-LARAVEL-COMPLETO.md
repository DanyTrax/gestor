# 🔄 Reinstalar Laravel Completamente

## 🎯 Objetivo

Este script reinstala todas las dependencias de Laravel desde cero, asegurando que todo esté correctamente instalado.

## 📋 Qué hace el script

1. ✅ Verifica Composer y PHP
2. ✅ Crea backup de archivos importantes
3. ✅ Elimina `vendor/` y `composer.lock`
4. ✅ Reinstala todas las dependencias
5. ✅ Verifica y crea archivos críticos faltantes:
   - `bootstrap/app.php`
   - `app/Http/Kernel.php`
   - `app/Console/Kernel.php`
   - `app/Exceptions/Handler.php`
   - `public/index.php`
6. ✅ Verifica sintaxis PHP
7. ✅ Prueba Laravel
8. ✅ Configura permisos

## 🚀 Cómo Usar

### Opción 1: Descargar y Ejecutar el Script

```bash
cd ~/clients.dowgroupcol.com/new

# Descargar el script
wget -O /tmp/reinstalar-laravel.sh https://raw.githubusercontent.com/DanyTrax/gestor/main/scripts/reinstalar-laravel-completo.sh

# O si prefieres hacer git pull primero:
git pull origin main

# Dar permisos de ejecución
chmod +x scripts/reinstalar-laravel-completo.sh

# Ejecutar
bash scripts/reinstalar-laravel-completo.sh
```

### Opción 2: Ejecutar Manualmente (Paso a Paso)

```bash
cd ~/clients.dowgroupcol.com/new

# 1. Backup
mkdir -p ../backup-laravel-$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="../backup-laravel-$(date +%Y%m%d_%H%M%S)"
cp .env "$BACKUP_DIR/.env" 2>/dev/null || true

# 2. Limpiar
rm -rf vendor
rm -f composer.lock

# 3. Reinstalar
composer install --no-dev --optimize-autoloader

# 4. Verificar
php artisan --version
```

## ⚠️ Advertencias

- **Backup**: El script crea un backup automático, pero asegúrate de tener tus propios backups antes de ejecutar
- **Tiempo**: La reinstalación puede tardar 3-5 minutos
- **Datos**: No se eliminan datos de la base de datos, solo las dependencias de Composer

## ✅ Después de la Reinstalación

```bash
# 1. Verificar .env
cat .env | head -10

# 2. Generar APP_KEY si falta
php artisan key:generate

# 3. Ejecutar migraciones
php artisan migrate --force

# 4. Optimizar
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Probar
php artisan --version
```

## 🔍 Verificación Final

Abre en el navegador:
```
https://clients.dowgroupcol.com/new/public/debug.php
```

Deberías ver:
- ✅ Versión PHP
- ✅ Directorios OK
- ✅ .env existe
- ✅ Dependencias OK
- ✅ Laravel cargado correctamente

## 🆘 Si Hay Problemas

1. **Error de permisos**: `chmod -R 775 storage bootstrap/cache`
2. **Error de .env**: `cp .env.example .env && php artisan key:generate`
3. **Error de base de datos**: Verifica configuración en `.env`
4. **Error de extensiones PHP**: Verifica que todas las extensiones estén habilitadas

## 📝 Notas

- El script es **seguro** - solo reinstala dependencias, no elimina datos
- Si algo falla, puedes restaurar desde el backup
- El backup se guarda en el directorio padre con fecha/hora

