# ⚡ Instalación Rápida Laravel en cPanel

## 📍 Estructura de Directorios

```
clients.dowgroupcol.com/
├── new/              (Laravel aquí)
├── scripts/         (Scripts aquí)
└── current/         (React actual)
```

## 🚀 Pasos Rápidos

### Paso 1: Ir al directorio de Laravel

```bash
cd ~/clients.dowgroupcol.com/new
```

### Paso 2: Instalar dependencias

```bash
composer install --no-dev --optimize-autoloader
```

### Paso 3: Configurar .env

```bash
cp .env.example .env
```

Editar `.env` con tus datos de BD (usa `nano .env` o el editor de cPanel).

### Paso 4: Generar APP_KEY

```bash
php artisan key:generate
```

### Paso 5: Crear directorios y permisos

```bash
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs storage/app/public
chmod -R 775 storage bootstrap/cache
chmod -R 755 public
```

### Paso 6: Ejecutar migraciones

```bash
php artisan migrate --force
```

### Paso 7: Crear tabla de sesiones

```bash
php artisan session:table
php artisan migrate
```

### Paso 8: Crear usuario inicial

```bash
php artisan tinker
```

En tinker:
```php
App\Models\User::create([
    'email' => 'admin@tudominio.com',
    'password' => bcrypt('TuContraseña123!'),
    'full_name' => 'Administrador',
    'role' => 'superadmin',
    'status' => 'active',
    'is_profile_complete' => true
]);
exit
```

### Paso 9: Optimizar

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## ✅ Listo!

Prueba en: `https://tudominio.com/new/public/login`

