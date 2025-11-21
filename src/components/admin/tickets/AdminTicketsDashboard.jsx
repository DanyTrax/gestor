import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { collection, onSnapshot, query, orderBy, where, doc, updateDoc, addDoc, Timestamp, deleteDoc, getDocs } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { TicketIcon, SearchIcon, FilterIcon, PlusIcon, EyeIcon, CheckIcon, XIcon, ClockIcon, UserIcon, MessageIcon } from '../../icons';
import TicketMessagesHistory from '../../tickets/TicketMessagesHistory';
import ActionDropdown from '../../common/ActionDropdown';
import { sendEmail, loadEmailConfig } from '../../../services/emailService';

function AdminTicketsDashboard({ isDemo, userRole }) {
  const { addNotification } = useNotification();
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [priorityFilter, setPriorityFilter] = useState('Todos');
  const [departmentFilter, setDepartmentFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    department: 'Soporte Técnico',
    priority: 'Media',
    description: '',
    clientId: '',
    clientName: '',
    clientEmail: ''
  });

  const ticketStatusOptions = ['Todos', 'Abierto', 'En Progreso', 'Respondido', 'Cerrado', 'Esperando Cliente'];
  const priorityOptions = ['Todos', 'Baja', 'Media', 'Alta', 'Crítica'];
  const departmentOptions = ['Todos', 'Soporte Técnico', 'Facturación', 'Ventas', 'General'];

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
          clientId: 'client1',
          clientName: 'Juan Pérez',
          clientEmail: 'juan@ejemplo.com',
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
          clientId: 'client2',
          clientName: 'María García',
          clientEmail: 'maria@ejemplo.com',
          assignedTo: 'admin1',
          assignedToName: 'Admin Principal',
          createdAt: { seconds: Date.now() / 1000 - 7200 },
          updatedAt: { seconds: Date.now() / 1000 - 1800 },
          lastReplyAt: { seconds: Date.now() / 1000 - 1800 },
          lastReplyBy: 'Admin Principal',
          replyCount: 2,
          attachments: ['factura_enero.pdf']
        },
        {
          id: 'ticket3',
          ticketNumber: 'TKT-2024-003',
          subject: 'Solicitud de nuevo servicio',
          description: 'Me gustaría contratar un plan de hosting más grande para mi sitio web.',
          status: 'En Progreso',
          priority: 'Baja',
          department: 'Ventas',
          clientId: 'client3',
          clientName: 'Carlos López',
          clientEmail: 'carlos@ejemplo.com',
          assignedTo: 'admin2',
          assignedToName: 'Admin Ventas',
          createdAt: { seconds: Date.now() / 1000 - 10800 },
          updatedAt: { seconds: Date.now() / 1000 - 900 },
          lastReplyAt: { seconds: Date.now() / 1000 - 900 },
          lastReplyBy: 'Admin Ventas',
          replyCount: 1,
          attachments: []
        },
        {
          id: 'ticket4',
          ticketNumber: 'TKT-2024-004',
          subject: 'Error crítico en el servidor',
          description: 'Mi sitio web está caído y no responde. Es urgente.',
          status: 'Abierto',
          priority: 'Crítica',
          department: 'Soporte Técnico',
          clientId: 'client4',
          clientName: 'Ana Martínez',
          clientEmail: 'ana@ejemplo.com',
          assignedTo: null,
          assignedToName: null,
          createdAt: { seconds: Date.now() / 1000 - 300 },
          updatedAt: { seconds: Date.now() / 1000 - 300 },
          lastReplyAt: { seconds: Date.now() / 1000 - 300 },
          lastReplyBy: 'Cliente',
          replyCount: 0,
          attachments: ['error_screenshot.png']
        }
      ]);
      
      setClients([
        { id: 'client1', fullName: 'Juan Pérez', email: 'juan@ejemplo.com' },
        { id: 'client2', fullName: 'María García', email: 'maria@ejemplo.com' },
        { id: 'client3', fullName: 'Carlos López', email: 'carlos@ejemplo.com' },
        { id: 'client4', fullName: 'Ana Martínez', email: 'ana@ejemplo.com' }
      ]);
      
      setLoading(false);
      return;
    }

    const ticketsQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'tickets')
    );

    const unsubscribeTickets = onSnapshot(ticketsQuery, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar por fecha de creación en el cliente para evitar necesidad de índice
      ticketsData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA; // Orden descendente (más recientes primero)
      });
      
      setTickets(ticketsData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading tickets:", error);
      addNotification("Error al cargar los tickets.", "error");
      setLoading(false);
    });

    const clientsQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'users'),
      where('role', '==', 'client')
    );

    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
    }, (error) => {
      console.error("Error loading clients:", error);
    });

    return () => {
      unsubscribeTickets();
      unsubscribeClients();
    };
  }, [isDemo, addNotification]);

  const handleStatusChange = async (ticketId, newStatus) => {
    if (isDemo) {
      addNotification("Función no disponible en modo demo", "error");
      return;
    }

    try {
      const ticketRef = doc(db, 'artifacts', appId, 'public', 'data', 'tickets', ticketId);
      await updateDoc(ticketRef, { 
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      addNotification(`Estado del ticket actualizado a ${newStatus}`, "success");
    } catch (error) {
      console.error("Error updating ticket status:", error);
      addNotification("Error al actualizar el estado del ticket", "error");
    }
  };

  const handleAssignTicket = async (ticketId, assignedTo) => {
    if (isDemo) {
      addNotification("Función no disponible en modo demo", "error");
      return;
    }

    try {
      const ticketRef = doc(db, 'artifacts', appId, 'public', 'data', 'tickets', ticketId);
      const assignedToName = assignedTo ? 'Admin Actual' : null; // En producción, buscar el nombre real
      await updateDoc(ticketRef, { 
        assignedTo: assignedTo,
        assignedToName: assignedToName,
        updatedAt: Timestamp.now()
      });
      addNotification(`Ticket asignado correctamente`, "success");
    } catch (error) {
      console.error("Error assigning ticket:", error);
      addNotification("Error al asignar el ticket", "error");
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (isDemo) {
      setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      addNotification("Ticket eliminado (modo demo)", "success");
      return;
    }

    try {
      // Eliminar el ticket
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', ticketId));
      
      // También eliminar todos los mensajes asociados al ticket
      const messagesQuery = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'ticketMessages'),
        where('ticketId', '==', ticketId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(messageDoc.ref)
      );
      
      await Promise.all(deletePromises);
      
      addNotification("Ticket eliminado exitosamente", "success");
    } catch (error) {
      console.error("Error deleting ticket:", error);
      addNotification("Error al eliminar el ticket", "error");
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    if (isDemo) {
      const demoTicket = {
        id: `ticket_${Date.now()}`,
        ticketNumber: `TKT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        subject: newTicket.subject,
        description: newTicket.description,
        status: 'Abierto',
        priority: newTicket.priority,
        department: newTicket.department,
        clientId: newTicket.clientId || 'demo',
        clientName: newTicket.clientName || 'Cliente Demo',
        clientEmail: newTicket.clientEmail || 'demo@ejemplo.com',
        assignedTo: null,
        assignedToName: null,
        createdAt: { seconds: Date.now() / 1000 },
        updatedAt: { seconds: Date.now() / 1000 },
        lastReplyAt: { seconds: Date.now() / 1000 },
        lastReplyBy: 'Cliente',
        replyCount: 0,
        attachments: []
      };
      setTickets(prev => [demoTicket, ...prev]);
      addNotification("Ticket creado (modo demo)", "success");
      setShowNewTicketModal(false);
      setNewTicket({ subject: '', department: 'Soporte Técnico', priority: 'Media', description: '', clientId: '', clientName: '', clientEmail: '' });
      return;
    }

    try {
      const ticketData = {
        ...newTicket,
        ticketNumber: `TKT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        status: 'Abierto',
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
        await loadEmailConfig();
        
        const clientName = ticketData.clientName || 'Cliente';
        const clientEmail = ticketData.clientEmail;
        const ticketNumber = ticketData.ticketNumber;
        const ticketSubject = ticketData.subject;
        const ticketDescription = ticketData.description;
        const ticketDepartment = ticketData.department;
        const ticketPriority = ticketData.priority;
        
        // Email al cliente - Confirmación de creación (solo si tiene email)
        if (clientEmail) {
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
          
          await sendEmail({
            to: clientEmail,
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
        }
        
        // Email al administrador - Notificación de nuevo ticket
        const emailConfig = await loadEmailConfig();
        const adminEmail = emailConfig?.fromEmail;
        
        if (adminEmail) {
          const adminEmailHtml = `
            <h2>Nuevo Ticket Creado</h2>
            <p>Se ha creado un nuevo ticket de soporte que requiere atención.</p>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p><strong>Número de Ticket:</strong> ${ticketNumber}</p>
              <p><strong>Cliente:</strong> ${clientName}${clientEmail ? ` (${clientEmail})` : ''}</p>
              <p><strong>Asunto:</strong> ${ticketSubject}</p>
              <p><strong>Departamento:</strong> ${ticketDepartment}</p>
              <p><strong>Prioridad:</strong> ${ticketPriority}</p>
              <p><strong>Descripción:</strong></p>
              <p style="white-space: pre-wrap;">${ticketDescription}</p>
            </div>
            <p>Por favor, revisa y asigna el ticket desde el panel de administración.</p>
          `;
          
          await sendEmail({
            to: adminEmail,
            toName: emailConfig?.fromName || 'Administrador',
            subject: `Nuevo Ticket - ${ticketNumber} - ${ticketSubject}`,
            html: adminEmailHtml,
            text: `Nuevo Ticket Creado\n\nSe ha creado un nuevo ticket de soporte que requiere atención.\n\nNúmero de Ticket: ${ticketNumber}\nCliente: ${clientName}${clientEmail ? ` (${clientEmail})` : ''}\nAsunto: ${ticketSubject}\nDepartamento: ${ticketDepartment}\nPrioridad: ${ticketPriority}\n\nDescripción:\n${ticketDescription}\n\nPor favor, revisa y asigna el ticket desde el panel de administración.`,
            type: 'Notificación',
            recipientType: 'Administrador',
            module: 'tickets',
            event: 'newTicket', // Usar evento existente en la configuración
            metadata: {
              ticketId: ticketId,
              ticketNumber: ticketNumber,
              clientEmail: clientEmail,
              clientName: clientName
            }
          });
        }
      } catch (emailError) {
        console.error("Error sending ticket notification emails:", emailError);
        // No fallar la creación del ticket si falla el email
      }
      
      addNotification("Ticket creado exitosamente", "success");
      setShowNewTicketModal(false);
      setNewTicket({ subject: '', department: 'Soporte Técnico', priority: 'Media', description: '', clientId: '', clientName: '', clientEmail: '' });
    } catch (error) {
      console.error("Error creating ticket:", error);
      addNotification("Error al crear el ticket", "error");
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Abierto': return <ClockIcon />;
      case 'En Progreso': return <ClockIcon />;
      case 'Respondido': return <CheckIcon />;
      case 'Cerrado': return <XIcon />;
      case 'Esperando Cliente': return <UserIcon />;
      default: return <ClockIcon />;
    }
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchTerm === '' ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Todos' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'Todos' || ticket.priority === priorityFilter;
    const matchesDepartment = departmentFilter === 'Todos' || ticket.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TicketIcon />
          Sistema de Tickets
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} encontrado{filteredTickets.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon />
            Nuevo Ticket
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Esperando Cliente</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.status === 'Esperando Cliente').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Críticos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tickets.filter(t => t.priority === 'Crítica').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por número, asunto, cliente..."
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
              {ticketStatusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon />
            </div>
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-full w-full appearance-none bg-white"
            >
              {priorityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon />
            </div>
          </div>

          <div className="relative">
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-full w-full appearance-none bg-white"
            >
              {departmentOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Tickets */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Ticket', 'Cliente', 'Asunto', 'Estado', 'Prioridad', 'Departamento', 'Asignado', 'Última Actividad', 'Respuestas', 'Acciones'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.map(ticket => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-mono text-sm font-medium text-blue-600">
                    {ticket.ticketNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(ticket.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{ticket.clientName}</div>
                  <div className="text-sm text-gray-500">{ticket.clientEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={ticket.subject}>
                    {ticket.subject}
                  </div>
                  <div className="text-xs text-gray-500 max-w-xs truncate" title={ticket.description}>
                    {ticket.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <div className="ml-2 text-gray-400">
                      {getStatusIcon(ticket.status)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDepartmentColor(ticket.department)}`}>
                    {ticket.department}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.assignedToName || 'Sin asignar'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{getTimeAgo(ticket.lastReplyAt)}</div>
                  <div className="text-xs text-gray-400">por {ticket.lastReplyBy}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <MessageIcon />
                    <span className="ml-1">{ticket.replyCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Ver ticket completo"
                    >
                      <EyeIcon />
                    </button>
                    {userRole === 'superadmin' && (
                      <ActionDropdown>
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-none bg-transparent"
                        >
                          {ticketStatusOptions.filter(opt => opt !== 'Todos').map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleAssignTicket(ticket.id, ticket.assignedTo ? null : 'admin')}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                        >
                          {ticket.assignedTo ? 'Desasignar' : 'Asignar'}
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                          Responder
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50">
                          Cerrar Ticket
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de que quieres eliminar este ticket? Esta acción no se puede deshacer.')) {
                              handleDeleteTicket(ticket.id);
                            }
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          Eliminar Ticket
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

      {filteredTickets.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron tickets</h3>
          <p className="text-gray-500">No hay tickets que coincidan con los filtros seleccionados.</p>
        </div>
      )}

      {/* Modal de Vista de Ticket */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <div className="text-sm text-gray-900">{selectedTicket.clientName}</div>
                  <div className="text-sm text-gray-500">{selectedTicket.clientEmail}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asignado a</label>
                  <div className="text-sm text-gray-900">{selectedTicket.assignedToName || 'Sin asignar'}</div>
                </div>
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
                  <label className="block text-sm font-medium text-gray-700">Creado</label>
                  <div className="text-sm text-gray-900">{formatDate(selectedTicket.createdAt)}</div>
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
                    userRole={userRole}
                    currentUser={{ uid: 'admin', displayName: 'Admin', email: 'admin@empresa.com' }}
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
                {userRole === 'superadmin' && (
                  <>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Responder
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar este ticket? Esta acción no se puede deshacer.')) {
                          handleDeleteTicket(selectedTicket.id);
                          setShowTicketModal(false);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Eliminar Ticket
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select
                    value={newTicket.clientId}
                    onChange={(e) => {
                      const selectedClient = clients.find(c => c.id === e.target.value);
                      setNewTicket(prev => ({
                        ...prev,
                        clientId: e.target.value,
                        clientName: selectedClient?.fullName || '',
                        clientEmail: selectedClient?.email || ''
                      }));
                    }}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.fullName} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <select
                    value={newTicket.department}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    {departmentOptions.filter(opt => opt !== 'Todos').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    {priorityOptions.filter(opt => opt !== 'Todos').map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email del Cliente</label>
                  <input
                    type="email"
                    value={newTicket.clientEmail}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    placeholder="email@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Describe brevemente el problema o consulta"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={6}
                  placeholder="Describe el problema o consulta en detalle..."
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
    </div>
  );
}

export default AdminTicketsDashboard;
