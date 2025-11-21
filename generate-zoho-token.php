<?php
/**
 * Script Helper para Generar Refresh Token de Zoho Mail API
 * 
 * INSTRUCCIONES:
 * 1. Reemplaza TU_CLIENT_ID y TU_CLIENT_SECRET con tus credenciales
 * 2. Accede a este archivo desde el navegador
 * 3. Sigue las instrucciones en pantalla
 * 4. COPIA el Refresh Token generado
 * 5. ELIMINA este archivo después de obtener el token (seguridad)
 * 
 * ⚠️ IMPORTANTE: Este archivo es solo para generar el token una vez.
 * Elimínalo después de obtener el Refresh Token.
 */

// ============================================
// CONFIGURACIÓN - REEMPLAZA ESTOS VALORES
// ============================================
$CLIENT_ID = 'TU_CLIENT_ID_AQUI';
$CLIENT_SECRET = 'TU_CLIENT_SECRET_AQUI';
$REDIRECT_URI = (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF'];

// ============================================
// NO MODIFICAR DESDE AQUÍ
// ============================================

header('Content-Type: text/html; charset=utf-8');

// Verificar que se configuraron las credenciales
if ($CLIENT_ID === 'TU_CLIENT_ID_AQUI' || $CLIENT_SECRET === 'TU_CLIENT_SECRET_AQUI') {
    echo '<!DOCTYPE html>
    <html>
    <head>
        <title>Generar Refresh Token - Zoho Mail</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 2px solid #fcc; padding: 15px; border-radius: 5px; }
            .success { background: #efe; border: 2px solid #cfc; padding: 15px; border-radius: 5px; }
            .info { background: #eef; border: 2px solid #ccf; padding: 15px; border-radius: 5px; margin: 20px 0; }
            code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
            .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="error">
            <h2>⚠️ Configuración Requerida</h2>
            <p>Antes de usar este script, debes:</p>
            <ol>
                <li>Abrir este archivo en un editor de texto</li>
                <li>Reemplazar <code>TU_CLIENT_ID_AQUI</code> con tu Client ID de Zoho</li>
                <li>Reemplazar <code>TU_CLIENT_SECRET_AQUI</code> con tu Client Secret de Zoho</li>
                <li>Guardar el archivo</li>
                <li>Recargar esta página</li>
            </ol>
            <p><strong>¿Dónde obtener las credenciales?</strong></p>
            <p>Ve a <a href="https://api-console.zoho.com" target="_blank">Zoho API Console</a> y crea una nueva aplicación.</p>
        </div>
    </body>
    </html>';
    exit;
}

// Paso 1: Si no hay código de autorización, mostrar link de autorización
if (!isset($_GET['code'])) {
    $authUrl = 'https://accounts.zoho.com/oauth/v2/auth?' . http_build_query([
        'scope' => 'ZohoMail.messages.CREATE',
        'client_id' => $CLIENT_ID,
        'response_type' => 'code',
        'access_type' => 'offline',
        'redirect_uri' => $REDIRECT_URI
    ]);
    
    echo '<!DOCTYPE html>
    <html>
    <head>
        <title>Generar Refresh Token - Zoho Mail</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .info { background: #eef; border: 2px solid #ccf; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>🔑 Generar Refresh Token de Zoho Mail</h1>
        
        <div class="info">
            <h3>📋 Pasos:</h3>
            <ol>
                <li>Click en el botón de abajo para autorizar la aplicación</li>
                <li>Inicia sesión en Zoho si es necesario</li>
                <li>Autoriza el acceso a Zoho Mail</li>
                <li>Serás redirigido de vuelta con el código de autorización</li>
                <li>El script generará automáticamente el Refresh Token</li>
            </ol>
        </div>
        
        <p><strong>Redirect URI configurado:</strong> <code>' . htmlspecialchars($REDIRECT_URI) . '</code></p>
        <p><strong>⚠️ IMPORTANTE:</strong> Asegúrate de que esta URL esté configurada en tu aplicación de Zoho API Console como "Authorized Redirect URI".</p>
        
        <a href="' . htmlspecialchars($authUrl) . '" class="button">🔐 Autorizar Aplicación en Zoho</a>
    </body>
    </html>';
    exit;
}

// Paso 2: Intercambiar código de autorización por tokens
$code = $_GET['code'];
$tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';

$data = [
    'grant_type' => 'authorization_code',
    'client_id' => $CLIENT_ID,
    'client_secret' => $CLIENT_SECRET,
    'redirect_uri' => $REDIRECT_URI,
    'code' => $code
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $tokenUrl);
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
    echo '<!DOCTYPE html>
    <html>
    <head>
        <title>Error - Generar Refresh Token</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 2px solid #fcc; padding: 15px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="error">
            <h2>❌ Error de Conexión</h2>
            <p>Error: ' . htmlspecialchars($curlError) . '</p>
            <p>Verifica tu conexión a internet e intenta nuevamente.</p>
        </div>
    </body>
    </html>';
    exit;
}

$result = json_decode($response, true);

if ($httpCode !== 200) {
    $errorMsg = $result['error'] ?? 'Error desconocido';
    $errorDesc = $result['error_description'] ?? '';
    
    echo '<!DOCTYPE html>
    <html>
    <head>
        <title>Error - Generar Refresh Token</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 2px solid #fcc; padding: 15px; border-radius: 5px; }
            code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="error">
            <h2>❌ Error al Obtener Tokens</h2>
            <p><strong>Código HTTP:</strong> ' . $httpCode . '</p>
            <p><strong>Error:</strong> ' . htmlspecialchars($errorMsg) . '</p>
            <p><strong>Descripción:</strong> ' . htmlspecialchars($errorDesc) . '</p>
            <h3>Posibles Causas:</h3>
            <ul>
                <li>El código de autorización expiró (válido por 1 minuto)</li>
                <li>Client ID o Client Secret incorrectos</li>
                <li>Redirect URI no coincide con el configurado en Zoho</li>
                <li>El código ya fue usado (solo se puede usar una vez)</li>
            </ul>
            <p><a href="' . $_SERVER['PHP_SELF'] . '">← Intentar Nuevamente</a></p>
        </div>
    </body>
    </html>';
    exit;
}

// Éxito: Mostrar Refresh Token
if (isset($result['refresh_token'])) {
    $refreshToken = $result['refresh_token'];
    $accessToken = $result['access_token'] ?? 'N/A';
    $expiresIn = $result['expires_in'] ?? 'N/A';
    
    echo '<!DOCTYPE html>
    <html>
    <head>
        <title>✅ Refresh Token Generado - Zoho Mail</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 900px; margin: 50px auto; padding: 20px; }
            .success { background: #efe; border: 2px solid #cfc; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fffbeb; border: 2px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .token-box { background: #1f2937; color: #10b981; padding: 15px; border-radius: 5px; font-family: monospace; word-break: break-all; margin: 15px 0; }
            .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px 10px 0; }
            code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
            .info-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <h1>✅ Refresh Token Generado Exitosamente</h1>
        
        <div class="success">
            <h2>🎉 ¡Token Generado!</h2>
            <p>Tu Refresh Token de Zoho Mail ha sido generado correctamente.</p>
        </div>
        
        <div class="warning">
            <h3>⚠️ IMPORTANTE - LEE ESTO:</h3>
            <ol>
                <li><strong>COPIA el Refresh Token de abajo</strong> y guárdalo de forma segura</li>
                <li><strong>Este token NO expira</strong> hasta que lo revoques manualmente</li>
                <li><strong>NO compartas</strong> este token con nadie</li>
                <li><strong>ELIMINA este archivo</strong> (<code>generate-zoho-token.php</code>) después de copiar el token</li>
            </ol>
        </div>
        
        <div class="info-box">
            <h3>📋 Información del Token:</h3>
            <p><strong>Access Token (temporal):</strong> <code>' . htmlspecialchars(substr($accessToken, 0, 30)) . '...</code></p>
            <p><strong>Expira en:</strong> ' . $expiresIn . ' segundos</p>
            <p><strong>Refresh Token (permanente):</strong> Ver abajo</p>
        </div>
        
        <h3>🔑 Tu Refresh Token:</h3>
        <div class="token-box" id="refreshToken">' . htmlspecialchars($refreshToken) . '</div>
        
        <button onclick="copyToken()" class="button">📋 Copiar Refresh Token</button>
        
        <div class="info-box" style="margin-top: 30px;">
            <h3>📝 Próximos Pasos:</h3>
            <ol>
                <li>Copia el Refresh Token de arriba</li>
                <li>Ve a tu sistema: <strong>Mensajes → Configuración de Email</strong></li>
                <li>Selecciona <strong>"Zoho Mail API"</strong> como proveedor</li>
                <li>Pega el Refresh Token en el campo correspondiente</li>
                <li>Completa los demás campos (Client ID, Client Secret, etc.)</li>
                <li>Guarda la configuración</li>
                <li>Envía un email de prueba</li>
            </ol>
        </div>
        
        <script>
            function copyToken() {
                const token = document.getElementById("refreshToken").textContent;
                navigator.clipboard.writeText(token).then(function() {
                    alert("✅ Refresh Token copiado al portapapeles!");
                }, function(err) {
                    // Fallback para navegadores antiguos
                    const textArea = document.createElement("textarea");
                    textArea.value = token;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                    alert("✅ Refresh Token copiado al portapapeles!");
                });
            }
        </script>
    </body>
    </html>';
} else {
    echo '<!DOCTYPE html>
    <html>
    <head>
        <title>Error - Generar Refresh Token</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 2px solid #fcc; padding: 15px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="error">
            <h2>❌ Error: No se recibió Refresh Token</h2>
            <p>La respuesta de Zoho no incluyó un Refresh Token.</p>
            <p><strong>Respuesta recibida:</strong></p>
            <pre>' . htmlspecialchars(print_r($result, true)) . '</pre>
            <p><a href="' . $_SERVER['PHP_SELF'] . '">← Intentar Nuevamente</a></p>
        </div>
    </body>
    </html>';
}

