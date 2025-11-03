# Pasos para Migración a Laravel

## ✅ Lo que ya está creado:

1. ✅ **10 Migraciones** de base de datos
2. ✅ **10 Modelos** con relaciones
3. ✅ **Script de migración** Firebase → SQL
4. ✅ **Script de instalación** Laravel

## 📋 Próximos Pasos:

### Paso 1: Instalar Laravel en el servidor

```bash
cd /var/www/html/gestor-cobros
chmod +x setup-laravel.sh
./setup-laravel.sh
```

O manualmente:

```bash
cd /var/www/html/gestor-cobros
mkdir -p gestor-cobros-new
cd gestor-cobros-new
composer create-project laravel/laravel . --prefer-dist
```

### Paso 2: Copiar archivos creados

```bash
# Copiar migraciones
cp -r database/migrations/* gestor-cobros-new/database/migrations/

# Copiar modelos
cp -r app/Models/* gestor-cobros-new/app/Models/

# Copiar scripts
cp -r scripts/* gestor-cobros-new/scripts/
```

### Paso 3: Instalar paquetes adicionales

```bash
cd gestor-cobros-new
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image
composer require kreait/firebase-php
```

### Paso 4: Configurar .env

```bash
cd gestor-cobros-new
cp .env.example .env
php artisan key:generate
```

Editar `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestor_cobros
DB_USERNAME=root
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

### Paso 5: Crear base de datos

```sql
CREATE DATABASE gestor_cobros CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Paso 6: Ejecutar migraciones

```bash
cd gestor-cobros-new
php artisan migrate
```

### Paso 7: Configurar Firebase Credentials

1. Descargar credenciales de Firebase Console
2. Guardar como `firebase-credentials.json` en el proyecto
3. Configurar permisos:

```bash
chmod 600 firebase-credentials.json
```

### Paso 8: Ejecutar migración de datos

```bash
cd gestor-cobros-new
php scripts/migrate-firebase-to-sql.php
```

### Paso 9: Configurar Apache

```apache
# /etc/apache2/sites-available/gestor-cobros.conf

<VirtualHost *:80>
    ServerName clients.dowgroupcol.com
    
    # Sistema actual (default)
    DocumentRoot /var/www/html/gestor-cobros/current
    
    # Sistema nuevo (testing)
    Alias /new /var/www/html/gestor-cobros/gestor-cobros-new/public
    
    <Directory /var/www/html/gestor-cobros/gestor-cobros-new/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Paso 10: Probar acceso

- Sistema actual: `https://clients.dowgroupcol.com/`
- Sistema nuevo: `https://clients.dowgroupcol.com/new/`

## 📝 Notas Importantes:

1. **No eliminar** el sistema actual hasta que el nuevo esté completamente probado
2. **Backup** de Firebase antes de migrar
3. **Backup** de MySQL después de migrar
4. **Validar datos** después de la migración
5. **Testing** en paralelo antes de cambiar rutas

## 🔄 Siguiente: Crear Controladores

Una vez completados estos pasos, crear:
- Controladores Web (MVC)
- Controladores API (REST)
- Rutas
- Vistas Blade

¿Listo para continuar?

