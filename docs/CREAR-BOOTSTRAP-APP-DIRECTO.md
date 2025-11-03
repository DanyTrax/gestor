# 🔧 Crear bootstrap/app.php Directamente

## ⚡ Solución Rápida

Ejecuta estos comandos **directamente en el servidor**:

```bash
cd ~/clients.dowgroupcol.com/new

# 1. Verificar si existe
ls -la bootstrap/app.php

# Si NO existe, crear el directorio y archivo:
mkdir -p bootstrap

# 2. Crear el archivo
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

# 3. Dar permisos
chmod 644 bootstrap/app.php

# 4. Verificar sintaxis
php -l bootstrap/app.php

# 5. Probar Laravel
php artisan --version
```

## ✅ Verificación

Después de crear el archivo:

```bash
# Verificar que existe
ls -la bootstrap/app.php

# Verificar sintaxis PHP
php -l bootstrap/app.php
# Debe decir: "No syntax errors detected"

# Probar Laravel
php artisan --version
# Debe mostrar: "Laravel Framework 10.x.x"

# Probar en navegador
# https://clients.dowgroupcol.com/new/public/debug.php
```

## 📝 Nota

Si prefieres hacer `git pull` primero:

```bash
cd ~/clients.dowgroupcol.com/new
git pull origin main
ls -la bootstrap/app.php
```

Si después del pull aún no existe, entonces usa el comando `cat` de arriba para crearlo manualmente.

