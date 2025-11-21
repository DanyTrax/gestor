# 🔧 Troubleshooting: Error 404 en Zoho Mail API

## ⚠️ Problema

Error 404: "Cuenta de email no encontrada en Zoho" aunque el email existe.

## 🔍 Posibles Causas

### 1. Email no habilitado para API

El email existe en Zoho Mail pero no está habilitado para uso con API.

**Solución:**
1. Inicia sesión en Zoho Mail: https://mail.zoho.com
2. Ve a **Configuración** → **Cuentas de correo**
3. Abre `soporte@acdoblevia.com`
4. Busca la opción **"API Access"** o **"Third-party apps"**
5. **Habilita** el acceso a API
6. Guarda los cambios

### 2. Email en organización diferente

El email puede estar en una organización diferente a la que autorizó la aplicación.

**Solución:**
1. Verifica que el email `soporte@acdoblevia.com` esté en la misma organización que autorizó la aplicación
2. Si está en otra organización, usa el email de la organización correcta

### 3. Dominio no verificado

El dominio `acdoblevia.com` puede no estar verificado en Zoho.

**Solución:**
1. Ve a Zoho Admin Console: https://admin.zoho.com
2. Ve a **Mail** → **Dominios**
3. Verifica que `acdoblevia.com` esté verificado
4. Si no está verificado, verifícalo siguiendo las instrucciones

### 4. Formato incorrecto del endpoint

El endpoint puede requerir un formato diferente.

**Verificación:**
El código actual usa:
```php
$accountId = urlencode($fromEmail);
$zohoApiUrl = "https://mail.zoho.com/api/accounts/$accountId/messages";
```

Esto genera: `https://mail.zoho.com/api/accounts/soporte%40acdoblevia.com/messages`

**Alternativa a probar:**
Algunas versiones de Zoho Mail API requieren el User ID en lugar del email.

### 5. Región incorrecta de Zoho

Si tu cuenta está en otra región (EU, IN, etc.), el endpoint puede ser diferente.

**Verificación:**
- US: `https://mail.zoho.com/api/...`
- EU: `https://mail.zoho.eu/api/...`
- IN: `https://mail.zoho.in/api/...`

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar que el email esté habilitado para API

1. **Inicia sesión en Zoho Mail:**
   ```
   https://mail.zoho.com
   ```

2. **Ve a Configuración:**
   - Click en el icono de configuración (⚙️)
   - O ve directamente a: https://mail.zoho.com/home#settings/accounts

3. **Abre la cuenta `soporte@acdoblevia.com`:**
   - Busca la cuenta en la lista
   - Haz click para abrirla

4. **Busca "API Access" o "Third-party apps":**
   - Debe estar en la sección de seguridad o permisos
   - **Habilita** el acceso a API si está deshabilitado

5. **Guarda los cambios**

### Paso 2: Verificar dominio

1. **Ve a Zoho Admin Console:**
   ```
   https://admin.zoho.com
   ```

2. **Ve a Mail → Dominios**

3. **Verifica que `acdoblevia.com` esté:**
   - Listado
   - Verificado (debe mostrar un check verde)
   - Activo

4. **Si no está verificado:**
   - Sigue las instrucciones para verificar el dominio
   - Esto puede requerir agregar registros DNS

### Paso 3: Verificar organización

1. **Verifica en qué organización está el email:**
   - Ve a Zoho Mail
   - Click en tu perfil (arriba a la derecha)
   - Verifica la organización actual

2. **Verifica que la aplicación esté autorizada para esa organización:**
   - Ve a: https://accounts.zoho.com/home#security/apps
   - Busca tu aplicación "Clients.dowgroupcol.com"
   - Verifica que esté autorizada para la organización correcta

### Paso 4: Probar con otro email

Si tienes otro email en Zoho Mail:

1. **Prueba temporalmente con otro email:**
   - Ve a tu sistema: Mensajes → Configuración de Email
   - Cambia "Email Remitente (Zoho)" a otro email que tengas
   - Guarda y prueba

2. **Si funciona con otro email:**
   - El problema es específico de `soporte@acdoblevia.com`
   - Necesitas habilitarlo para API o verificar su configuración

### Paso 5: Verificar scopes de la aplicación

1. **Ve a Zoho API Console:**
   ```
   https://api-console.zoho.com
   ```

2. **Abre tu aplicación "Clients.dowgroupcol.com"**

3. **Ve a "Settings" o "Scopes"**

4. **Verifica que tenga:**
   - `ZohoMail.messages.CREATE` ✅
   - `ZohoMail.accounts.READ` (opcional pero recomendado) ✅

5. **Si no los tiene, agrégalos y guarda**

---

## 🔄 Alternativa: Usar User ID en lugar de Email

Si el problema persiste, puede que necesites usar el User ID en lugar del email.

### Obtener User ID:

1. **Usa la API de Zoho para obtener cuentas:**
   ```bash
   curl -X GET "https://mail.zoho.com/api/accounts" \
     -H "Authorization: Zoho-oauthtoken TU_ACCESS_TOKEN"
   ```

2. **Busca el User ID del email `soporte@acdoblevia.com`**

3. **Modifica el código para usar User ID en lugar de email**

---

## 📝 Checklist de Verificación

- [ ] Email existe en Zoho Mail
- [ ] Email está habilitado para API Access
- [ ] Dominio está verificado en Zoho
- [ ] Email está en la misma organización que autorizó la app
- [ ] Aplicación tiene scope `ZohoMail.messages.CREATE`
- [ ] Refresh Token es válido
- [ ] Access Token se genera correctamente
- [ ] Endpoint URL es correcto

---

## 🆘 Si Nada Funciona

1. **Contacta soporte de Zoho:**
   - https://help.zoho.com/portal/en/kb/mail
   - Explica que estás usando Zoho Mail API y recibes error 404

2. **Verifica la documentación oficial:**
   - https://www.zoho.com/mail/help/api/
   - Puede haber cambios recientes en la API

3. **Considera usar SMTP como alternativa:**
   - Si Zoho Mail API no funciona, puedes usar SMTP de Zoho
   - Configuración SMTP de Zoho:
     - Servidor: `smtp.zoho.com`
     - Puerto: `587` (TLS) o `465` (SSL)
     - Usuario: `soporte@acdoblevia.com`
     - Contraseña: La contraseña del email

---

**¿Necesitas más ayuda?** Revisa la documentación oficial de Zoho Mail API.

