# Plan de Pruebas Completo - Gestor de Cobros
## Revisión Exhaustiva del Sistema

**Fecha:** 2024
**Revisado por:** Agencia de Desarrollo
**Versión del Sistema:** React + Firebase (Producción)

---

## 📋 ÍNDICE DE MÓDULOS A PROBAR

### 1. AUTENTICACIÓN Y GESTIÓN DE USUARIOS
### 2. GESTIÓN DE SERVICIOS
### 3. GESTIÓN DE PAGOS
### 4. SISTEMA DE TICKETS
### 5. MENSAJERÍA Y NOTIFICACIONES
### 6. CONFIGURACIÓN Y SETTINGS
### 7. COMPONENTES DE CLIENTE
### 8. INTEGRACIONES EXTERNAS

---

## 1. AUTENTICACIÓN Y GESTIÓN DE USUARIOS

### 1.1 Autenticación
- [ ] **Login con credenciales válidas**
  - Email y contraseña correctos
  - Verificar redirección según rol
  - Verificar carga de perfil de usuario

- [ ] **Login con credenciales inválidas**
  - Email incorrecto
  - Contraseña incorrecta
  - Email no registrado
  - Verificar mensajes de error apropiados

- [ ] **Registro de nuevo usuario**
  - Primer usuario (debe ser superadmin)
  - Usuarios subsecuentes (deben ser client con status pending)
  - Verificar creación en Firebase Auth
  - Verificar creación en Firestore
  - Verificar envío de email de verificación

- [ ] **Cambio de contraseña obligatorio**
  - Usuario con requiresPasswordChange = true
  - Modal debe aparecer automáticamente
  - Cambio exitoso de contraseña
  - Actualización en Firestore

- [ ] **Completar perfil (clientes)**
  - Modal aparece para clientes sin perfil completo
  - Validación de campos requeridos
  - Guardado exitoso en Firestore

- [ ] **Cierre de sesión**
  - Botón de logout funciona
  - Limpieza de estado
  - Redirección a página de login

- [ ] **Timeout de inactividad**
  - Configuración de minutos
  - Cierre automático después del tiempo
  - Notificación antes de cerrar

- [ ] **Modo Demo**
  - Activación/desactivación
  - Login sin autenticación real
  - Datos de demostración cargados
  - Funcionalidades bloqueadas apropiadamente

### 1.2 Gestión de Usuarios (Admin/Superadmin)
- [ ] **Listar usuarios**
  - Carga de todos los usuarios
  - Ordenamiento por email
  - Filtros de búsqueda funcionan

- [ ] **Crear usuario**
  - Modal de creación
  - Validación de email único
  - Creación en Firebase Auth
  - Creación en Firestore
  - Asignación de rol correcto
  - Envío de email de verificación (opcional)

- [ ] **Editar usuario**
  - Actualización de datos personales
  - Cambio de rol (client ↔ admin)
  - Actualización en Firestore

- [ ] **Activar usuario**
  - Cambio de status: pending → active
  - Generación de link de activación
  - Copia al portapapeles

- [ ] **Deshabilitar/Reactivar usuario**
  - Cambio de status: active → disabled
  - Cambio de status: disabled → active
  - Usuario no puede iniciar sesión si está disabled

- [ ] **Eliminar usuario**
  - Confirmación requerida
  - Eliminación de Firestore
  - Nota sobre eliminación de Auth

- [ ] **Búsqueda y filtros**
  - Búsqueda por email
  - Búsqueda por nombre
  - Búsqueda por identificación

---

## 2. GESTIÓN DE SERVICIOS

### 2.1 Dashboard de Servicios (Admin)
- [ ] **Listar servicios**
  - Carga de todos los servicios
  - Ordenamiento por fecha
  - Filtros por estado funcionan

- [ ] **Crear servicio**
  - Modal de creación
  - Selección de cliente
  - Campos requeridos validados
  - Tipos de servicio
  - Ciclos de facturación (One-Time, Monthly, Annually, etc.)
  - Guardado en Firestore

- [ ] **Editar servicio**
  - Actualización de datos
  - Cambio de estado
  - Actualización de fechas

- [ ] **Eliminar servicio**
  - Confirmación requerida
  - Eliminación de Firestore

- [ ] **Cambio de estado**
  - Select dropdown funciona
  - Actualización inmediata
  - Persistencia en Firestore

- [ ] **Cálculo de fechas de vencimiento**
  - Monthly: +1 mes
  - Semiannually: +6 meses
  - Annually: +1 año
  - Biennially: +2 años
  - Triennially: +3 años

- [ ] **Envío de notificaciones manuales**
  - Modal de recordatorio
  - Selección de plantilla
  - Envío de email
  - Registro en historial

