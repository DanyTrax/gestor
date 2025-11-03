# 🔍 Debug: php artisan --version no muestra nada

## ❌ Problema

Cuando ejecutas `php artisan --version` no muestra nada (ni error ni versión).

## 🔍 Diagnóstico

Esto puede ser por varias razones. Vamos a diagnosticar paso a paso:

### 1. Verificar que artisan existe

```bash
cd ~/clients.dowgroupcol.com/new

# Verificar archivo
ls -la artisan

# Ver contenido
head -20 artisan
```

### 2. Verificar permisos

```bash
chmod +x artisan
ls -la artisan
```

### 3. Ejecutar con errores visibles

```bash
# Ver errores PHP
php -d display_errors=1 artisan --version

# O con error_reporting
php -d error_reporting=E_ALL artisan --version
```

### 4. Verificar que vendor existe

```bash
ls -la vendor/autoload.php
ls -la vendor/laravel/framework
```

### 5. Intentar cargar manualmente

```bash
php -r "require 'vendor/autoload.php'; echo 'Autoload OK\n';"
```

### 6. Verificar bootstrap/app.php

```bash
php -l bootstrap/app.php
cat bootstrap/app.php | head -10
```

### 7. Verificar errores en logs

```bash
tail -50 storage/logs/laravel.log 2>/dev/null || echo "No hay logs aún"
```

## ✅ Solución Rápida

Si `artisan` no existe o está corrupto:

```bash
cd ~/clients.dowgroupcol.com/new

# Crear artisan si no existe
cat > artisan << 'ARTISAN_EOF'
#!/usr/bin/env php
<?php

use Illuminate\Foundation\Application;
use Symfony\Component\Console\Input\ArgvInput;

define('LARAVEL_START', microtime(true));

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$status = $app->handleCommand(new ArgvInput);

exit($status);
ARTISAN_EOF

chmod +x artisan
php artisan --version
```

## 🔧 Verificación Completa

Ejecuta este script de diagnóstico completo:

```bash
cd ~/clients.dowgroupcol.com/new

echo "=== DIAGNÓSTICO COMPLETO ==="
echo ""
echo "1. Verificar artisan:"
ls -la artisan && echo "✅ artisan existe" || echo "❌ artisan NO existe"
echo ""

echo "2. Verificar vendor:"
[ -f "vendor/autoload.php" ] && echo "✅ vendor/autoload.php existe" || echo "❌ vendor/autoload.php NO existe"
echo ""

echo "3. Verificar bootstrap/app.php:"
[ -f "bootstrap/app.php" ] && echo "✅ bootstrap/app.php existe" || echo "❌ bootstrap/app.php NO existe"
php -l bootstrap/app.php 2>&1 | head -1
echo ""

echo "4. Intentar cargar Laravel:"
php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; echo '✅ Laravel cargado\n';" 2>&1
echo ""

echo "5. Probar artisan:"
php artisan --version 2>&1 || echo "❌ Error al ejecutar artisan"
```

