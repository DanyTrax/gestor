import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { collection, onSnapshot, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { MessagesIcon, SearchIcon, FilterIcon, EyeIcon, CheckIcon, XIcon, ClockIcon } from '../../icons';
import ActionDropdown from '../../common/ActionDropdown';
import EmailConfigTab from './EmailConfigTab';
import NotificationSettingsTab from './NotificationSettingsTab';

function AdminMessagesDashboard({ isDemo, userRole }) {
  const [activeTab, setActiveTab] = useState('history');
  const { addNotification } = useNotification();
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [recipientFilter, setRecipientFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const messageStatusOptions = ['Todos', 'Enviado', 'Entregado', 'Leído', 'Fallido', 'Pendiente'];
  const messageTypeOptions = ['Todos', 'Aprobación', 'Rechazo', 'Recordatorio', 'Notificación', 'Activación', 'Sistema'];
  const recipientTypeOptions = ['Todos', 'Cliente', 'Administrador', 'Sistema'];

  useEffect(() => {
    if (isDemo) {
      setMessages([
        {
          id: 'msg1',
          type: 'Aprobación',
          recipientType: 'Cliente',
          recipientName: 'Juan Pérez',
          recipientEmail: 'juan@ejemplo.com',
          subject: 'Pago Aprobado - SRV-241017-123456',
          message: 'Estimado/a Juan Pérez,\n\nSu pago por el servicio SRV-241017-123456 ha sido aprobado exitosamente.\n\nDetalles del pago:\n- Servicio: Hosting Básico\n- Monto: $50,000 COP\n- Fecha: 17/10/2024\n- Método: Bold\n\nSu servicio está ahora activo. Gracias por su pago.\n\nSaludos cordiales,\nEquipo de Soporte',
          status: 'Entregado',
          sentAt: { seconds: Date.now() / 1000 - 3600 },
          deliveredAt: { seconds: Date.now() / 1000 - 3000 },
          readAt: { seconds: Date.now() / 1000 - 1800 },
          templateId: 'approval_1',
          paymentId: 'pay1',
          serviceId: 'srv1',
          sentBy: 'admin@empresa.com',
          channel: 'email'
        },
        {
          id: 'msg2',
          type: 'Recordatorio',
          recipientType: 'Cliente',
          recipientName: 'María García',
          recipientEmail: 'maria@ejemplo.com',
          subject: 'Recordatorio de Vencimiento - SRV-241017-789012',
          message: 'Hola María García,\n\nTe recordamos que tu servicio SRV-241017-789012 vence en 3 días.\n\nPara evitar interrupciones, por favor realiza el pago correspondiente.\n\nGracias por tu atención.\n\nEquipo de Soporte',
          status: 'Enviado',
          sentAt: { seconds: Date.now() / 1000 - 7200 },
          deliveredAt: null,
          readAt: null,
          templateId: 'reminder_1',
          serviceId: 'srv2',
          sentBy: 'sistema@empresa.com',
          channel: 'email'
        },
        {
          id: 'msg3',
          type: 'Rechazo',
          recipientType: 'Cliente',
          recipientName: 'Carlos López',
          recipientEmail: 'carlos@ejemplo.com',
          subject: 'Pago Rechazado - SRV-241017-345678',
          message: 'Estimado/a Carlos López,\n\nLamentamos informarle que su pago por el servicio SRV-241017-345678 no pudo ser procesado.\n\nPor favor, verifique los datos de su método de pago e intente nuevamente.\n\nSi necesita ayuda, contacte a nuestro equipo de soporte.\n\nSaludos cordiales,\nEquipo de Soporte',
          status: 'Fallido',
          sentAt: { seconds: Date.now() / 1000 - 10800 },
          deliveredAt: null,
          readAt: null,
          templateId: 'rejection_1',
          paymentId: 'pay3',
          serviceId: 'srv3',
          sentBy: 'admin@empresa.com',
          channel: 'email',
          errorMessage: 'Error de conexión con el servidor de email'
        },
        {
          id: 'msg4',
          type: 'Notificación',
          recipientType: 'Administrador',
          recipientName: 'Admin Principal',
          recipientEmail: 'admin@empresa.com',
          subject: 'Nuevo Pago Recibido',
          message: 'Se ha recibido un nuevo pago:\n\n- Cliente: Ana Martínez\n- Servicio: SRV-241017-456789\n- Monto: $75,000 COP\n- Método: Transferencia Bancaria\n\nPor favor, verifica y aprueba el pago si es necesario.',
          status: 'Leído',
          sentAt: { seconds: Date.now() / 1000 - 14400 },
          deliveredAt: { seconds: Date.now() / 1000 - 14300 },
          readAt: { seconds: Date.now() / 1000 - 14200 },
          templateId: 'admin_payment_notification',
          paymentId: 'pay4',
          serviceId: 'srv4',
          sentBy: 'sistema@empresa.com',
          channel: 'email'
        }
      ]);
      setLoading(false);
      return;
    }

    const messagesQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'messages'),
      orderBy('sentAt', 'desc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading messages:", error);
      addNotification("Error al cargar los mensajes.", "error");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemo, addNotification]);

  const handleStatusChange = async (messageId, newStatus) => {
    if (isDemo) {
      addNotification("Función no disponible en modo demo", "error");
      return;
    }

    try {
      const messageRef = doc(db, 'artifacts', appId, 'public', 'data', 'messages', messageId);
      await updateDoc(messageRef, { 
        status: newStatus,
        updatedAt: new Date()
      });
      addNotification(`Estado del mensaje actualizado a ${newStatus}`, "success");
    } catch (error) {
      console.error("Error updating message status:", error);
      addNotification("Error al actualizar el estado del mensaje", "error");
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Enviado': 'bg-blue-100 text-blue-800',
      'Entregado': 'bg-green-100 text-green-800',
      'Leído': 'bg-purple-100 text-purple-800',
      'Fallido': 'bg-red-100 text-red-800',
      'Pendiente': 'bg-yellow-100 text-yellow-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const typeMap = {
      'Aprobación': 'bg-green-100 text-green-800',
      'Rechazo': 'bg-red-100 text-red-800',
      'Recordatorio': 'bg-yellow-100 text-yellow-800',
      'Notificación': 'bg-blue-100 text-blue-800',
      'Activación': 'bg-purple-100 text-purple-800',
      'Sistema': 'bg-gray-100 text-gray-800'
    };
    return typeMap[type] || 'bg-gray-100 text-gray-800';
  };

  const getRecipientTypeColor = (recipientType) => {
    const typeMap = {
      'Cliente': 'bg-blue-100 text-blue-800',
      'Administrador': 'bg-purple-100 text-purple-800',
      'Sistema': 'bg-gray-100 text-gray-800'
    };
    return typeMap[recipientType] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '--';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Enviado': return <ClockIcon />;
      case 'Entregado': return <CheckIcon />;
      case 'Leído': return <EyeIcon />;
      case 'Fallido': return <XIcon />;
      case 'Pendiente': return <ClockIcon />;
      default: return <ClockIcon />;
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = searchTerm === '' ||
      message.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Todos' || message.status === statusFilter;
    const matchesType = typeFilter === 'Todos' || message.type === typeFilter;
    const matchesRecipient = recipientFilter === 'Todos' || message.recipientType === recipientFilter;

    return matchesSearch && matchesStatus && matchesType && matchesRecipient;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Componente de Historial de Mensajes
  const MessagesHistoryTab = () => (
    <>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-900">Historial de Mensajes</h3>
        <div className="text-sm text-gray-500">
          {filteredMessages.length} mensaje{filteredMessages.length !== 1 ? 's' : ''} encontrado{filteredMessages.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por destinatario, asunto o contenido..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-full w-full"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-full w-full appearance-none bg-white"
            >
              {messageStatusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon />
            </div>
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-full w-full appearance-none bg-white"
            >
              {messageTypeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MessagesIcon />
            </div>
          </div>

          <div className="relative">
            <select
              value={recipientFilter}
              onChange={e => setRecipientFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-full w-full appearance-none bg-white"
            >
              {recipientTypeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Mensajes */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Tipo', 'Módulo', 'Destinatario', 'Asunto', 'Estado', 'Enviado', 'Entregado', 'Leído', 'Acciones'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMessages.map(message => (
              <tr key={message.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(message.type)}`}>
                      {message.type}
                    </span>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRecipientTypeColor(message.recipientType)}`}>
                      {message.recipientType}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {message.module || 'Sistema'}
                  </div>
                  {message.event && (
                    <div className="text-xs text-gray-500 capitalize">
                      {message.event.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{message.recipientName || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{message.recipientEmail || message.to || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={message.subject}>
                    {message.subject}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                    <div className="ml-2 text-gray-400">
                      {getStatusIcon(message.status)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(message.sentAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {message.deliveredAt ? formatDate(message.deliveredAt) : '--'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {message.readAt ? formatDate(message.readAt) : '--'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleViewMessage(message)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Ver mensaje completo"
                    >
                      <EyeIcon />
                    </button>
                    {userRole === 'superadmin' && (
                      <ActionDropdown>
                        <select
                          value={message.status}
                          onChange={(e) => handleStatusChange(message.id, e.target.value)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-none bg-transparent"
                        >
                          {messageStatusOptions.filter(opt => opt !== 'Todos').map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <button className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50">
                          Reenviar
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                          Eliminar
                        </button>
                      </ActionDropdown>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMessages.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <MessagesIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron mensajes</h3>
          <p className="text-gray-500">No hay mensajes que coincidan con los filtros seleccionados.</p>
        </div>
      )}

      {/* Modal de Vista de Mensaje */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Detalles del Mensaje</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(selectedMessage.type)}`}>
                    {selectedMessage.type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destinatario</label>
                  <div className="text-sm text-gray-900">{selectedMessage.recipientName}</div>
                  <div className="text-sm text-gray-500">{selectedMessage.recipientEmail}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Canal</label>
                  <div className="text-sm text-gray-900">{selectedMessage.channel || 'Email'}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                  {selectedMessage.subject}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido del Mensaje</label>
                <div className="text-sm text-gray-900 p-4 bg-gray-50 rounded-md whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enviado</label>
                  <div className="text-gray-900">{formatDate(selectedMessage.sentAt)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Entregado</label>
                  <div className="text-gray-900">{selectedMessage.deliveredAt ? formatDate(selectedMessage.deliveredAt) : 'No entregado'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Leído</label>
                  <div className="text-gray-900">{selectedMessage.readAt ? formatDate(selectedMessage.readAt) : 'No leído'}</div>
                </div>
              </div>

              {selectedMessage.errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <label className="block text-sm font-medium text-red-700 mb-1">Error</label>
                  <div className="text-sm text-red-600">{selectedMessage.errorMessage}</div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cerrar
                </button>
                {userRole === 'superadmin' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Reenviar Mensaje
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <MessagesIcon />
          Mensajería y Notificaciones
        </h2>
        
        {/* Pestañas */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Historial de Mensajes
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'email'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚙️ Configuración de Email
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔔 Notificaciones por Módulo
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de pestañas */}
      {activeTab === 'history' && <MessagesHistoryTab />}
      {activeTab === 'email' && <EmailConfigTab isDemo={isDemo} />}
      {activeTab === 'notifications' && <NotificationSettingsTab isDemo={isDemo} />}
    </div>
  );
}

export default AdminMessagesDashboard;
