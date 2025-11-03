import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { PlusIcon, SearchIcon } from '../../icons';
import ActionDropdown from '../../common/ActionDropdown';
import ServiceModal from './ServiceModal';
import ManualReminderModal from './ManualReminderModal';

function AdminServicesDashboard({ isDemo, userRole }) {
  const { addNotification } = useNotification();
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [companySettings, setCompanySettings] = useState({});

  const serviceStatusOptions = ['Activo', 'Periodo de Gracia Vencido', 'Pendiente Pago', 'Pago', 'Cancelado'];
  
  useEffect(() => {
    if(isDemo) {
      const demoDueDate = Timestamp.fromDate(new Date());
      setServices([
        {id: 's1', clientName: 'Juan Perez (Demo)', clientEmail: 'juan@demo.com', serviceType: 'Hosting', description: 'Plan Pro', amount: 25.00, currency: 'USD', dueDate: demoDueDate, billingCycle: 'Monthly', status: 'Pendiente Pago', clientNotes: 'A la espera del pago.', adminNotes: 'Contactado por teléfono.'},
        {id: 's2', clientName: 'Maria Garcia (Demo)', clientEmail: 'maria@demo.com', serviceType: 'Dominio', description: 'nuevositio.co', amount: 50000, currency: 'COP', dueDate: demoDueDate, billingCycle: 'Annually', status: 'Pago', clientNotes: '', adminNotes: ''},
        {id: 's3', clientName: 'Carlos Lopez (Demo)', clientEmail: 'carlos@demo.com', serviceType: 'Mantenimiento', description: 'Sitio Web', amount: 150.00, currency: 'USD', dueDate: demoDueDate, billingCycle: 'Monthly', status: 'Activo', clientNotes: 'Servicio funcionando correctamente.', adminNotes: 'Cliente satisfecho.'},
        {id: 's4', clientName: 'Ana Rodriguez (Demo)', clientEmail: 'ana@demo.com', serviceType: 'Hosting', description: 'Plan Básico', amount: 15.00, currency: 'USD', dueDate: demoDueDate, billingCycle: 'Monthly', status: 'Periodo de Gracia Vencido', clientNotes: 'Necesita renovar pronto.', adminNotes: 'Enviar recordatorio urgente.'},
        {id: 's5', clientName: 'Pedro Martinez (Demo)', clientEmail: 'pedro@demo.com', serviceType: 'Dominio', description: 'tiendaonline.com', amount: 120000, currency: 'COP', dueDate: demoDueDate, billingCycle: 'Annually', status: 'Cancelado', clientNotes: 'Cliente canceló el servicio.', adminNotes: 'Cancelación por solicitud del cliente.'},
      ]);
      setClients([
        {id: 'c1', email: 'juan@demo.com', fullName: 'Juan Perez (Demo)'},
        {id: 'c2', email: 'maria@demo.com', fullName: 'Maria Garcia (Demo)'}
      ]);
      setTemplates([{ id: 't1', name: 'Recordatorio General (Demo)', subject: 'Recordatorio de pago', body: 'Hola {clientName}, recuerda pagar...' }]);
      setCompanySettings({ companyName: 'Tu Empresa (Demo)' });
      return;
    }
    
    const servicesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'services');
    const qServices = query(servicesCollection, orderBy('dueDate', 'desc'));
    const unsubscribeServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    const usersCollection = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const qUsers = query(usersCollection, where('role', '==', 'client'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const templatesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'messageTemplates');
    const unsubTemplates = onSnapshot(templatesCollection, snapshot => {
      setTemplates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'company');
    const unsubSettings = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) setCompanySettings(doc.data());
    });

    return () => {
      unsubscribeServices();
      unsubscribeUsers();
      unsubTemplates();
      unsubSettings();
    };
  }, [isDemo]);
  
  const handleSaveService = async (serviceData) => {
    if (isDemo) { 
      addNotification("Función no disponible en modo demo.", "error");
      return; 
    }
    const servicesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'services');
    try {
      if (serviceData.id) {
        const { id, ...data } = serviceData;
        await updateDoc(doc(servicesCollection, id), data);
      } else {
        await addDoc(servicesCollection, { ...serviceData, createdAt: Timestamp.now() });
      }
    } catch (error) {
      throw error; // Re-throw to be caught by the modal
    }
  };
  
  const handleDeleteService = async (id) => {
    if (isDemo) { addNotification("Función no disponible en modo demo.", "error"); return; }
    if (window.confirm("¿Seguro que quieres eliminar este servicio?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', id));
        addNotification("Servicio eliminado.", "success");
      } catch (error) {
        addNotification("Error al eliminar el servicio.", "error");
      }
    }
  };
  
  const handleSendMessage = async (messageData) => {
    if (isDemo) { 
       addNotification(`Simulación: Enviando correo a ${messageData.to}.`, "success");
       return;
    }
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messageHistory'), {
        ...messageData,
        sentAt: Timestamp.now(),
      });
      addNotification("Notificación registrada en el historial.", "success");
    } catch (error) {
      addNotification("Error al registrar la notificación.", "error");
    }
  };

  const handleStatusChange = async (serviceId, newStatus) => {
    if (isDemo) { addNotification("Función no disponible en modo demo.", "error"); return; }
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', serviceId), { status: newStatus });
      addNotification("Estado actualizado.", "success");
    } catch(e) {
       addNotification("Error al actualizar estado.", "error");
    }
  };
  
  const getEffectiveStatus = (service) => {
    // Si el servicio está en "Pendiente Pago" y la fecha de vencimiento ya pasó, cambiar a "Periodo de Gracia Vencido"
    if (service.status === 'Pendiente Pago' && service.dueDate && service.dueDate.toDate() < new Date()) {
      return 'Periodo de Gracia Vencido';
    }
    return service.status;
  };

  const getDateColor = (status, dueDate) => {
    if (!dueDate) return 'text-gray-500';
    const now = new Date();
    const due = dueDate.toDate();
    const daysDiff = (due - now) / (1000 * 60 * 60 * 24);

    if (status === 'Pago') return 'text-green-600';
    if (status === 'Cancelado') return 'text-gray-500';
    if (status === 'Periodo de Gracia Vencido' || daysDiff < 0) return 'text-red-600 font-bold';
    if (status === 'Pendiente Pago' && daysDiff < 7) return 'text-yellow-600 font-semibold';
    if (status === 'Activo') return 'text-blue-600';
    return 'text-gray-700';
  };

  // Calcular fecha de vencimiento basada en el ciclo
  const calculateExpirationDate = (service) => {
    if (!service.dueDate || !service.billingCycle || service.billingCycle === 'One-Time') {
      return service.expirationDate ? service.expirationDate.toDate().toLocaleDateString() : 'N/A';
    }

    const startDate = service.dueDate.toDate();
    let endDate = new Date(startDate);

    switch (service.billingCycle) {
      case 'Monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'Semiannually':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'Annually':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'Biennially':
        endDate.setFullYear(endDate.getFullYear() + 2);
        break;
      case 'Triennially':
        endDate.setFullYear(endDate.getFullYear() + 3);
        break;
      default:
        return 'N/A';
    }

    return endDate.toLocaleDateString();
  };

  // Obtener etiqueta del ciclo
  const getCycleLabel = (billingCycle) => {
    const cycleMap = {
      'One-Time': 'Pago único',
      'Monthly': 'Mensual',
      'Semiannually': 'Semestral',
      'Annually': 'Anual',
      'Biennially': 'Bianual',
      'Triennially': 'Trienal',
      'Custom': 'Personalizado'
    };
    return cycleMap[billingCycle] || billingCycle;
  };
  
  const openReminderModal = (service) => {
    setCurrentService(service);
    setIsReminderModalOpen(true);
  };

  const filteredServices = services
    .filter(service => filter === 'Todos' || getEffectiveStatus(service) === filter)
    .filter(service => {
      if (!searchTerm) return true;
      
      const search = searchTerm.toLowerCase();
      const effectiveStatus = getEffectiveStatus(service);
      
      // Buscar en todos los campos de la tabla
      return (
        service.clientName?.toLowerCase().includes(search) ||
        service.clientEmail?.toLowerCase().includes(search) ||
        service.serviceType?.toLowerCase().includes(search) ||
        service.description?.toLowerCase().includes(search) ||
        service.amount?.toString().includes(search) ||
        service.currency?.toLowerCase().includes(search) ||
        service.billingCycle?.toLowerCase().includes(search) ||
        effectiveStatus?.toLowerCase().includes(search) ||
        service.clientNotes?.toLowerCase().includes(search) ||
        service.adminNotes?.toLowerCase().includes(search) ||
        // Buscar en fechas (formato legible)
        (service.dueDate && new Date(service.dueDate.seconds * 1000).toLocaleDateString().includes(search)) ||
        // Buscar en fechas (formato numérico)
        (service.dueDate && service.dueDate.seconds?.toString().includes(search))
      );
    });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {['Todos', ...serviceStatusOptions].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === f ? 'bg-blue-600 text-white shadow-lg' : 'bg-white hover:bg-gray-100'}`}>{f}</button>
          ))}
           <div className="relative">
            <input type="text" placeholder="Buscar en toda la tabla..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-full w-full sm:w-64" />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
          </div>
        </div>
        <button onClick={() => { setCurrentService(null); setIsModalOpen(true); }} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
          <PlusIcon /> <span className="hidden sm:inline">Nuevo Servicio</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              {['Número', 'Cliente', 'Servicio', 'Monto', 'Ciclo', 'Fecha de Inicio', 'Fecha de Vencimiento', 'Notas', 'Estado', 'Acciones'].map(h => 
                <th key={h} className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredServices.map(s => {
              const effectiveStatus = getEffectiveStatus(s);
              return (
              <tr key={s.id}>
                <td className="px-6 py-4">
                  <div className="font-mono text-sm font-medium text-blue-600">{s.serviceNumber || 'N/A'}</div>
                </td>
                <td className="px-6 py-4"><div className="font-medium">{s.clientName}</div><div className="text-sm text-gray-500">{s.clientEmail}</div></td>
                <td className="px-6 py-4"><div className="font-semibold">{s.serviceType}</div><div className="text-sm text-gray-600">{s.description}</div></td>
                <td className="px-6 py-4 font-semibold">{s.amount?.toFixed(2)} {s.currency}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{getCycleLabel(s.billingCycle)}</div>
                  {s.billingCycle === 'Custom' && s.customBillingCycle && (
                    <div className="text-xs text-gray-500">({s.customBillingCycle})</div>
                  )}
                </td>
                <td className={`px-6 py-4 ${getDateColor(effectiveStatus, s.dueDate)}`}>
                  <div className="text-sm">{s.dueDate ? s.dueDate.toDate().toLocaleDateString() : 'N/A'}</div>
                  <div className="text-xs text-gray-500">Inicio</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{calculateExpirationDate(s)}</div>
                  <div className="text-xs text-gray-500">Vencimiento</div>
                </td>
                <td className="px-6 py-4 text-xs max-w-xs">
                  {s.clientNotes && <div className="truncate" title={s.clientNotes}><strong>Cliente:</strong> {s.clientNotes}</div>}
                  {s.adminNotes && <div className="truncate text-purple-600 mt-1" title={s.adminNotes}><strong>Admin:</strong> {s.adminNotes}</div>}
                </td>
                <td className="px-6 py-4">
                  <select value={s.status} onChange={(e) => handleStatusChange(s.id, e.target.value)} className="p-1 text-xs rounded-md border-gray-300 bg-white shadow-sm w-full">
                    {serviceStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                  <ActionDropdown>
                    <button onClick={() => { setCurrentService(s); setIsModalOpen(true); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Editar</button>
                    <button onClick={() => openReminderModal(s)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Enviar Notificación</button>
                    <button onClick={() => handleDeleteService(s.id)} className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">Eliminar</button>
                  </ActionDropdown>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      <ServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveService} service={currentService} clients={clients} isDemo={isDemo} />
      <ManualReminderModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} onSend={handleSendMessage} service={currentService} templates={templates} companySettings={companySettings} isDemo={isDemo}/>
    </div>
  );
}

export default AdminServicesDashboard;


