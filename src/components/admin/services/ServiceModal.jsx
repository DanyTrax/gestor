import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { Timestamp } from 'firebase/firestore';

function ServiceModal({ isOpen, onClose, onSave, service, clients }) {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({});
  const [selectedClientId, setSelectedClientId] = useState('');
  const [serviceNumber, setServiceNumber] = useState('');
  const [customBillingCycle, setCustomBillingCycle] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customServiceType, setCustomServiceType] = useState('');
  const [showCustomServiceTypeInput, setShowCustomServiceTypeInput] = useState(false);
  
  const serviceStatusOptions = ['Activo', 'Periodo de Gracia Vencido', 'Pendiente Pago', 'Pago', 'Cancelado'];
  
  // Generar número de servicio único
  const generateServiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getTime().toString().slice(-6);
    return `SRV-${year}${month}${day}-${time}`;
  };

  // Calcular fechas de inicio y fin del ciclo
  const calculateCycleDates = (billingCycle, startDate) => {
    if (!billingCycle || billingCycle === 'One-Time' || !startDate) {
      return { startDate: '', endDate: '' };
    }

    const start = new Date(startDate);
    let end = new Date(start);

    switch (billingCycle) {
      case 'Monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'Semiannually':
        end.setMonth(end.getMonth() + 6);
        break;
      case 'Annually':
        end.setFullYear(end.getFullYear() + 1);
        break;
      case 'Biennially':
        end.setFullYear(end.getFullYear() + 2);
        break;
      case 'Triennially':
        end.setFullYear(end.getFullYear() + 3);
        break;
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
        } else {
          return { startDate: '', endDate: '' };
        }
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  // Obtener opciones de ciclo de facturación
  const getBillingCycleOptions = () => [
    { value: 'One-Time', label: 'Pago único' },
    { value: 'Monthly', label: 'Mensual' },
    { value: 'Semiannually', label: 'Semestral' },
    { value: 'Annually', label: 'Anual' },
    { value: 'Biennially', label: 'Bianual (2 años)' },
    { value: 'Triennially', label: 'Trienal (3 años)' },
    { value: 'Custom', label: 'Otros' }
  ];
  
  useEffect(() => {
    const initialFormState = {
      clientName: '', clientEmail: '', serviceType: 'Hosting', description: '',
      amount: '', currency: 'USD', dueDate: '', billingCycle: 'One-Time',
      status: 'Activo', clientNotes: '', adminNotes: '', assignedUserId: ''
    };

    if (service) {
      setFormData({
        ...service,
        dueDate: service.dueDate ? new Date(service.dueDate.seconds * 1000).toISOString().split('T')[0] : '',
        assignedUserId: service.assignedUserId || ''
      });
      setServiceNumber(service.serviceNumber || '');
      
      // Manejar tipo de servicio personalizado
      const predefinedTypes = ['Hosting', 'Dominio', 'Dominio + Hosting'];
      if (service.serviceType && !predefinedTypes.includes(service.serviceType)) {
        setCustomServiceType(service.serviceType);
        setShowCustomServiceTypeInput(true);
      } else {
        setCustomServiceType('');
        setShowCustomServiceTypeInput(false);
      }
      
      // Manejar ciclo de facturación personalizado
      const predefinedCycles = ['One-Time', 'Monthly', 'Semiannually', 'Annually', 'Biennially', 'Triennially'];
      if (service.billingCycle && !predefinedCycles.includes(service.billingCycle)) {
        setCustomBillingCycle(service.billingCycle);
        setShowCustomInput(true);
      } else {
        setCustomBillingCycle('');
        setShowCustomInput(false);
      }
      
      // Si hay un usuario asignado, seleccionarlo
      if (service.assignedUserId) {
        const assignedClient = clients.find(c => c.id === service.assignedUserId);
        if (assignedClient) {
          setSelectedClientId(assignedClient.email);
        }
      }
    } else {
      const newServiceNumber = generateServiceNumber();
      setFormData(initialFormState);
      setSelectedClientId('');
      setServiceNumber(newServiceNumber);
      setCustomServiceType('');
      setShowCustomServiceTypeInput(false);
      setCustomBillingCycle('');
      setShowCustomInput(false);
    }
  }, [service, clients]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si cambia el ciclo de facturación, manejar lógica especial
    if (name === 'billingCycle') {
      if (value === 'Custom') {
        setShowCustomInput(true);
      } else {
        setShowCustomInput(false);
        setCustomBillingCycle('');
      }
    }
    
    // Si cambia el tipo de servicio, manejar lógica especial
    if (name === 'serviceType') {
      if (value === 'Otro') {
        setShowCustomServiceTypeInput(true);
      } else {
        setShowCustomServiceTypeInput(false);
        setCustomServiceType('');
      }
    }
  };

  const handleCustomBillingCycleChange = (e) => {
    const value = e.target.value;
    setCustomBillingCycle(value);
    
    // Actualizar el formData con el valor personalizado
    setFormData(prev => ({ ...prev, billingCycle: value || 'Custom' }));
  };

  const handleCustomServiceTypeChange = (e) => {
    const value = e.target.value;
    setCustomServiceType(value);
    
    // Actualizar el formData con el valor personalizado
    setFormData(prev => ({ ...prev, serviceType: value || 'Otro' }));
  };
  
  const handleClientSelect = (email) => {
    setSelectedClientId(email);
    const selectedClient = clients.find(c => c.email === email);
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        clientEmail: selectedClient.email,
        clientName: selectedClient.fullName || selectedClient.email.split('@')[0],
        assignedUserId: selectedClient.id
      }));
    } else {
      // Si no se selecciona cliente, limpiar campos
      setFormData(prev => ({
        ...prev,
        assignedUserId: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        amount: parseFloat(formData.amount),
        dueDate: Timestamp.fromDate(new Date(formData.dueDate)),
        serviceNumber: serviceNumber
      };
      await onSave(dataToSave);
      addNotification(`Servicio ${service ? 'actualizado' : 'creado'} exitosamente.`, 'success');
      onClose();
    } catch (error) {
      addNotification("Error al guardar el servicio.", "error");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{service ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Servicio</label>
            <input 
              type="text" 
              value={serviceNumber} 
              onChange={(e) => setServiceNumber(e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-50 font-mono"
              placeholder="SRV-YYMMDD-XXXXXX"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Identificador único del servicio</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignar a Cliente Existente</label>
            <select 
              value={selectedClientId} 
              onChange={(e) => handleClientSelect(e.target.value)} 
              className="w-full p-2 border rounded-md bg-gray-50"
            >
              <option value="">-- Opcional --</option>
              {clients.map(client => (
                <option key={client.id} value={client.email}>
                  {client.fullName || client.email}
                </option>
              ))}
            </select>
            {selectedClientId && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Servicio asignado a: {clients.find(c => c.email === selectedClientId)?.fullName || selectedClientId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="clientName" value={formData.clientName || ''} onChange={handleChange} placeholder="Nombre del Cliente" className="w-full p-2 border rounded-md" required />
            <input name="clientEmail" type="email" value={formData.clientEmail || ''} onChange={handleChange} placeholder="Email del Cliente" className="w-full p-2 border rounded-md" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Servicio</label>
              <select name="serviceType" value={formData.serviceType || 'Hosting'} onChange={handleChange} className="w-full p-2 border rounded-md">
                <option>Hosting</option>
                <option>Dominio</option>
                <option>Dominio + Hosting</option>
                <option>Otro</option>
              </select>
              {showCustomServiceTypeInput && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Especificar tipo de servicio personalizado
                  </label>
                  <input
                    type="text"
                    value={customServiceType}
                    onChange={handleCustomServiceTypeChange}
                    placeholder="Ej: VPS, Cloud Storage, SSL, etc."
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Escribe el tipo de servicio específico que ofreces
                  </p>
                </div>
              )}
            </div>
            <input name="description" value={formData.description || ''} onChange={handleChange} placeholder="Descripción (ej: plan, dominio.com)" className="w-full p-2 border rounded-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <input name="amount" type="number" step="0.01" value={formData.amount || ''} onChange={handleChange} placeholder="Monto" className="w-full p-2 border rounded-md" required />
             <select name="currency" value={formData.currency || 'USD'} onChange={handleChange} className="w-full p-2 border rounded-md">
              <option>USD</option><option>COP</option>
            </select>
            <input name="dueDate" type="date" value={formData.dueDate || ''} onChange={handleChange} className="w-full p-2 border rounded-md" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo de Facturación</label>
              <select name="billingCycle" value={formData.billingCycle || 'One-Time'} onChange={handleChange} className="w-full p-2 border rounded-md">
                {getBillingCycleOptions().map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {showCustomInput && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Especificar ciclo personalizado
                  </label>
                  <input
                    type="text"
                    value={customBillingCycle}
                    onChange={handleCustomBillingCycleChange}
                    placeholder="Ej: 6 meses, 18 meses, 2 años, etc."
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes escribir el período en meses o años (ej: "6 meses", "2 años")
                  </p>
                </div>
              )}
            </div>
            <select name="status" value={formData.status || 'Activo'} onChange={handleChange} className="w-full p-2 border rounded-md">
              {serviceStatusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Mostrar fechas del ciclo si no es pago único */}
          {formData.billingCycle && formData.billingCycle !== 'One-Time' && formData.dueDate && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Período del Servicio</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={calculateCycleDates(formData.billingCycle, formData.dueDate).startDate}
                    readOnly
                    className="w-full p-2 border border-blue-200 rounded-md bg-blue-50 text-blue-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={calculateCycleDates(formData.billingCycle, formData.dueDate).endDate}
                    readOnly
                    className="w-full p-2 border border-blue-200 rounded-md bg-blue-50 text-blue-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Información especial para pago único */}
          {formData.billingCycle === 'One-Time' && (
            <div className="bg-yellow-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Pago Único</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="activation-only"
                    name="oneTimeType"
                    value="activation-only"
                    className="text-yellow-600"
                  />
                  <label htmlFor="activation-only" className="text-sm text-yellow-700">
                    Solo fecha de activación (sin expiración)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="with-expiration"
                    name="oneTimeType"
                    value="with-expiration"
                    className="text-yellow-600"
                  />
                  <label htmlFor="with-expiration" className="text-sm text-yellow-700">
                    Con fecha de expiración
                  </label>
                </div>
                <div className="ml-6">
                  <label className="block text-xs font-medium text-yellow-700 mb-1">Hasta qué fecha expira</label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-yellow-200 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          <textarea name="clientNotes" value={formData.clientNotes || ''} onChange={handleChange} placeholder="Notas para el cliente (visible en su portal)" rows="3" className="w-full p-2 border rounded-md" />
          <textarea name="adminNotes" value={formData.adminNotes || ''} onChange={handleChange} placeholder="Notas internas (solo para administrador)" rows="3" className="w-full p-2 border rounded-md" />

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar Servicio</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ServiceModal;


