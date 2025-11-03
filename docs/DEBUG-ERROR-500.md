# 🔍 Debug Error 500 - Laravel

## 🚨 Error 500 Internal Server Error

Si ves un error 500, significa que hay un problema en el servidor. Sigue estos pasos:

## 📋 Paso 1: Verificar Logs

### Ver el log de Laravel:

```bash
cd ~/clients.dowgroupcol.com/new
tail -50 storage/logs/laravel.log
```

O desde cPanel → File Manager → `storage/logs/laravel.log`

## 📋 Paso 2: Usar Script de Debug

1. Acceder a:
   ```
   https://clients.dowgroupcol.com/new/public/debug.php
   ```

2. El script mostrará:
   - Versión PHP
   - Estado de directorios
   - Configuración de .env
   - Errores en los logs
   - Estado de las rutas

3. **IMPORTANTE:** Eliminar `debug.php` después de usar

## 📋 Paso 3: Verificar Errores Comunes

### Error: "Class not found"
```bash
cd ~/clients.dowgroupcol.com/new
composer dump-autoload
```

### Error: "Database connection"
Verificar `.env`:
```bash
cat .env | grep DB_
```

### Error: "Permission denied"
```bash
chmod -R 775 storage bootstrap/cache
chmod -R 755 public
```

### Error: "APP_KEY not set"
```bash
php artisan key:generate
```

### Error: "View not found"
Verificar que las vistas existan:
```bash
ls -la resources/views/auth/
```

## 📋 Paso 4: Verificar Configuración

### Verificar que .env esté correcto:

```bash
cd ~/clients.dowgroupcol.com/new
cat .env
```

Debe tener:
- `APP_KEY=base64:...`
- `DB_CONNECTION=mysql`
- `DB_DATABASE=...`
- `DB_USERNAME=...`
- `DB_PASSWORD=...`

### Limpiar cache:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

Luego recrear:
```bash
php artisan config:cache
php artisan route:cache
```

## 📋 Paso 5: Verificar Permisos

```bash
cd ~/clients.dowgroupcol.com/new
ls -la storage/
ls -la bootstrap/cache/
```

Deben ser escribibles (775 o 755).

## 🔧 Soluciones Rápidas

### Si el error persiste:

1. **Verificar logs específicos:**
   ```bash
   tail -100 storage/logs/laravel.log | grep -i error
   ```

2. **Verificar última migración:**
   ```bash
   php artisan migrate:status
   ```

3. **Reinstalar dependencias:**
   ```bash
   composer install --no-dev --optimize-autoloader
   ```

4. **Verificar rutas:**
   ```bash
   php artisan route:list | grep login
   ```

## 📝 Comandos Útiles

```bash
# Ver todos los errores
tail -100 storage/logs/laravel.log

# Ver solo errores recientes
tail -20 storage/logs/laravel.log | grep -i error

# Verificar configuración
php artisan config:show

# Verificar rutas
php artisan route:list

# Verificar base de datos
php artisan tinker --execute="echo DB::connection()->getDatabaseName();"
```

## 🎯 Pasos Inmediatos

1. Acceder a `debug.php` para diagnóstico rápido
2. Revisar `storage/logs/laravel.log` para el error específico
3. Verificar permisos de `storage/` y `bootstrap/cache/`
4. Limpiar cache de configuración
5. Verificar que `.env` esté correctamente configurado

