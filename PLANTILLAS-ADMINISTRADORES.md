# 👨‍💼 Plantillas Sugeridas para Administradores

## ✅ **Plantillas Implementadas**

### **🔔 Alerta: Próximo Vencimiento**
**Propósito:** Notificar a administradores sobre servicios próximos a vencer

**Asunto:** `ALERTA: Servicio próximo a vencer - {clientName}`

**Contenido:**
```
Estimado/a Administrador,

Se ha generado una alerta automática para el siguiente servicio:

📋 INFORMACIÓN DEL SERVICIO:
- Cliente: {clientName} ({clientEmail})
- Servicio: {description}
- Tipo: {serviceType}
- Monto: {amount} {currency}
- Fecha de vencimiento: {dueDate}
- Ciclo de facturación: {billingCycle}
- Días restantes: {daysRemaining}

📊 ESTADO ACTUAL:
- Estado: Próximo a vencer
- Notificación enviada al cliente: ✅
- Plantilla utilizada: Aviso de Próximo Vencimiento

🔔 ACCIONES RECOMENDADAS:
1. Verificar que el cliente haya recibido la notificación
2. Contactar al cliente si es necesario
3. Preparar seguimiento post-vencimiento

📈 ESTADÍSTICAS:
- Total de servicios próximos a vencer: {totalPending}
- Ingresos potenciales: {potentialRevenue}

Este es un mensaje automático del sistema de gestión de cobros.

Sistema de Gestión - {companyName}
```

### **⚠️ Alerta: Período de Gracia**
**Propósito:** Alerta urgente para servicios en período de gracia

**Asunto:** `URGENTE: Servicio en período de gracia - {clientName}`

**Contenido:**
```
Estimado/a Administrador,

⚠️ ALERTA URGENTE - Servicio en período de gracia:

📋 INFORMACIÓN DEL SERVICIO:
- Cliente: {clientName} ({clientEmail})
- Servicio: {description}
- Tipo: {serviceType}
- Monto pendiente: {amount} {currency}
- Fecha de vencimiento original: {dueDate}
- Días en período de gracia: {graceDays}
- Días restantes de gracia: {remainingGraceDays}

📊 ESTADO ACTUAL:
- Estado: Período de Gracia Vencido
- Notificación enviada al cliente: ✅
- Plantilla utilizada: Notificación de Servicio Vencido
- Riesgo de suspensión: ALTO

🚨 ACCIONES INMEDIATAS:
1. Contactar al cliente por teléfono
2. Enviar recordatorio personalizado
3. Evaluar opciones de pago flexibles
4. Preparar suspensión si no hay respuesta

📈 IMPACTO:
- Ingresos en riesgo: {amount} {currency}
- Tiempo de mora: {daysOverdue} días
- Historial de pagos: {paymentHistory}

⏰ PRÓXIMOS PASOS:
- Si no se paga en {remainingGraceDays} días: Suspender servicio
- Seguimiento diario hasta resolución
- Documentar todas las comunicaciones

Este es un mensaje automático del sistema de gestión de cobros.

Sistema de Gestión - {companyName}
```

### **🔴 Alerta: Servicio Vencido**
**Propósito:** Notificación inmediata de servicios vencidos

**Asunto:** `INMEDIATO: Servicio vencido - {clientName}`

**Contenido:**
```
Estimado/a Administrador,

🔴 ALERTA INMEDIATA - Servicio vencido:

📋 INFORMACIÓN DEL SERVICIO:
- Cliente: {clientName} ({clientEmail})
- Servicio: {description}
- Tipo: {serviceType}
- Monto vencido: {amount} {currency}
- Fecha de vencimiento: {dueDate}
- Días de atraso: {daysOverdue}
- Ciclo de facturación: {billingCycle}

📊 ESTADO ACTUAL:
- Estado: Vencido
- Notificación enviada al cliente: ✅
- Plantilla utilizada: Notificación de Servicio Vencido
- Próximo paso: Período de gracia

🎯 ACCIONES REQUERIDAS:
1. Verificar recepción de notificación por cliente
2. Iniciar período de gracia ({gracePeriod} días)
3. Contacto directo con el cliente
4. Evaluar historial de pagos del cliente
5. Preparar estrategia de cobro

📈 ANÁLISIS:
- Cliente desde: {clientSince}
- Pagos anteriores: {previousPayments}
- Patrón de pago: {paymentPattern}
- Riesgo de pérdida: {riskLevel}

📞 CONTACTOS:
- Teléfono: {clientPhone}
- Email: {clientEmail}
- Última comunicación: {lastContact}

Este es un mensaje automático del sistema de gestión de cobros.

Sistema de Gestión - {companyName}
```

