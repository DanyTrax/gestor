# Instalación Completa de Laravel - Local

## 🎯 Objetivo

Instalar y configurar Laravel **completamente localmente**, para luego hacer commit y en el servidor solo hacer `git pull` y ejecutar.

## 🚀 Paso 1: Ejecutar Script de Instalación

```bash
# Desde la raíz del proyecto
./scripts/install-laravel-complete.sh
```

Este script:
- ✅ Instala Laravel en `new/`
- ✅ Copia nuestros archivos (app/, database/, routes/)
- ✅ Instala dependencias (Sanctum, DomPDF, Image)
- ✅ Configura .env y .env.example
- ✅ Crea directorios necesarios
- ✅ Configura .gitignore

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
MAIL_FROM_ADDRESS=no_reply@dvsystemsas.com
MAIL_FROM_NAME="${APP_NAME}"
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

## 📝 Paso 7: Verificar .gitignore

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

## 📦 Paso 8: Commit y Push

```bash
# Desde la raíz del proyecto
git add new/
git commit -m "feat: agregar Laravel completo instalado y configurado localmente"
git push
```

## 🌐 Paso 9: En el Servidor (cPanel)

Una vez que todo esté en GitHub, en el servidor:

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com

# Actualizar código
git pull

# Ir a Laravel
cd new

# Copiar .env.example a .env (solo la primera vez)
cp .env.example .env

# Generar clave
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

# Crear enlace de storage
php artisan storage:link

# Crear usuario inicial
php artisan tinker
# (crear usuario como en paso 5)
```

## ✅ Checklist de Instalación Local

- [ ] Script ejecutado exitosamente
- [ ] .env configurado con base de datos local
- [ ] Base de datos creada localmente
- [ ] Migraciones ejecutadas
- [ ] Usuario inicial creado (opcional)
- [ ] Probado localmente (`php artisan serve`)
- [ ] Commit y push realizado

## ✅ Checklist en Servidor

- [ ] `git pull` ejecutado
- [ ] `.env` creado desde `.env.example`
- [ ] Clave generada (`php artisan key:generate`)
- [ ] Base de datos creada en cPanel
- [ ] `.env` configurado con datos del servidor
- [ ] Migraciones ejecutadas
- [ ] Permisos configurados
- [ ] Usuario inicial creado
- [ ] Acceso funcionando en `/new/`

## 🎯 Ventajas de Este Método

1. ✅ **Todo probado localmente** antes de subir
2. ✅ **Un solo commit** con Laravel completo
3. ✅ **Sin problemas de instalación** en servidor
4. ✅ **Dependencias ya instaladas** (vendor/)
5. ✅ **Más rápido** en el servidor (solo git pull)
6. ✅ **Sin problemas de permisos** durante instalación

## 📝 Notas Importantes

1. **vendor/ se sube**: Para facilitar, el script mantiene vendor/ en el repo. Si prefieres no subirlo:
   - Agregar `vendor/` a `.gitignore`
   - En servidor ejecutar: `composer install`

2. **.env NO se sube**: Está en `.gitignore`, cada servidor tiene su propio `.env`

3. **node_modules/**: Si instalas npm packages, no subirlos (agregar a .gitignore)

---

¿Listo para ejecutar el script localmente?

