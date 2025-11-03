<?php
/**
 * Endpoint para enviar emails usando SMTP
 * Se usa desde el frontend React para enviar emails reales
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Cargar PHPMailer
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Obtener datos del POST
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos']);
    exit;
}

// Validar datos requeridos
$required = ['to', 'subject', 'html', 'smtpConfig'];
foreach ($required as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Campo requerido faltante: $field"]);
        exit;
    }
}

$to = $input['to'];
$toName = $input['toName'] ?? '';
$subject = $input['subject'];
$html = $input['html'];
$text = $input['text'] ?? strip_tags($html);
$smtpConfig = $input['smtpConfig'];

// Limpiar espacios en blanco de los campos SMTP (problema común)
if (isset($smtpConfig['smtpUser'])) {
    $smtpConfig['smtpUser'] = trim($smtpConfig['smtpUser']);
}
if (isset($smtpConfig['smtpPassword'])) {
    $smtpConfig['smtpPassword'] = trim($smtpConfig['smtpPassword']);
}
if (isset($smtpConfig['smtpHost'])) {
    $smtpConfig['smtpHost'] = trim($smtpConfig['smtpHost']);
}
if (isset($smtpConfig['fromEmail'])) {
    $smtpConfig['fromEmail'] = trim($smtpConfig['fromEmail']);
}

// Validar configuración SMTP
if (!isset($smtpConfig['smtpHost']) || !isset($smtpConfig['smtpPort']) || 
    !isset($smtpConfig['smtpUser']) || !isset($smtpConfig['smtpPassword']) ||
    !isset($smtpConfig['fromEmail']) || !isset($smtpConfig['fromName'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Configuración SMTP incompleta']);
    exit;
}

try {
    // Crear instancia de PHPMailer con modo debug deshabilitado por defecto
    $mail = new PHPMailer(true);

    // Configuración del servidor SMTP
    $mail->isSMTP();
    $mail->Host = $smtpConfig['smtpHost'];
    $mail->SMTPAuth = true;
    $mail->Username = $smtpConfig['smtpUser'];
    $mail->Password = $smtpConfig['smtpPassword'];
    $mail->Port = (int)$smtpConfig['smtpPort'];
    
    // Configuración de seguridad - Forzar según puerto
    $port = (int)$smtpConfig['smtpPort'];
    if ($port == 465) {
        // Puerto 465 SIEMPRE requiere SSL
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL
    } elseif ($port == 587) {
        // Puerto 587 usa TLS
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS
    } elseif ($smtpConfig['smtpSecure'] === true) {
        // Si está marcado como seguro pero el puerto no es estándar, intentar SSL
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } else {
        // Sin encriptación (no recomendado)
        $mail->SMTPSecure = '';
    }
    
    // Configuración adicional (opcional, para algunos servidores)
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );
    
    // Timeout más largo para conexiones lentas
    $mail->Timeout = 30;
    
    // Habilitar debug SMTP (opcional, comentar en producción)
    // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    // $mail->Debugoutput = function($str, $level) {
    //     error_log("SMTP Debug: $str");
    // };

    // Remitente
    $mail->setFrom($smtpConfig['fromEmail'], $smtpConfig['fromName']);
    
    // Destinatario
    if ($toName) {
        $mail->addAddress($to, $toName);
    } else {
        $mail->addAddress($to);
    }

    // Contenido
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $html;
    $mail->AltBody = $text;

    // Enviar
    $mail->send();
    
    echo json_encode([
        'success' => true,
        'message' => 'Email enviado correctamente',
        'to' => $to
    ]);

} catch (Exception $e) {
    http_response_code(500);
    
    // Extraer información más detallada del error
    $errorMessage = $mail->ErrorInfo;
    $errorDetails = '';
    
    // Detectar tipos específicos de errores comunes
    if (strpos($errorMessage, 'Could not authenticate') !== false || 
        strpos($errorMessage, 'SMTP connect() failed') !== false ||
        strpos($errorMessage, 'authentication') !== false ||
        strpos($errorMessage, '535') !== false) {
        
        $port = (int)($smtpConfig['smtpPort'] ?? 0);
        $host = $smtpConfig['smtpHost'] ?? 'no configurado';
        $user = $smtpConfig['smtpUser'] ?? 'no configurado';
        
        $errorDetails = 'Error de autenticación SMTP. Verifica paso a paso: ' .
            "\n1) Usuario SMTP: Debe ser el email completo (ej: no_reply@dvsystemsas.com)" .
            "\n   - Tu configuración: '$user'" .
            "\n   - Verifica que no tenga espacios al inicio o final" .
            "\n2) Contraseña: Debe ser la contraseña exacta del email en cPanel" .
            "\n   - Si no la recuerdas, cámbiala en cPanel → Email Accounts" .
            "\n3) Puerto y conexión:" .
            "\n   - Puerto $port: " . ($port == 465 ? 'Requiere SSL (marcar "Usar conexión segura")' : ($port == 587 ? 'Requiere TLS (marcar "Usar conexión segura")' : 'Puerto no estándar')) .
            "\n4) Servidor SMTP: '$host'" .
            "\n   - Verifica en cPanel → Email Accounts → Configurar Cliente de Correo" .
            "\n   - Prueba también: smtp.dvsystemsas.com si mail.dvsystemsas.com no funciona" .
            "\n5) Verifica que la cuenta de email existe y está activa en cPanel";
    } elseif (strpos($errorMessage, 'Could not connect') !== false || 
              strpos($errorMessage, 'Connection refused') !== false) {
        $errorDetails = 'No se puede conectar al servidor SMTP. Verifica: ' .
            '1) Servidor SMTP correcto, ' .
            '2) Puerto no bloqueado por firewall, ' .
            '3) Servidor SMTP accesible desde el servidor';
    } elseif (strpos($errorMessage, 'timeout') !== false) {
        $errorDetails = 'Timeout al conectar. Verifica: ' .
            '1) Servidor SMTP correcto, ' .
            '2) Puerto correcto, ' .
            '3) Conexión de red estable';
    }
    
    echo json_encode([
        'success' => false,
        'error' => 'Error al enviar email: ' . $errorMessage,
        'details' => $errorDetails,
        'smtp_host' => $smtpConfig['smtpHost'] ?? 'no configurado',
        'smtp_port' => $smtpConfig['smtpPort'] ?? 'no configurado',
        'smtp_user' => $smtpConfig['smtpUser'] ?? 'no configurado'
    ]);
}

