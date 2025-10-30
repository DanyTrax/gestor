# Ciclos de Facturación Personalizados en Servicios

## 📋 Resumen de Funcionalidad

Se implementó la capacidad de crear ciclos de facturación personalizados al crear o editar servicios, permitiendo a los administradores especificar períodos que no están en las opciones predefinidas.

## ✅ Funcionalidades Implementadas

### 1. **Opción "Otros" en Ciclo de Facturación**
- **Ubicación**: Modal de creación/edición de servicios
- **Activación**: Al seleccionar "Otros" en el dropdown de ciclo de facturación
- **Comportamiento**: Muestra un input personalizado para especificar el ciclo

### 2. **Input Personalizado Inteligente**
- **Placeholder**: "Ej: 6 meses, 18 meses, 2 años, etc."
- **Validación**: Acepta formatos como "6 meses", "2 años", "18 meses"
- **Cálculo automático**: Intenta calcular fechas de vencimiento basándose en el texto

### 3. **Cálculo Inteligente de Fechas**
- **Reconocimiento de meses**: Detecta patrones como "6 meses", "18 meses"
- **Reconocimiento de años**: Detecta patrones como "2 años", "3 años"
- **Fallback**: Si no puede parsear, no calcula fecha de vencimiento automáticamente

## 🔧 Implementación Técnica

### Archivos Modificados
- `src/components/admin/services/ServiceModal.jsx`

### Estados Agregados
```javascript
const [customBillingCycle, setCustomBillingCycle] = useState('');
const [showCustomInput, setShowCustomInput] = useState(false);
```

### Función de Manejo
```javascript
const handleCustomBillingCycleChange = (e) => {
  const value = e.target.value;
  setCustomBillingCycle(value);
  
  // Actualizar el formData con el valor personalizado
  setFormData(prev => ({ ...prev, billingCycle: value || 'Custom' }));
};
```

### Cálculo de Fechas Mejorado
```javascript
case 'Custom':
  // Para ciclos personalizados, no calcular fecha de fin automáticamente
  return { 
    startDate: start.toISOString().split('T')[0], 
    endDate: '' 
  };
default:
  // Si es un ciclo personalizado (no está en los casos anteriores)
  if (billingCycle && billingCycle !== 'Custom' && billingCycle !== 'One-Time') {
    // Intentar extraer números del texto personalizado
    const monthsMatch = billingCycle.match(/(\d+)\s*mes/i);
    const yearsMatch = billingCycle.match(/(\d+)\s*año/i);
    
    if (monthsMatch) {
      const months = parseInt(monthsMatch[1]);
      end.setMonth(end.getMonth() + months);
    } else if (yearsMatch) {
      const years = parseInt(yearsMatch[1]);
      end.setFullYear(end.getFullYear() + years);
    } else {
      // Si no se puede parsear, no calcular fecha de fin
      return { 
        startDate: start.toISOString().split('T')[0], 
        endDate: '' 
      };
    }
  }
```

## 🎯 Casos de Uso

### Caso 1: Ciclo de 6 Meses
- **Selección**: "Otros" en el dropdown
- **Input**: "6 meses"
- **Resultado**: Calcula automáticamente la fecha de vencimiento 6 meses después

### Caso 2: Ciclo de 18 Meses
- **Selección**: "Otros" en el dropdown
- **Input**: "18 meses"
- **Resultado**: Calcula automáticamente la fecha de vencimiento 18 meses después

### Caso 3: Ciclo de 2 Años
- **Selección**: "Otros" en el dropdown
- **Input**: "2 años"
- **Resultado**: Calcula automáticamente la fecha de vencimiento 2 años después

### Caso 4: Ciclo Personalizado Complejo
- **Selección**: "Otros" en el dropdown
- **Input**: "Cada 4 meses con descuento"
- **Resultado**: No calcula fecha automáticamente, permite especificación manual

## 📱 Interfaz de Usuario

### Elementos Visuales
1. **Dropdown de Ciclo**: Incluye opción "Otros"
2. **Input Personalizado**: Aparece solo cuando se selecciona "Otros"
3. **Label Explicativo**: "Especificar ciclo personalizado"
4. **Placeholder Informativo**: "Ej: 6 meses, 18 meses, 2 años, etc."
5. **Texto de Ayuda**: Explica los formatos aceptados

### Estilos
- **Focus Ring**: `focus:ring-2 focus:ring-blue-500 focus:border-blue-500`
- **Texto de Ayuda**: `text-xs text-gray-500`
- **Label**: `text-xs font-medium text-gray-600`

## 🔄 Flujo de Usuario

1. **Administrador abre modal** de crear/editar servicio
2. **Selecciona "Otros"** en el dropdown de ciclo de facturación
3. **Aparece input personalizado** con placeholder y texto de ayuda
4. **Escribe el ciclo** (ej: "6 meses", "2 años")
5. **Sistema calcula automáticamente** la fecha de vencimiento si es posible
6. **Guarda el servicio** con el ciclo personalizado

## ⚡ Beneficios

- **Flexibilidad**: Permite cualquier período de facturación
- **Inteligencia**: Calcula fechas automáticamente cuando es posible
- **Simplicidad**: Interfaz clara y fácil de usar
- **Compatibilidad**: Funciona con el sistema de renovaciones existente
- **Extensibilidad**: Fácil de agregar más patrones de reconocimiento

## 🎯 Resultado Final

Los administradores ahora pueden crear servicios con ciclos de facturación completamente personalizados, desde períodos específicos como "6 meses" hasta descripciones más complejas, manteniendo la funcionalidad de cálculo automático de fechas cuando es posible.




