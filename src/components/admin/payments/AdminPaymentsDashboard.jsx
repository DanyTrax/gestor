import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { collection, onSnapshot, query, orderBy, where, doc, updateDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { CreditCardIcon, SearchIcon, FilterIcon, SettingsIcon, CheckIcon, XIcon, CalendarIcon, EyeIcon, TrashIcon } from '../../icons';
import ActionDropdown from '../../common/ActionDropdown';
import PaymentConfigDashboard from './PaymentConfigDashboard';
import PaymentMessageModal from './PaymentMessageModal';
import RenewalConfigDashboard from './RenewalConfigDashboard';

function AdminPaymentsDashboard({ isDemo, userRole }) {
  const { addNotification } = useNotification();
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [gatewayFilter, setGatewayFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('history');
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);

  const paymentStatusOptions = ['Todos', 'Pendiente', 'Procesando', 'Completado', 'Fallido', 'Cancelado', 'Reembolsado'];
  const gatewayOptions = ['Todos', 'Bold', 'PayPal', 'PayU', 'Transferencia Bancaria', 'Manual'];

  useEffect(() => {
    if (isDemo) {
      setPayments([
        {
          id: 'demo1',
          serviceNumber: 'SRV-241017-123456',
          clientName: 'Juan Pérez',
          clientEmail: 'juan@ejemplo.com',
          amount: 10.99,
          currency: 'USD',
          status: 'Completado',
          gateway: 'Bold',
          transactionId: 'bold_txn_123456',
          createdAt: { seconds: Date.now() / 1000 - 86400 },
          completedAt: { seconds: Date.now() / 1000 - 3600 }
        },
        {
          id: 'demo2',
          serviceNumber: 'SRV-241017-789012',
          clientName: 'María García',
          clientEmail: 'maria@ejemplo.com',
          amount: 25.00,
          currency: 'USD',
          status: 'Pendiente',
          gateway: 'PayPal',
          transactionId: 'paypal_txn_789012',
          createdAt: { seconds: Date.now() / 1000 - 7200 }
        },
        {
          id: 'demo3',
          serviceNumber: 'SRV-241017-345678',
          clientName: 'Carlos López',
          clientEmail: 'carlos@ejemplo.com',
          amount: 50.00,
          currency: 'USD',
          status: 'Completado',
          gateway: 'Transferencia Bancaria',
          transactionId: 'TRF-123456789',
          createdAt: { seconds: Date.now() / 1000 - 10800 },
          completedAt: { seconds: Date.now() / 1000 - 9000 }
        }
      ]);
      setClients([
        { id: 'client1', fullName: 'Juan Pérez', email: 'juan@ejemplo.com' },
        { id: 'client2', fullName: 'María García', email: 'maria@ejemplo.com' }
      ]);
      setLoading(false);
      return;
    }

    // Cargar pagos
    const paymentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'payments');
    
    const unsubscribePayments = onSnapshot(paymentsRef, (snapshot) => {
      console.log('Admin payments snapshot:', snapshot.size, 'documents');
      const paymentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Payment doc:', doc.id, data);
        return {
          id: doc.id,
          ...data
        };
      });
      
      // Ordenar por fecha de creación en el cliente para evitar necesidad de índice compuesto
      paymentsData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA; // Orden descendente (más recientes primero)
      });
      
      console.log('Admin payments loaded:', paymentsData.length, paymentsData);
      setPayments(paymentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading payments:', error);
      addNotification('Error al cargar los pagos', 'error');
      setLoading(false);
    });

    // Cargar clientes
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
    });

    return () => {
      unsubscribePayments();
      unsubscribeClients();
    };
  }, [isDemo, addNotification]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.serviceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || payment.status === statusFilter;
    const matchesGateway = gatewayFilter === 'Todos' || payment.gateway === gatewayFilter;

    return matchesSearch && matchesStatus && matchesGateway;
  });

  const handleStatusChange = async (paymentId, newStatus) => {
    if (isDemo) {
      addNotification("Función no disponible en modo demo", "error");
      return;
    }

    try {
      const paymentRef = doc(db, 'artifacts', appId, 'public', 'data', 'payments', paymentId);
      await updateDoc(paymentRef, { 
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === 'Completado' ? { completedAt: Timestamp.now() } : {})
      });

      // Si el pago quedó Completado y es de renovación, actualizar fechas del servicio
      if (newStatus === 'Completado') {
        const snap = await getDoc(paymentRef);
        if (snap.exists()) {
          const payment = snap.data();
          const serviceId = payment.serviceId;
          if (serviceId && (payment.isRenewal || payment.paymentType === 'Renovación')) {
            try {
              const serviceRef = doc(db, 'artifacts', appId, 'public', 'data', 'services', serviceId);
              const updates = {};
              if (payment.startDate) updates.dueDate = payment.startDate; // Timestamp
              if (payment.endDate) updates.expirationDate = payment.endDate; // Timestamp
              updates.status = 'Pago';
              updates.updatedAt = Timestamp.now();
              await updateDoc(serviceRef, updates);
            } catch (e) {
              console.error('Error updating service after completed payment:', e);
            }
          }
        }
      }

      addNotification(`Estado del pago actualizado a ${newStatus}`, "success");
    } catch (error) {
      console.error("Error updating payment status:", error);
      addNotification("Error al actualizar el estado del pago", "error");
    }
  };

  const handleSendMessage = (payment, messageType) => {
    setSelectedPayment({ ...payment, _messageType: messageType });
    setMessageModalOpen(true);
  };

  // Generar y descargar invoice
  const downloadInvoice = (payment) => {
    const invoiceHTML = generateInvoiceHTML(payment);

    // Crear y descargar el archivo
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-INV-${payment.id.slice(-8).toUpperCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification('Invoice descargado exitosamente', 'success');
  };

  // Eliminar pago
  const handleDeletePayment = async (paymentId) => {
    if (isDemo) {
      addNotification("Función no disponible en modo demo", "error");
      return;
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar este pago? Esta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'payments', paymentId));
        addNotification('Pago eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error deleting payment:', error);
        addNotification('Error al eliminar el pago', 'error');
      }
    }
  };

  // Función para generar HTML del invoice (sin template strings para evitar problemas de scope)
  const generateInvoiceHTML = (payment) => {
    try {
      if (!payment || !payment.id) {
        console.error('Payment inválido para generar invoice:', payment);
        return '<html><body><p>Error: Datos de pago incompletos</p></body></html>';
      }

      const paymentId = String(payment.id || '');
      const invoiceNumber = 'INV-' + paymentId.slice(-8).toUpperCase();
      const invoiceDate = new Date(payment.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('es-ES');
      const invoiceDueDate = payment.dueDate ? new Date(payment.dueDate.seconds * 1000).toLocaleDateString('es-ES') : 'N/A';
      const invoiceClientName = String(payment.clientName || 'Cliente');
      const invoiceClientEmail = String(payment.clientEmail || 'N/A');
      const invoiceServiceNumber = String(payment.serviceNumber || 'N/A');
      const invoiceServiceType = String(payment.serviceType || 'Servicio');
      const invoiceDescription = String(payment.description || 'Descripción del servicio');
      const invoiceAmount = Number(payment.amount || 0);
      const invoiceCurrency = String(payment.currency || 'USD');
      const invoiceStatus = 'Completado';
      const invoiceGateway = String(payment.gateway || 'N/A');
      const invoiceTransactionId = String(payment.transactionId || 'N/A');
      const invoicePaymentMethod = String(payment.paymentMethod || 'N/A');
      const invoiceStatusClass = 'completado';
      const invoiceAmountFormatted = invoiceAmount.toFixed(2);
      const transactionIdHtml = invoiceTransactionId !== 'N/A' ? '<p>ID de Transacción: ' + invoiceTransactionId + '</p>' : '';

      // Construir HTML usando concatenación en lugar de template strings
      const htmlParts = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '<meta charset="UTF-8">',
        '<title>Invoice ' + invoiceNumber + '</title>',
        '<style>body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; } .invoice { background: white; max-width: 800px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); } .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e5e5; padding-bottom: 20px; } .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; } .invoice-title { font-size: 18px; color: #666; } .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; } .client-info, .invoice-info { flex: 1; } .client-info h3, .invoice-info h3 { margin: 0 0 10px 0; color: #333; font-size: 16px; } .client-info p, .invoice-info p { margin: 5px 0; color: #666; font-size: 14px; } .service-details { margin-bottom: 30px; } .service-table { width: 100%; border-collapse: collapse; margin-top: 15px; } .service-table th, .service-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; } .service-table th { background: #f8f9fa; font-weight: bold; color: #333; } .service-table .amount { text-align: right; font-weight: bold; } .total { text-align: right; margin-top: 20px; } .total-amount { font-size: 20px; font-weight: bold; color: #2563eb; } .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; } .status.completado { background: #d1fae5; color: #065f46; } .status.pendiente { background: #fef3c7; color: #92400e; } .status.fallido { background: #fee2e2; color: #991b1b; } .status.cancelado { background: #f3f4f6; color: #374151; } .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5; padding-top: 20px; }</style>',
        '</head>',
        '<body>',
        '<div class="invoice">',
        '<div class="header">',
        '<div class="company-name">Gestor de Cobros</div>',
        '<div class="invoice-title">FACTURA</div>',
        '</div>',
        '<div class="invoice-details">',
        '<div class="client-info">',
        '<h3>Cliente</h3>',
        '<p><strong>' + invoiceClientName + '</strong></p>',
        '<p>' + invoiceClientEmail + '</p>',
        '</div>',
        '<div class="invoice-info">',
        '<h3>Detalles de la Factura</h3>',
        '<p><strong>Número:</strong> ' + invoiceNumber + '</p>',
        '<p><strong>Fecha:</strong> ' + invoiceDate + '</p>',
        '<p><strong>Vencimiento:</strong> ' + invoiceDueDate + '</p>',
        '<p><strong>Estado:</strong> <span class="status ' + invoiceStatusClass + '">' + invoiceStatus + '</span></p>',
        '</div>',
        '</div>',
        '<div class="service-details">',
        '<h3>Detalles del Servicio</h3>',
        '<table class="service-table">',
        '<thead>',
        '<tr><th>Servicio</th><th>Descripción</th><th>Monto</th></tr>',
        '</thead>',
        '<tbody>',
        '<tr>',
        '<td>' + invoiceServiceType + '</td>',
        '<td>' + invoiceDescription + '</td>',
        '<td class="amount">' + invoiceCurrency + ' ' + invoiceAmountFormatted + '</td>',
        '</tr>',
        '</tbody>',
        '</table>',
        '</div>',
        '<div class="total">',
        '<div class="total-amount">Total: ' + invoiceCurrency + ' ' + invoiceAmountFormatted + '</div>',
        '</div>',
        '<div class="footer">',
        '<p>Método de Pago: ' + invoicePaymentMethod + '</p>',
        '<p>Gateway: ' + invoiceGateway + '</p>',
        transactionIdHtml,
        '<p>Gracias por su negocio</p>',
        '</div>',
        '</div>',
        '</body>',
        '</html>'
      ];

      return htmlParts.join('');
    } catch (error) {
      console.error('Error en generateInvoiceHTML:', error);
      return '<html><body><p>Error generando factura</p></body></html>';
    }
  };

  const handleMessageSend = async (messageData) => {
    if (isDemo) {
      addNotification("Mensaje enviado (modo demo)", "success");
      return;
    }

    try {
      const payment = selectedPayment;
      if (!payment || !payment.id) {
        addNotification("No se encontró el pago seleccionado o falta el ID", "error");
        return;
      }

      // Si es aprobación, realizar acciones automáticas
      if (messageData.type === 'approval') {
        const paymentRef = doc(db, 'artifacts', appId, 'public', 'data', 'payments', payment.id);
        
        // 1. Actualizar pago a Completado
        await updateDoc(paymentRef, {
          status: 'Completado',
          completedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        // 2. Obtener datos actualizados del pago
        const paymentSnap = await getDoc(paymentRef);
        if (!paymentSnap.exists()) {
          addNotification("No se pudo encontrar el pago actualizado", "error");
          return;
        }
        
        const updatedPayment = { 
          id: payment.id, 
          ...paymentSnap.data(),
          // Asegurar que tenemos los campos necesarios con fallbacks
          clientName: paymentSnap.data().clientName || payment.clientName || 'Cliente',
          clientEmail: paymentSnap.data().clientEmail || payment.clientEmail || 'N/A',
          serviceNumber: paymentSnap.data().serviceNumber || payment.serviceNumber || 'N/A',
          serviceType: paymentSnap.data().serviceType || payment.serviceType || 'Servicio',
          description: paymentSnap.data().description || payment.description || 'Descripción del servicio',
          amount: paymentSnap.data().amount || payment.amount || 0,
          currency: paymentSnap.data().currency || payment.currency || 'USD',
          gateway: paymentSnap.data().gateway || payment.gateway || 'N/A',
          transactionId: paymentSnap.data().transactionId || payment.transactionId || 'N/A',
          paymentMethod: paymentSnap.data().paymentMethod || payment.paymentMethod || 'N/A',
          createdAt: paymentSnap.data().createdAt || payment.createdAt,
          dueDate: paymentSnap.data().dueDate || payment.dueDate
        };

        // 3. Generar invoice HTML
        let invoiceHTML;
        try {
          invoiceHTML = generateInvoiceHTML(updatedPayment);
        } catch (invoiceError) {
          console.error('Error generando invoice HTML:', invoiceError);
          // Invoice HTML básico de respaldo
          invoiceHTML = `
            <html>
              <body>
                <h1>Factura</h1>
                <p>Cliente: ${String(updatedPayment.clientName || 'Cliente')}</p>
                <p>Monto: ${String(updatedPayment.currency || 'USD')} ${Number(updatedPayment.amount || 0).toFixed(2)}</p>
                <p>Estado: Completado</p>
              </body>
            </html>
          `;
        }

        // 4. Actualizar servicio según el tipo
        const serviceId = updatedPayment.serviceId;
        if (serviceId) {
          try {
            const serviceRef = doc(db, 'artifacts', appId, 'public', 'data', 'services', serviceId);
            const serviceSnap = await getDoc(serviceRef);
            
            if (serviceSnap.exists()) {
              const service = serviceSnap.data();
              const updates = { updatedAt: Timestamp.now() };

              // Si es servicio de ciclo (renovación)
              if (updatedPayment.isRenewal || updatedPayment.paymentType === 'Renovación') {
                if (updatedPayment.startDate) {
                  updates.dueDate = updatedPayment.startDate; // Timestamp
                }
                if (updatedPayment.endDate) {
                  updates.expirationDate = updatedPayment.endDate; // Timestamp
                }
                updates.status = 'Activo';
              } 
              // Si es servicio de único pago
              else if (service.billingCycle === 'One-Time' || updatedPayment.paymentType === 'Pago Único') {
                updates.paidDate = Timestamp.now();
                updates.status = 'Completado';
              }

              if (Object.keys(updates).length > 1) { // Más de solo updatedAt
                await updateDoc(serviceRef, updates);
              }
            }
          } catch (serviceError) {
            console.error('Error actualizando servicio después de aprobación:', serviceError);
            // No fallar todo el proceso si falla la actualización del servicio
          }
        }

        // 5. Aquí se enviaría el mensaje con el invoice adjunto
        // Por ahora guardamos el invoice en el mensaje para referencia futura
        messageData.invoiceHTML = invoiceHTML;
        messageData.invoiceNumber = `INV-${payment.id.slice(-8).toUpperCase()}`;
        
        console.log("Mensaje de aprobación enviado con invoice:", {
          paymentId: payment.id,
          invoiceNumber: messageData.invoiceNumber,
          message: messageData.message
        });
      }

      // Envío real del mensaje (email, notificación, etc.)
      // TODO: Integrar con servicio de emails o notificaciones
      console.log("Mensaje enviado:", messageData);
      
      addNotification(
        messageData.type === 'approval' 
          ? "Pago aprobado, servicio actualizado e invoice enviado exitosamente" 
          : "Mensaje enviado exitosamente", 
        "success"
      );
      
      // Cerrar modal y refrescar datos
      setMessageModalOpen(false);
      setSelectedPayment(null);
      
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      addNotification("Error al enviar el mensaje", "error");
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Procesando': 'bg-blue-100 text-blue-800',
      'Completado': 'bg-green-100 text-green-800',
      'Fallido': 'bg-red-100 text-red-800',
      'Cancelado': 'bg-gray-100 text-gray-800',
      'Reembolsado': 'bg-purple-100 text-purple-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getGatewayColor = (gateway) => {
    const gatewayMap = {
      'Bold': 'bg-blue-100 text-blue-800',
      'PayPal': 'bg-yellow-100 text-yellow-800',
      'PayU': 'bg-green-100 text-green-800',
      'Transferencia Bancaria': 'bg-purple-100 text-purple-800',
      'Manual': 'bg-gray-100 text-gray-800'
    };
    return gatewayMap[gateway] || 'bg-gray-100 text-gray-800';
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

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

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
          <CreditCardIcon />
          Gestión de Pagos
        </h2>
      </div>

      {/* Subpestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSubTab('history')}
            className={`${
              activeSubTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <CreditCardIcon />
            Historial de Pagos
          </button>
          <button
            onClick={() => setActiveSubTab('renewal')}
            className={`${
              activeSubTab === 'renewal'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <CalendarIcon />
            Renovaciones
          </button>
          {userRole === 'superadmin' && (
            <button
              onClick={() => setActiveSubTab('config')}
              className={`${
                activeSubTab === 'config'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <SettingsIcon />
              Configuración
            </button>
          )}
        </nav>
      </div>

      {activeSubTab === 'renewal' ? (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Configuración de Renovaciones</h3>
          <RenewalConfigDashboard isDemo={isDemo} />
        </div>
      ) : activeSubTab === 'config' ? (
        <PaymentConfigDashboard isDemo={isDemo} />
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="text-sm text-gray-500">
              {filteredPayments.length} pago{filteredPayments.length !== 1 ? 's' : ''} encontrado{filteredPayments.length !== 1 ? 's' : ''}
            </div>
          </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por servicio, cliente, email o transacción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {paymentStatusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <select
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {gatewayOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            <FilterIcon />
            Filtros
          </button>
        </div>
      </div>

      {/* Tabla de Pagos */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              {['Servicio', 'Cliente', 'Monto', 'Estado', 'Pasarela', 'Transacción', 'Fecha', 'Acciones'].map(header => (
                <th key={header} className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPayments.map(payment => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-mono text-sm font-medium text-blue-600">
                    {payment.serviceNumber || payment.id}
                  </div>
                  <div className="text-sm text-gray-600">
                    {payment.serviceName || payment.serviceType || 'N/A'}
                  </div>
                  {payment.serviceDescription && (
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {payment.serviceDescription}
                    </div>
                  )}
                  {payment.isRenewal && (
                    <div className="text-xs text-green-600 font-medium">
                      Renovación: {payment.renewalPeriod || 'N/A'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{payment.clientName}</div>
                  <div className="text-sm text-gray-500">{payment.clientEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">
                    {formatAmount(payment.amount, payment.currency)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGatewayColor(payment.gateway)}`}>
                    {payment.gateway}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-mono text-sm text-gray-600">
                    {payment.transactionId || 'N/A'}
                  </div>
                  {payment.proofUrl && (
                    <div className="mt-2">
                      <button
                        onClick={() => { setSelectedPayment(payment); setProofModalOpen(true); }}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Ver Comprobante
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 flex items-center gap-2">
                    {formatDate(payment.createdAt)}
                    {payment.proofUrl && (
                      <span className="ml-2 inline-flex px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700" title="Comprobante adjunto">
                        Comprobante
                      </span>
                    )}
                  </div>
                  {payment.completedAt && (
                    <div className="text-xs text-gray-500">
                      Completado: {formatDate(payment.completedAt)}
                    </div>
                  )}
                  {payment.startDate && payment.endDate && (
                    <div className="text-xs text-blue-600 mt-1">
                      <div>Inicio: {formatDate(payment.startDate)}</div>
                      <div>Fin: {formatDate(payment.endDate)}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    {payment.proofUrl && (
                      <button
                        onClick={() => { setSelectedPayment(payment); setProofModalOpen(true); }}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                        title="Ver comprobante de pago"
                      >
                        <EyeIcon />
                      </button>
                    )}
                    {userRole === 'superadmin' && (
                      <>
                        <ActionDropdown>
                          <select
                            value={payment.status}
                            onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-none bg-transparent"
                          >
                            {paymentStatusOptions.filter(opt => opt !== 'Todos').map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => downloadInvoice(payment)}
                            className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center"
                          >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Descargar Invoice
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50">
                            Ver Detalles
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50">
                            Reembolsar
                          </button>
                          <button 
                            onClick={() => handleDeletePayment(payment.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Eliminar Pago
                          </button>
                        </ActionDropdown>
                        
                        {/* Botones de mensajes */}
                        <button
                          onClick={() => handleSendMessage(payment, 'approval')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          title="Enviar mensaje de aprobación"
                        >
                          <CheckIcon />
                        </button>
                        <button
                          onClick={() => handleSendMessage(payment, 'rejection')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Enviar mensaje de rechazo"
                        >
                          <XIcon />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

          {filteredPayments.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pagos</h3>
              <p className="text-gray-500">No hay pagos que coincidan con los filtros seleccionados.</p>
            </div>
          )}
        </>
      )}

      {/* Modal de mensajes */}
      <PaymentMessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        payment={selectedPayment}
        onSend={handleMessageSend}
        isDemo={isDemo}
      />

      {/* Modal de comprobante */}
      {proofModalOpen && selectedPayment?.proofUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="text-lg font-semibold text-gray-800">Comprobante de Pago</h3>
              <button onClick={() => setProofModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4">
              <img src={selectedPayment.proofUrl} alt="Comprobante" className="max-w-full h-auto rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPaymentsDashboard;
