# Solución: Error de Autenticación SMTP

## 🔴 Error Actual

```
SMTP Error: Could not authenticate.
```

**Configuración actual:**
- Servidor: `mail.dvsystemsas.com`
- Puerto: `465`
- Usuario: `no_reply@dvsystemsas.com`
- Conexión segura: SSL (requerida para puerto 465)

## ✅ Pasos para Solucionar

### Paso 1: Verificar en cPanel

1. **Accede a cPanel** → **Email Accounts**
2. **Verifica que la cuenta existe:**
   - Busca `no_reply@dvsystemsas.com`
   - Debe estar **activa** (no suspendida)

3. **Obtén la configuración exacta:**
   - Click en **"Configurar Cliente de Correo"** o **"Connect Devices"**
   - Selecciona el email `no_reply@dvsystemsas.com`
   - Copia la configuración SMTP que aparece

### Paso 2: Verificar Contraseña

1. En cPanel → **Email Accounts**
2. Busca `no_reply@dvsystemsas.com`
3. Click en **"Cambiar Contraseña"** o **"Change Password"**
4. **Crea una nueva contraseña** (más fácil que recordar la vieja)
5. **Copia la contraseña** (no la olvides)

### Paso 3: Verificar Configuración en el Sistema

En **Mensajes** → **Configuración de Email**, verifica:

#### ✅ Configuración Correcta para Puerto 465 (SSL):

```
Servidor SMTP: mail.dvsystemsas.com
Puerto: 465
Usuario SMTP: no_reply@dvsystemsas.com  ← SIN ESPACIOS
Contraseña: [la contraseña que acabas de crear]
Email Remitente: no_reply@dvsystemsas.com
Nombre Remitente: Tu Empresa
✅ Usar conexión segura (DEBE estar marcado para puerto 465)
✅ Habilitar servicio de email
```

**IMPORTANTE:**
- ✅ Puerto 465 **SIEMPRE** requiere SSL
- ✅ Marca **"Usar conexión segura"**
- ✅ El usuario debe ser el email completo (no solo `no_reply`)

### Paso 4: Alternativa - Probar Puerto 587 (TLS)

Si el puerto 465 no funciona, prueba con **587 y TLS**:

```
Servidor SMTP: mail.dvsystemsas.com
Puerto: 587
Usuario SMTP: no_reply@dvsystemsas.com
Contraseña: [tu contraseña]
✅ Usar conexión segura (TLS para puerto 587)
✅ Habilitar servicio de email
```

### Paso 5: Verificar Servidor SMTP Alternativo

Si `mail.dvsystemsas.com` no funciona, prueba:

1. `smtp.dvsystemsas.com`
2. `mail.hosting-provider.com` (consulta con tu hosting)

## 🔍 Checklist de Verificación

Antes de probar nuevamente, verifica:

- [ ] La cuenta `no_reply@dvsystemsas.com` existe en cPanel
- [ ] La cuenta está **activa** (no suspendida)
- [ ] La contraseña es correcta (o la acabas de cambiar)
- [ ] El usuario SMTP es el email completo: `no_reply@dvsystemsas.com`
- [ ] No hay espacios al inicio o final del usuario
- [ ] Puerto 465 con SSL marcado, O puerto 587 con TLS marcado
- [ ] El servidor SMTP es correcto (verificado en cPanel)

## 🚨 Si Aún No Funciona

### Opción A: Verificar con Soporte del Hosting

Contacta a tu proveedor de hosting y pregunta:
1. ¿El servidor SMTP es `mail.dvsystemsas.com` o `smtp.dvsystemsas.com`?
2. ¿Qué puertos están habilitados? (587, 465)
3. ¿Hay alguna restricción de IP para SMTP?
4. ¿La cuenta de email está correctamente configurada?

### Opción B: Crear Nueva Cuenta de Email

1. En cPanel → **Email Accounts**
2. Crea una nueva cuenta: `noreply@dvsystemsas.com` (sin guión bajo)
3. Crea una contraseña nueva
4. Usa esta nueva cuenta en la configuración

### Opción C: Probar con Cliente de Email

Para verificar que la cuenta funciona, configura un cliente de email (Outlook, Thunderbird) con:
- Servidor: `mail.dvsystemsas.com`
- Puerto: `465` (SSL) o `587` (TLS)
- Usuario: `no_reply@dvsystemsas.com`
- Contraseña: [tu contraseña]

Si funciona en el cliente de email, debería funcionar en el sistema.

## 📝 Notas Importantes

1. **Puerto 465 = SSL obligatorio**
2. **Puerto 587 = TLS obligatorio**
3. **El usuario debe ser el email completo** (no solo el nombre)
4. **La contraseña debe coincidir exactamente** con la de cPanel
5. **Algunos servidores requieren autenticación desde IP específicas** (consulta con tu hosting)

## ✅ Una Vez Solucionado

Cuando el email se envíe correctamente:
- Verás el mensaje: "✅ Email de prueba enviado exitosamente"
- El estado en el historial será "Enviado"
- Recibirás el email en tu bandeja de entrada

