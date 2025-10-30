# 🔧 Solución al Error de Credenciales Inválidas

## 🚨 **Problema Identificado**
Error: `Firebase: Error (auth/invalid-credential)`

Este error indica que las credenciales (email/contraseña) no son válidas o no existen en Firebase.

## 🛠️ **Solución Paso a Paso**

### **Paso 1: Usar el Diagnóstico de Firebase**
1. **Abrir la página**: http://localhost:3001
2. **Hacer clic en el botón "🔧 Debug"** (esquina inferior derecha)
3. **Ejecutar diagnóstico** para ver el estado actual

### **Paso 2: Crear Usuarios de Prueba**
En el diagnóstico:
1. **Hacer clic en "👥 Crear Usuarios"**
2. **Esperar a que se creen** los usuarios de prueba
3. **Verificar que aparezcan** en los resultados

### **Paso 3: Configurar Sistema Básico**
En el diagnóstico:
1. **Hacer clic en "⚙️ Configurar"**
2. **Esperar a que se complete** la configuración
3. **Verificar que no haya errores**

### **Paso 4: Probar Login**
En el diagnóstico:
1. **Hacer clic en "🔐 Probar Login"**
2. **Verificar que el login funcione**
3. **Si funciona, usar las credenciales de prueba**

## 🔑 **Credenciales de Prueba**

Después de ejecutar el diagnóstico, usa estas credenciales:

### **Superadmin:**
- **Email**: `admin@test.com`
- **Contraseña**: `admin123`

### **Cliente:**
- **Email**: `cliente@test.com`
- **Contraseña**: `cliente123`

## 🔍 **Diagnóstico Manual**

Si el diagnóstico no funciona, puedes ejecutar esto en la consola del navegador:

```javascript
// Importar las funciones de diagnóstico
import { debugFirebase, createDefaultTestUsers, ensureBasicSetup } from './src/utils/firebaseDebug.js';

// Ejecutar diagnóstico
debugFirebase().then(result => console.log(result));

// Crear usuarios de prueba
createDefaultTestUsers().then(() => console.log('Usuarios creados'));

// Configurar sistema básico
ensureBasicSetup().then(() => console.log('Configuración completada'));
```

## 🚨 **Posibles Causas del Error**

### **1. Usuario No Existe**
- **Solución**: Crear usuarios de prueba con el diagnóstico

### **2. Contraseña Incorrecta**
- **Solución**: Usar las credenciales de prueba estándar

### **3. Usuario Deshabilitado**
- **Solución**: Verificar estado en la tabla de usuarios

### **4. Problema de Configuración de Firebase**
- **Solución**: Verificar reglas de Firestore y configuración

## ✅ **Verificación de Solución**

Después de seguir los pasos:

1. **✅ Deberías poder hacer login** con las credenciales de prueba
2. **✅ El sistema debería funcionar** normalmente
3. **✅ No debería aparecer** el error de credenciales inválidas

## 🔄 **Si el Problema Persiste**

1. **Verificar reglas de Firebase**:
   - Ir a Firebase Console → Firestore → Rules
   - Aplicar las reglas simples del archivo `firebase-rules-simple.txt`

2. **Verificar configuración de Auth**:
   - Ir a Firebase Console → Authentication → Sign-in method
   - Asegurar que Email/Password esté habilitado

3. **Limpiar caché del navegador**:
   - Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)

4. **Reiniciar el servidor**:
   - Detener con Ctrl+C
   - Ejecutar `npm run dev` nuevamente

## 📞 **Soporte Adicional**

Si el problema persiste después de seguir todos los pasos:

1. **Revisar la consola del navegador** (F12) para errores adicionales
2. **Verificar la configuración de Firebase** en la consola
3. **Comprobar que las reglas de Firestore** estén aplicadas correctamente

¡El diagnóstico debería solucionar el problema automáticamente! 🚀






