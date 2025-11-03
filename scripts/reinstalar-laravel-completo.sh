#!/bin/bash

# Script para reinstalar Laravel completamente en el servidor

echo "🚀 Reinstalando Laravel completamente..."
echo "=========================================="

cd ~/clients.dowgroupcol.com/new || exit 1

# 1. Verificar Composer
echo ""
echo "1️⃣ Verificando Composer..."
if ! command -v composer &> /dev/null; then
    echo "❌ Composer no está instalado"
    exit 1
fi
composer --version
echo "✅ Composer OK"

# 2. Verificar PHP
echo ""
echo "2️⃣ Verificando PHP..."
php -v
php -m | grep -E "(pdo_mysql|openssl|fileinfo|mbstring)" || echo "⚠️  Algunas extensiones pueden faltar"
echo "✅ PHP OK"

# 3. Backup de archivos importantes
echo ""
echo "3️⃣ Haciendo backup de archivos importantes..."
mkdir -p ../backup-laravel-$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="../backup-laravel-$(date +%Y%m%d_%H%M%S)"
cp .env "$BACKUP_DIR/.env" 2>/dev/null || echo "⚠️  .env no existe"
cp -r app "$BACKUP_DIR/app" 2>/dev/null || true
cp -r routes "$BACKUP_DIR/routes" 2>/dev/null || true
cp -r database "$BACKUP_DIR/database" 2>/dev/null || true
echo "✅ Backup creado en: $BACKUP_DIR"

# 4. Eliminar vendor y lock
echo ""
echo "4️⃣ Limpiando instalación anterior..."
rm -rf vendor
rm -f composer.lock
echo "✅ Limpiado"

# 5. Reinstalar dependencias
echo ""
echo "5️⃣ Reinstalando todas las dependencias de Composer..."
echo "⏳ Esto puede tardar 3-5 minutos..."
composer install --no-dev --optimize-autoloader

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas"

# 6. Verificar que vendor existe
echo ""
echo "6️⃣ Verificando instalación..."
if [ ! -d "vendor" ]; then
    echo "❌ Directorio vendor no existe"
    exit 1
fi

if [ ! -f "vendor/autoload.php" ]; then
    echo "❌ autoload.php no existe"
    exit 1
fi
echo "✅ vendor/ existe y tiene autoload.php"

# 7. Verificar archivos críticos de Laravel
echo ""
echo "7️⃣ Verificando archivos críticos de Laravel..."

# Verificar bootstrap/app.php
if [ ! -f "bootstrap/app.php" ]; then
    echo "⚠️  bootstrap/app.php no existe - creándolo..."
    mkdir -p bootstrap
    cat > bootstrap/app.php << 'BOOTSTRAP_EOF'
<?php

$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

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

return $app;
BOOTSTRAP_EOF
    echo "✅ bootstrap/app.php creado"
fi

# Verificar app/Http/Kernel.php
if [ ! -f "app/Http/Kernel.php" ]; then
    echo "⚠️  app/Http/Kernel.php no existe - creándolo..."
    mkdir -p app/Http
    cat > app/Http/Kernel.php << 'KERNEL_EOF'
<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $middleware = [
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    protected $middlewareGroups = [
        'web' => [
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
        'api' => [
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    protected $middlewareAliases = [
        'auth' => \Illuminate\Auth\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
        'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \Illuminate\Auth\Middleware\RedirectIfAuthenticated::class,
        'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
        'precognitive' => \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
        'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
        'role' => \App\Http\Middleware\CheckRole::class,
    ];
}
KERNEL_EOF
    echo "✅ app/Http/Kernel.php creado"
fi

# Verificar app/Console/Kernel.php
if [ ! -f "app/Console/Kernel.php" ]; then
    echo "⚠️  app/Console/Kernel.php no existe - creándolo..."
    mkdir -p app/Console
    cat > app/Console/Kernel.php << 'CONSOLE_EOF'
<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        //
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
CONSOLE_EOF
    echo "✅ app/Console/Kernel.php creado"
fi

# Verificar app/Exceptions/Handler.php
if [ ! -f "app/Exceptions/Handler.php" ]; then
    echo "⚠️  app/Exceptions/Handler.php no existe - creándolo..."
    mkdir -p app/Exceptions
    cat > app/Exceptions/Handler.php << 'HANDLER_EOF'
<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }
}
HANDLER_EOF
    echo "✅ app/Exceptions/Handler.php creado"
fi

# Verificar public/index.php
if [ ! -f "public/index.php" ]; then
    echo "⚠️  public/index.php no existe - creándolo..."
    cat > public/index.php << 'INDEX_EOF'
<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
INDEX_EOF
    echo "✅ public/index.php creado"
fi

echo ""
echo "✅ Todos los archivos críticos verificados"

# 8. Verificar sintaxis
echo ""
echo "8️⃣ Verificando sintaxis PHP..."
php -l bootstrap/app.php && echo "✅ bootstrap/app.php OK"
php -l app/Http/Kernel.php && echo "✅ Kernel.php OK"
php -l app/Console/Kernel.php && echo "✅ Console Kernel OK"
php -l app/Exceptions/Handler.php && echo "✅ Handler.php OK"

# 9. Probar Laravel
echo ""
echo "9️⃣ Probando Laravel..."
php artisan --version && echo "✅ Laravel funciona correctamente" || echo "⚠️  Laravel tiene problemas"

# 10. Configurar permisos
echo ""
echo "🔟 Configurando permisos..."
chmod -R 775 storage bootstrap/cache 2>/dev/null || true
echo "✅ Permisos configurados"

# 11. Resumen
echo ""
echo "=========================================="
echo "✅ REINSTALACIÓN COMPLETA"
echo "=========================================="
echo ""
echo "📋 Próximos pasos:"
echo "1. Verificar .env está configurado"
echo "2. Ejecutar: php artisan key:generate"
echo "3. Ejecutar: php artisan migrate --force"
echo "4. Probar en navegador: https://clients.dowgroupcol.com/new/public/debug.php"
echo ""

