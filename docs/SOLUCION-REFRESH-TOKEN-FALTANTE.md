# 🔧 Solución: No se recibe Refresh Token de Zoho

## ⚠️ Problema

Al generar el Refresh Token, Zoho devuelve solo el Access Token pero no el Refresh Token.

**Respuesta recibida:**
```php
Array
(
    [access_token] => 1000.xxxxx...
    [scope] => ZohoMail.messages.CREATE
    [expires_in] => 3600
    // ❌ NO hay refresh_token
)
```

## 🔍 Causa

Zoho solo devuelve el Refresh Token **la primera vez** que autorizas una aplicación. Si ya autorizaste antes, no lo devuelve de nuevo.

## ✅ Solución: Revocar y Re-autorizar

### Opción 1: Revocar desde Zoho API Console (Recomendado)

1. **Ve a Zoho API Console:** https://api-console.zoho.com
2. **Abre tu aplicación** "Clients.dowgroupcol.com"
3. **Ve a la pestaña "Settings"** o busca "Authorized Apps"
4. **Busca tu aplicación** en la lista de aplicaciones autorizadas
5. **Revoca el acceso** (botón "Revoke" o "Remove")
6. **Espera 1-2 minutos**
7. **Vuelve a ejecutar** `generate-zoho-token.php` desde el navegador
8. **Autoriza nuevamente** - Esta vez SÍ recibirás el Refresh Token

### Opción 2: Revocar desde Zoho Account Settings

1. **Ve a:** https://accounts.zoho.com/home#security/apps
2. **Busca tu aplicación** en la lista
3. **Haz clic en "Revoke"** o "Remove"
4. **Espera 1-2 minutos**
5. **Vuelve a ejecutar** `generate-zoho-token.php`
6. **Autoriza nuevamente**

### Opción 3: Usar una cuenta diferente (Temporal)

Si no puedes revocar, puedes:

1. **Crear una nueva aplicación** en Zoho API Console con otro nombre
2. **Usar esa nueva aplicación** para generar el Refresh Token
3. **Actualizar las credenciales** en tu sistema

---

## 📋 Pasos Detallados (Opción 1)

### Paso 1: Revocar Acceso

1. Inicia sesión en: https://api-console.zoho.com
2. Selecciona tu aplicación: **"Clients.dowgroupcol.com"**
3. Ve a la pestaña **"Settings"**
4. Busca la sección **"Authorized Apps"** o **"Connected Apps"**
5. Si no aparece ahí, ve a: https://accounts.zoho.com/home#security/apps
6. Busca tu aplicación en la lista
7. Haz clic en **"Revoke"** o **"Remove"**
8. Confirma la acción

### Paso 2: Esperar

Espera **1-2 minutos** para que Zoho procese la revocación.

### Paso 3: Regenerar Token

1. **Abre en el navegador:**
   ```
   https://clients.dowgroupcol.com/generate-zoho-token.php
   ```

2. **Verifica que el script muestre:**
   - Redirect URI configurado
   - Botón "Autorizar Aplicación en Zoho"

3. **Haz clic en "Autorizar"**

4. **Inicia sesión en Zoho** si es necesario

5. **Autoriza el acceso** a Zoho Mail

6. **Serás redirigido** y esta vez SÍ verás el Refresh Token

### Paso 4: Copiar Refresh Token

1. **Copia el Refresh Token** que aparece en pantalla
2. **Pégalo en tu sistema:** Mensajes → Configuración de Email
3. **Guarda la configuración**

---

## 🔍 Verificar que Funcionó

Después de re-autorizar, deberías ver:

```php
Array
(
    [access_token] => 1000.xxxxx...
    [refresh_token] => 1000.xxxxx...  ✅ ESTO DEBE APARECER
    [scope] => ZohoMail.messages.CREATE
    [expires_in] => 3600
)
```

---

## ⚠️ Notas Importantes

1. **Solo la primera vez:** Zoho devuelve el Refresh Token solo la primera vez que autorizas
2. **Revocar es necesario:** Si ya autorizaste antes, debes revocar para obtenerlo de nuevo
3. **El Refresh Token no expira:** Una vez que lo obtengas, no necesitarás regenerarlo (a menos que lo revoques)
4. **Guárdalo seguro:** Copia el Refresh Token y guárdalo de forma segura

---

## 🐛 Si Sigue Sin Funcionar

### Verificar parámetros en la URL de autorización

Asegúrate de que la URL de autorización incluya:
- `access_type=offline` ✅
- `response_type=code` ✅
- `scope=ZohoMail.messages.CREATE` ✅

### Verificar Redirect URI

El Redirect URI en Zoho API Console debe coincidir EXACTAMENTE con:
```
https://clients.dowgroupcol.com/generate-zoho-token.php
```

### Verificar que la aplicación esté activa

En Zoho API Console:
1. Abre tu aplicación
2. Verifica que esté en estado "Active" o "Active"
3. Si está "Inactive", actívala

---

## ✅ Checklist

- [ ] Revocaste el acceso anterior en Zoho
- [ ] Esperaste 1-2 minutos después de revocar
- [ ] Accediste a `generate-zoho-token.php` nuevamente
- [ ] Autorizaste la aplicación en Zoho
- [ ] Recibiste el Refresh Token en la respuesta
- [ ] Copiaste el Refresh Token
- [ ] Lo pegaste en tu sistema
- [ ] Guardaste la configuración
- [ ] Probaste enviar un email

---

**¿Necesitas más ayuda?** Revisa la documentación oficial de Zoho: https://www.zoho.com/mail/help/api/oauth-overview.html

