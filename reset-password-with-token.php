<?php
/**
 * Endpoint para restablecer contraseña usando token personalizado
 * Usa Firebase Admin SDK para cambiar la contraseña
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

if (!$input || !isset($input['token']) || !isset($input['newPassword'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Token y nueva contraseña requeridos']);
    exit;
}

$token = $input['token'];
$newPassword = $input['newPassword'];

if (strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres']);
    exit;
}

try {
    // Cargar Firebase Admin SDK
    require_once __DIR__ . '/vendor/autoload.php';
    
    // Ruta al archivo de credenciales de Firebase Admin SDK
    $firebaseCredentialsPath = __DIR__ . '/firebase-credentials.json';
    
    if (!file_exists($firebaseCredentialsPath)) {
        throw new Exception('firebase-credentials.json no encontrado. Configura las credenciales de Firebase Admin SDK.');
    }
    
    use Kreait\Firebase\Factory;
    use Kreait\Firebase\Auth;
    use Kreait\Firebase\Firestore;
    
    // Inicializar Firebase
    $factory = (new Factory)->withServiceAccount($firebaseCredentialsPath);
    $auth = $factory->createAuth();
    $firestore = $factory->createFirestore();
    
    $appId = 'alojamientos-3c46b';
    
    // Validar token en Firestore
    $tokensCollection = $firestore->database()->collection("artifacts/{$appId}/public/data/passwordResetTokens");
    $tokenQuery = $tokensCollection->where('token', '=', $token);
    $tokenDocs = $tokenQuery->documents();
    
    if ($tokenDocs->isEmpty()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Token no encontrado']);
        exit;
    }
    
    $tokenDoc = $tokenDocs->documents()[0];
    $tokenData = $tokenDoc->data();
    
    // Verificar si ya fue usado
    if (isset($tokenData['used']) && $tokenData['used'] === true) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Este token ya fue utilizado']);
        exit;
    }
    
    // Verificar si expiró
    if (isset($tokenData['expiresAt'])) {
        $expiresAt = $tokenData['expiresAt']->toDateTime();
        if (new DateTime() > $expiresAt) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Este token ha expirado']);
            exit;
        }
    }
    
    $userId = $tokenData['userId'];
    $email = $tokenData['email'];
    
    // Obtener el UID de Firebase Auth del usuario
    $userDoc = $firestore->database()->document("artifacts/{$appId}/public/data/users/{$userId}");
    $userData = $userDoc->snapshot()->data();
    
    if (!$userData) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
        exit;
    }
    
    // Buscar el usuario en Firebase Auth por email
    try {
        $firebaseUser = $auth->getUserByEmail($email);
        $uid = $firebaseUser->uid;
        
        // Cambiar la contraseña usando Firebase Admin SDK
        $auth->changeUserPassword($uid, $newPassword);
        
        // Marcar token como usado
        $tokenDoc->reference()->update([
            'used' => true,
            'usedAt' => new \DateTime()
        ]);
        
        // Actualizar requiresPasswordChange en Firestore
        $userDoc->reference()->update([
            'requiresPasswordChange' => false
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Contraseña restablecida exitosamente'
        ]);
        
    } catch (\Kreait\Firebase\Auth\Exception\UserNotFound $e) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Usuario no encontrado en Firebase Auth']);
    } catch (\Kreait\Firebase\Exception\FirebaseException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al cambiar contraseña: ' . $e->getMessage()]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}

