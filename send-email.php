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

// Validar configuración SMTP
if (!isset($smtpConfig['smtpHost']) || !isset($smtpConfig['smtpPort']) || 
    !isset($smtpConfig['smtpUser']) || !isset($smtpConfig['smtpPassword']) ||
    !isset($smtpConfig['fromEmail']) || !isset($smtpConfig['fromName'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Configuración SMTP incompleta']);
    exit;
}

try {
    // Crear instancia de PHPMailer
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
    }
    
    // Configuración adicional (opcional, para algunos servidores)
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );

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
    echo json_encode([
        'success' => false,
        'error' => 'Error al enviar email: ' . $mail->ErrorInfo
    ]);
}

