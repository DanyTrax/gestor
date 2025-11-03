# Instalar Laravel en cPanel - Paso a Paso

## 📋 Prerrequisitos

- ✅ Acceso SSH a cPanel (Terminal)
- ✅ Node.js instalado (ya lo tienes)
- ✅ Composer instalado (o instalarlo)
- ✅ Base de datos MySQL creada

## 🚀 Paso 1: Acceder al Terminal de cPanel

1. Accede a **cPanel**
2. Busca **"Terminal"** o **"SSH Access"**
3. Click en **"Open Terminal"**

O desde WHM:
- **Terminal** → Abre terminal como root

## 📦 Paso 2: Verificar/Navegar al Directorio

```bash
# Verificar ubicación actual
pwd

# Navegar al directorio del proyecto
cd /home/dowgroupcol/clients.dowgroupcol.com

# Verificar estructura
ls -la
```

Deberías ver:
```
current/
new/
shared/
docs/
```

## 🔧 Paso 3: Instalar Composer (si no está instalado)

```bash
# Verificar si Composer está instalado
composer --version

# Si no está, instalarlo
cd ~
php -r "copy('https://getcomposer.org/installer', 'composer.phar');"
php composer.phar install
sudo mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Verificar instalación
composer --version
```

## 📁 Paso 4: Instalar Laravel en `new/`

```bash
# Ir al directorio new
cd /home/dowgroupcol/clients.dowgroupcol.com/new

# Instalar Laravel
composer create-project laravel/laravel . --prefer-dist

# Esperar a que termine (puede tomar varios minutos)
```

**Nota:** Si da error de memoria, aumentar límite:

```bash
php -d memory_limit=512M /usr/local/bin/composer create-project laravel/laravel . --prefer-dist
```

## 📦 Paso 5: Instalar Dependencias Adicionales

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com/new

# Instalar paquetes necesarios
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image
```

## ⚙️ Paso 6: Configurar `.env`

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com/new

# Copiar archivo de ejemplo
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate
```

### Editar `.env` manualmente:

```bash
# Usar editor nano (más fácil en terminal)
nano .env
```

O desde cPanel:
1. **File Manager** → `new/`
2. Click en `.env` → **Edit**

Configurar:

```env
APP_NAME="Gestor de Cobros"
APP_ENV=production
APP_KEY=base64:... (se genera automáticamente)
APP_DEBUG=false
APP_URL=https://clients.dowgroupcol.com/new

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestor_cobros
DB_USERNAME=tu_usuario_db
DB_PASSWORD=tu_password_db

MAIL_MAILER=smtp
MAIL_HOST=mail.dvsystemsas.com
MAIL_PORT=465
MAIL_USERNAME=no_reply@dvsystemsas.com
MAIL_PASSWORD=tu_password_email
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=no_reply@dvsystemsas.com
MAIL_FROM_NAME="${APP_NAME}"
```

Guardar: `Ctrl + X`, luego `Y`, luego `Enter`

## 🗄️ Paso 7: Crear Base de Datos en cPanel

### Opción A: Desde cPanel (Recomendado)

1. **cPanel** → **MySQL Databases**
2. Crear nueva base de datos:
   - Nombre: `gestor_cobros`
   - Click **"Create Database"**
3. Crear usuario:
   - Usuario: `gestor_user`
   - Password: (genera una segura)
   - Click **"Create User"**
4. Asignar permisos:
   - Seleccionar usuario y base de datos
   - Marcar **"ALL PRIVILEGES"**
   - Click **"Make Changes"**

**Nota:** cPanel agrega prefijo al nombre. Ejemplo:
- Base de datos: `dowgroupc_gestor_cobros`
- Usuario: `dowgroupc_gestor_user`

Usa estos nombres en `.env`:

```env
DB_DATABASE=dowgroupc_gestor_cobros
DB_USERNAME=dowgroupc_gestor_user
DB_PASSWORD=tu_password_generado
```

### Opción B: Desde Terminal

```bash
mysql -u root -p

# En MySQL:
CREATE DATABASE dowgroupc_gestor_cobros CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'dowgroupc_gestor_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON dowgroupc_gestor_cobros.* TO 'dowgroupc_gestor_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 🔄 Paso 8: Ejecutar Migraciones

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com/new

# Ejecutar migraciones
php artisan migrate

# Si pregunta confirmación, escribir "yes"
```

Deberías ver:
```
Migration table created successfully.
Migrating: 2024_01_01_000001_create_users_table
Migrated:  2024_01_01_000001_create_users_table
...
```

## 📝 Paso 9: Crear Usuario Inicial

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com/new

