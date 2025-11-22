<?php
/**
 * Endpoint para generar enlace de restablecimiento de contraseña
 * Usa Firebase Admin SDK para generar el enlace sin exponer Firebase al usuario
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Verificar que se recibieron datos
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email requerido']);
    exit;
}

$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email inválido']);
    exit;
}

try {
    // Cargar Firebase Admin SDK
    // Nota: Requiere instalar: composer require kreait/firebase-php
    require_once __DIR__ . '/vendor/autoload.php';
    
    // Ruta al archivo de credenciales de Firebase Admin SDK
    $firebaseCredentialsPath = __DIR__ . '/firebase-credentials.json';
    
    if (!file_exists($firebaseCredentialsPath)) {
        throw new Exception('firebase-credentials.json no encontrado. Configura las credenciales de Firebase Admin SDK.');
    }
    
    use Kreait\Firebase\Factory;
    use Kreait\Firebase\Auth;
    
    // Inicializar Firebase
    $factory = (new Factory)->withServiceAccount($firebaseCredentialsPath);
    $auth = $factory->createAuth();
    
    // Obtener la URL base del sistema
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $path = dirname($_SERVER['SCRIPT_NAME']);
    // Remover el nombre del script para obtener la raíz
    $path = str_replace('/' . basename($_SERVER['SCRIPT_NAME']), '', $path);
    $baseUrl = $protocol . '://' . $host . ($path !== '/' ? $path : '');
    
    // Generar enlace de restablecimiento de contraseña
    $actionCodeSettings = [
        'url' => $baseUrl,
        'handleCodeInApp' => true,
    ];
    
    $link = $auth->generatePasswordResetLink($email, $actionCodeSettings);
    
    // Devolver el enlace
    echo json_encode([
        'success' => true,
        'resetLink' => $link,
        'email' => $email
    ]);
    
} catch (\Kreait\Firebase\Auth\Exception\UserNotFound $e) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Usuario no encontrado'
    ]);
} catch (\Kreait\Firebase\Exception\FirebaseException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al generar enlace: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}

