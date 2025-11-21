<?php
/**
 * Endpoint para enviar emails usando Zoho Mail API
 * Alternativa a SMTP para envío de emails
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Obtener datos del POST
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos']);
    exit;
}

// Validar datos requeridos
$required = ['to', 'subject', 'html', 'zohoConfig'];
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
$zohoConfig = $input['zohoConfig'];

// Validar configuración Zoho
if (!isset($zohoConfig['clientId']) || !isset($zohoConfig['clientSecret']) || 
    !isset($zohoConfig['refreshToken']) || !isset($zohoConfig['fromEmail'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Configuración Zoho incompleta']);
    exit;
}

/**
 * Obtener Access Token de Zoho usando Refresh Token
 */
function getZohoAccessToken($clientId, $clientSecret, $refreshToken) {
    $url = 'https://accounts.zoho.com/oauth/v2/token';
    
    $data = [
        'refresh_token' => $refreshToken,
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'grant_type' => 'refresh_token'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        throw new Exception("Error de conexión con Zoho: $curlError");
    }
    
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        $errorMsg = $errorData['error'] ?? 'Error desconocido';
        $errorDesc = $errorData['error_description'] ?? '';
        throw new Exception("Error al obtener token de Zoho ($httpCode): $errorMsg - $errorDesc");
    }
    
    $tokenData = json_decode($response, true);
    
    if (!isset($tokenData['access_token'])) {
        throw new Exception("No se recibió access_token de Zoho");
    }
    
    return [
        'access_token' => $tokenData['access_token'],
        'expires_in' => $tokenData['expires_in'] ?? 3600,
        'expires_at' => time() + ($tokenData['expires_in'] ?? 3600)
    ];
}

/**
 * Obtener lista de cuentas disponibles en Zoho Mail
 */
function getZohoAccounts($accessToken) {
    $accountsUrl = "https://mail.zoho.com/api/accounts";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $accountsUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Zoho-oauthtoken ' . $accessToken,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $result = json_decode($response, true);
        return $result['data']['accounts'] ?? [];
    }
    
    return [];
}

/**
 * Enviar email usando Zoho Mail API
 */
