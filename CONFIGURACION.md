# 🚀 Configuración del Gestor de Cobros

## ✅ **Problemas Solucionados**

### 1. **Modo Demo Desactivado**
- El proyecto ya NO inicia en modo demo
- Funciona en modo producción real

### 2. **Usuario Superadmin Funcional**
- El primer usuario registrado se convierte automáticamente en superadmin
- No requiere verificación de email para el superadmin
- Puede iniciar sesión inmediatamente después del registro

### 3. **Configuración Inicial**
- Modal de configuración de empresa para el primer superadmin
- Configuración automática de datos básicos

## 🔧 **Pasos para Configurar Firebase**

### 1. **Configurar Reglas de Firestore**
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: `alojamientos-3c46b`
3. Ve a **Firestore Database** > **Rules**
4. Copia y pega las reglas del archivo `firebase-rules.txt`

### 2. **Verificar Autenticación**
1. Ve a **Authentication** > **Sign-in method**
2. Asegúrate de que **Email/Password** esté habilitado
3. No es necesario verificar emails para desarrollo

## 🚀 **Cómo Usar el Sistema**

### **Primer Uso:**
1. **Ejecutar el proyecto**: `npm run dev`
2. **Abrir**: http://localhost:3001
3. **Registrarse** con el primer usuario (será superadmin)
4. **Completar configuración inicial** de la empresa
5. **¡Listo!** Ya puedes usar el sistema completo

### **Usuarios Posteriores:**
- Los siguientes usuarios serán **clientes** por defecto
- Requieren activación por parte del superadmin
- El superadmin puede gestionar usuarios en la pestaña "Usuarios"

## 📋 **Funcionalidades Disponibles**

### **Para Superadmin:**
- ✅ Gestión completa de servicios
- ✅ Gestión de usuarios (crear, activar, desactivar)
- ✅ Configuración de la empresa
- ✅ Plantillas de mensajes
- ✅ Historial de mensajes
- ✅ Tickets de soporte

### **Para Clientes:**
- ✅ Ver sus servicios contratados
- ✅ Crear tickets de soporte
- ✅ Configurar sus datos personales

## 🔍 **Solución de Problemas**

### **Si no puedes iniciar sesión:**
1. Verifica que las reglas de Firestore estén configuradas
2. Asegúrate de que el usuario esté registrado correctamente
3. Revisa la consola del navegador para errores

### **Si no aparece el usuario en la lista:**
1. El superadmin debe activar los usuarios desde la pestaña "Usuarios"
2. Solo los usuarios con rol "superadmin" pueden gestionar otros usuarios

### **Si hay errores de permisos:**
1. Verifica las reglas de Firestore
2. Asegúrate de que el usuario esté autenticado
3. Revisa que el rol del usuario sea correcto

## 📞 **Soporte**

Si encuentras algún problema:
1. Revisa la consola del navegador (F12)
2. Verifica que Firebase esté configurado correctamente
3. Asegúrate de que todas las dependencias estén instaladas






