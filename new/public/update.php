<?php
/**
 * Actualizador Web de Laravel
 * Acceder desde: https://tudominio.com/new/public/update.php
 * 
 * IMPORTANTE: Eliminar este archivo después de usarlo por seguridad
 */

// Contraseña simple para proteger (cambiar por una segura)
$password = 'actualizar2024';

// Verificar contraseña
session_start();
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['password'] === $password) {
        $_SESSION['authenticated'] = true;
    } else {
        ?>
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Actualizador Laravel</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100">
            <div class="min-h-screen flex items-center justify-center">
                <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <h1 class="text-2xl font-bold mb-4">🔐 Actualizador Laravel</h1>
                    <form method="POST">
                        <input type="password" name="password" placeholder="Contraseña" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4" required>
                        <button type="submit" class="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                            Acceder
                        </button>
                    </form>
                </div>
            </div>
        </body>
        </html>
        <?php
        exit;
    }
}

$output = [];
$errors = [];

// Procesar actualización
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'update') {
        // Hacer git pull
        chdir('..');
        exec('git pull origin main 2>&1', $output, $return);
        
        if ($return === 0) {
            // Instalar dependencias
            exec('composer install --no-dev --optimize-autoloader 2>&1', $output2, $return2);
            $output = array_merge($output, $output2);
            
            // Ejecutar migraciones
            exec('php artisan migrate --force 2>&1', $output3, $return3);
            $output = array_merge($output, $output3);
            
            // Limpiar y cachear
            exec('php artisan config:clear 2>&1', $output4, $return4);
            exec('php artisan config:cache 2>&1', $output5, $return5);
            exec('php artisan route:cache 2>&1', $output6, $return6);
            exec('php artisan view:cache 2>&1', $output7, $return7);
            
            $output = array_merge($output, $output4, $output5, $output6, $output7);
            
            if ($return === 0 && $return2 === 0) {
                $success = true;
            } else {
                $errors[] = "Algunos comandos fallaron";
            }
        } else {
            $errors[] = "Error al hacer git pull";
        }
    }
    
    if ($_POST['action'] === 'migrate') {
        chdir('..');
        exec('php artisan migrate --force 2>&1', $output, $return);
        if ($return === 0) {
            $success = true;
        } else {
            $errors[] = "Error al ejecutar migraciones";
        }
    }
    
    if ($_POST['action'] === 'clear_cache') {
        chdir('..');
        exec('php artisan config:clear 2>&1', $output1, $return1);
        exec('php artisan route:clear 2>&1', $output2, $return2);
        exec('php artisan view:clear 2>&1', $output3, $return3);
        exec('php artisan cache:clear 2>&1', $output4, $return4);
        $output = array_merge($output1, $output2, $output3, $output4);
        $success = true;
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Actualizador Laravel</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="min-h-screen py-12 px-4">
        <div class="max-w-3xl mx-auto">
            <div class="bg-white rounded-lg shadow-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-8">🔄 Actualizador Laravel</h1>
                
                <?php if (!empty($errors)): ?>
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <ul>
                            <?php foreach ($errors as $error): ?>
                                <li><?= htmlspecialchars($error) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>
                
                <?php if (isset($success) && $success): ?>
                    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        ✅ Operación completada exitosamente
                    </div>
                <?php endif; ?>
                
                <div class="space-y-4">
                    <!-- Actualizar todo -->
                    <form method="POST" class="bg-blue-50 p-4 rounded">
                        <h2 class="text-xl font-semibold mb-2">Actualizar Todo</h2>
                        <p class="text-sm text-gray-600 mb-4">Hace git pull, instala dependencias, ejecuta migraciones y optimiza cache</p>
                        <input type="hidden" name="action" value="update">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                            🔄 Actualizar Todo
                        </button>
                    </form>
                    
                    <!-- Solo migraciones -->
                    <form method="POST" class="bg-yellow-50 p-4 rounded">
                        <h2 class="text-xl font-semibold mb-2">Ejecutar Migraciones</h2>
                        <p class="text-sm text-gray-600 mb-4">Solo ejecuta las migraciones pendientes</p>
                        <input type="hidden" name="action" value="migrate">
                        <button type="submit" class="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700">
                            📦 Ejecutar Migraciones
                        </button>
                    </form>
                    
                    <!-- Limpiar cache -->
                    <form method="POST" class="bg-gray-50 p-4 rounded">
                        <h2 class="text-xl font-semibold mb-2">Limpiar Cache</h2>
                        <p class="text-sm text-gray-600 mb-4">Limpia todos los caches</p>
                        <input type="hidden" name="action" value="clear_cache">
                        <button type="submit" class="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
                            🧹 Limpiar Cache
                        </button>
                    </form>
                </div>
                
                <?php if (!empty($output)): ?>
                    <div class="mt-8">
                        <h3 class="font-semibold mb-2">Salida de comandos:</h3>
                        <pre class="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-sm"><?= htmlspecialchars(implode("\n", $output)) ?></pre>
                    </div>
                <?php endif; ?>
                
                <div class="mt-8 pt-6 border-t">
                    <p class="text-sm text-gray-600">
                        <strong>⚠️ Seguridad:</strong> Cambia la contraseña en update.php (línea 8) y elimina este archivo después de usarlo.
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

