# ✅ Pasos Finales para Completar Laravel

## 📋 Checklist Inicial

- [x] PHP 8.2 instalado y activo
- [x] OpenSSL habilitado
- [x] Composer instalado
- [x] Git pull realizado

## 🚀 Pasos para Completar Instalación

### Paso 1: Verificar Entorno

```bash
cd ~/clients.dowgroupcol.com/new

# Verificar PHP
php -v
# Debe mostrar: PHP 8.2.x

# Verificar extensiones
php -m | grep -E "(openssl|pdo_mysql|fileinfo|mbstring)"
# Debe mostrar todas las extensiones

# Verificar Composer
composer --version
```

### Paso 2: Instalar Dependencias

```bash
cd ~/clients.dowgroupcol.com/new

# Eliminar composer.lock antiguo (si existe)
rm -f composer.lock

# Instalar dependencias
composer install --no-dev --optimize-autoloader
```

**Esto puede tardar 3-5 minutos.** Debería instalar sin errores ahora.

### Paso 3: Verificar Instalación

```bash
# Verificar que vendor/ existe
ls -la vendor/ | head -5

# Verificar Laravel
php artisan --version
# Debe mostrar: Laravel Framework 10.x.x
```

### Paso 4: Configurar .env

```bash
# Si no existe .env, copiarlo
cp .env.example .env

# Editar .env con tus datos de BD
nano .env
# O usar el editor de cPanel
```

**Configuración mínima en .env:**
```env
APP_URL=https://clients.dowgroupcol.com/new/public
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=tu_base_datos
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
SESSION_DRIVER=database
APP_DEBUG=false
```

### Paso 5: Generar APP_KEY

```bash
php artisan key:generate
```

### Paso 6: Ejecutar Migraciones

```bash
# Crear todas las tablas
php artisan migrate --force

# Crear tabla de sesiones
php artisan session:table
php artisan migrate --force
```

### Paso 7: Configurar Permisos

```bash
chmod -R 775 storage bootstrap/cache
chmod -R 755 public
```

### Paso 8: Optimizar

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Paso 9: Crear Usuario Administrador

```bash
php create-user.php admin@tudominio.com TuContraseña123 Administrador
```

### Paso 10: Probar Login

Abre en el navegador:
```
https://clients.dowgroupcol.com/new/public/login
```

## ✅ Verificación Final

### Verificar que todo funciona:

```bash
# 1. Verificar tablas creadas
php artisan tinker --execute="echo DB::select('SHOW TABLES');"

# 2. Contar usuarios
php artisan tinker --execute="echo App\Models\User::count();"

# 3. Verificar rutas
php artisan route:list | grep login
```

## 🎯 Si Todo Funciona

1. ✅ Eliminar `install.php` por seguridad:
   ```bash
   rm public/install.php
   ```

2. ✅ Eliminar `debug.php` por seguridad:
   ```bash
   rm public/debug.php
   ```

3. ✅ Acceder al login y probar

## 🆘 Si Hay Errores

### Error: "Class not found"
```bash
composer dump-autoload
```

### Error: "Database connection"
```bash
# Verificar .env
cat .env | grep DB_

# Probar conexión
php artisan tinker --execute="echo DB::connection()->getDatabaseName();"
```

### Error: "Permission denied"
```bash
chmod -R 775 storage bootstrap/cache
```

## 📝 Comandos Útiles

```bash
# Ver logs
tail -50 storage/logs/laravel.log

# Limpiar cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Verificar estado
php artisan migrate:status
```

## 🎉 Listo!

Una vez completados estos pasos, Laravel debería estar funcionando completamente.

