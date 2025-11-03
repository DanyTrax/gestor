# Instalar Laravel Localmente y Subir con Git

## 🎯 Ventajas de Instalar Localmente

✅ **Más rápido** - No depende de la conexión del servidor
✅ **Más fácil** - Ambiente de desarrollo completo
✅ **Sin problemas de permisos** - Todo funciona mejor localmente
✅ **Puedes probar** antes de subir
✅ **Un solo commit** - Subes todo listo

## 🚀 Paso 1: Instalar Laravel Localmente

### Opción A: Usar el Script (Recomendado)

```bash
# Desde la raíz del proyecto
./scripts/setup-laravel-local.sh
```

### Opción B: Manual

```bash
cd new

# Limpiar si hay archivos
mkdir -p ../temp-our-files
[ -d "app" ] && mv app ../temp-our-files/
[ -d "database" ] && mv database ../temp-our-files/
[ -d "routes" ] && mv routes ../temp-our-files/
[ -d "bootstrap" ] && mv bootstrap ../temp-our-files/

# Instalar Laravel
composer create-project laravel/laravel . --prefer-dist

# Copiar nuestros archivos
cp -r ../temp-our-files/app/* app/
cp -r ../temp-our-files/database/migrations/* database/migrations/
cp -r ../temp-our-files/routes/* routes/
[ -f ../temp-our-files/bootstrap/app.php ] && cp ../temp-our-files/bootstrap/app.php bootstrap/app.php

# Limpiar
rm -rf ../temp-our-files

# Instalar dependencias
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image

# Configurar .env
cp .env.example .env
php artisan key:generate
```

## ⚙️ Paso 2: Configurar .env Local

Editar `new/.env`:

```env
APP_NAME="Gestor de Cobros"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestor_cobros
DB_USERNAME=root
DB_PASSWORD=

# Email (opcional para pruebas locales)
MAIL_MAILER=smtp
MAIL_HOST=mail.dvsystemsas.com
MAIL_PORT=465
MAIL_USERNAME=no_reply@dvsystemsas.com
MAIL_PASSWORD=
MAIL_ENCRYPTION=ssl
```

## 🗄️ Paso 3: Crear Base de Datos Local

```bash
# MySQL
mysql -u root -p

CREATE DATABASE gestor_cobros CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

O usar phpMyAdmin si tienes XAMPP/MAMP.

## 🔄 Paso 4: Ejecutar Migraciones Localmente

```bash
cd new
php artisan migrate
```

## 👤 Paso 5: Crear Usuario Inicial (Opcional)

```bash
cd new
php artisan tinker
```

```php
\App\Models\User::create([
    'email' => 'admin@test.com',
    'password' => \Hash::make('password123'),
    'full_name' => 'Admin Test',
    'role' => 'superadmin',
    'status' => 'active',
    'is_profile_complete' => true,
]);
exit
```

## 🧪 Paso 6: Probar Localmente

```bash
cd new
php artisan serve
```

Acceder a: `http://localhost:8000`

## 📝 Paso 7: Actualizar .gitignore

Asegúrate de que `new/.gitignore` incluya:

```
/node_modules
/public/hot
/public/storage
/storage/*.key
/vendor
.env
.env.backup
.phpunit.result.cache
Homestead.json
Homestead.yaml
npm-debug.log
yarn-error.log
/.idea
/.vscode
```

**IMPORTANTE:** `.env` debe estar en `.gitignore` (no subir credenciales)

## 🚀 Paso 8: Crear .env.example para Servidor

Crear `new/.env.example` con valores de ejemplo:

```env
APP_NAME="Gestor de Cobros"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://clients.dowgroupcol.com/new

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=mail.dvsystemsas.com
MAIL_PORT=465
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=ssl
```

## 📦 Paso 9: Commit y Push

```bash
# Desde la raíz del proyecto
git add new/
git commit -m "feat: agregar Laravel completo con todas las dependencias instaladas"
git push
```

## 🌐 Paso 10: En el Servidor (cPanel)

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com
git pull

cd new

# Copiar .env.example a .env
cp .env.example .env

# Generar clave (si no se generó antes)
php artisan key:generate

# Editar .env con datos del servidor
nano .env
# O desde File Manager en cPanel

# Configurar base de datos (crear en cPanel → MySQL Databases)

# Ejecutar migraciones
php artisan migrate

# Configurar permisos
chmod -R 755 storage bootstrap/cache
chown -R dowgroupcol:nobody storage bootstrap/cache

# Crear usuario inicial
php artisan tinker
# (crear usuario como en paso 5)
```

## ✅ Ventajas de Este Método

1. ✅ **Todo probado localmente** antes de subir
2. ✅ **Un solo commit** con todo Laravel
3. ✅ **Sin problemas de instalación** en servidor
4. ✅ **Dependencias ya instaladas** (vendor/)
5. ✅ **Más rápido** en el servidor (solo git pull)

## ⚠️ Notas Importantes

1. **vendor/ se sube**: Aunque normalmente no se sube `vendor/`, para facilitar puedes subirlo. Si prefieres no subirlo:
   ```bash
   # En .gitignore agregar vendor/
   # En servidor ejecutar: composer install
   ```

2. **.env NO se sube**: Está en `.gitignore`, cada servidor tiene su propio `.env`

3. **node_modules/**: Si instalas npm packages, no subirlos (agregar a .gitignore)

## 🎯 Resumen del Flujo

```
Local:
1. Ejecutar script de instalación
2. Configurar .env local
3. Probar localmente
4. Commit y push

Servidor:
1. git pull
2. Configurar .env del servidor
3. Ejecutar migraciones
4. ¡Listo!
```

---

¿Listo para instalar localmente?

