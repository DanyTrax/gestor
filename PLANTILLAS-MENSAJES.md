# 📧 Módulo de Plantillas de Mensajes

## ✅ **Funcionalidades Implementadas**

### **1. Gestión Completa de Plantillas**
- **Crear** nuevas plantillas personalizadas
- **Editar** plantillas existentes
- **Eliminar** plantillas no utilizadas
- **Listar** todas las plantillas guardadas

### **2. Plantillas Sugeridas Predefinidas**
- **Aviso de Próximo Vencimiento** - Recordatorio antes del vencimiento
- **Notificación de Servicio Vencido** - Período de gracia
- **Aviso de Suspensión de Servicio** - Servicio suspendido
- **Confirmación de Pago Recibido** - Pago confirmado
- **Bienvenida a Nuevo Cliente** - Mensaje de bienvenida

### **3. Editor Avanzado**
- **Editor de texto** con formato monospace
- **Variables dinámicas** para personalización
- **Validación** de campos obligatorios
- **Vista previa** de variables disponibles

## 🎯 **Plantillas Sugeridas Incluidas**

### **1. Aviso de Próximo Vencimiento**
```
Asunto: Recordatorio de Renovación de Servicio: {description}

Estimado/a {clientName},

Le escribimos para recordarle que su servicio '{description}' está programado para vencer el próximo {dueDate}.

El monto correspondiente a la renovación es de {amount} {currency}.

Para garantizar la continuidad de su servicio, le recomendamos realizar el pago antes de la fecha de vencimiento. Puede gestionarlo a través de nuestro portal de clientes.

Si tiene alguna consulta, no dude en contactarnos.

Atentamente,
{companyName}
```

### **2. Notificación de Servicio Vencido**
```
Asunto: Importante: Su servicio {description} ha vencido

Estimado/a {clientName},

Le informamos que la factura correspondiente a su servicio '{description}', con fecha de vencimiento {dueDate}, se encuentra pendiente de pago.

Su servicio ha entrado en un período de gracia. Para evitar la suspensión del mismo, le solicitamos regularizar su situación a la brevedad posible. El monto pendiente es de {amount} {currency}.

Si usted ya ha realizado el pago, por favor, omita esta notificación.

Cordialmente,
{companyName}
```

### **3. Aviso de Suspensión de Servicio**
```
Asunto: Acción Requerida: Suspensión del servicio {description}

Estimado/a {clientName},

Lamentamos informarle que, debido a la falta de pago, su servicio '{description}' ha sido suspendido.

Para proceder con la reactivación y recuperar el acceso, es necesario saldar el monto pendiente de {amount} {currency}. Por favor, contáctenos para coordinar el pago y la restauración del servicio.

Quedamos a su disposición.

Atentamente,
{companyName}
```

### **4. Confirmación de Pago Recibido**
```
Asunto: Confirmación: Pago recibido para {description}

Estimado/a {clientName},

Hemos recibido y procesado exitosamente su pago por {amount} {currency} correspondiente al servicio '{description}'.

Su servicio está activo y funcionando correctamente. La próxima fecha de vencimiento será {dueDate}.

Gracias por su confianza y por mantener sus pagos al día.

Atentamente,
{companyName}
```

### **5. Bienvenida a Nuevo Cliente**
```
Asunto: Bienvenido a {companyName} - Servicio {description}

Estimado/a {clientName},

¡Bienvenido a {companyName}!

Nos complace confirmar que su servicio '{description}' ha sido activado exitosamente.

Detalles del servicio:
- Descripción: {description}
- Monto: {amount} {currency}
- Próximo vencimiento: {dueDate}

Puede acceder a su portal de cliente en cualquier momento para gestionar su cuenta y realizar pagos.

Si tiene alguna pregunta, no dude en contactarnos.

¡Gracias por elegirnos!

Atentamente,
{companyName}
```

## 🔧 **Variables Disponibles**

### **Información del Cliente:**
- `{clientName}` - Nombre completo del cliente
- `{clientEmail}` - Email del cliente

### **Información del Servicio:**
- `{serviceType}` - Tipo de servicio (Hosting, Dominio, etc.)
- `{description}` - Descripción del servicio
- `{amount}` - Monto del servicio
- `{currency}` - Moneda (USD, COP, etc.)
- `{dueDate}` - Fecha de vencimiento
- `{billingCycle}` - Ciclo de facturación

### **Información de la Empresa:**
- `{companyName}` - Nombre de la empresa

## 🎨 **Interfaz de Usuario**

