# Configurar SMTP de cPanel en Gestor de Cobros

## 📋 Pasos para Configurar

### Paso 1: Crear cuenta de email en cPanel

1. Accede a tu **cPanel**
2. Busca la sección **"Email Accounts"** o **"Cuentas de Email"**
3. Click en **"Crear"** o **"Create"**
4. Configura:
   - **Email:** `noreply@tu-dominio.com` (o el que prefieras)
   - **Contraseña:** Crea una contraseña segura
   - **Almacenamiento:** No es crítico para solo enviar
5. Click en **"Crear Cuenta"**

### Paso 2: Obtener configuración SMTP

La configuración típica de cPanel es:

- **Servidor SMTP:** `mail.tu-dominio.com` o `smtp.tu-dominio.com`
- **Puerto:** 
  - `587` con TLS (más común)
  - `465` con SSL
- **Autenticación:** Sí (activada)
- **Conexión segura:** Sí (TLS o SSL)

**Nota:** El servidor exacto puede variar según tu proveedor. Si `mail.tu-dominio.com` no funciona, prueba:
- `smtp.tu-dominio.com`
- `mail.hosting-provider.com` (consulta con tu hosting)
- O revisa en cPanel → Email Accounts → Configurar Cliente de Correo

### Paso 3: Configurar en Gestor de Cobros

1. Ve a **Mensajes** → **Configuración de Email**
2. Completa los campos:

   ```
   Servidor SMTP: mail.tu-dominio.com
   Puerto: 587
   Usuario SMTP: noreply@tu-dominio.com
   Contraseña: [la contraseña que creaste]
   Email Remitente: noreply@tu-dominio.com
   Nombre Remitente: Tu Empresa
   ✅ Usar conexión segura (TLS)
   ✅ Habilitar servicio de email
   ```

3. Click en **Guardar Configuración**

### Paso 4: Probar

1. En la sección "Probar Configuración"
2. Ingresa un email válido (puede ser el tuyo)
3. Click en **Enviar Email de Prueba**
4. Revisa tu bandeja de entrada

---

## 🔍 Verificar configuración SMTP en cPanel

### Opción A: Desde Email Accounts

1. cPanel → **Email Accounts**
2. Click en **"Configurar Cliente de Correo"** o **"Connect Devices"**
3. Selecciona el email que creaste
4. Verás la configuración SMTP completa

### Opción B: Desde Configuración del Servidor

1. cPanel → **"Configuración del Servidor"** o busca **"SMTP"**
2. Revisa los puertos habilitados (normalmente 587 y 465)

---

## ⚠️ Solución de Problemas

### Error: "Could not connect to SMTP server"

**Posibles causas:**
1. **Servidor incorrecto:** Verifica el servidor exacto en cPanel
2. **Puerto bloqueado:** Algunos hosts bloquean puertos. Verifica con soporte
3. **Firewall:** El firewall del servidor puede estar bloqueando

**Solución:**
- Prueba primero `mail.tu-dominio.com:587` con TLS
- Si no funciona, prueba `smtp.tu-dominio.com:587`
- Si sigue fallando, contacta a tu proveedor de hosting

### Error: "Could not authenticate" o "Authentication failed"

**Causa:** Usuario o contraseña incorrectos, o configuración SMTP incorrecta

**Solución paso a paso:**

1. **Verifica el usuario SMTP:**
   - Debe ser el email completo: `noreply@dowgroupcol.com` (no solo `noreply`)
   - Debe coincidir exactamente con la cuenta creada en cPanel

2. **Verifica la contraseña:**
   - Debe ser la contraseña que configuraste al crear la cuenta en cPanel
   - Si no la recuerdas, cambia la contraseña en cPanel → Email Accounts
   - No debe tener espacios al inicio o final

3. **Verifica el servidor SMTP:**
   - Para cPanel, generalmente es: `mail.tu-dominio.com` o `smtp.tu-dominio.com`
   - Puedes verificarlo en cPanel → Email Accounts → "Configurar Cliente de Correo"

4. **Verifica puerto y conexión segura:**
   - **Puerto 587** con **TLS** (más común) - marca "Usar conexión segura"
   - **Puerto 465** con **SSL** - marca "Usar conexión segura"
   - El puerto y la conexión segura deben coincidir

5. **Si aún no funciona:**
   - Prueba cambiar la contraseña de la cuenta en cPanel
   - Verifica que la cuenta de email no esté suspendida o deshabilitada
   - Contacta a tu proveedor de hosting para verificar restricciones SMTP

### Error: "Connection timeout"

**Causa:** Puerto bloqueado o servidor incorrecto

**Solución:**
- Prueba puerto `465` con SSL en lugar de `587` con TLS
- Verifica con tu hosting si hay restricciones

---

## 💡 Ventajas de usar cPanel SMTP

✅ **Emails ilimitados** (según tu plan de hosting)
✅ **Desde tu propio dominio** (mejor deliverability)
✅ **Sin límites de terceros** (no como servicios gratuitos)
✅ **Ya está incluido** (no necesitas servicios adicionales)
✅ **Control total** sobre tus emails

---

## 📝 Configuración Típica

```
Servidor: mail.dowgroupcol.com
Puerto: 587
Seguro: TLS ✓
Usuario: noreply@dowgroupcol.com
Contraseña: [tu-contraseña]
```

**Nota:** Ajusta `dowgroupcol.com` por tu dominio real.

---

## 🚀 Una vez configurado

Una vez que configures cPanel SMTP y guardes:
- Los emails se enviarán realmente
- El estado cambiará de "Simulado" a "Enviado" o "Entregado"
- Verás los emails en las bandejas de entrada de los destinatarios

---

¿Tienes acceso a cPanel para crear la cuenta de email? Una vez que la tengas, solo necesitas copiar los datos en la configuración del sistema.

