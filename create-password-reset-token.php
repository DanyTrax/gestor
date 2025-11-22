<?php
/**
 * Endpoint para crear token personalizado de restablecimiento de contraseña
 * Usa Firebase Admin SDK para crear el token en Firestore sin requerir autenticación del usuario
 */

// Configurar manejo de errores para devolver JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Función para devolver error JSON
function returnJsonError($message, $code = 500) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Verificar que se recibieron datos
$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    returnJsonError('No se recibieron datos', 400);
}

$input = json_decode($rawInput, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    returnJsonError('JSON inválido: ' . json_last_error_msg(), 400);
}

if (!$input || !isset($input['email'])) {
    returnJsonError('Email requerido', 400);
}

$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email inválido']);
    exit;
}

// Obtener appId del request, si no viene usar el de Firebase por defecto
$appId = $input['appId'] ?? 'alojamientos-3c46b';

try {
    // Cargar Firebase Admin SDK
    if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
        throw new Exception('Composer autoload no encontrado. Ejecuta: composer install');
    }
    require_once __DIR__ . '/vendor/autoload.php';
    
    // Ruta al archivo de credenciales de Firebase Admin SDK
    $firebaseCredentialsPath = __DIR__ . '/firebase-credentials.json';
    
    if (!file_exists($firebaseCredentialsPath)) {
        throw new Exception('firebase-credentials.json no encontrado. Configura las credenciales de Firebase Admin SDK.');
    }
    
    use Kreait\Firebase\Factory;
    use Kreait\Firebase\Firestore;
    
    // Inicializar Firebase
    $factory = (new Factory)->withServiceAccount($firebaseCredentialsPath);
    $firestore = $factory->createFirestore();
    $db = $firestore->database();
    
    // Buscar usuario por email en Firestore
    $usersRef = $db->collection("artifacts/{$appId}/public/data/users");
    $usersQuery = $usersRef->where('email', '=', $email);
    $usersSnapshot = $usersQuery->documents();
    
    if ($usersSnapshot->isEmpty()) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'No se encontró una cuenta con ese email.'
        ]);
        exit;
    }
    
    $userDoc = $usersSnapshot->documents()[0];
    $userData = $userDoc->data();
    $userId = $userDoc->id();
    
    // Verificar que el usuario esté activo
    if (isset($userData['status']) && ($userData['status'] === 'pending' || $userData['status'] === 'disabled')) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Tu cuenta está pendiente de activación o ha sido deshabilitada.'
        ]);
        exit;
    }
    
    // Generar token único (48 caracteres)
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    $token = '';
    for ($i = 0; $i < 48; $i++) {
        $token .= $chars[random_int(0, strlen($chars) - 1)];
    }
    
    // Calcular fecha de expiración (24 horas desde ahora)
    $expiresInHours = $input['expiresInHours'] ?? 24;
    $expiresAt = new \DateTime();
    $expiresAt->modify("+{$expiresInHours} hours");
    
    // Eliminar tokens existentes para este usuario que no hayan sido usados
    $tokensRef = $db->collection("artifacts/{$appId}/public/data/passwordResetTokens");
    $existingTokensQuery = $tokensRef
        ->where('userId', '=', $userId)
        ->where('used', '=', false);
    $existingTokens = $existingTokensQuery->documents();
    
    foreach ($existingTokens as $tokenDoc) {
        $tokenDoc->reference()->delete();
    }
    
    // Guardar nuevo token en Firestore
    $tokensRef->add([
        'userId' => $userId,
        'email' => $email,
        'token' => $token,
        'expiresAt' => new \Google\Cloud\Firestore\Timestamp($expiresAt),
        'createdAt' => new \Google\Cloud\Firestore\Timestamp(new \DateTime()),
        'used' => false
    ]);
    
    // Devolver el token y datos del usuario para el email
    echo json_encode([
        'success' => true,
        'token' => $token,
        'email' => $email,
        'userId' => $userId,
        'userData' => [
            'fullName' => $userData['fullName'] ?? '',
            'status' => $userData['status'] ?? 'active'
        ]
    ]);
    
} catch (\Kreait\Firebase\Exception\FirebaseException $e) {
    http_response_code(500);
    error_log('Firebase Error en create-password-reset-token.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Error al crear token: ' . $e->getMessage()
    ]);
} catch (\Throwable $e) {
    http_response_code(500);
    error_log('Error en create-password-reset-token.php: ' . $e->getMessage() . ' - Trace: ' . $e->getTraceAsString());
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log('Exception en create-password-reset-token.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}

