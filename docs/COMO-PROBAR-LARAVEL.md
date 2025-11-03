# Cómo Probar la App Laravel

## 🚀 Opción 1: Probar Localmente (Desarrollo)

### Prerrequisitos:
- PHP 8.1 o superior
- Composer instalado
- MySQL/MariaDB o PostgreSQL

### Pasos:

#### 1. Instalar Laravel en `new/`

```bash
cd new
composer create-project laravel/laravel . --prefer-dist
```

#### 2. Copiar archivos creados

```bash
# Los archivos ya están en new/, solo necesitas copiar si se crean nuevos
# Estructura actual:
# new/app/
# new/database/
# new/routes/
```

#### 3. Instalar dependencias adicionales

```bash
cd new
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image
```

#### 4. Configurar base de datos

Crear archivo `.env`:

```bash
cp .env.example .env
php artisan key:generate
```

Editar `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestor_cobros_test
DB_USERNAME=root
DB_PASSWORD=
```

#### 5. Crear base de datos

```sql
CREATE DATABASE gestor_cobros_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 6. Ejecutar migraciones

```bash
php artisan migrate
```

#### 7. Crear usuario inicial

```bash
php artisan tinker
```

En tinker:

```php
$user = \App\Models\User::create([
    'email' => 'admin@test.com',
    'password' => \Hash::make('password123'),
    'full_name' => 'Admin Test',
    'role' => 'superadmin',
    'status' => 'active',
    'is_profile_complete' => true,
]);
```

#### 8. Iniciar servidor

```bash
php artisan serve
```

#### 9. Acceder a la aplicación

- Web: `http://localhost:8000`
- API: `http://localhost:8000/api/v1`

---

## 🌐 Opción 2: Probar en Servidor (Producción)

### Pasos:

#### 1. En el servidor, clonar/actualizar

```bash
cd /var/www/html/gestor-cobros
git pull
```

#### 2. Instalar Laravel en `new/`

```bash
cd new
composer create-project laravel/laravel . --prefer-dist
```

#### 3. Instalar dependencias

```bash
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image
```

#### 4. Configurar `.env`

```bash
cp .env.example .env
php artisan key:generate
```

Editar `.env` con datos del servidor:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://clients.dowgroupcol.com/new

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestor_cobros
DB_USERNAME=root
DB_PASSWORD=tu_password
```

#### 5. Configurar Apache

```apache
# /etc/apache2/sites-available/gestor-cobros.conf

<VirtualHost *:80>
    ServerName clients.dowgroupcol.com
    
    # Sistema actual (default)
    DocumentRoot /var/www/html/gestor-cobros/current/dist
    
    # Sistema nuevo Laravel
    Alias /new /var/www/html/gestor-cobros/new/public
    
    <Directory /var/www/html/gestor-cobros/new/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    # Uploads compartidos
    Alias /uploads /var/www/html/gestor-cobros/shared/uploads
    
    <Directory /var/www/html/gestor-cobros/shared/uploads>
        Require all granted
    </Directory>
</VirtualHost>
```

#### 6. Ejecutar migraciones

```bash
cd /var/www/html/gestor-cobros/new
php artisan migrate
```

#### 7. Configurar permisos

```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### 8. Acceder

- Sistema actual: `https://clients.dowgroupcol.com/`
- Sistema nuevo: `https://clients.dowgroupcol.com/new/`

---

## 🧪 Probar Funcionalidades

### 1. Probar Autenticación Web

```
GET  /login           → Ver formulario de login
POST /login           → Login
POST /logout          → Logout
GET  /register        → Ver formulario de registro
POST /register        → Registro
```

### 2. Probar Dashboard Admin

```
GET  /admin/dashboard → Dashboard admin (requiere login + rol admin)
```

### 3. Probar CRUD Usuarios

```
GET    /admin/users           → Listar usuarios
GET    /admin/users/create    → Formulario crear
POST   /admin/users           → Crear usuario
GET    /admin/users/{id}      → Ver usuario
GET    /admin/users/{id}/edit → Editar usuario
PUT    /admin/users/{id}      → Actualizar
DELETE /admin/users/{id}      → Eliminar
```

### 4. Probar API REST

#### Login API:
```bash
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

#### Obtener Token:
```bash
# Respuesta incluye token
{
  "user": {...},
  "token": "1|abc123..."
}
```

#### Usar Token:
```bash
curl -X GET http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer 1|abc123..."
```

---

## ⚠️ Notas Importantes

1. **Faltan las Vistas Blade**: Los controladores están listos, pero faltan las vistas HTML. Puedes:
   - Crearlas manualmente
   - Usar `php artisan make:auth` (Laravel < 10)
   - Crear vistas básicas para probar

2. **Base de Datos Vacía**: Al crear desde cero, necesitas:
   - Crear usuarios manualmente
   - O crear seeders para datos de prueba

3. **Rutas API**: Funcionan sin vistas, puedes probarlas con Postman o curl

---

## 🔧 Crear Vistas Básicas (Opcional)

Si quieres probar la interfaz web, puedes crear vistas mínimas:

```bash
cd new
mkdir -p resources/views/{auth,admin,client}
```

Crear `resources/views/auth/login.blade.php`:

```blade
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
</head>
<body>
    <h1>Login</h1>
    <form method="POST" action="{{ route('login') }}">
        @csrf
        <input type="email" name="email" required>
        <input type="password" name="password" required>
        <button type="submit">Login</button>
    </form>
</body>
</html>
```

---

## ✅ Checklist de Prueba

- [ ] Laravel instalado
- [ ] Dependencias instaladas
- [ ] `.env` configurado
- [ ] Base de datos creada
- [ ] Migraciones ejecutadas
- [ ] Usuario creado
- [ ] Servidor corriendo
- [ ] Login funciona
- [ ] API responde

---

¿Necesitas ayuda con algún paso específico?