function sendEmailViaZoho($accessToken, $fromEmail, $fromName, $to, $toName, $subject, $html, $text) {
    // Primero intentar obtener las cuentas para verificar el formato correcto
    $accounts = getZohoAccounts($accessToken);
    
    // Buscar el email en las cuentas disponibles
    $accountId = null;
    foreach ($accounts as $account) {
        if (isset($account['emailAddress']) && strtolower($account['emailAddress']) === strtolower($fromEmail)) {
            // Usar el accountId si está disponible, sino usar el email
            $accountId = $account['accountId'] ?? $account['emailAddress'] ?? $fromEmail;
            break;
        }
    }
    
    // Si no se encontró en las cuentas, usar el email directamente
    if (!$accountId) {
        $accountId = urlencode($fromEmail);
    }
    
    // Endpoint de Zoho Mail API para enviar emails
    // Formato: https://mail.zoho.com/api/accounts/{accountId}/messages
    $zohoApiUrl = "https://mail.zoho.com/api/accounts/$accountId/messages";
    
    // Preparar el cuerpo del email según la documentación de Zoho Mail API
    $emailData = [
        'fromAddress' => $fromName ? "$fromName <$fromEmail>" : $fromEmail,
        'toAddress' => $toName ? "$toName <$to>" : $to,
        'subject' => $subject,
        'content' => $html,
        'mailFormat' => 'html'
    ];
    
    // Agregar texto plano como alternativa si está disponible
    if ($text && $text !== strip_tags($html)) {
        $emailData['textContent'] = $text;
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $zohoApiUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($emailData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Zoho-oauthtoken ' . $accessToken,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        throw new Exception("Error de conexión con Zoho Mail API: $curlError");
    }
    
    if ($httpCode !== 200 && $httpCode !== 201) {
        $errorData = json_decode($response, true);
        $errorMsg = $errorData['message'] ?? $errorData['error'] ?? 'Error desconocido';
        $errorCode = $errorData['code'] ?? $httpCode;
        $errorDetails = $errorData['data'] ?? $errorData['details'] ?? '';
        
        // Mensajes de error más descriptivos
        if ($httpCode === 401) {
            throw new Exception("Error de autenticación con Zoho (401). Verifica que el Access Token sea válido y que el Refresh Token no haya expirado.");
        } elseif ($httpCode === 403) {
            throw new Exception("Error de permisos con Zoho (403). Verifica que la aplicación tenga permisos para enviar emails. Scope requerido: ZohoMail.messages.CREATE");
        } elseif ($httpCode === 404) {
            // Error 404 puede ser por varias razones
            $detailedError = "Cuenta de email no encontrada en Zoho (404). ";
            $detailedError .= "Endpoint usado: $zohoApiUrl\n";
            $detailedError .= "Email remitente: $fromEmail\n";
            $detailedError .= "Verifica que:\n";
            $detailedError .= "1. El email '$fromEmail' esté configurado en Zoho Mail\n";
            $detailedError .= "2. El email esté habilitado para API en Zoho Mail\n";
            $detailedError .= "3. El dominio esté verificado en Zoho\n";
            $detailedError .= "4. El email pertenezca a la misma cuenta/organización que autorizó la aplicación\n";
            if ($errorDetails) {
                $detailedError .= "\nDetalles: " . (is_array($errorDetails) ? json_encode($errorDetails) : $errorDetails);
            }
            if ($errorMsg && $errorMsg !== 'Error desconocido') {
                $detailedError .= "\nMensaje de Zoho: " . $errorMsg;
            }
            if ($response) {
                $detailedError .= "\nRespuesta completa de Zoho: " . substr($response, 0, 1000);
            }
            throw new Exception($detailedError);
        } elseif ($httpCode === 429) {
            throw new Exception("Límite de rate excedido en Zoho (429). Espera unos minutos antes de intentar nuevamente.");
        }
        
        $fullError = "Error al enviar email vía Zoho ($httpCode): $errorMsg";
        if ($errorDetails) {
            $fullError .= " | Detalles: " . (is_array($errorDetails) ? json_encode($errorDetails) : $errorDetails);
        }
        if ($response) {
            $fullError .= " | Respuesta completa: " . substr($response, 0, 500);
        }
        throw new Exception($fullError);
    }
    
    $result = json_decode($response, true);
    return $result;
}

try {
    // Paso 1: Obtener Access Token
    $tokenInfo = getZohoAccessToken(
        $zohoConfig['clientId'],
        $zohoConfig['clientSecret'],
        $zohoConfig['refreshToken']
    );
    
    // Paso 2: Enviar email
    $result = sendEmailViaZoho(
        $tokenInfo['access_token'],
        $zohoConfig['fromEmail'],
        $zohoConfig['fromName'] ?? '',
        $to,
        $toName,
        $subject,
        $html,
        $text
    );
    
    // Retornar éxito con información del token para actualizar en Firestore
    echo json_encode([
        'success' => true,
        'message' => 'Email enviado correctamente vía Zoho Mail API',
        'to' => $to,
        'accessToken' => $tokenInfo['access_token'],
        'expiresAt' => $tokenInfo['expires_at'],
        'zohoMessageId' => $result['data']['messageId'] ?? null
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    
    $errorMessage = $e->getMessage();
    $errorDetails = '';
    
    // Detectar tipos específicos de errores
    if (strpos($errorMessage, 'refresh_token') !== false || 
        strpos($errorMessage, 'invalid_grant') !== false) {
        $errorDetails = 'Error con Refresh Token. Verifica: ' .
            "\n1) El Refresh Token es válido y no ha sido revocado" .
            "\n2) El Client ID y Client Secret son correctos" .
            "\n3) La aplicación tiene permisos de Zoho Mail API" .
            "\n4) El Refresh Token no ha expirado (genera uno nuevo si es necesario)";
    } elseif (strpos($errorMessage, 'access_token') !== false) {
        $errorDetails = 'Error al obtener Access Token. Verifica la configuración OAuth 2.0.';
    } elseif (strpos($errorMessage, '401') !== false || strpos($errorMessage, 'autenticación') !== false) {
        $errorDetails = 'Error de autenticación. El Access Token puede haber expirado. Intenta nuevamente.';
    } elseif (strpos($errorMessage, '404') !== false) {
        $errorDetails = 'La cuenta de email no existe en Zoho Mail. Verifica que el email esté configurado en Zoho.';
    } elseif (strpos($errorMessage, '429') !== false) {
        $errorDetails = 'Límite de rate excedido. Zoho tiene límites en la cantidad de emails por minuto/hora. Espera unos minutos.';
    }
    
    echo json_encode([
        'success' => false,
        'error' => 'Error al enviar email vía Zoho: ' . $errorMessage,
        'details' => $errorDetails,
        'zoho_client_id' => $zohoConfig['clientId'] ?? 'no configurado',
        'zoho_from_email' => $zohoConfig['fromEmail'] ?? 'no configurado'
    ]);
}

