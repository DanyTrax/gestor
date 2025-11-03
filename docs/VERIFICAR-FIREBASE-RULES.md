# Verificar y Configurar Reglas de Firestore

## 🔍 Problema Común

Si ves errores como:
- `FirebaseError: Missing or insufficient permissions`
- `permission-denied`
- `Error checking configuration`

Significa que las **reglas de seguridad de Firestore** no están configuradas correctamente.

## ✅ Solución: Configurar Reglas de Firestore

### Paso 1: Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Firestore Database**
4. Click en la pestaña **"Rules"** (Reglas)

### Paso 2: Copiar las Reglas

Abre el archivo `firebase-rules.txt` en tu proyecto y copia todo su contenido.

### Paso 3: Pegar en Firebase Console

1. En la pestaña "Rules" de Firebase Console
2. Reemplaza todo el contenido del editor con las reglas de `firebase-rules.txt`
3. Click en **"Publish"** (Publicar)

## 📋 Reglas Necesarias

Las reglas deben permitir lectura y escritura para usuarios autenticados en:

- `/artifacts/{appId}/public/data/settings/{settingId}` - Para configuración de empresa y email
- `/artifacts/{appId}/public/data/users/{userId}` - Para datos de usuarios
- `/artifacts/{appId}/public/data/services/{serviceId}` - Para servicios
- `/artifacts/{appId}/public/data/messageHistory/{messageId}` - Para historial de mensajes

### Ejemplo de Reglas Correctas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura para usuarios autenticados
    match /artifacts/{appId}/public/data/{collection}/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas específicas para configuración
    match /artifacts/{appId}/public/data/settings/{settingId} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas para usuarios
    match /artifacts/{appId}/public/data/users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## ⚠️ Importante

- **Las reglas deben coincidir exactamente** con la estructura de tu base de datos
- **Solo usuarios autenticados** pueden leer/escribir (seguridad)
- **Publica las reglas** después de editarlas (botón "Publish")

## 🔧 Verificar que las Reglas Están Activas

1. Recarga la aplicación en el navegador
2. Los errores de "Missing or insufficient permissions" deberían desaparecer
3. Si persisten, verifica:
   - Que el usuario esté autenticado correctamente
   - Que las reglas coincidan con la estructura de datos
   - Que hayas publicado las reglas (botón "Publish")

## 📝 Nota de Seguridad

Estas reglas permiten que **cualquier usuario autenticado** pueda leer y escribir. Para producción, considera:
- Restricciones basadas en roles (admin, cliente)
- Validación de datos antes de escribir
- Reglas más específicas por colección

Para mayor seguridad, consulta la [documentación oficial de Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started).

