# 👤 Crear Usuario Administrador - Métodos

## 🎯 Método 1: Script Directo (Recomendado)

### Opción A: Con parámetros

```bash
cd ~/clients.dowgroupcol.com/new
php create-user.php admin@tudominio.com TuContraseña123 Administrador
```

### Opción B: Interactivo

```bash
cd ~/clients.dowgroupcol.com/new
php create-user-interactive.php
```

Te pedirá:
- Email
- Contraseña
- Nombre completo

## 🎯 Método 2: Usar Artisan Command

```bash
cd ~/clients.dowgroupcol.com/new
php artisan tinker --execute="
App\Models\User::create([
    'email' => 'admin@tudominio.com',
    'password' => bcrypt('TuContraseña123!'),
    'full_name' => 'Administrador',
    'role' => 'superadmin',
    'status' => 'active',
    'is_profile_complete' => true
]);
"
```

## 🎯 Método 3: Tinker Interactivo (si funciona)

```bash
cd ~/clients.dowgroupcol.com/new
php artisan tinker
```

Luego copia y pega:

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

## 🎯 Método 4: SQL Directo (última opción)

Si nada funciona, puedes insertar directamente en la base de datos:

```sql
INSERT INTO users (email, password, full_name, role, status, is_profile_complete, created_at, updated_at)
VALUES (
    'admin@tudominio.com',
    '$2y$10$...', -- Generar hash con: php -r "echo bcrypt('TuContraseña123!');"
    'Administrador',
    'superadmin',
    'active',
    1,
    NOW(),
    NOW()
);
```

Para generar el hash de contraseña:

```bash
php -r "echo password_hash('TuContraseña123!', PASSWORD_BCRYPT);"
```

## ✅ Verificar Usuario Creado

```bash
php artisan tinker --execute="echo App\Models\User::count();"
```

O:

```bash
php create-user.php --check
```

## 🔧 Solución de Problemas

### Error: "Class not found"
```bash
composer dump-autoload
```

### Error: "Database connection"
Verifica que `.env` esté configurado correctamente.

### Tinker no responde
Usa el método 1 (script directo) que es más confiable.