### **❌ Alerta: Servicio Suspendido**
**Propósito:** Notificación de servicios cancelados por falta de pago

**Asunto:** `SUSPENDIDO: Servicio cancelado por falta de pago - {clientName}`

**Contenido:**
```
Estimado/a Administrador,

❌ SERVICIO SUSPENDIDO - Acción requerida:

📋 INFORMACIÓN DEL SERVICIO:
- Cliente: {clientName} ({clientEmail})
- Servicio: {description}
- Tipo: {serviceType}
- Monto pendiente: {amount} {currency}
- Fecha de vencimiento: {dueDate}
- Días de atraso: {daysOverdue}
- Período de gracia agotado: {gracePeriod} días

📊 ESTADO ACTUAL:
- Estado: Cancelado
- Motivo: Falta de pago
- Notificación enviada al cliente: ✅
- Plantilla utilizada: Aviso de Suspensión de Servicio
- Fecha de suspensión: {suspensionDate}

🔧 ACCIONES INMEDIATAS:
1. Suspender acceso del cliente al servicio
2. Documentar suspensión en el sistema
3. Enviar notificación de suspensión
4. Iniciar proceso de recuperación de cobros
5. Evaluar reactivación futura

📈 ANÁLISIS FINANCIERO:
- Pérdida de ingresos: {amount} {currency}
- Costo de reactivación: {reactivationCost}
- Valor del cliente: {clientValue}
- Probabilidad de recuperación: {recoveryProbability}%

📞 SEGUIMIENTO:
- Contactar para negociación de pago
- Ofrecer planes de pago flexibles
- Documentar todas las comunicaciones
- Evaluar cancelación definitiva

📋 DOCUMENTACIÓN:
- Historial de pagos: {paymentHistory}
- Comunicaciones previas: {communicationHistory}
- Términos del servicio: {serviceTerms}
- Política de suspensión: {suspensionPolicy}

Este es un mensaje automático del sistema de gestión de cobros.

Sistema de Gestión - {companyName}
```

### **✅ Notificación: Pago Recibido**
**Propósito:** Confirmación interna de pagos procesados

**Asunto:** `CONFIRMADO: Pago recibido - {clientName}`

**Contenido:**
```
Estimado/a Administrador,

✅ PAGO CONFIRMADO - Servicio reactivado:

📋 INFORMACIÓN DEL PAGO:
- Cliente: {clientName} ({clientEmail})
- Servicio: {description}
- Monto recibido: {amount} {currency}
- Fecha de pago: {paymentDate}
- Método de pago: {paymentMethod}
- Referencia: {paymentReference}

📊 ESTADO ACTUAL:
- Estado: Activo
- Servicio reactivado: ✅
- Notificación enviada al cliente: ✅
- Plantilla utilizada: Confirmación de Pago Recibido
- Próximo vencimiento: {nextDueDate}

🎯 ACCIONES COMPLETADAS:
1. Pago procesado y verificado
2. Servicio reactivado automáticamente
3. Cliente notificado del pago
4. Próxima fecha de vencimiento actualizada
5. Historial de pagos actualizado

📈 IMPACTO POSITIVO:
- Ingresos recuperados: {amount} {currency}
- Cliente retenido: ✅
- Servicio activo: ✅
- Próximo ciclo iniciado

📊 ESTADÍSTICAS:
- Tiempo de pago: {paymentTime} días
- Eficiencia de cobro: {collectionEfficiency}%
- Satisfacción del cliente: {clientSatisfaction}
- Ingresos mensuales: {monthlyRevenue}

📋 SEGUIMIENTO:
- Monitorear estabilidad del servicio
- Preparar próximo recordatorio
- Actualizar perfil del cliente
- Documentar éxito de cobro

Este es un mensaje automático del sistema de gestión de cobros.

Sistema de Gestión - {companyName}
```

### **🎉 Notificación: Nuevo Cliente**
**Propósito:** Alerta de nuevos clientes registrados

**Asunto:** `NUEVO CLIENTE: {clientName} - Servicio {description}`

