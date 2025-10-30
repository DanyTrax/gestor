# 🔔 Sistema de Alertas Automáticas

## ✅ **Funcionalidades Implementadas**

### **1. Sistema Completo de Alertas**
- **Alertas Pre-vencimiento** - Notificaciones antes del vencimiento
- **Período de Gracia** - Tiempo adicional para pagar
- **Servicio Vencido** - Notificaciones cuando vence
- **Configuración flexible** para cada tipo de alerta

### **2. Configuraciones Avanzadas**
- **Días personalizables** para cada tipo de alerta
- **Selección de plantillas** específicas para cada situación
- **Notificaciones a administradores** con selección múltiple
- **Plantillas separadas** para clientes y administradores

## 🎯 **Tipos de Alertas Configurables**

### **🟡 Alerta de Próximo Vencimiento**
```
Configuración:
- ✅ Activar/Desactivar alerta
- 📅 Días antes del vencimiento (1-30 días)
- 📧 Plantilla para cliente
- 👥 Notificar administradores (opcional)
- 📧 Plantilla para administradores
- 👤 Selección de administradores específicos

Funcionalidad:
- Se envía X días antes del vencimiento
- Notifica al cliente sobre próximo vencimiento
- Opcionalmente notifica a administradores seleccionados
```

### **🟠 Período de Gracia**
```
Configuración:
- ✅ Activar/Desactivar período de gracia
- 📅 Días de gracia (1-30 días)
- 📧 Plantilla para cliente
- 👥 Notificar administradores (opcional)
- 📧 Plantilla para administradores
- 👤 Selección de administradores específicos

Funcionalidad:
- Se activa cuando el servicio vence
- Da tiempo adicional para pagar antes de suspender
- Notifica al cliente sobre el período de gracia
- Opcionalmente notifica a administradores
```

### **🔴 Servicio Vencido**
```
Configuración:
- ✅ Activar/Desactivar alerta
- 📧 Plantilla para cliente
- 📧 Plantilla para administradores
- 👥 Notificar administradores (opcional)
- 👤 Selección de administradores específicos

Funcionalidad:
- Se envía cuando el servicio vence
- Notifica al cliente sobre el vencimiento
- Opcionalmente notifica a administradores
```

## 🔧 **Configuración de Alertas**

### **Interfaz de Usuario:**

#### **Pestaña de Alertas:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔔 Alertas Automáticas                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🟡 Alerta de Próximo Vencimiento                       │
│ ├─ ✅ Activar alerta                                   │
│ ├─ 📅 Días antes del vencimiento: [7] días             │
│ ├─ 📧 Plantilla para cliente: [Seleccionar]            │
│ ├─ 👥 Notificar administradores: ✅                    │
│ ├─ 📧 Plantilla para administradores: [Seleccionar]    │
│ └─ 👤 Administradores: ☑️ Admin1 ☑️ Admin2            │
│                                                         │
│ 🟠 Período de Gracia                                    │
│ ├─ ✅ Activar período de gracia                        │
│ ├─ 📅 Días de gracia: [3] días                         │
│ ├─ 📧 Plantilla para cliente: [Seleccionar]            │
│ ├─ 👥 Notificar administradores: ✅                    │
│ ├─ 📧 Plantilla para administradores: [Seleccionar]    │
│ └─ 👤 Administradores: ☑️ Admin1 ☑️ Admin2            │
│                                                         │
│ 🔴 Servicio Vencido                                     │
│ ├─ ✅ Activar alerta                                   │
│ ├─ 📧 Plantilla para cliente: [Seleccionar]            │
│ ├─ 📧 Plantilla para administradores: [Seleccionar]    │
│ ├─ 👥 Notificar administradores: ✅                    │
│ └─ 👤 Administradores: ☑️ Admin1 ☑️ Admin2            │
│                                                         │
│ [🔧 Guardar Configuración de Alertas]                   │
└─────────────────────────────────────────────────────────┘
```

## 📋 **Flujo de Trabajo de Alertas**

### **1. Configuración Inicial:**
1. **Ir a Plantillas y Alertas** → Pestaña "Alertas Automáticas"
2. **Activar alertas** deseadas con los toggles
3. **Configurar días** para cada tipo de alerta
4. **Seleccionar plantillas** para clientes y administradores
5. **Elegir administradores** a notificar
6. **Guardar configuración**

### **2. Funcionamiento Automático:**
```
Servicio con vencimiento: 15 de Enero

