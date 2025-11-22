# Configurar Dominio Autorizado en Firebase

## 🔴 Error Común

Si ves este error al intentar restablecer contraseñas:

```
Firebase: Domain not allowlisted by project (auth/unauthorized-continue-uri)
```

Significa que el dominio desde el cual se está ejecutando la aplicación no está autorizado en Firebase Console.

## ✅ Solución: Agregar Dominio en Firebase Console

### Paso 1: Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (en este caso: `alojamientos-3c46b`)

### Paso 2: Ir a Authentication Settings

1. En el menú lateral, haz clic en **"Authentication"** (Autenticación)
2. Haz clic en la pestaña **"Settings"** (Configuración)
3. Desplázate hasta la sección **"Authorized domains"** (Dominios autorizados)

### Paso 3: Agregar tu Dominio

1. Haz clic en **"Add domain"** (Agregar dominio)
2. Ingresa tu dominio completo, por ejemplo:
   - `clients.dowgroupcol.com`
   - `localhost` (para desarrollo local)
   - `127.0.0.1` (para desarrollo local)
   - Cualquier otro dominio donde esté desplegada la aplicación

3. Haz clic en **"Add"** (Agregar)

### Paso 4: Verificar

Los dominios autorizados por defecto incluyen:
- `localhost` (ya está incluido)
- `[tu-proyecto].firebaseapp.com` (ya está incluido)
- `[tu-proyecto].web.app` (ya está incluido)

**IMPORTANTE:** Debes agregar manualmente tu dominio de producción.

## 📋 Dominios que Debes Agregar

Agrega todos los dominios donde la aplicación esté disponible:

- **Producción:** `clients.dowgroupcol.com`
- **Desarrollo local:** `localhost` (ya está incluido, pero verifica)
- **Cualquier subdominio:** `www.clients.dowgroupcol.com` (si aplica)

## 🔍 Verificar el Dominio Actual

Para ver qué dominio está usando tu aplicación, abre la consola del navegador y ejecuta:

```javascript
console.log(window.location.hostname);
```

Este es el dominio que debes agregar en Firebase Console.

## ⚠️ Notas Importantes

1. **Cambios Inmediatos:** Los cambios en Firebase Console pueden tardar unos minutos en aplicarse.

2. **HTTPS Requerido:** En producción, Firebase requiere HTTPS para dominios personalizados.

3. **Subdominios:** Cada subdominio debe agregarse por separado (ej: `www.example.com` y `example.com` son diferentes).

4. **Desarrollo Local:** `localhost` ya está autorizado por defecto, pero si usas `127.0.0.1` o un puerto específico, puede que necesites agregarlo.

## 🧪 Probar Después de Configurar

1. Espera 2-3 minutos después de agregar el dominio
2. Intenta restablecer una contraseña nuevamente
3. Si el error persiste, verifica que:
   - El dominio esté escrito correctamente (sin `http://` o `https://`)
   - No haya espacios adicionales
   - El dominio coincida exactamente con `window.location.hostname`

## 📞 Soporte

Si después de seguir estos pasos el error persiste, verifica:
- Que el proyecto de Firebase sea el correcto
- Que tengas permisos de administrador en el proyecto
- Que no haya restricciones de red/firewall bloqueando las peticiones a Firebase