- [ ] **Búsqueda y filtros**
  - Búsqueda en todos los campos
  - Filtros por estado
  - Combinación de filtros

### 2.2 Dashboard de Servicios (Cliente)
- [ ] **Listar servicios asignados**
  - Solo servicios del usuario actual
  - Ordenamiento correcto

- [ ] **Visualización de información**
  - Número de servicio
  - Tipo y descripción
  - Monto y moneda
  - Estado
  - Fechas de inicio y vencimiento
  - Ciclo de facturación

- [ ] **Solicitar pago**
  - Botón "Solicitar de Nuevo"
  - Modal de confirmación
  - Creación de pago pendiente
  - Redirección a pagos

- [ ] **Navegación a renovaciones**
  - Botón "Aumentar Ciclo"
  - Guardado en localStorage
  - Redirección a #renewals

- [ ] **Pagos pendientes**
  - Detección de pagos pendientes/procesando
  - Botón "Ir a Pago" cuando hay pago pendiente
  - Deshabilitación de "Solicitar de Nuevo"

---

## 3. GESTIÓN DE PAGOS

### 3.1 Dashboard de Pagos (Admin)
- [ ] **Listar pagos**
  - Carga de todos los pagos
  - Ordenamiento por fecha
  - Filtros por estado y gateway

- [ ] **Cambio de estado de pago**
  - Select dropdown funciona
  - Estados: Pendiente, Procesando, Completado, Fallido, Cancelado, Reembolsado
  - Actualización en Firestore

- [ ] **Completar pago**
  - Generación de invoice PDF
  - Conversión de moneda (USD → COP)
  - Envío de email de aprobación
  - Actualización de servicio asociado
  - Cambio de estado del servicio

- [ ] **Rechazar/Cancelar pago**
  - Envío de email de rechazo
  - Actualización de estado
  - Mensaje apropiado al cliente

- [ ] **Ver comprobante**
  - Modal de visualización
  - Imagen se carga correctamente
  - Descarga de comprobante

- [ ] **Descargar invoice**
  - Generación de PDF
  - Contenido correcto
  - Formato apropiado
  - Conversión de moneda

- [ ] **Eliminar pago**
  - Confirmación requerida
  - Eliminación de Firestore

- [ ] **Filtros y búsqueda**
  - Por estado
  - Por gateway
  - Por servicio/cliente/transacción

### 3.2 Dashboard de Pagos (Cliente)
- [ ] **Listar pagos del usuario**
  - Solo pagos del usuario actual
  - Ordenamiento correcto

- [ ] **Visualización de información**
  - Servicio asociado
  - Monto y moneda
  - Estado
  - Gateway
  - Fechas
  - Comprobante (si existe)

- [ ] **Seleccionar método de pago**
  - Botones según gateways habilitados
  - Redirección a pasarela (simulado)
  - Cambio a Transferencia Bancaria

- [ ] **Transferencia Bancaria**
  - Modal de instrucciones
  - Cuentas bancarias configuradas
  - Información de transferencia
  - Subida de comprobante

- [ ] **Subir comprobante**
  - Selección de archivo
  - Validación de tipo (JPG, PNG, PDF)
  - Validación de tamaño (5MB max)
  - Subida a servidor PHP
  - Actualización en Firestore
  - Cambio de estado a "Procesando"

- [ ] **Ver comprobante**
  - Modal de visualización
  - Imagen se carga correctamente
  - Descarga de comprobante

- [ ] **Descargar invoice**
  - Generación de HTML
  - Contenido correcto
  - Descarga exitosa

- [ ] **Resumen de pagos**
  - Total pagado
  - Pendientes
  - Completados
  - Fallidos

### 3.3 Configuración de Pagos
- [ ] **Configurar gateways**
  - Bold
  - PayPal
  - PayU
  - Transferencia Bancaria
  - Habilitar/deshabilitar
  - Auto-aprobación

- [ ] **Configurar cuentas bancarias**
  - Agregar cuenta
  - Editar cuenta
  - Eliminar cuenta
  - Información completa

- [ ] **Configuración de renovaciones**
  - Días de recordatorio
  - Período de gracia
  - Guardado en Firestore

---

## 4. SISTEMA DE TICKETS

### 4.1 Dashboard de Tickets (Admin)
- [ ] **Listar tickets**
  - Carga de todos los tickets
  - Ordenamiento por fecha
  - Filtros por estado, prioridad, departamento

- [ ] **Crear ticket**
  - Modal de creación
  - Selección de cliente
  - Campos requeridos
  - Asignación de número único
  - Guardado en Firestore

- [ ] **Ver ticket**
  - Modal de detalles
  - Información completa
  - Historial de mensajes
  - Adjuntos

