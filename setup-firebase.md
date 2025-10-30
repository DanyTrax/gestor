# 🔥 Configuración de Firebase - SOLUCIÓN RÁPIDA

## ⚡ **Solución Inmediata (2 minutos)**

### **Paso 1: Ir a Firebase Console**
1. Abre: https://console.firebase.google.com
2. Selecciona tu proyecto: **alojamientos-3c46b**

### **Paso 2: Configurar Firestore Rules**
1. Ve a **Firestore Database** → **Rules**
2. **BORRA** todo el contenido actual
3. **COPIA y PEGA** este código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Haz clic en **"Publish"**

### **Paso 3: Verificar Authentication**
1. Ve a **Authentication** → **Sign-in method**
2. Asegúrate de que **Email/Password** esté **HABILITADO**
3. Si no está habilitado, haz clic en **"Enable"**

## ✅ **¡Listo!**

Después de estos pasos:
- ✅ Los errores de permisos desaparecerán
- ✅ Podrás registrarte como superadmin
- ✅ El sistema funcionará completamente

## 🔄 **Probar el Sistema**

1. **Refresca** la página: http://localhost:3001
2. **Regístrate** con tu email (será superadmin)
3. **Inicia sesión** inmediatamente
4. **¡Funciona!** 🎉

## ⚠️ **Importante**

Estas reglas son **SOLO PARA DESARROLLO**. 
Para producción necesitarás reglas más restrictivas.






