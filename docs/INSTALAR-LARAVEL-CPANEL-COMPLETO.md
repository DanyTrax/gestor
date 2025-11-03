# 🚀 Instalar Laravel en cPanel - Guía Completa

## 📋 Requisitos Previos

- Acceso SSH a cPanel
- Base de datos MySQL creada en cPanel
- PHP 8.1+ (verificar con `php -v`)
- Composer instalado (verificar con `composer --version`)

## 🎯 Paso 1: Preparar el Proyecto Localmente

### 1.1 Actualizar .env.example para producción

```bash
cd new
cp .env.example .env.production
```

Editar `.env.production` con valores por defecto para producción:

```env
APP_NAME="Gestor de Cobros"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://tudominio.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nombre_base_datos
DB_USERNAME=usuario_bd
DB_PASSWORD=contraseña_bd

SESSION_DRIVER=database
SESSION_LIFETIME=120

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
```

### 1.2 Hacer commit final

```bash
git add .
git commit -m "feat: Laravel listo para producción"
git push
```

## 🎯 Paso 2: En el Servidor (cPanel)

### 2.1 Conectar por SSH

```bash
ssh usuario@tuservidor.com
# O desde cPanel: Terminal
```

### 2.2 Ir al directorio del proyecto

```bash
cd ~/public_html
# O donde tengas el proyecto actual
cd ~/clients.dowgroupcol.com
```

### 2.3 Hacer pull del repositorio

```bash
git pull origin main
```

### 2.4 Ir al directorio de Laravel

```bash
cd new
```

## 🎯 Paso 3: Instalar Dependencias

### 3.1 Instalar dependencias de Composer

```bash
composer install --no-dev --optimize-autoloader
```

**Nota:** Si no tienes Composer en el servidor:
```bash
# Instalar Composer globalmente
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer
```

## 🎯 Paso 4: Configurar Base de Datos

### 4.1 Crear base de datos en cPanel

1. Ir a cPanel → **MySQL Databases**
2. Crear nueva base de datos: `gestor_cobros`
3. Crear usuario de base de datos
4. Asignar usuario a la base de datos con todos los privilegios
5. Anotar:
   - Nombre de BD: `usuario_gestor_cobros`
   - Usuario: `usuario_bd`
   - Contraseña: `contraseña_bd`

### 4.2 Configurar .env

```bash
cp .env.example .env
```

Editar `.env` con tus datos:

```bash
nano .env
# O usar el editor de cPanel
```

**Configuración importante:**

```env
APP_NAME="Gestor de Cobros"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://tudominio.com/new/public

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=usuario_gestor_cobros
DB_USERNAME=usuario_bd
DB_PASSWORD=contraseña_bd

SESSION_DRIVER=database
SESSION_LIFETIME=120
```

### 4.3 Generar APP_KEY

```bash
php artisan key:generate
```

### 4.4 Ejecutar migraciones

```bash
php artisan migrate --force
```

Esto creará todas las tablas:
- ✅ users
- ✅ services
- ✅ payments
- ✅ tickets
- ✅ ticket_messages
- ✅ message_history
- ✅ email_config
- ✅ notification_settings
- ✅ company_settings
- ✅ message_templates
- ✅ sessions (para sesiones)
- ✅ cache, jobs (Laravel estándar)

## 🎯 Paso 5: Configurar Sesiones en Base de Datos

### 5.1 Crear tabla de sesiones

```bash
php artisan session:table
php artisan migrate
```

**O manualmente en MySQL:**

```sql
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `payload` longtext NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🎯 Paso 6: Configurar Permisos

### 6.1 Permisos de directorios

```bash
chmod -R 755 storage bootstrap/cache
chmod -R 755 public
```

### 6.2 Crear directorios necesarios

```bash
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/framework/cache
mkdir -p storage/logs
mkdir -p storage/app/public
chmod -R 775 storage
```

## 🎯 Paso 7: Configurar Apache/cPanel

### 7.1 Opción A: Subdirectorio `/new/public`

Si tu dominio apunta a `public_html`, necesitas que Laravel esté en `/new/public`:

**Crear `.htaccess` en `public_html`:**

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^$ new/public/ [L]
    RewriteRule ^(.*)$ new/public/$1 [L]
</IfModule>
```

### 7.2 Opción B: Subdominio o dominio dedicado

1. En cPanel → **Subdomains** crear `laravel.tudominio.com`
2. Apuntar a `~/public_html/new/public`
3. Actualizar `APP_URL` en `.env`:
   ```
   APP_URL=https://laravel.tudominio.com
   ```

### 7.3 Configurar .htaccess en public/

El archivo `new/public/.htaccess` ya existe, verificar que tenga:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

## 🎯 Paso 8: Crear Usuario Inicial

### 8.1 Crear superadmin

```bash
php artisan tinker
```

En tinker:

```php
$user = App\Models\User::create([
    'email' => 'admin@tudominio.com',
    'password' => bcrypt('TuContraseñaSegura123!'),
    'full_name' => 'Administrador',
    'role' => 'superadmin',
    'status' => 'active',
    'is_profile_complete' => true
]);
echo "Usuario creado: " . $user->email;
exit
```

## 🎯 Paso 9: Verificar Instalación

### 9.1 Probar rutas

```bash
# Verificar que Laravel funciona
curl https://tudominio.com/new/public/login
```

### 9.2 Verificar base de datos

```bash
php artisan tinker
```

```php
// Contar usuarios
App\Models\User::count();

// Verificar tablas
DB::select('SHOW TABLES');
exit
```

## 🎯 Paso 10: Optimización de Producción

### 10.1 Optimizar autoloader

```bash
composer install --optimize-autoloader --no-dev
```

### 10.2 Cachear configuración

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 10.3 Desactivar debug

Asegúrate que en `.env`:
```
APP_DEBUG=false
APP_ENV=production
```

## ⚠️ Solución de Problemas Comunes

### Error: "No such file or directory"

```bash
# Verificar que todos los directorios existen
ls -la storage/
ls -la bootstrap/cache/
```

### Error: "Permission denied"

```bash
chmod -R 775 storage bootstrap/cache
chown -R usuario:usuario storage bootstrap/cache
```

### Error: "Class not found"

```bash
composer dump-autoload
php artisan config:clear
php artisan cache:clear
```

### Error: "SQLSTATE[HY000] [2002]"

Verificar que `DB_HOST=localhost` (no `127.0.0.1` en cPanel)

### Error: "Vite manifest not found"

Si usas Tailwind CDN (como en el layout actual), no necesitas Vite. Si quieres usar Vite:

```bash
npm install
npm run build
```

## 📝 Checklist Final

- [ ] Git pull realizado
- [ ] Composer install ejecutado
- [ ] .env configurado con datos reales
- [ ] APP_KEY generado
- [ ] Migraciones ejecutadas (12+ tablas)
- [ ] Tabla sessions creada
- [ ] Permisos configurados (storage, cache)
- [ ] Usuario inicial creado
- [ ] Login funciona en navegador
- [ ] APP_DEBUG=false en producción
- [ ] Configuración cacheada

## 🎉 ¡Listo!

Tu aplicación Laravel debería estar funcionando en:
- `https://tudominio.com/new/public/login`
- O `https://laravel.tudominio.com/login` (si configuraste subdominio)

## 📞 Próximos Pasos

1. Crear más usuarios desde el panel admin
2. Configurar email SMTP en el panel
3. Configurar notificaciones
4. Probar todas las funcionalidades