- [ ] **Cambiar estado**
  - Select dropdown
  - Estados: Abierto, En Progreso, Respondido, Cerrado, Esperando Cliente
  - Actualización en Firestore

- [ ] **Asignar ticket**
  - Asignación a admin
  - Desasignación
  - Actualización en Firestore

- [ ] **Responder ticket**
  - Envío de mensaje
  - Actualización de contador
  - Notificación al cliente

- [ ] **Cerrar ticket**
  - Cambio de estado a "Cerrado"
  - Notificación al cliente

- [ ] **Eliminar ticket**
  - Confirmación requerida
  - Eliminación de ticket
  - Eliminación de mensajes asociados

- [ ] **Estadísticas**
  - Abiertos
  - En Progreso
  - Esperando Cliente
  - Críticos

### 4.2 Dashboard de Tickets (Cliente)
- [ ] **Listar tickets del usuario**
  - Solo tickets del usuario actual
  - Ordenamiento correcto

- [ ] **Crear ticket**
  - Modal de creación
  - Campos requeridos
  - Selección de departamento
  - Selección de prioridad
  - Guardado en Firestore

- [ ] **Ver ticket**
  - Modal de detalles
  - Información completa
  - Historial de mensajes
  - Responder ticket

- [ ] **Cerrar ticket**
  - Cambio de estado a "Cerrado"
  - Confirmación

- [ ] **Estadísticas**
  - Abiertos
  - Respondidos
  - En Progreso
  - Cerrados

---

## 5. MENSAJERÍA Y NOTIFICACIONES

### 5.1 Historial de Mensajes
- [ ] **Listar mensajes**
  - Carga de todos los mensajes
  - Ordenamiento por fecha
  - Filtros por tipo, estado, destinatario

- [ ] **Ver detalles de mensaje**
  - Modal de detalles
  - Información completa
  - Estado del envío
  - Errores (si aplica)

- [ ] **Filtros**
  - Por tipo (Aprobación, Rechazo, Recordatorio, etc.)
  - Por estado (Enviado, Entregado, Fallido, etc.)
  - Por destinatario (Cliente, Administrador)
  - Por módulo (payments, services, tickets, etc.)

### 5.2 Configuración de Email
- [ ] **Configurar SMTP**
  - Host SMTP
  - Puerto
  - Usuario
  - Contraseña
  - Email remitente
  - Nombre remitente
  - Conexión segura (SSL/TLS)
  - Habilitar/deshabilitar servicio

- [ ] **Probar configuración**
  - Envío de email de prueba
  - Validación de campos
  - Mensaje de éxito/error
  - Verificación en bandeja de entrada

- [ ] **Guardar configuración**
  - Persistencia en Firestore
  - Carga de configuración guardada

### 5.3 Configuración de Notificaciones
- [ ] **Notificaciones de Pagos**
  - Admin: Aprobación, Rechazo, Nuevo pago
  - Cliente: Aprobado, Rechazado, Recordatorio

- [ ] **Notificaciones de Servicios**
  - Admin: Recordatorio vencimiento, Nuevo servicio
  - Cliente: Recordatorio, Activado, Vencido

- [ ] **Notificaciones de Usuarios**
  - Admin: Nuevo usuario, Activación

- [ ] **Notificaciones de Tickets**
  - Admin: Nuevo ticket, Actualización
  - Cliente: Respuesta, Resuelto

- [ ] **Notificaciones de Renovaciones**
  - Admin: Solicitud de renovación
  - Cliente: Recordatorio, Confirmada

- [ ] **Activar/Desactivar notificaciones**
  - Toggle individual
  - Guardado en Firestore
  - Aplicación inmediata

---

## 6. CONFIGURACIÓN Y SETTINGS

### 6.1 Configuración de Empresa
- [ ] **Información de empresa**
  - Nombre de empresa
  - Logo (URL)
  - Modo demo
  - Timeout de inactividad
  - Guardado en Firestore

- [ ] **Setup inicial**
  - Modal de configuración inicial
  - Solo aparece si no hay configuración
  - Guardado de configuración
  - Recarga de página

### 6.2 Plantillas de Mensajes
- [ ] **Listar plantillas**
  - Carga de plantillas
  - Ordenamiento

- [ ] **Crear plantilla**
  - Modal de creación
  - Nombre
  - Asunto
  - Cuerpo (con variables)
  - Guardado en Firestore

- [ ] **Editar plantilla**
  - Actualización de datos
  - Persistencia

- [ ] **Eliminar plantilla**
  - Confirmación
  - Eliminación de Firestore

