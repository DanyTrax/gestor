#!/bin/bash

# Script para verificar y restaurar bootstrap/app.php

echo "🔍 Verificando bootstrap/app.php..."

cd ~/clients.dowgroupcol.com/new || exit 1

# Verificar si existe
if [ -f "bootstrap/app.php" ]; then
    echo "✅ bootstrap/app.php existe"
    php -l bootstrap/app.php
    exit 0
fi

echo "❌ bootstrap/app.php NO existe"
echo "📥 Intentando restaurar desde git..."

# Intentar pull
git pull origin main

if [ -f "bootstrap/app.php" ]; then
    echo "✅ Restaurado desde git"
    exit 0
fi

echo "❌ No se pudo restaurar desde git"
echo "🔧 Creando archivo manualmente..."

# Crear directorio si no existe
mkdir -p bootstrap

# Crear el archivo
cat > bootstrap/app.php << 'EOF'
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
EOF

chmod 644 bootstrap/app.php

if [ -f "bootstrap/app.php" ]; then
    echo "✅ Archivo creado exitosamente"
    php -l bootstrap/app.php
    echo "✅ Sintaxis PHP válida"
else
    echo "❌ Error al crear el archivo"
    exit 1
fi

