# 🧪 Probar Laravel Localmente

## ✅ Estado Actual

- ✅ Laravel instalado y configurado
- ✅ Base de datos SQLite creada
- ✅ Migraciones ejecutadas (12 tablas creadas)
- ✅ Usuario de prueba creado
- ✅ Servidor corriendo en `http://127.0.0.1:8000`

## 🔐 Credenciales de Prueba

```
Email: admin@test.com
Contraseña: password123
Rol: superadmin
```

## 🌐 Rutas Disponibles

### Autenticación
- `GET /login` - Formulario de login
- `POST /login` - Procesar login
- `POST /logout` - Cerrar sesión
- `GET /register` - Formulario de registro
- `POST /register` - Procesar registro

### Dashboard
- `GET /dashboard` - Redirige según rol del usuario

### Admin (requiere autenticación + rol admin)
- `GET /admin/dashboard` - Dashboard de administrador
- `GET /admin/users` - Lista de usuarios
- `POST /admin/users` - Crear usuario
- `GET /admin/users/{id}` - Ver usuario
- `PUT /admin/users/{id}` - Actualizar usuario
- `DELETE /admin/users/{id}` - Eliminar usuario
- `POST /admin/users/{id}/activate` - Activar usuario
- `POST /admin/users/{id}/deactivate` - Desactivar usuario

- `GET /admin/services` - Lista de servicios
- `POST /admin/services` - Crear servicio
- (etc...)

- `GET /admin/payments` - Lista de pagos
- (etc...)

### Cliente (requiere autenticación + rol client)
- `GET /client/dashboard` - Dashboard de cliente
- `GET /client/payments` - Mis pagos
- `POST /client/payments` - Crear pago
- (etc...)

## 🚀 Cómo Probar

### 1. Acceder a la aplicación
Abre en tu navegador:
```
http://127.0.0.1:8000
```

### 2. Iniciar sesión
- Ve a: `http://127.0.0.1:8000/login`
- Email: `admin@test.com`
- Contraseña: `password123`

### 3. Probar rutas
Después de iniciar sesión, podrás acceder a:
- `http://127.0.0.1:8000/admin/dashboard`
- `http://127.0.0.1:8000/admin/users`
- `http://127.0.0.1:8000/admin/services`
- etc.

## 🛠️ Comandos Útiles

### Ver todas las rutas
```bash
cd new
php artisan route:list
```

### Detener el servidor
```bash
# Presiona Ctrl+C en la terminal donde corre el servidor
# O busca el proceso y mátalo:
pkill -f "php artisan serve"
```

### Reiniciar el servidor
```bash
cd new
php artisan serve --host=127.0.0.1 --port=8000
```

### Ver logs
```bash
cd new
tail -f storage/logs/laravel.log
```

### Crear más usuarios
```bash
cd new
php artisan tinker
```
Luego en tinker:
```php
App\Models\User::create([
    'email' => 'cliente@test.com',
    'password' => bcrypt('password123'),
    'full_name' => 'Cliente Test',
    'role' => 'client',
    'status' => 'active',
    'is_profile_complete' => true
]);
```

## ⚠️ Notas

- El servidor está corriendo en segundo plano
- La base de datos es SQLite (archivo: `database/database.sqlite`)
- Los cambios en código requieren reiniciar el servidor
- Los cambios en rutas/cache requieren: `php artisan route:clear && php artisan config:clear`

## 📝 Siguientes Pasos

1. Probar login con las credenciales
2. Navegar por las rutas de admin
3. Crear algunos datos de prueba (usuarios, servicios, pagos)
4. Verificar que todo funcione antes de subir al servidor