# Abrir tinker
php artisan tinker
```

En tinker, ejecutar:

```php
$user = \App\Models\User::create([
    'email' => 'admin@dowgroupcol.com',
    'password' => \Hash::make('tu_password_seguro'),
    'full_name' => 'Administrador',
    'role' => 'superadmin',
    'status' => 'active',
    'is_profile_complete' => true,
]);

echo "Usuario creado: " . $user->email;
exit
```

## 🔐 Paso 10: Configurar Permisos

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com/new

# Dar permisos a storage y cache
chmod -R 755 storage bootstrap/cache
chown -R dowgroupcol:nobody storage bootstrap/cache

# Crear enlaces simbólicos si es necesario
php artisan storage:link
```

## 🌐 Paso 11: Configurar Apache en cPanel

### Opción A: Desde cPanel (Recomendado)

1. **cPanel** → **Subdomains** o **Subdirectories**
2. Crear subdirectorio:
   - **Document Root:** `clients.dowgroupcol.com/new/public`
   - O modificar `.htaccess` en la raíz

### Opción B: Modificar `.htaccess` en la Raíz

Desde **File Manager** en cPanel:

1. Ir a `/home/dowgroupcol/clients.dowgroupcol.com/`
2. Editar `.htaccess` (o crear si no existe)

Agregar:

```apache
# Redirigir /new a Laravel
RewriteEngine On

# Sistema nuevo Laravel
RewriteCond %{REQUEST_URI} ^/new
RewriteRule ^new(.*)$ /new/public$1 [L]

# Sistema actual (default)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(?!new).*$ current/dist/$1 [L]
```

### Opción C: Desde Terminal (Avanzado)

```bash
# Editar configuración de Apache
sudo nano /etc/apache2/sites-available/clients.dowgroupcol.com.conf
```

Agregar:

```apache
<VirtualHost *:80>
    ServerName clients.dowgroupcol.com
    
    # Sistema actual
    DocumentRoot /home/dowgroupcol/clients.dowgroupcol.com/current/dist
    
    # Sistema nuevo Laravel
    Alias /new /home/dowgroupcol/clients.dowgroupcol.com/new/public
    
    <Directory /home/dowgroupcol/clients.dowgroupcol.com/new/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Reiniciar Apache:

```bash
sudo systemctl restart apache2
# O
sudo service apache2 restart
```

## 🧪 Paso 12: Probar la Aplicación

### 1. Probar desde Navegador

- **Sistema actual:** `https://clients.dowgroupcol.com/`
- **Sistema nuevo:** `https://clients.dowgroupcol.com/new/`

### 2. Probar Login

Si no tienes vistas aún, puedes probar la API:

```bash
# Desde terminal
curl -X POST https://clients.dowgroupcol.com/new/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dowgroupcol.com","password":"tu_password"}'
```

### 3. Verificar Errores

Si hay errores, revisar logs:

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com/new
tail -f storage/logs/laravel.log
```

## 📋 Checklist de Verificación

- [ ] Composer instalado
- [ ] Laravel instalado en `new/`
- [ ] Dependencias instaladas (Sanctum, DomPDF, Image)
- [ ] `.env` configurado
- [ ] Base de datos creada en cPanel
- [ ] Migraciones ejecutadas
- [ ] Usuario creado
- [ ] Permisos configurados
- [ ] Apache configurado
- [ ] Acceso funciona en `/new/`

## ⚠️ Problemas Comunes

### Error: "Composer not found"
```bash
# Instalar Composer globalmente
php -r "copy('https://getcomposer.org/installer', 'composer.phar');"
sudo mv composer.phar /usr/local/bin/composer
```

### Error: "Memory limit exceeded"
```bash
# Aumentar memoria en composer
php -d memory_limit=512M composer install
```

### Error: "Permission denied"
```bash
# Dar permisos correctos
chmod -R 755 storage bootstrap/cache
chown -R dowgroupcol:nobody storage bootstrap/cache
```

### Error: "No application encryption key"
```bash
# Generar clave
php artisan key:generate
```

### Error: "Base de datos no encontrada"
- Verificar nombre de base de datos en `.env` (con prefijo de cPanel)
- Verificar usuario y contraseña
- Verificar que la base de datos existe en MySQL Databases

### Error 500 en Laravel
```bash
# Ver logs
tail -f storage/logs/laravel.log

# Verificar permisos
ls -la storage/
ls -la bootstrap/cache/
```

## 🎯 Próximos Pasos

Una vez que Laravel esté funcionando:

1. **Crear vistas Blade** (opcional, para interfaz web)
2. **Probar API** con Postman o curl
3. **Configurar email** en `.env`
4. **Crear más usuarios** de prueba
5. **Probar funcionalidades** una por una

## 📚 Referencias

- Documentación Laravel: https://laravel.com/docs
- cPanel SSH: Terminal en cPanel
- MySQL en cPanel: MySQL Databases

---

¿Necesitas ayuda con algún paso específico?