**Contenido:**
```
Estimado/a Administrador,

🎉 NUEVO CLIENTE REGISTRADO:

📋 INFORMACIÓN DEL CLIENTE:
- Nombre: {clientName}
- Email: {clientEmail}
- Identificación: {clientId}
- Teléfono: {clientPhone}
- Fecha de registro: {registrationDate}

📋 INFORMACIÓN DEL SERVICIO:
- Descripción: {description}
- Tipo: {serviceType}
- Monto: {amount} {currency}
- Ciclo de facturación: {billingCycle}
- Fecha de vencimiento: {dueDate}
- Estado: Activo

📊 CONFIGURACIÓN:
- Servicio activado: ✅
- Notificación de bienvenida enviada: ✅
- Plantilla utilizada: Bienvenida a Nuevo Cliente
- Portal de cliente habilitado: ✅
- Método de pago configurado: {paymentMethod}

🎯 ACCIONES INICIALES:
1. Verificar activación del servicio
2. Confirmar recepción de bienvenida
3. Programar seguimiento inicial
4. Configurar recordatorios automáticos
5. Documentar preferencias del cliente

📈 ANÁLISIS:
- Valor del cliente: {clientValue}
- Potencial de crecimiento: {growthPotential}
- Segmento: {clientSegment}
- Fuente de adquisición: {acquisitionSource}

📋 PRÓXIMOS PASOS:
- Seguimiento en 7 días
- Verificar satisfacción inicial
- Preparar próximo recordatorio
- Monitorear uso del servicio

Este es un mensaje automático del sistema de gestión de cobros.

Sistema de Gestión - {companyName}
```

## 🔧 **Variables Específicas para Administradores**

### **Información del Cliente:**
- `{clientName}` - Nombre completo del cliente
- `{clientEmail}` - Email del cliente
- `{clientPhone}` - Teléfono del cliente
- `{clientId}` - Identificación del cliente

### **Información del Servicio:**
- `{serviceType}` - Tipo de servicio
- `{description}` - Descripción del servicio
- `{amount}` - Monto del servicio
- `{currency}` - Moneda
- `{dueDate}` - Fecha de vencimiento
- `{billingCycle}` - Ciclo de facturación
- `{companyName}` - Nombre de la empresa

### **Fechas y Tiempos:**
- `{daysRemaining}` - Días restantes hasta vencimiento
- `{daysOverdue}` - Días de atraso
- `{graceDays}` - Días de período de gracia
- `{remainingGraceDays}` - Días restantes de gracia

### **Estadísticas:**
- `{totalPending}` - Total de servicios pendientes
- `{potentialRevenue}` - Ingresos potenciales
- `{paymentHistory}` - Historial de pagos
- `{clientSince}` - Cliente desde (fecha)

### **Análisis de Riesgo:**
- `{previousPayments}` - Pagos anteriores
- `{paymentPattern}` - Patrón de pago
- `{riskLevel}` - Nivel de riesgo
- `{lastContact}` - Última comunicación

### **Información de Pago:**
- `{paymentDate}` - Fecha de pago
- `{paymentMethod}` - Método de pago
- `{paymentReference}` - Referencia de pago
- `{nextDueDate}` - Próxima fecha de vencimiento

### **Métricas de Rendimiento:**
- `{paymentTime}` - Tiempo de pago
- `{collectionEfficiency}` - Eficiencia de cobro
- `{clientSatisfaction}` - Satisfacción del cliente
- `{monthlyRevenue}` - Ingresos mensuales

### **Información de Registro:**
- `{registrationDate}` - Fecha de registro
- `{growthPotential}` - Potencial de crecimiento
- `{clientSegment}` - Segmento del cliente
- `{acquisitionSource}` - Fuente de adquisición

### **Configuración:**
- `{gracePeriod}` - Período de gracia
- `{communicationHistory}` - Historial de comunicaciones
- `{serviceTerms}` - Términos del servicio
- `{suspensionPolicy}` - Política de suspensión

## 🎯 **Características de las Plantillas**

### **Formato Profesional:**
- **Estructura clara** con secciones organizadas
- **Emojis descriptivos** para fácil identificación
- **Información detallada** y específica
- **Acciones recomendadas** claras

### **Información Completa:**
- **Datos del cliente** y servicio
- **Estado actual** del proceso
- **Acciones requeridas** específicas
- **Análisis y métricas** relevantes

### **Variables Dinámicas:**
- **40+ variables** específicas para administradores
- **Información contextual** según la situación
- **Métricas de rendimiento** y análisis
- **Datos históricos** del cliente

## ✅ **Beneficios para Administradores**

### **Visibilidad Completa:**
- **Información detallada** de cada situación
- **Contexto completo** del cliente y servicio
- **Acciones específicas** a realizar
- **Métricas relevantes** para toma de decisiones

### **Eficiencia Operativa:**
- **Alertas automáticas** sin intervención manual
- **Información centralizada** en un solo mensaje
- **Acciones claras** para cada situación
- **Seguimiento estructurado** del proceso

### **Gestión Profesional:**
- **Comunicación interna** estructurada
- **Documentación automática** de procesos
- **Análisis de riesgo** integrado
- **Métricas de rendimiento** continuas

¡Las plantillas para administradores están completamente implementadas y listas para automatizar la gestión interna de cobros! 🚀





