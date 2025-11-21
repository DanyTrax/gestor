import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { collection, onSnapshot, query, orderBy, where, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import { TicketIcon, PlusIcon, EyeIcon, ClockIcon, UserIcon, MessageIcon, XIcon } from '../icons';
import TicketMessagesHistory from '../tickets/TicketMessagesHistory';
import { sendEmail, loadEmailConfig } from '../../services/emailService';

function ClientTicketsDashboard({ user, isDemo, userProfile }) {
  const { addNotification } = useNotification();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    department: 'Soporte Técnico',
    priority: 'Media',
    description: ''
  });

  const departmentOptions = ['Soporte Técnico', 'Facturación', 'Ventas', 'General'];
  const priorityOptions = ['Baja', 'Media', 'Alta', 'Crítica'];

  useEffect(() => {
    if (isDemo) {
      setTickets([
        {
          id: 'ticket1',
          ticketNumber: 'TKT-2024-001',
          subject: 'Problema con el acceso al panel de cliente',
          description: 'No puedo acceder a mi panel de cliente desde ayer. Me aparece un error 500.',
          status: 'Abierto',
          priority: 'Alta',
          department: 'Soporte Técnico',
          clientId: user?.uid || 'demo',
          clientName: userProfile?.fullName || 'Usuario Demo',
          clientEmail: user?.email || 'demo@ejemplo.com',
          assignedTo: null,
          assignedToName: null,
          createdAt: { seconds: Date.now() / 1000 - 3600 },
          updatedAt: { seconds: Date.now() / 1000 - 3600 },
          lastReplyAt: { seconds: Date.now() / 1000 - 3600 },
          lastReplyBy: 'Cliente',
          replyCount: 0,
          attachments: []
        },
        {
          id: 'ticket2',
          ticketNumber: 'TKT-2024-002',
          subject: 'Consulta sobre facturación',
          description: 'Necesito una copia de mi factura del mes pasado para contabilidad.',
          status: 'Respondido',
          priority: 'Media',
          department: 'Facturación',
          clientId: user?.uid || 'demo',
          clientName: userProfile?.fullName || 'Usuario Demo',
          clientEmail: user?.email || 'demo@ejemplo.com',
          assignedTo: 'admin1',
          assignedToName: 'Admin Principal',
          createdAt: { seconds: Date.now() / 1000 - 7200 },
          updatedAt: { seconds: Date.now() / 1000 - 1800 },
          lastReplyAt: { seconds: Date.now() / 1000 - 1800 },
          lastReplyBy: 'Admin Principal',
          replyCount: 2,
          attachments: ['factura_enero.pdf']
        }
      ]);
      setLoading(false);
      return;
    }

    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const ticketsQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'tickets'),
      where('clientId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(ticketsQuery, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar por fecha de creación en el cliente para evitar necesidad de índice compuesto
      ticketsData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA; // Orden descendente (más recientes primero)
      });
      
      setTickets(ticketsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading tickets:', error);
      addNotification('Error al cargar los tickets', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, isDemo, addNotification, userProfile]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    console.log('🎫 handleCreateTicket llamado - Iniciando creación de ticket');
    
    if (isDemo) {
      console.log('⚠️ Modo demo activado - saltando envío de emails');
      addNotification("Ticket creado (modo demo)", "success");
      setShowNewTicketModal(false);
      setNewTicket({ subject: '', department: 'Soporte Técnico', priority: 'Media', description: '' });
      return;
    }

    try {
      console.log('🎫 Creando ticket en Firestore...');
      const ticketData = {
        ...newTicket,
        ticketNumber: `TKT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        status: 'Abierto',
        clientId: user.uid,
        clientName: userProfile?.fullName || user.email,
        clientEmail: user.email,
        assignedTo: null,
        assignedToName: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastReplyAt: Timestamp.now(),
        lastReplyBy: 'Cliente',
        replyCount: 0,
        attachments: []
      };

      const ticketDocRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tickets'), ticketData);
      const ticketId = ticketDocRef.id;
      
      // Enviar notificaciones por email
      try {
        console.log('📧 Iniciando envío de notificaciones por email para ticket:', ticketId);
        await loadEmailConfig();
        console.log('✅ Configuración de email cargada');
        
        const clientName = userProfile?.fullName || user.email;
        const ticketNumber = ticketData.ticketNumber;
        const ticketSubject = ticketData.subject;
        const ticketDescription = ticketData.description;
        const ticketDepartment = ticketData.department;
        const ticketPriority = ticketData.priority;
        
        // Email al cliente - Confirmación de creación
        const clientEmailHtml = `
          <h2>Ticket Creado Exitosamente</h2>
          <p>Estimado/a <strong>${clientName}</strong>,</p>
          <p>Hemos recibido tu ticket de soporte. Nuestro equipo lo revisará y te responderá pronto.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Número de Ticket:</strong> ${ticketNumber}</p>
            <p><strong>Asunto:</strong> ${ticketSubject}</p>
            <p><strong>Departamento:</strong> ${ticketDepartment}</p>
            <p><strong>Prioridad:</strong> ${ticketPriority}</p>
            <p><strong>Descripción:</strong></p>
            <p style="white-space: pre-wrap;">${ticketDescription}</p>
          </div>
          <p>Puedes hacer seguimiento a tu ticket desde tu panel de cliente.</p>
          <p>Saludos cordiales,<br>Equipo de Soporte</p>
        `;
        
        console.log('📧 Enviando email al cliente:', user.email);
        const clientEmailResult = await sendEmail({
          to: user.email,
          toName: clientName,
          subject: `Ticket Creado - ${ticketNumber}`,
          html: clientEmailHtml,
          text: `Ticket Creado Exitosamente\n\nEstimado/a ${clientName},\n\nHemos recibido tu ticket de soporte. Nuestro equipo lo revisará y te responderá pronto.\n\nNúmero de Ticket: ${ticketNumber}\nAsunto: ${ticketSubject}\nDepartamento: ${ticketDepartment}\nPrioridad: ${ticketPriority}\n\nDescripción:\n${ticketDescription}\n\nPuedes hacer seguimiento a tu ticket desde tu panel de cliente.\n\nSaludos cordiales,\nEquipo de Soporte`,
          type: 'Notificación',
          recipientType: 'Cliente',
          module: 'tickets',
          event: 'ticketReply', // Usar evento existente en la configuración
          metadata: {
            ticketId: ticketId,
            ticketNumber: ticketNumber
          }
        });
        console.log('📧 Resultado email cliente:', clientEmailResult);
        
        // Email al administrador - Notificación de nuevo ticket
        const adminEmailHtml = `
          <h2>Nuevo Ticket Creado</h2>
          <p>Se ha creado un nuevo ticket de soporte que requiere atención.</p>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p><strong>Número de Ticket:</strong> ${ticketNumber}</p>
            <p><strong>Cliente:</strong> ${clientName} (${user.email})</p>
            <p><strong>Asunto:</strong> ${ticketSubject}</p>
            <p><strong>Departamento:</strong> ${ticketDepartment}</p>
            <p><strong>Prioridad:</strong> ${ticketPriority}</p>
            <p><strong>Descripción:</strong></p>
            <p style="white-space: pre-wrap;">${ticketDescription}</p>
          </div>
          <p>Por favor, revisa y asigna el ticket desde el panel de administración.</p>
        `;
        
        // Obtener email del administrador desde la configuración
        const emailConfig = await loadEmailConfig();
        const adminEmail = emailConfig?.fromEmail || user.email; // Fallback al email del cliente si no hay config
        
        console.log('📧 Enviando email al administrador:', adminEmail);
        const adminEmailResult = await sendEmail({
          to: adminEmail,
          toName: emailConfig?.fromName || 'Administrador',
          subject: `Nuevo Ticket - ${ticketNumber} - ${ticketSubject}`,
          html: adminEmailHtml,
          text: `Nuevo Ticket Creado\n\nSe ha creado un nuevo ticket de soporte que requiere atención.\n\nNúmero de Ticket: ${ticketNumber}\nCliente: ${clientName} (${user.email})\nAsunto: ${ticketSubject}\nDepartamento: ${ticketDepartment}\nPrioridad: ${ticketPriority}\n\nDescripción:\n${ticketDescription}\n\nPor favor, revisa y asigna el ticket desde el panel de administración.`,
          type: 'Notificación',
          recipientType: 'Administrador',
          module: 'tickets',
          event: 'newTicket', // Usar evento existente en la configuración
          metadata: {
            ticketId: ticketId,
            ticketNumber: ticketNumber,
            clientEmail: user.email,
            clientName: clientName
          }
        });
        console.log('📧 Resultado email administrador:', adminEmailResult);
        console.log('✅ Notificaciones por email completadas');
      } catch (emailError) {
        console.error("❌ Error sending ticket notification emails:", emailError);
        console.error("❌ Detalles del error:", emailError.message, emailError.stack);
        // No fallar la creación del ticket si falla el email
      }
      
      addNotification("Ticket creado exitosamente", "success");
      setShowNewTicketModal(false);
      setNewTicket({ subject: '', department: 'Soporte Técnico', priority: 'Media', description: '' });
    } catch (error) {
      console.error("Error creating ticket:", error);
      addNotification("Error al crear el ticket", "error");
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleCloseTicket = async (ticketId) => {
    if (isDemo) {
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: 'Cerrado', updatedAt: { seconds: Date.now() / 1000 } }
          : ticket
      ));
      addNotification("Ticket cerrado (modo demo)", "success");
      return;
    }

    try {
      const ticketRef = doc(db, 'artifacts', appId, 'public', 'data', 'tickets', ticketId);
      await updateDoc(ticketRef, {
        status: 'Cerrado',
        updatedAt: Timestamp.now()
      });
      addNotification("Ticket cerrado exitosamente", "success");
    } catch (error) {
      console.error("Error closing ticket:", error);
      addNotification("Error al cerrar el ticket", "error");
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Abierto': 'bg-red-100 text-red-800',
      'En Progreso': 'bg-yellow-100 text-yellow-800',
      'Respondido': 'bg-blue-100 text-blue-800',
      'Cerrado': 'bg-gray-100 text-gray-800',
      'Esperando Cliente': 'bg-orange-100 text-orange-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      'Baja': 'bg-green-100 text-green-800',
      'Media': 'bg-yellow-100 text-yellow-800',
      'Alta': 'bg-orange-100 text-orange-800',
      'Crítica': 'bg-red-100 text-red-800'
    };
    return priorityMap[priority] || 'bg-gray-100 text-gray-800';
  };

  const getDepartmentColor = (department) => {
    const departmentMap = {
      'Soporte Técnico': 'bg-blue-100 text-blue-800',
      'Facturación': 'bg-green-100 text-green-800',
      'Ventas': 'bg-purple-100 text-purple-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return departmentMap[department] || 'bg-gray-100 text-gray-800';
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

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '--';
    const now = new Date();
    const date = new Date(timestamp.seconds * 1000);
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffMinutes > 0) return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    return 'hace unos segundos';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Abierto': return <ClockIcon />;
      case 'En Progreso': return <ClockIcon />;
      case 'Respondido': return <UserIcon />;
      case 'Cerrado': return <TicketIcon />;
      case 'Esperando Cliente': return <UserIcon />;
      default: return <ClockIcon />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TicketIcon />
          Mis Tickets de Soporte
        </h2>
        <button
          onClick={() => setShowNewTicketModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon />
          Nuevo Ticket
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ClockIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Abiertos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'Abierto').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Respondidos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'Respondido').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En Progreso</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'En Progreso').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TicketIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Cerrados</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'Cerrado').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Tickets */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes tickets</h3>
          <p className="text-gray-500 mb-4">Crea tu primer ticket para obtener soporte.</p>
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Crear Primer Ticket
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-medium text-blue-600">
                      {ticket.ticketNumber}
                    </span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDepartmentColor(ticket.department)}`}>
                      {ticket.department}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ClockIcon />
                      <span>Creado {getTimeAgo(ticket.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageIcon />
                      <span>{ticket.replyCount} respuesta{ticket.replyCount !== 1 ? 's' : ''}</span>
                    </div>
                    {ticket.assignedToName && (
                      <div className="flex items-center gap-1">
                        <UserIcon />
                        <span>Asignado a {ticket.assignedToName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewTicket(ticket)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Ver ticket completo"
                  >
                    <EyeIcon />
                  </button>
                  {ticket.status !== 'Cerrado' && (
                    <button
                      onClick={() => handleCloseTicket(ticket.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Cerrar ticket"
                    >
                      <XIcon />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nuevo Ticket */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Crear Nuevo Ticket</h3>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Describe brevemente tu problema o consulta"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
                  <select
                    value={newTicket.department}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    {departmentOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    {priorityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={6}
                  placeholder="Describe tu problema o consulta en detalle. Incluye cualquier información relevante que pueda ayudar a resolver tu ticket más rápidamente."
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Vista de Ticket */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Ticket {selectedTicket.ticketNumber}</h3>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Información del ticket */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Departamento</label>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDepartmentColor(selectedTicket.department)}`}>
                    {selectedTicket.department}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asignado a</label>
                  <div className="text-sm text-gray-900">{selectedTicket.assignedToName || 'Sin asignar'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Creado</label>
                  <div className="text-sm text-gray-900">{formatDate(selectedTicket.createdAt)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Última actividad</label>
                  <div className="text-sm text-gray-900">{getTimeAgo(selectedTicket.lastReplyAt)}</div>
                </div>
              </div>

              {/* Asunto y descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                  {selectedTicket.subject}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <div className="text-sm text-gray-900 p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Historial de mensajes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Historial de Mensajes</label>
                <div className="border border-gray-200 rounded-md p-4">
                  <TicketMessagesHistory 
                    ticketId={selectedTicket.id} 
                    isDemo={isDemo} 
                    userRole="client"
                    currentUser={user}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cerrar
                </button>
                {selectedTicket.status !== 'Cerrado' && (
                  <button
                    onClick={() => {
                      handleCloseTicket(selectedTicket.id);
                      setShowTicketModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Cerrar Ticket
                  </button>
                )}
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Responder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ClientTicketsDashboard;
