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
    
    // Configuración de seguridad
    if ($smtpConfig['smtpSecure'] === true || $smtpConfig['smtpPort'] == 465) {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL
    } elseif ($smtpConfig['smtpPort'] == 587) {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS
    } else {
        // Si el puerto no es 587 ni 465, intentar sin encriptación o según configuración
        if (isset($smtpConfig['smtpSecure']) && $smtpConfig['smtpSecure'] === false) {
            // Sin encriptación (no recomendado pero algunos servidores lo requieren)
            $mail->SMTPSecure = '';
        }
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
        strpos($errorMessage, 'authentication') !== false) {
        $errorDetails = 'Error de autenticación SMTP. Verifica: ' .
            '1) Usuario SMTP debe ser el email completo (ej: noreply@dominio.com), ' .
            '2) Contraseña correcta, ' .
            '3) Puerto y conexión segura (587/TLS o 465/SSL), ' .
            '4) Servidor SMTP correcto (mail.dominio.com o smtp.dominio.com)';
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