- [ ] **Usar plantilla**
  - Selección en modal de recordatorio
  - Reemplazo de variables
  - Envío de email

---

## 7. COMPONENTES DE CLIENTE

### 7.1 Dashboard de Cliente
- [ ] **Navegación entre pestañas**
  - Servicios
  - Pagos
  - Renovaciones
  - Tickets
  - Hash navigation funciona

### 7.2 Renovaciones
- [ ] **Listar servicios renovables**
  - Servicios con ciclo (no One-Time)
  - Información de vencimiento

- [ ] **Solicitar renovación**
  - Selección de período
  - Cálculo de nuevo vencimiento
  - Creación de pago
  - Actualización de servicio

---

## 8. INTEGRACIONES EXTERNAS

### 8.1 Firebase
- [ ] **Configuración de Firebase**
  - Credenciales correctas
  - Conexión exitosa
  - Firestore accesible
  - Auth funcionando

- [ ] **Reglas de Firestore**
  - Lectura según rol
  - Escritura según rol
  - Seguridad de datos

- [ ] **Estructura de datos**
  - Colecciones correctas
  - Rutas de documentos
  - Tipos de datos

### 8.2 PHP (Email y Uploads)
- [ ] **send-email.php**
  - Endpoint accesible
  - CORS configurado
  - PHPMailer funcionando
  - Envío de emails reales
  - Manejo de errores

- [ ] **upload.php**
  - Endpoint accesible
  - CORS configurado
  - Validación de archivos
  - Guardado en uploads/payments/
  - Generación de URL pública
  - Manejo de errores

### 8.3 Generación de PDFs
- [ ] **jsPDF**
  - Generación de invoice
  - Formato correcto
  - Contenido completo
  - Descarga exitosa

---

## 9. CASOS DE USO COMPLETOS

### 9.1 Flujo de Cliente Nuevo
1. Registro de cliente
2. Activación por admin
3. Login y cambio de contraseña
4. Completar perfil
5. Ver servicios asignados
6. Solicitar pago
7. Subir comprobante
8. Ver pago aprobado
9. Descargar invoice

### 9.2 Flujo de Pago Completo
1. Admin crea servicio
2. Cliente ve servicio
3. Cliente solicita pago
4. Cliente sube comprobante
5. Admin ve pago pendiente
6. Admin aprueba pago
7. Email de aprobación enviado
8. Servicio actualizado
9. Invoice generado

### 9.3 Flujo de Ticket
1. Cliente crea ticket
2. Admin ve ticket nuevo
3. Admin asigna ticket
4. Admin responde
5. Cliente ve respuesta
6. Cliente responde
7. Admin cierra ticket
8. Cliente ve ticket cerrado

### 9.4 Flujo de Renovación
1. Servicio próximo a vencer
2. Recordatorio automático
3. Cliente solicita renovación
4. Pago creado automáticamente
5. Cliente paga
6. Admin aprueba
7. Servicio renovado

---

## 10. PRUEBAS DE RENDIMIENTO

- [ ] **Carga inicial**
  - Tiempo de carga < 3 segundos
  - Datos cargados correctamente

- [ ] **Navegación**
  - Transiciones suaves
  - Sin errores en consola

- [ ] **Operaciones**
  - Crear/editar/eliminar < 2 segundos
  - Actualizaciones en tiempo real

---

## 11. PRUEBAS DE SEGURIDAD

- [ ] **Autenticación**
  - Usuarios no autenticados no pueden acceder
  - Roles respetados
  - Permisos correctos

- [ ] **Datos**
  - Clientes solo ven sus datos
  - Admins ven todos los datos
  - Validación de inputs

- [ ] **Firebase Rules**
  - Reglas implementadas
  - Pruebas de acceso no autorizado

---

## 12. PRUEBAS DE USABILIDAD

- [ ] **Responsive Design**
  - Mobile (< 640px)
  - Tablet (640px - 1024px)
  - Desktop (> 1024px)

- [ ] **Accesibilidad**
  - Navegación por teclado
  - Contraste de colores
  - Textos legibles

- [ ] **Mensajes de error**
  - Claros y útiles
  - En español
  - Acciones sugeridas

---

## RESULTADOS DE PRUEBAS

### ✅ Funcionalidades que Funcionan Correctamente
(Se llenará durante las pruebas)

### ⚠️ Funcionalidades con Problemas Menores
(Se llenará durante las pruebas)

### ❌ Funcionalidades con Errores Críticos
(Se llenará durante las pruebas)

### 📝 Notas y Observaciones
(Se llenará durante las pruebas)

---

**Próximos Pasos:**
1. Ejecutar todas las pruebas sistemáticamente
2. Documentar resultados
3. Priorizar correcciones
4. Implementar mejoras