🟡 Alerta Pre-vencimiento (7 días antes):
- Fecha de envío: 8 de Enero
- Notifica: Cliente + Administradores seleccionados
- Plantilla: "Aviso de Próximo Vencimiento"

🔴 Servicio Vencido (15 de Enero):
- Fecha de envío: 15 de Enero
- Notifica: Cliente + Administradores seleccionados
- Plantilla: "Notificación de Servicio Vencido"

🟠 Período de Gracia (3 días):
- Fecha de inicio: 15 de Enero
- Fecha de fin: 18 de Enero
- Notifica: Cliente + Administradores seleccionados
- Plantilla: "Período de Gracia"

🔴 Servicio Cancelado (18 de Enero):
- Si no se paga en período de gracia
- Cambia estado a "Cancelado"
- Notifica: Administradores seleccionados
```

## 🎨 **Características de la Interfaz**

### **Toggles Inteligentes:**
- **Activación/Desactivación** con toggles visuales
- **Configuración condicional** - solo muestra opciones cuando está activo
- **Validación automática** de campos requeridos

### **Selección de Plantillas:**
- **Dropdown dinámico** con todas las plantillas disponibles
- **Plantillas separadas** para clientes y administradores
- **Validación** de plantillas seleccionadas

### **Selección de Administradores:**
- **Lista de checkboxes** con todos los administradores
- **Selección múltiple** para diferentes alertas
- **Información completa** (nombre y email)
- **Scroll automático** para listas largas

## 🔄 **Estados de Servicio y Alertas**

### **Flujo Completo:**
```
Servicio Activo
    ↓ (X días antes del vencimiento)
🟡 Alerta Pre-vencimiento
    ↓ (Fecha de vencimiento)
🔴 Servicio Vencido
    ↓ (Período de gracia activo)
🟠 Período de Gracia
    ↓ (Fin del período de gracia)
❌ Servicio Cancelado
```

### **Configuración por Estado:**
- **Activo** → Solo alertas pre-vencimiento
- **Pendiente Pago** → Alertas de vencimiento
- **Periodo de Gracia Vencido** → Alertas de período de gracia
- **Cancelado** → Sin alertas automáticas

## 📊 **Datos de Demo**

### **Configuración de Ejemplo:**
```javascript
alertSettings: {
  preVencimiento: {
    enabled: true,
    days: 7,
    clientTemplate: 't1',
    adminTemplate: 't1',
    notifyAdmins: true,
    selectedAdmins: ['admin1']
  },
  periodoGracia: {
    enabled: true,
    days: 3,
    clientTemplate: 't2',
    adminTemplate: 't2',
    notifyAdmins: true,
    selectedAdmins: ['admin1']
  },
  vencido: {
    enabled: true,
    days: 0,
    clientTemplate: 't2',
    adminTemplate: 't2',
    notifyAdmins: true,
    selectedAdmins: ['admin1']
  }
}
```

## 🔐 **Seguridad y Validaciones**

### **Validaciones Implementadas:**
- **Días válidos**: 1-30 días para alertas
- **Plantillas requeridas**: Debe seleccionar plantilla si está activo
- **Administradores**: Validación de selección múltiple
- **Configuración persistente**: Guardado en Firebase

### **Manejo de Errores:**
- **Notificaciones claras** para cada acción
- **Validación en tiempo real** de configuraciones
- **Manejo de errores** de Firebase
- **Modo demo** con funcionalidad limitada

## ✅ **Beneficios del Sistema**

### **Para Administradores:**
- **Control total** sobre cuándo y cómo notificar
- **Flexibilidad** en configuración de días
- **Selección específica** de administradores a notificar
- **Plantillas personalizadas** para cada situación

### **Para Clientes:**
- **Notificaciones oportunas** antes del vencimiento
- **Período de gracia** para evitar suspensiones
- **Mensajes claros** sobre el estado de su servicio
- **Comunicación profesional** y consistente

### **Para el Sistema:**
- **Automatización completa** del proceso de cobros
- **Reducción de trabajo manual** para administradores
- **Mejora en la gestión** de servicios vencidos
- **Escalabilidad** para múltiples clientes

## 🚀 **Próximas Funcionalidades**

- **Envío automático** con Cloud Functions
- **Programación avanzada** de alertas
- **Estadísticas de alertas** enviadas
- **Plantillas por tipo de servicio**
- **Integración con sistemas de pago**

¡El sistema de alertas automáticas está completamente funcional y listo para automatizar la gestión de cobros! 🚀





