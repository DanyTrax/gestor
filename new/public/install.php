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

// Crear directorios necesarios si no existen
if (!is_dir('../storage')) {
    mkdir('../storage', 0755, true);
    mkdir('../storage/framework', 0755, true);
    mkdir('../storage/framework/sessions', 0755, true);
    mkdir('../storage/framework/views', 0755, true);
    mkdir('../storage/framework/cache', 0755, true);
    mkdir('../storage/logs', 0755, true);
    mkdir('../storage/app', 0755, true);
    mkdir('../storage/app/public', 0755, true);
    mkdir('../bootstrap/cache', 0755, true);
    $success[] = "Directorio storage creado";
}

// Intentar configurar permisos
if (is_dir('../storage')) {
    @chmod('../storage', 0775);
    @chmod('../bootstrap/cache', 0775);
    $success[] = "Permisos configurados";
}

// Procesar formularios
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $step = (int)$_POST['step'];
    
    if ($step == 2 && isset($_POST['db_database'])) {
        // Configurar .env
        if (!file_exists('../.env.example')) {
            $errors[] = "No se encontró .env.example";
        } else {
            $envContent = file_get_contents('../.env.example');
            
            // Reemplazos más robustos
            $envContent = preg_replace('/DB_DATABASE=.*/m', 'DB_DATABASE=' . $_POST['db_database'], $envContent);
            $envContent = preg_replace('/DB_USERNAME=.*/m', 'DB_USERNAME=' . $_POST['db_username'], $envContent);
            $envContent = preg_replace('/DB_PASSWORD=.*/m', 'DB_PASSWORD=' . $_POST['db_password'], $envContent);
            $envContent = preg_replace('/APP_URL=.*/m', 'APP_URL=' . $_POST['app_url'], $envContent);
            $envContent = preg_replace('/APP_DEBUG=.*/m', 'APP_DEBUG=false', $envContent);
            $envContent = preg_replace('/SESSION_DRIVER=.*/m', 'SESSION_DRIVER=database', $envContent);
            
            if (file_put_contents('../.env', $envContent)) {
                $success[] = "Archivo .env configurado correctamente";
                // Redirigir al paso 3 automáticamente
                header('Location: ?step=3');
                exit;
            } else {
                $errors[] = "Error al escribir .env. Verifica permisos.";
            }
        }
    }
    
    if ($step == 3) {
        // Verificar si podemos ejecutar comandos
        $canExecute = function_exists('exec') && !in_array('exec', explode(',', ini_get('disable_functions')));
        
        if ($canExecute) {
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
        } else {
            // No se pueden ejecutar comandos, mostrar instrucciones
            $manualMode = true;
        }
    }
    
    if ($step == 4 && isset($_POST['create_user'])) {
        // Crear usuario
        $email = $_POST['email'];
        $password = $_POST['password'];
        $name = $_POST['name'];
        
        $canExecute = function_exists('exec') && !in_array('exec', explode(',', ini_get('disable_functions')));
        
        if ($canExecute) {
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
                $manualUserCreation = true;
            }
        } else {
            $manualUserCreation = true;
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
                        // Verificar si shell_exec está disponible
                        $shellExecAvailable = function_exists('shell_exec') && !in_array('shell_exec', explode(',', ini_get('disable_functions')));
                        
                        // Verificar directorios
                        $storageExists = is_dir('../storage');
                        $storageWritable = is_writable('../storage');
                        $bootstrapCacheExists = is_dir('../bootstrap/cache');
                        $bootstrapCacheWritable = is_writable('../bootstrap/cache');
                        
                        $checks = [
                            'PHP >= 8.1' => version_compare(PHP_VERSION, '8.1.0', '>='),
                            'Composer' => $shellExecAvailable ? (shell_exec('composer --version') !== null) : null,
                            'Directorio .env.example' => file_exists('../.env.example'),
                            'Directorio storage' => $storageExists,
                            'Permisos storage' => $storageWritable,
                            'Directorio bootstrap/cache' => $bootstrapCacheExists,
                            'Permisos bootstrap/cache' => $bootstrapCacheWritable,
                            'shell_exec disponible' => $shellExecAvailable,
                        ];
                        ?>
                        
                        <ul class="space-y-2">
                            <?php foreach ($checks as $check => $ok): ?>
                                <li class="flex items-center">
                                    <?php if ($ok === true): ?>
                                        <span class="text-green-500 mr-2">✅</span>
                                    <?php elseif ($ok === false): ?>
                                        <span class="text-red-500 mr-2">❌</span>
                                    <?php else: ?>
                                        <span class="text-yellow-500 mr-2">⚠️</span>
                                    <?php endif; ?>
                                    <?= htmlspecialchars($check) ?>
                                    <?php if ($ok === null): ?>
                                        <span class="text-gray-500 text-sm ml-2">(No verificado)</span>
                                    <?php endif; ?>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                        
                        <?php if (!$shellExecAvailable): ?>
                            <div class="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                                <p class="font-semibold">⚠️ shell_exec() no está disponible</p>
                                <p class="text-sm mt-2">No se pueden ejecutar comandos automáticamente. El instalador te guiará paso a paso con instrucciones manuales.</p>
                            </div>
                        <?php endif; ?>
                        
                        <?php if (!$storageExists || !$storageWritable || !$bootstrapCacheExists || !$bootstrapCacheWritable): ?>
                            <div class="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                                <p class="font-semibold">⚠️ Problemas con directorios o permisos</p>
                                <p class="text-sm mt-2">Si los directorios no se crearon automáticamente, ejecuta estos comandos desde SSH:</p>
                                <pre class="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto"><code>cd ~/clients.dowgroupcol.com/new
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs storage/app/public
mkdir -p bootstrap/cache
chmod -R 775 storage bootstrap/cache</code></pre>
                            </div>
                        <?php endif; ?>
                        
                        <?php 
                        // Verificar solo los requisitos críticos
                        $criticalChecks = [
                            'PHP >= 8.1' => $checks['PHP >= 8.1'],
                            'Directorio .env.example' => $checks['Directorio .env.example'],
                        ];
                        
                        $criticalOk = array_sum(array_filter($criticalChecks)) === count($criticalChecks);
                        ?>
                        
                        <?php if ($criticalOk): ?>
                            <a href="?step=2" class="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                                Continuar (Algunos checks pueden requerir configuración manual) →
                            </a>
                        <?php else: ?>
                            <p class="mt-4 text-red-600">Por favor corrige los errores críticos antes de continuar</p>
                        <?php endif; ?>
                    </div>
                
                <!-- Paso 2: Configurar Base de Datos -->
                <?php elseif ($step == 2): ?>
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
                    
                    <form method="POST" class="space-y-4" action="?step=2">
                        <input type="hidden" name="step" value="2">
                        <h2 class="text-xl font-semibold mb-4">Paso 2: Configurar Base de Datos</h2>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">URL de la Aplicación</label>
                            <input type="text" name="app_url" value="<?= htmlspecialchars($_POST['app_url'] ?? 'https://' . $_SERVER['HTTP_HOST'] . '/new/public') ?>" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Base de Datos</label>
                            <input type="text" name="db_database" value="<?= htmlspecialchars($_POST['db_database'] ?? '') ?>" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                                   placeholder="usuario_gestor_cobros" required>
                            <p class="text-xs text-gray-500 mt-1">Nombre completo de la base de datos (ej: dowgroupcol_gestor_cobros)</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario BD</label>
                            <input type="text" name="db_username" value="<?= htmlspecialchars($_POST['db_username'] ?? '') ?>" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña BD</label>
                            <input type="password" name="db_password" value="<?= htmlspecialchars($_POST['db_password'] ?? '') ?>" 
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
                        
                        <?php 
                        $canExecute = function_exists('exec') && !in_array('exec', explode(',', ini_get('disable_functions')));
                        $manualMode = isset($manualMode) && $manualMode;
                        ?>
                        
                        <?php if ($canExecute && !$manualMode): ?>
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
                        <?php else: ?>
                            <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                                <p class="font-semibold">⚠️ Modo Manual Requerido</p>
                                <p class="text-sm mt-2">No se pueden ejecutar comandos automáticamente. Sigue estas instrucciones:</p>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded mb-4">
                                <h3 class="font-semibold mb-2">Instrucciones para SSH/Terminal:</h3>
                                <ol class="list-decimal list-inside space-y-2 text-sm">
                                    <li>Conecta por SSH o usa la Terminal de cPanel</li>
                                    <li>Ve al directorio: <code class="bg-gray-200 px-2 py-1 rounded">cd ~/clients.dowgroupcol.com/new</code></li>
                                    <li>Ejecuta estos comandos uno por uno:</li>
                                </ol>
                                <pre class="bg-gray-900 text-green-400 p-4 rounded mt-4 overflow-x-auto text-xs"><code>php artisan key:generate --force
php artisan migrate --force
php artisan session:table
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache</code></pre>
                            </div>
                            
                            <p class="mb-4">Después de ejecutar los comandos, continúa al siguiente paso:</p>
                            <a href="?step=4" class="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                                Continuar al Paso 4 →
                            </a>
                        <?php endif; ?>
                    </div>
                
                <!-- Paso 4: Crear Usuario -->
                <?php elseif ($step == 4): ?>
                    <?php 
                    $canExecute = function_exists('exec') && !in_array('exec', explode(',', ini_get('disable_functions')));
                    $manualUserCreation = isset($manualUserCreation) && $manualUserCreation;
                    ?>
                    
                    <?php if ($canExecute && !$manualUserCreation): ?>
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
                    <?php else: ?>
                        <div class="mb-6">
                            <h2 class="text-xl font-semibold mb-4">Paso 4: Crear Usuario Administrador</h2>
                            
                            <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                                <p class="font-semibold">⚠️ Creación Manual Requerida</p>
                                <p class="text-sm mt-2">Ejecuta este comando desde SSH/Terminal:</p>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded mb-4">
                                <h3 class="font-semibold mb-2">Comando SSH:</h3>
                                <pre class="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs"><code>cd ~/clients.dowgroupcol.com/new
php artisan tinker</code></pre>
                                <p class="text-sm mt-2 mb-2">Luego en tinker, copia y pega (reemplaza los datos):</p>
                                <pre class="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs"><code>App\Models\User::create([
    'email' => 'admin@tudominio.com',
    'password' => bcrypt('TuContraseña123!'),
    'full_name' => 'Administrador',
    'role' => 'superadmin',
    'status' => 'active',
    'is_profile_complete' => true
]);
exit</code></pre>
                            </div>
                            
                            <p class="mb-4">Después de crear el usuario, continúa al siguiente paso:</p>
                            <a href="?step=5" class="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                                Finalizar →
                            </a>
                        </div>
                    <?php endif; ?>
                
                <!-- Paso 5: Completado -->
                <?php elseif ($step == 5): ?>
                    <div class="text-center">
                        <h2 class="text-2xl font-semibold text-green-600 mb-4">✅ Instalación Completada</h2>
                        <p class="mb-4">Laravel ha sido instalado correctamente.</p>
                        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                            <strong>⚠️ IMPORTANTE:</strong> Elimina este archivo (install.php) por seguridad.
                        </div>
                        <?php
                        // Construir URL correcta
                        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
                        $host = $_SERVER['HTTP_HOST'];
                        $basePath = dirname($_SERVER['SCRIPT_NAME']); // /new/public
                        $loginUrl = $protocol . '://' . $host . $basePath . '/login';
                        ?>
                        <div class="mb-4">
                            <p class="text-sm text-gray-600 mb-2">URL de acceso:</p>
                            <code class="bg-gray-100 px-3 py-1 rounded text-sm"><?= htmlspecialchars($loginUrl) ?></code>
                        </div>
                        <a href="<?= htmlspecialchars($loginUrl) ?>" class="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
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

