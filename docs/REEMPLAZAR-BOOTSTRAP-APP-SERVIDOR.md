# 🔧 Reemplazar bootstrap/app.php en el Servidor

## ❌ Error Actual

El archivo en el servidor todavía tiene la sintaxis de Laravel 11, pero necesitamos Laravel 10.

## ✅ Solución Directa

Ejecuta estos comandos **directamente en SSH**:

```bash
cd ~/clients.dowgroupcol.com/new

# 1. Hacer backup del archivo actual
cp bootstrap/app.php bootstrap/app.php.backup

# 2. Reemplazar con la versión correcta para Laravel 10
cat > bootstrap/app.php << 'EOF'
<?php

$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

/*
|--------------------------------------------------------------------------
| Bind Important Interfaces
|--------------------------------------------------------------------------
|
| Next, we need to bind some important interfaces into the container so
| we will be able to resolve them when needed. The kernels serve the
| incoming requests to this application from both the web and CLI.
|
*/

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

/*
|--------------------------------------------------------------------------
| Return The Application
|--------------------------------------------------------------------------
|
| This script returns the application instance. The instance is given to
| the calling script so we can separate the building of the instances
| from the actual running of the application and sending responses.
|
*/

return $app;
EOF

# 3. Verificar sintaxis
php -l bootstrap/app.php

# 4. Verificar que el archivo fue actualizado
head -5 bootstrap/app.php
# Debe mostrar: $app = new Illuminate\Foundation\Application
```

## 🔍 Verificación

Después de ejecutar los comandos:

```bash
# Verificar sintaxis
php -l bootstrap/app.php
# Debe decir: "No syntax errors detected"

# Probar Laravel
php artisan --version
# Debe mostrar: "Laravel Framework 10.x.x"

# Verificar en navegador
# https://clients.dowgroupcol.com/new/public/debug.php
```

## 📝 Nota

Si después de esto sigue apareciendo el error, puede ser cache. Limpia el cache:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

