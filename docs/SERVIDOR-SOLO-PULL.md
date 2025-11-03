# Instrucciones para Servidor - Solo Pull y Ejecutar

## 🎯 Objetivo

Cuando Laravel esté completamente instalado localmente y subido a GitHub, en el servidor solo necesitas:

1. `git pull`
2. Configurar `.env`
3. Ejecutar migraciones
4. ¡Listo!

## 🚀 Pasos en el Servidor

### 1. Actualizar Código

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com
git pull
```

### 2. Configurar Laravel (Solo la primera vez)

```bash
cd new

# Copiar .env.example a .env
cp .env.example .env

# Generar clave
php artisan key:generate

# Editar .env con datos del servidor
nano .env
```

Editar `.env`:

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

### 3. Crear Base de Datos (Solo la primera vez)

Desde cPanel:
1. **MySQL Databases**
2. Crear base de datos: `gestor_cobros`
3. Crear usuario y asignar permisos
4. Usar nombres completos (con prefijo) en `.env`

### 4. Ejecutar Migraciones

```bash
cd new
php artisan migrate
```

### 5. Configurar Permisos

```bash
chmod -R 755 storage bootstrap/cache
chown -R dowgroupcol:nobody storage bootstrap/cache
php artisan storage:link
```

### 6. Crear Usuario Inicial

```bash
php artisan tinker
```

```php
\App\Models\User::create([
    'email' => 'admin@dowgroupcol.com',
    'password' => \Hash::make('tu_password_seguro'),
    'full_name' => 'Administrador',
    'role' => 'superadmin',
    'status' => 'active',
    'is_profile_complete' => true,
]);
exit
```

### 7. Configurar Apache (Si es necesario)

Si no está configurado, agregar a `.htaccess` en la raíz:

```apache
# Redirigir /new a Laravel
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/new
RewriteRule ^new(.*)$ /new/public$1 [L]
```

## ✅ Después de la Primera Instalación

Para futuras actualizaciones:

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com
git pull
cd new
php artisan migrate  # Solo si hay nuevas migraciones
```

## 📋 Checklist Rápido

- [ ] `git pull`
- [ ] `cp .env.example .env` (solo primera vez)
- [ ] `php artisan key:generate` (solo primera vez)
- [ ] Editar `.env` con datos del servidor
- [ ] Crear base de datos en cPanel
- [ ] `php artisan migrate`
- [ ] Configurar permisos
- [ ] Crear usuario inicial
- [ ] ¡Listo!

---

¡Todo listo para cuando instales localmente!

