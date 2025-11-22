<?php
/**
 * Script de diagnóstico para el endpoint de restablecimiento de contraseña
 * Uso: php test-password-reset-endpoint.php
 */

echo "🔍 Diagnóstico del Endpoint de Restablecimiento de Contraseña\n";
echo "============================================================\n\n";

// 1. Verificar PHP
echo "1. Versión de PHP: " . phpversion() . "\n";
if (version_compare(phpversion(), '7.4.0', '<')) {
    echo "   ⚠️  ADVERTENCIA: Se requiere PHP 7.4 o superior\n";
} else {
    echo "   ✅ Versión de PHP OK\n";
}

// 2. Verificar extensiones necesarias
echo "\n2. Extensiones PHP:\n";
$required_extensions = ['json', 'curl', 'openssl', 'mbstring'];
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "   ✅ $ext: Instalada\n";
    } else {
        echo "   ❌ $ext: NO instalada\n";
    }
}

// 3. Verificar Composer
echo "\n3. Composer:\n";
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo "   ✅ vendor/autoload.php existe\n";
    require_once __DIR__ . '/vendor/autoload.php';
    echo "   ✅ Composer autoload cargado\n";
} else {
    echo "   ❌ vendor/autoload.php NO existe\n";
    echo "   💡 Solución: Ejecuta 'composer install' en el directorio del proyecto\n";
}

// 4. Verificar credenciales de Firebase
echo "\n4. Credenciales de Firebase:\n";
$firebaseCredentialsPath = __DIR__ . '/firebase-credentials.json';
if (file_exists($firebaseCredentialsPath)) {
    echo "   ✅ firebase-credentials.json existe\n";
    if (is_readable($firebaseCredentialsPath)) {
        echo "   ✅ firebase-credentials.json es legible\n";
        $credentials = json_decode(file_get_contents($firebaseCredentialsPath), true);
        if ($credentials && isset($credentials['type']) && $credentials['type'] === 'service_account') {
            echo "   ✅ firebase-credentials.json tiene formato válido\n";
        } else {
            echo "   ❌ firebase-credentials.json NO tiene formato válido\n";
        }
    } else {
        echo "   ❌ firebase-credentials.json NO es legible (verifica permisos)\n";
    }
} else {
    echo "   ❌ firebase-credentials.json NO existe\n";
    echo "   💡 Solución: Descarga las credenciales de Firebase Console y guárdalas como firebase-credentials.json\n";
}

// 5. Verificar el endpoint
echo "\n5. Endpoint create-password-reset-token.php:\n";
$endpointPath = __DIR__ . '/create-password-reset-token.php';
if (file_exists($endpointPath)) {
    echo "   ✅ create-password-reset-token.php existe\n";
    if (is_readable($endpointPath)) {
        echo "   ✅ create-password-reset-token.php es legible\n";
    } else {
        echo "   ❌ create-password-reset-token.php NO es legible\n";
    }
} else {
    echo "   ❌ create-password-reset-token.php NO existe\n";
    echo "   💡 Solución: Asegúrate de que el archivo esté en el directorio raíz\n";
}

// 6. Probar sintaxis PHP
echo "\n6. Sintaxis PHP:\n";
if (file_exists($endpointPath)) {
    $output = [];
    $return_var = 0;
    exec("php -l $endpointPath 2>&1", $output, $return_var);
    if ($return_var === 0) {
        echo "   ✅ Sintaxis PHP válida\n";
    } else {
        echo "   ❌ Error de sintaxis PHP:\n";
        foreach ($output as $line) {
            echo "      $line\n";
        }
    }
}

// 7. Verificar permisos
echo "\n7. Permisos de archivos:\n";
$files_to_check = [
    'create-password-reset-token.php',
    'firebase-credentials.json',
    'vendor/autoload.php'
];
foreach ($files_to_check as $file) {
    $fullPath = __DIR__ . '/' . $file;
    if (file_exists($fullPath)) {
        $perms = substr(sprintf('%o', fileperms($fullPath)), -4);
        echo "   $file: $perms\n";
    }
}

// 8. Probar conexión a Firebase (si todo está OK)
echo "\n8. Prueba de conexión a Firebase:\n";
if (file_exists($firebaseCredentialsPath) && file_exists(__DIR__ . '/vendor/autoload.php')) {
    try {
        require_once __DIR__ . '/vendor/autoload.php';
        use Kreait\Firebase\Factory;
        
        $factory = (new Factory)->withServiceAccount($firebaseCredentialsPath);
        $firestore = $factory->createFirestore();
        $db = $firestore->database();
        
        echo "   ✅ Conexión a Firebase exitosa\n";
        echo "   ✅ Firestore inicializado correctamente\n";
    } catch (Exception $e) {
        echo "   ❌ Error al conectar con Firebase:\n";
        echo "      " . $e->getMessage() . "\n";
    }
} else {
    echo "   ⏭️  Omitido (faltan dependencias)\n";
}

echo "\n============================================================\n";
echo "✅ Diagnóstico completado\n";
echo "\n💡 Si hay errores, corrige los problemas indicados arriba\n";

