# 🗑️ Eliminación de Usuarios

## Problema
Al eliminar usuarios desde el panel de administración, solo se eliminaban de Firestore pero no de Firebase Authentication, dejando cuentas huérfanas.

## Solución Actual (Simplificada)

### 1. Eliminación de Firestore
Se eliminó la dependencia de Cloud Functions y se implementó eliminación solo de Firestore.

**Funcionamiento:**
1. Usuario hace clic en "Eliminar"
2. Se elimina de Firestore
3. Se muestra notificación informativa sobre Authentication

### 2. Opciones para Eliminación Completa

#### Opción A: Cloud Functions (Recomendada)
**Archivos disponibles:**
- `functions/index.js` - Cloud Function principal
- `functions/package.json` - Dependencias de Node.js
- `firebase.json` - Configuración de Firebase

**Configuración:**
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Instalar dependencias
cd functions
npm install

# Desplegar
firebase deploy --only functions
```

#### Opción B: API REST (Limitada)
**Archivo:** `src/utils/deleteUserAuth.js`
- Requiere token de administrador
- Limitaciones de la API REST

#### Opción C: Backend Personalizado
- Implementar endpoint con Admin SDK
- Mayor control y flexibilidad

### 3. Estado Actual
- ✅ Eliminación de Firestore funcionando
- ⚠️ Eliminación de Authentication requiere configuración adicional
- ✅ Notificaciones informativas al usuario
- ✅ Verificación de permisos de superadmin

## Recomendación
Para eliminación completa, implementar Cloud Functions siguiendo las instrucciones en `functions/` o crear un backend personalizado con Admin SDK.
