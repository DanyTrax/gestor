<?php
/**
 * Script de Debug - Eliminar después de usar
 * Acceder: https://tudominio.com/new/public/debug.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Debug Laravel</h1>";

// 1. Verificar PHP
echo "<h2>1. Versión PHP</h2>";
echo "PHP Version: " . PHP_VERSION . "<br>";

// 2. Verificar directorios
echo "<h2>2. Directorios</h2>";
$dirs = ['../storage', '../bootstrap/cache', '../.env', '../.env.example'];
foreach ($dirs as $dir) {
    $exists = file_exists($dir) || is_dir($dir);
    $writable = is_writable($dir);
    echo "$dir: " . ($exists ? "✅ Existe" : "❌ No existe") . " | " . ($writable ? "✅ Escribible" : "❌ No escribible") . "<br>";
}

// 3. Verificar .env
echo "<h2>3. Archivo .env</h2>";
if (file_exists('../.env')) {
    echo "✅ .env existe<br>";
    $env = file_get_contents('../.env');
    // Mostrar solo algunas líneas (sin contraseñas)
    $lines = explode("\n", $env);
    foreach ($lines as $line) {
        if (strpos($line, 'APP_KEY') !== false || strpos($line, 'DB_CONNECTION') !== false || strpos($line, 'APP_URL') !== false) {
            echo htmlspecialchars($line) . "<br>";
        }
    }
} else {
    echo "❌ .env NO existe<br>";
}

// 4. Intentar cargar Laravel
echo "<h2>4. Cargar Laravel</h2>";
try {
    require __DIR__ . '/../vendor/autoload.php';
    echo "✅ Autoload cargado<br>";
    
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    echo "✅ Bootstrap cargado<br>";
    
    // Verificar conexión a BD
    try {
        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
        $config = $app->make('config');
        echo "✅ Config cargado<br>";
        
        $dbConnection = $config->get('database.default');
        echo "DB Connection: $dbConnection<br>";
        
        $dbDatabase = $config->get('database.connections.mysql.database');
        echo "DB Database: " . ($dbDatabase ?: 'No configurada') . "<br>";
        
    } catch (\Exception $e) {
        echo "❌ Error al cargar config: " . $e->getMessage() . "<br>";
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
    echo "Stack trace: <pre>" . $e->getTraceAsString() . "</pre>";
}

// 5. Verificar logs
echo "<h2>5. Últimos errores en log</h2>";
$logFile = '../storage/logs/laravel.log';
if (file_exists($logFile)) {
    $lines = file($logFile);
    $lastLines = array_slice($lines, -20); // Últimas 20 líneas
    echo "<pre>" . htmlspecialchars(implode('', $lastLines)) . "</pre>";
} else {
    echo "❌ Archivo de log no existe<br>";
}

// 6. Verificar rutas
echo "<h2>6. Verificar rutas</h2>";
try {
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    $router = $app->make('router');
    $routes = $router->getRoutes();
    echo "Total de rutas: " . count($routes) . "<br>";
    
    // Buscar ruta de login
    foreach ($routes as $route) {
        if (strpos($route->uri(), 'login') !== false) {
            echo "Ruta login encontrada: " . $route->uri() . " -> " . ($route->getActionName() ?: 'Closure') . "<br>";
        }
    }
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
}

echo "<hr>";
echo "<p><strong>⚠️ IMPORTANTE:</strong> Elimina este archivo después de depurar por seguridad.</p>";

