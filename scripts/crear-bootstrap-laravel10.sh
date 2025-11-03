#!/bin/bash

# Script para crear bootstrap/app.php correcto para Laravel 10

cd ~/clients.dowgroupcol.com/new || exit 1

echo "🔧 Creando bootstrap/app.php para Laravel 10..."

# Crear bootstrap/app.php
cat > bootstrap/app.php << 'BOOTSTRAP_EOF'
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
BOOTSTRAP_EOF

chmod 644 bootstrap/app.php

echo "✅ bootstrap/app.php creado"

# Verificar sintaxis
if php -l bootstrap/app.php; then
    echo "✅ Sintaxis PHP válida"
else
    echo "❌ Error de sintaxis"
    exit 1
fi

# Verificar si existen las clases necesarias
echo "🔍 Verificando clases necesarias..."

if [ ! -f "app/Http/Kernel.php" ]; then
    echo "⚠️  app/Http/Kernel.php no existe - necesitamos crearlo"
fi

if [ ! -f "app/Console/Kernel.php" ]; then
    echo "⚠️  app/Console/Kernel.php no existe - necesitamos crearlo"
fi

if [ ! -f "app/Exceptions/Handler.php" ]; then
    echo "⚠️  app/Exceptions/Handler.php no existe - necesitamos crearlo"
fi

echo "✅ Script completado"