### **Panel Izquierdo - Gestión:**
```
┌─────────────────────────────────────┐
│ Plantillas Guardadas                │
├─────────────────────────────────────┤
│ 📝 Recordatorio General             │
│    Recordatorio de pago             │
│    [Editar] [Eliminar]              │
├─────────────────────────────────────┤
│ 📝 Servicio Vencido                 │
│    Servicio vencido: {description}  │
│    [Editar] [Eliminar]              │
├─────────────────────────────────────┤
│ [+] Nueva Plantilla                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Plantillas Sugeridas                │
├─────────────────────────────────────┤
│ 🔵 Aviso de Próximo Vencimiento     │
│ 🟡 Notificación de Servicio Vencido │
│ 🔴 Aviso de Suspensión de Servicio  │
│ 🟢 Confirmación de Pago Recibido    │
│ 🟣 Bienvenida a Nuevo Cliente       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Variables Disponibles               │
├─────────────────────────────────────┤
│ {clientName}, {serviceType},        │
│ {description}, {amount}, {currency},│
│ {dueDate}, {companyName}            │
└─────────────────────────────────────┘
```

### **Panel Derecho - Editor:**
```
┌─────────────────────────────────────┐
│ Nueva Plantilla / Editando Plantilla│
├─────────────────────────────────────┤
│ Nombre de la Plantilla              │
│ [Ej: Primer Recordatorio de Pago]   │
├─────────────────────────────────────┤
│ Asunto del Correo                   │
│ [Ej: Recordatorio: {description}]   │
├─────────────────────────────────────┤
│ Cuerpo del Mensaje                  │
│ ┌─────────────────────────────────┐ │
│ │ Estimado/a {clientName},        │ │
│ │                                 │ │
│ │ Le recordamos que su servicio   │ │
│ │ '{description}' vence el        │ │
│ │ {dueDate}.                      │ │
│ │                                 │ │
│ │ Monto: {amount} {currency}      │ │
│ │                                 │ │
│ │ Atentamente,                    │ │
│ │ {companyName}                   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Limpiar] [Crear Plantilla]         │
└─────────────────────────────────────┘
```

## 🔄 **Flujo de Trabajo**

### **Para Crear una Nueva Plantilla:**
1. **Hacer clic en "Nueva Plantilla"**
2. **Llenar nombre, asunto y cuerpo**
3. **Usar variables** para personalización
4. **Hacer clic en "Crear Plantilla"**
5. **Confirmar** creación exitosa

### **Para Editar una Plantilla Existente:**
1. **Hacer clic en el icono de editar** en la lista
2. **Modificar** los campos necesarios
3. **Hacer clic en "Guardar Cambios"**
4. **Confirmar** actualización exitosa

### **Para Usar una Plantilla Sugerida:**
1. **Hacer clic en una sugerencia** del panel izquierdo
2. **La plantilla se carga** en el editor
3. **Personalizar** según necesidades
4. **Guardar** como nueva plantilla

## 📊 **Datos de Demo**

### **Plantillas de Ejemplo:**
1. **Recordatorio General (Demo)**
   - Asunto: "Recordatorio de pago"
   - Cuerpo: "Hola {clientName}, recuerda pagar..."

2. **Servicio Vencido (Demo)**
   - Asunto: "Servicio vencido: {description}"
   - Cuerpo: "Estimado {clientName}, su servicio..."

## 🔐 **Seguridad y Validaciones**

### **Validaciones Implementadas:**
- **Campos obligatorios**: Nombre, asunto y cuerpo
- **Trim automático**: Elimina espacios en blanco
- **Validación de Firebase**: Manejo de errores de conexión

### **Funciones de Seguridad:**
- **Confirmación de eliminación**: Previene borrado accidental
- **Manejo de errores**: Notificaciones claras
- **Modo demo**: Funcionalidad limitada para pruebas

## ✅ **Beneficios**

- **📝 Plantillas profesionales**: Mensajes bien estructurados
- **🔄 Reutilización**: Plantillas para diferentes situaciones
- **⚡ Eficiencia**: Creación rápida de mensajes
- **🎯 Personalización**: Variables dinámicas
- **📱 Responsive**: Funciona en todos los dispositivos
- **🔧 Fácil gestión**: Interfaz intuitiva

## 🚀 **Próximas Funcionalidades**

- **Envío automático**: Integración con Cloud Functions
- **Programación**: Envío en fechas específicas
- **Estadísticas**: Seguimiento de apertura y clics
- **Plantillas por estado**: Asignación automática según estado del servicio

¡El módulo de plantillas está completamente funcional y listo para usar! 🚀





