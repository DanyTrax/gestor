# Guía de Configuración - Zoho Mail API

## 📋 Requisitos Previos

1. Cuenta de Zoho Mail activa
2. Acceso a Zoho API Console (https://api-console.zoho.com)
3. Dominio verificado en Zoho Mail (opcional pero recomendado)

---

## 🔧 Paso 1: Registrar Aplicación en Zoho

### 1.1 Acceder a Zoho API Console

1. Ve a https://api-console.zoho.com
2. Inicia sesión con tu cuenta de Zoho
3. Click en **"Add Client"** o **"Create Client"**

### 1.2 Configurar la Aplicación

1. **Client Name:** `Gestor de Cobros Email Service`
2. **Client Type:** Selecciona **"Server-based Applications"**
3. **Homepage URL:** `https://tu-dominio.com` (o tu URL de producción)
4. **Authorized Redirect URIs:** 
   - `https://tu-dominio.com/oauth/zoho/callback` (para generación de refresh token)
   - O usa una herramienta online para generar el refresh token

### 1.3 Obtener Credenciales

Después de crear la aplicación, obtendrás:
- **Client ID:** `1000.XXXXXXXXXX`
- **Client Secret:** `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**⚠️ IMPORTANTE:** Guarda estas credenciales de forma segura.

---

## 🔑 Paso 2: Generar Refresh Token

### Opción A: Usando Herramienta Online (Más Fácil)

1. Ve a https://www.zoho.com/mail/help/api/oauth-overview.html
2. Sigue las instrucciones para generar un Refresh Token
3. O usa esta URL (reemplaza con tu Client ID):

```
https://accounts.zoho.com/oauth/v2/auth?scope=ZohoMail.messages.CREATE&client_id=TU_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=https://www.zoho.com/mail/help/api/oauth-overview.html
```

4. Autoriza la aplicación
5. Copia el código de autorización de la URL
6. Intercambia el código por un Refresh Token usando:

```bash
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "grant_type=authorization_code" \
  -d "client_id=TU_CLIENT_ID" \
  -d "client_secret=TU_CLIENT_SECRET" \
  -d "redirect_uri=https://www.zoho.com/mail/help/api/oauth-overview.html" \
  -d "code=CODIGO_DE_AUTORIZACION"
```

### Opción B: Usando Script PHP (Recomendado)

Crea un archivo temporal `generate-zoho-token.php`:

```php
<?php
// Solo para generar el refresh token una vez
// ELIMINA ESTE ARCHIVO después de obtener el token

$clientId = 'TU_CLIENT_ID';
$clientSecret = 'TU_CLIENT_SECRET';
$redirectUri = 'https://tu-dominio.com/oauth/zoho/callback';

// Paso 1: Obtener código de autorización
if (!isset($_GET['code'])) {
    $authUrl = "https://accounts.zoho.com/oauth/v2/auth?" . http_build_query([
        'scope' => 'ZohoMail.messages.CREATE',
        'client_id' => $clientId,
        'response_type' => 'code',
        'access_type' => 'offline',
        'redirect_uri' => $redirectUri
    ]);
    
    echo "Ve a esta URL y autoriza: <a href='$authUrl'>$authUrl</a>";
    exit;
}

// Paso 2: Intercambiar código por tokens
$code = $_GET['code'];
$tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
$data = [
    'grant_type' => 'authorization_code',
    'client_id' => $clientId,
    'client_secret' => $clientSecret,
    'redirect_uri' => $redirectUri,
    'code' => $code
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $tokenUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$result = json_decode($response, true);

if (isset($result['refresh_token'])) {
    echo "<h2>✅ Refresh Token Generado:</h2>";
    echo "<pre>" . $result['refresh_token'] . "</pre>";
    echo "<p><strong>⚠️ COPIA ESTE TOKEN Y GUÁRDALO DE FORMA SEGURA</strong></p>";
    echo "<p>Este token no expira hasta que lo revoques manualmente.</p>";
} else {
    echo "<h2>❌ Error:</h2>";
    echo "<pre>" . print_r($result, true) . "</pre>";
}
?>
```

---

## ⚙️ Paso 3: Configurar en el Sistema

### 3.1 Acceder a Configuración

1. Inicia sesión como **Superadmin**
2. Ve a **Mensajes** → **Configuración de Email**
3. Selecciona **"Zoho Mail API"** en el selector de proveedor

### 3.2 Completar Campos

1. **Client ID:** Pega el Client ID obtenido
2. **Client Secret:** Pega el Client Secret obtenido
3. **Refresh Token:** Pega el Refresh Token generado
4. **Email Remitente:** Tu email de Zoho Mail (ej: `noreply@tudominio.com`)
5. **Nombre Remitente:** Nombre que aparecerá como remitente

### 3.3 Habilitar Servicio

1. Marca **"Habilitar servicio de email"**
2. Click en **"Guardar Configuración"**

### 3.4 Probar Configuración

1. Ingresa un email de prueba
2. Click en **"Enviar Email de Prueba"**
3. Verifica que llegue el email

---

## 🔄 Renovación Automática de Tokens

El sistema renueva automáticamente el Access Token cuando expira usando el Refresh Token. No necesitas hacer nada manualmente.

**Nota:** El Refresh Token no expira hasta que lo revoques manualmente desde Zoho API Console.

---

## 🛠️ Solución de Problemas

### Error: "Invalid refresh token"
- **Causa:** El Refresh Token fue revocado o es inválido
- **Solución:** Genera un nuevo Refresh Token siguiendo el Paso 2

### Error: "Invalid client credentials"
- **Causa:** Client ID o Client Secret incorrectos
- **Solución:** Verifica que copiaste correctamente desde Zoho API Console

### Error: "Account not found"
- **Causa:** El email remitente no existe en Zoho Mail
- **Solución:** Verifica que el email esté configurado en tu cuenta de Zoho Mail

### Error: "Rate limit exceeded"
- **Causa:** Se excedió el límite de emails por minuto/hora
- **Solución:** Espera unos minutos antes de intentar nuevamente

### Error: "Permission denied"
- **Causa:** La aplicación no tiene permisos de Zoho Mail API
- **Solución:** Verifica los scopes en Zoho API Console (debe incluir `ZohoMail.messages.CREATE`)

---

## 📊 Límites de Zoho Mail API

- **Plan Free:** Limitado (consultar documentación actual)
- **Plan Paid:** Mayor límite de emails
- **Rate Limit:** Varía según el plan

**Recomendación:** Consulta los límites actuales en la documentación oficial de Zoho.

---

## 🔐 Seguridad

### Mejores Prácticas:

1. **Nunca compartas** tu Client Secret o Refresh Token
2. **Almacena** las credenciales de forma segura
3. **Revisa** periódicamente los accesos en Zoho API Console
4. **Revoca** tokens si sospechas compromiso

### En Producción:

- Considera encriptar las credenciales en Firestore
- Usa variables de entorno para credenciales sensibles
- Implementa rate limiting en el servidor

---

## 📚 Referencias

- [Zoho Mail API Documentation](https://www.zoho.com/mail/help/api/)
- [Zoho OAuth 2.0 Guide](https://www.zoho.com/mail/help/dev-platform/connectors.html)
- [Zoho API Console](https://api-console.zoho.com)

---

## ✅ Checklist de Configuración

- [ ] Aplicación registrada en Zoho API Console
- [ ] Client ID y Client Secret obtenidos
- [ ] Refresh Token generado
- [ ] Credenciales configuradas en el sistema
- [ ] Email de prueba enviado exitosamente
- [ ] Verificado que los emails llegan correctamente
- [ ] Historial de mensajes muestra "Enviado" para Zoho

---

**¿Necesitas ayuda?** Consulta la documentación oficial de Zoho o contacta al soporte.

