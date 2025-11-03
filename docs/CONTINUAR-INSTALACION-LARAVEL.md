# Continuar Instalación Laravel - Pasos Siguientes

## ✅ Lo que ya está hecho:

1. ✅ Laravel instalado en `laravel-new/`
2. ✅ Dependencias base instaladas
3. ✅ Clave generada
4. ✅ Migraciones ejecutadas (si ya las ejecutaste)

## 📋 Pasos Siguientes:

### 1. Copiar nuestros archivos a Laravel

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com

# Copiar nuestros archivos creados
cp -r new/app/* laravel-new/app/
cp -r new/database/migrations/* laravel-new/database/migrations/
cp -r new/routes/* laravel-new/routes/
cp new/bootstrap/app.php laravel-new/bootstrap/app.php 2>/dev/null || true
```

### 2. Reemplazar directorio new/

```bash
# Eliminar directorio new/ anterior
rm -rf new

# Renombrar laravel-new a new
mv laravel-new new
```

### 3. Instalar dependencias adicionales

```bash
cd new

# Instalar paquetes
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image
```

### 4. Configurar .env

```bash
cd new

# Si no existe .env, copiarlo
cp .env.example .env

# Generar clave (si no se generó antes)
php artisan key:generate
```

Editar `.env` con datos del servidor:

```env
APP_NAME="Gestor de Cobros"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://clients.dowgroupcol.com/new

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dowgroupc_gestor_cobros
DB_USERNAME=dowgroupc_gestor_user
DB_PASSWORD=tu_password

MAIL_MAILER=smtp
MAIL_HOST=mail.dvsystemsas.com
MAIL_PORT=465
MAIL_USERNAME=no_reply@dvsystemsas.com
MAIL_PASSWORD=tu_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=no_reply@dvsystemsas.com
MAIL_FROM_NAME="Gestor de Cobros"
```

### 5. Ejecutar migraciones (si no las ejecutaste)

```bash
cd new
php artisan migrate
```

### 6. Crear usuario inicial

```bash
cd new
php artisan tinker
```

En tinker:

```php
\App\Models\User::create([
    'email' => 'admin@dowgroupcol.com',
    'password' => \Hash::make('tu_password_seguro'),
    'full_name' => 'Administrador',
    'role' => 'superadmin',
    'status' => 'active',
    'is_profile_complete' => true,
]);

echo "Usuario creado exitosamente";
exit
```

### 7. Configurar permisos

```bash
cd new
chmod -R 755 storage bootstrap/cache
chown -R dowgroupcol:nobody storage bootstrap/cache

# Crear enlace simbólico de storage
php artisan storage:link
```

### 8. Configurar Apache

Editar `.htaccess` en la raíz o configurar Apache para que `/new` apunte a `new/public/`

---

## 🎯 Resumen de Comandos

```bash
# 1. Copiar archivos
cd /home/dowgroupcol/clients.dowgroupcol.com
cp -r new/app/* laravel-new/app/
cp -r new/database/migrations/* laravel-new/database/migrations/
cp -r new/routes/* laravel-new/routes/

# 2. Reemplazar
rm -rf new
mv laravel-new new

# 3. Instalar dependencias
cd new
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image

# 4. Configurar
cp .env.example .env
php artisan key:generate
# Editar .env con datos del servidor

# 5. Migraciones
php artisan migrate

# 6. Permisos
chmod -R 755 storage bootstrap/cache
chown -R dowgroupcol:nobody storage bootstrap/cache
php artisan storage:link
```

---

¿Quieres que te guíe paso a paso desde aquí?

