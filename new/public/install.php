<?php
/**
 * Instalador Web de Laravel
 * Acceder desde: https://tudominio.com/new/public/install.php
 * 
 * IMPORTANTE: Eliminar este archivo después de la instalación por seguridad
 */

// Configuración
error_reporting(E_ALL);
ini_set('display_errors', 1);

$step = $_GET['step'] ?? 1;
$errors = [];
$success = [];

// Procesar formularios
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $step = (int)$_POST['step'];
    
    if ($step == 2) {
        // Configurar .env
        $envContent = file_get_contents('../.env.example');
        $envContent = str_replace('DB_DATABASE=laravel', 'DB_DATABASE=' . $_POST['db_database'], $envContent);
        $envContent = str_replace('DB_USERNAME=root', 'DB_USERNAME=' . $_POST['db_username'], $envContent);
        $envContent = str_replace('DB_PASSWORD=', 'DB_PASSWORD=' . $_POST['db_password'], $envContent);
        $envContent = str_replace('APP_URL=http://localhost', 'APP_URL=' . $_POST['app_url'], $envContent);
        $envContent = str_replace('APP_DEBUG=true', 'APP_DEBUG=false', $envContent);
        $envContent = str_replace('SESSION_DRIVER=file', 'SESSION_DRIVER=database', $envContent);
        
        file_put_contents('../.env', $envContent);
        $success[] = "Archivo .env configurado correctamente";
    }
    
    if ($step == 3) {
        // Ejecutar comandos
        $commands = [
            'php ../artisan key:generate --force',
            'php ../artisan migrate --force',
            'php ../artisan session:table',
            'php ../artisan migrate --force',
            'php ../artisan config:cache',
            'php ../artisan route:cache',
            'php ../artisan view:cache',
        ];
        
        foreach ($commands as $cmd) {
            exec($cmd . ' 2>&1', $output, $return);
            if ($return !== 0) {
                $errors[] = "Error en: $cmd - " . implode("\n", $output);
            }
        }
        
        if (empty($errors)) {
            $success[] = "Laravel instalado correctamente";
        }
    }
    
    if ($step == 4 && isset($_POST['create_user'])) {
        // Crear usuario
        $email = $_POST['email'];
        $password = $_POST['password'];
        $name = $_POST['name'];
        
        $tinkerCmd = "php ../artisan tinker --execute=\"
            \$user = App\Models\User::create([
                'email' => '$email',
                'password' => bcrypt('$password'),
                'full_name' => '$name',
                'role' => 'superadmin',
                'status' => 'active',
                'is_profile_complete' => true
            ]);
            echo 'Usuario creado: ' . \$user->email;
        \"";
        
        exec($tinkerCmd . ' 2>&1', $output, $return);
        if ($return === 0) {
            $success[] = "Usuario creado: $email";
        } else {
            $errors[] = "Error al crear usuario: " . implode("\n", $output);
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalador Laravel</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="min-h-screen py-12 px-4">
        <div class="max-w-3xl mx-auto">
            <div class="bg-white rounded-lg shadow-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-8">🚀 Instalador Laravel</h1>
                
                <?php if (!empty($errors)): ?>
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <ul>
                            <?php foreach ($errors as $error): ?>
                                <li><?= htmlspecialchars($error) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>
                
                <?php if (!empty($success)): ?>
                    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        <ul>
                            <?php foreach ($success as $msg): ?>
                                <li><?= htmlspecialchars($msg) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>
                
                <!-- Paso 1: Verificar requisitos -->
                <?php if ($step == 1): ?>
                    <div class="mb-6">
                        <h2 class="text-xl font-semibold mb-4">Paso 1: Verificar Requisitos</h2>
                        
                        <?php
                        $checks = [
                            'PHP >= 8.1' => version_compare(PHP_VERSION, '8.1.0', '>='),
                            'Composer' => shell_exec('composer --version') !== null,
                            'Directorio .env.example' => file_exists('../.env.example'),
                            'Directorio storage' => is_dir('../storage'),
                            'Permisos storage' => is_writable('../storage'),
                        ];
                        ?>
                        
                        <ul class="space-y-2">
                            <?php foreach ($checks as $check => $ok): ?>
                                <li class="flex items-center">
                                    <?php if ($ok): ?>
                                        <span class="text-green-500 mr-2">✅</span>
                                    <?php else: ?>
                                        <span class="text-red-500 mr-2">❌</span>
                                    <?php endif; ?>
                                    <?= htmlspecialchars($check) ?>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                        
                        <?php if (array_sum($checks) === count($checks)): ?>
                            <a href="?step=2" class="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                                Siguiente →
                            </a>
                        <?php else: ?>
                            <p class="mt-4 text-red-600">Por favor corrige los errores antes de continuar</p>
                        <?php endif; ?>
                    </div>
                
                <!-- Paso 2: Configurar Base de Datos -->
                <?php elseif ($step == 2): ?>
                    <form method="POST" class="space-y-4">
                        <input type="hidden" name="step" value="2">
                        <h2 class="text-xl font-semibold mb-4">Paso 2: Configurar Base de Datos</h2>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">URL de la Aplicación</label>
                            <input type="text" name="app_url" value="<?= $_POST['app_url'] ?? 'https://' . $_SERVER['HTTP_HOST'] . '/new/public' ?>" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Base de Datos</label>
                            <input type="text" name="db_database" value="<?= $_POST['db_database'] ?? '' ?>" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                                   placeholder="usuario_gestor_cobros" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario BD</label>
                            <input type="text" name="db_username" value="<?= $_POST['db_username'] ?? '' ?>" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña BD</label>
                            <input type="password" name="db_password" value="<?= $_POST['db_password'] ?? '' ?>" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                        </div>
                        
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                            Guardar y Continuar →
                        </button>
                    </form>
                
                <!-- Paso 3: Instalar Laravel -->
                <?php elseif ($step == 3): ?>
                    <div class="mb-6">
                        <h2 class="text-xl font-semibold mb-4">Paso 3: Instalar Laravel</h2>
                        <p class="mb-4">Se ejecutarán los siguientes comandos:</p>
                        <ul class="list-disc list-inside mb-4 space-y-1">
                            <li>Generar APP_KEY</li>
                            <li>Ejecutar migraciones (crear tablas)</li>
                            <li>Crear tabla de sesiones</li>
                            <li>Optimizar cache</li>
                        </ul>
                        
                        <form method="POST">
                            <input type="hidden" name="step" value="3">
                            <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                                Instalar Ahora
                            </button>
                        </form>
                    </div>
                
                <!-- Paso 4: Crear Usuario -->
                <?php elseif ($step == 4): ?>
                    <form method="POST" class="space-y-4">
                        <input type="hidden" name="step" value="4">
                        <input type="hidden" name="create_user" value="1">
                        <h2 class="text-xl font-semibold mb-4">Paso 4: Crear Usuario Administrador</h2>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <input type="text" name="name" value="<?= $_POST['name'] ?? 'Administrador' ?>" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" value="<?= $_POST['email'] ?? '' ?>" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input type="password" name="password" value="<?= $_POST['password'] ?? '' ?>" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                        </div>
                        
                        <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                            Crear Usuario
                        </button>
                    </form>
                
                <!-- Paso 5: Completado -->
                <?php elseif ($step == 5): ?>
                    <div class="text-center">
                        <h2 class="text-2xl font-semibold text-green-600 mb-4">✅ Instalación Completada</h2>
                        <p class="mb-4">Laravel ha sido instalado correctamente.</p>
                        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                            <strong>⚠️ IMPORTANTE:</strong> Elimina este archivo (install.php) por seguridad.
                        </div>
                        <a href="/login" class="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                            Ir al Login
                        </a>
                    </div>
                <?php endif; ?>
                
                <div class="mt-8 pt-6 border-t">
                    <a href="?step=<?= max(1, $step - 1) ?>" class="text-gray-600 hover:text-gray-800">
                        ← Atrás
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

