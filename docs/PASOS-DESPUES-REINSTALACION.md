# ✅ Pasos Después de Reinstalar Dependencias

## 🎯 Pasos Siguientes

Después de ejecutar `composer install`, sigue estos pasos en orden:

### 1. Verificar que Laravel Funciona

```bash
cd ~/clients.dowgroupcol.com/new

# Verificar versión
php artisan --version

# Debe mostrar: "Laravel Framework 10.x.x"
```

### 2. Verificar/Crear Archivos Críticos

```bash
# Verificar que existen estos archivos
ls -la bootstrap/app.php
ls -la app/Http/Kernel.php
ls -la app/Console/Kernel.php
ls -la app/Exceptions/Handler.php
ls -la public/index.php
```

Si alguno falta, haz `git pull` para descargarlos, o avísame y los creamos.

### 3. Configurar .env

```bash
# Verificar .env existe
ls -la .env

# Si NO existe, copiarlo
cp .env.example .env

# Editar .env con tus datos de BD
nano .env
# O usar el editor de cPanel
```

**Configuración mínima en .env:**
```env
APP_NAME=GestorCobros
APP_ENV=production
APP_KEY=  # Se generará en el siguiente paso
APP_DEBUG=false
APP_URL=https://clients.dowgroupcol.com/new/public

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=tu_base_datos
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña

SESSION_DRIVER=database
```

### 4. Generar APP_KEY

```bash
php artisan key:generate
```

### 5. Crear Tabla de Sesiones

```bash
php artisan session:table
php artisan migrate --force
```

### 6. Ejecutar Todas las Migraciones

```bash
php artisan migrate --force
```

### 7. Crear Usuario Administrador

```bash
php create-user.php admin@tudominio.com TuContraseña123 Administrador
```

### 8. Optimizar Laravel

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 9. Configurar Permisos

```bash
chmod -R 775 storage bootstrap/cache
chmod -R 755 public
```

### 10. Verificar en Navegador

Abre:
```
https://clients.dowgroupcol.com/new/public/debug.php
```

Deberías ver:
- ✅ Versión PHP
- ✅ Directorios OK
- ✅ .env existe
- ✅ Dependencias OK
- ✅ Laravel cargado correctamente

### 11. Probar Login

Abre:
```
https://clients.dowgroupcol.com/new/public/login
```

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

### Error: "No such table"
```bash
php artisan migrate --force
```

## ✅ Checklist Final

- [ ] `php artisan --version` funciona
- [ ] `.env` configurado correctamente
- [ ] `APP_KEY` generado
- [ ] Migraciones ejecutadas
- [ ] Usuario admin creado
- [ ] Permisos configurados
- [ ] `debug.php` muestra todo OK
- [ ] Login funciona

## 🎉 Listo!

Una vez completados estos pasos, Laravel debería estar funcionando completamente.

