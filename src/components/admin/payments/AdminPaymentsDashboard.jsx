import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { collection, onSnapshot, query, orderBy, where, doc, updateDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { CreditCardIcon, SearchIcon, FilterIcon, SettingsIcon, CalendarIcon, EyeIcon, TrashIcon } from '../../icons';
import ActionDropdown from '../../common/ActionDropdown';
import PaymentConfigDashboard from './PaymentConfigDashboard';
import RenewalConfigDashboard from './RenewalConfigDashboard';
import { jsPDF } from 'jspdf';

function AdminPaymentsDashboard({ isDemo, userRole }) {
  const { addNotification } = useNotification();
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [gatewayFilter, setGatewayFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('history');
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

  // Función para obtener tasa de cambio USD a COP para una fecha específica
  const getExchangeRate = async (date, paymentData = null) => {
    try {
      // Si el pago ya tiene la tasa guardada, usarla
      if (paymentData?.exchangeRate) {
        return Number(paymentData.exchangeRate);
      }

      // Formatear fecha para la API (YYYY-MM-DD)
      const dateObj = date instanceof Date ? date : new Date(date);
      const dateStr = dateObj.toISOString().split('T')[0];

      // Intentar obtener tasa histórica desde exchangerate.host (gratuita)
      // Para fechas históricas, usa la API de exchangerate.host
      try {
        // Si la fecha es hoy o muy reciente, usar API de tasa actual
        const today = new Date();
        const daysDiff = Math.floor((today - dateObj) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) {
          // Para fechas recientes, obtener tasa actual (la diferencia será mínima)
          const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=COP');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.rates && data.rates.COP) {
              return Number(data.rates.COP);
            }
          }
        } else {
          // Para fechas históricas, intentar obtener tasa histórica
          const response = await fetch(`https://api.exchangerate.host/${dateStr}?base=USD&symbols=COP`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.rates && data.rates.COP) {
              return Number(data.rates.COP);
            }
          }
        }
      } catch (apiError) {
        console.warn('Error obteniendo tasa de cambio de API:', apiError);
      }

      // Fallback: Tasa aproximada (promedio histórico USD/COP ~4000)
      // El usuario puede actualizar esto con una tasa más precisa si es necesario
      console.warn('Usando tasa de cambio predeterminada (4000 COP/USD). Para tasas históricas precisas, configure una API key.');
      return 4000;
    } catch (error) {
      console.error('Error en getExchangeRate:', error);
      return 4000; // Tasa predeterminada
    }
  };

  // Función para generar PDF del invoice
  const generateInvoicePDF = async (payment) => {
    try {
      if (!payment || !payment.id) {
        console.error('Payment inválido para generar invoice:', payment);
        return;
      }

      const paymentId = String(payment.id || '');
      const invoiceNumber = 'INV-' + paymentId.slice(-8).toUpperCase();
      const paymentDate = payment.createdAt?.seconds ? new Date(payment.createdAt.seconds * 1000) : new Date();
      const invoiceDate = paymentDate.toLocaleDateString('es-ES');
      const invoiceDueDate = payment.dueDate ? new Date(payment.dueDate.seconds * 1000).toLocaleDateString('es-ES') : 'N/A';
      const invoiceClientName = String(payment.clientName || 'Cliente');
      const invoiceClientEmail = String(payment.clientEmail || 'N/A');
      const invoiceServiceNumber = String(payment.serviceNumber || 'N/A');
      const invoiceServiceType = String(payment.serviceType || 'Servicio');
      const invoiceDescription = String(payment.description || 'Descripción del servicio');
      const invoiceAmount = Number(payment.amount || 0);
      const invoiceCurrency = String(payment.currency || 'USD');
      const invoiceGateway = String(payment.gateway || 'N/A');
      const invoiceTransactionId = String(payment.transactionId || 'N/A');
      const invoicePaymentMethod = String(payment.paymentMethod || 'N/A');

      // Convertir a COP solo si la moneda original es USD
      // Si ya está en COP, mostrar directamente en COP
      let finalAmount = invoiceAmount;
      let finalCurrency = invoiceCurrency;
      let originalAmount = null;
      let exchangeRate = null;
      let exchangeRateDate = null;

      // Solo convertir si el pago está en USD
      if (invoiceCurrency && invoiceCurrency.toUpperCase() === 'USD') {
        exchangeRate = await getExchangeRate(paymentDate, payment);
        exchangeRateDate = paymentDate.toLocaleDateString('es-ES');
        originalAmount = invoiceAmount;
        finalAmount = invoiceAmount * exchangeRate;
        finalCurrency = 'COP';
      } else if (invoiceCurrency && invoiceCurrency.toUpperCase() === 'COP') {
        // Si ya está en COP, mantener COP
        finalCurrency = 'COP';
      } else {
        // Si no tiene moneda definida, asumir USD y convertir
        console.warn('Pago sin moneda definida, asumiendo USD');
        exchangeRate = await getExchangeRate(paymentDate, payment);
        exchangeRateDate = paymentDate.toLocaleDateString('es-ES');
        originalAmount = invoiceAmount;
        finalAmount = invoiceAmount * exchangeRate;
        finalCurrency = 'COP';
      }

      const finalAmountFormatted = finalAmount.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const originalAmountFormatted = originalAmount ? originalAmount.toFixed(2) : null;
      const exchangeRateFormatted = exchangeRate ? exchangeRate.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;

      const pdf = new jsPDF();
      let yPos = 20;

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(37, 99, 235); // Blue
      pdf.text('Gestor de Cobros', 105, yPos, { align: 'center' });
      yPos += 10;
      pdf.setFontSize(18);
      pdf.setTextColor(102, 102, 102);
      pdf.text('FACTURA', 105, yPos, { align: 'center' });
      yPos += 20;

      // Invoice details
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text('Cliente:', 20, yPos);
      pdf.setFont(undefined, 'normal');
      pdf.text(invoiceClientName, 60, yPos);
      yPos += 7;
      pdf.text(invoiceClientEmail, 60, yPos);
      yPos += 15;

      pdf.setFont(undefined, 'bold');
      pdf.text('Detalles de la Factura:', 20, yPos);
      yPos += 7;
      pdf.setFont(undefined, 'normal');
      pdf.text('Número: ' + invoiceNumber, 20, yPos);
      yPos += 7;
      pdf.text('Fecha: ' + invoiceDate, 20, yPos);
      yPos += 7;
      pdf.text('Vencimiento: ' + invoiceDueDate, 20, yPos);
      yPos += 7;
      pdf.text('Estado: Completado', 20, yPos);
      yPos += 15;

      // Service details
      pdf.setFont(undefined, 'bold');
      pdf.text('Detalles del Servicio:', 20, yPos);
      yPos += 10;

      // Table header
      pdf.setFillColor(248, 249, 250);
      pdf.rect(20, yPos - 5, 170, 8, 'F');
      pdf.setFont(undefined, 'bold');
      pdf.text('Servicio', 25, yPos);
      pdf.text('Descripción', 70, yPos);
      pdf.text('Monto', 165, yPos, { align: 'right' });
      yPos += 10;

      // Table row
      pdf.setFont(undefined, 'normal');
      pdf.text(invoiceServiceType, 25, yPos);
      pdf.text(invoiceDescription.substring(0, 35), 70, yPos);
      pdf.text(finalCurrency + ' ' + finalAmountFormatted, 165, yPos, { align: 'right' });
      yPos += 10;

      // Si hubo conversión, mostrar información
      if (originalAmount && exchangeRate) {
        pdf.setFontSize(8);
        pdf.setTextColor(102, 102, 102);
        pdf.text('Equivale a USD ' + originalAmountFormatted + ' (Tasa: ' + exchangeRateFormatted + ' COP/USD del ' + exchangeRateDate + ')', 165, yPos, { align: 'right' });
        yPos += 10;
      }

      // Total
      yPos += 5;
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text('Total: ' + finalCurrency + ' ' + finalAmountFormatted, 165, yPos, { align: 'right' });
      yPos += 20;

      // Footer
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.setFont(undefined, 'normal');
      pdf.text('Método de Pago: ' + invoicePaymentMethod, 20, yPos);
      yPos += 6;
      pdf.text('Gateway: ' + invoiceGateway, 20, yPos);
      yPos += 6;
      if (invoiceTransactionId !== 'N/A') {
        pdf.text('ID de Transacción: ' + invoiceTransactionId, 20, yPos);
        yPos += 6;
      }
      pdf.text('Gracias por su negocio', 105, yPos, { align: 'center' });

      // Guardar PDF
      pdf.save('invoice-' + invoiceNumber + '.pdf');
      return pdf;
    } catch (error) {
      console.error('Error generando PDF:', error);
      addNotification('Error al generar el PDF del invoice', 'error');
      return null;
    }
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    if (isDemo) {
      addNotification("Función no disponible en modo demo", "error");
      return;
    }

    try {
      const paymentRef = doc(db, 'artifacts', appId, 'public', 'data', 'payments', paymentId);
      
      // Obtener datos del pago antes de actualizar
      const paymentSnap = await getDoc(paymentRef);
      if (!paymentSnap.exists()) {
        addNotification("No se encontró el pago", "error");
        return;
      }

      const currentPayment = { id: paymentId, ...paymentSnap.data() };

      // Actualizar estado del pago
      await updateDoc(paymentRef, { 
        status: newStatus,
        updatedAt: Timestamp.now(),
        ...(newStatus === 'Completado' ? { completedAt: Timestamp.now() } : {})
      });

      // Si el pago quedó Completado, realizar acciones adicionales
      if (newStatus === 'Completado') {
        // 1. Generar invoice PDF
        const updatedPaymentSnap = await getDoc(paymentRef);
        const updatedPayment = { 
          id: paymentId, 
          ...updatedPaymentSnap.data(),
          // Asegurar campos necesarios con fallbacks
          clientName: updatedPaymentSnap.data().clientName || currentPayment.clientName || 'Cliente',
          clientEmail: updatedPaymentSnap.data().clientEmail || currentPayment.clientEmail || 'N/A',
          serviceNumber: updatedPaymentSnap.data().serviceNumber || currentPayment.serviceNumber || 'N/A',
          serviceType: updatedPaymentSnap.data().serviceType || currentPayment.serviceType || 'Servicio',
          description: updatedPaymentSnap.data().description || currentPayment.description || 'Descripción del servicio',
          amount: updatedPaymentSnap.data().amount || currentPayment.amount || 0,
          currency: updatedPaymentSnap.data().currency || currentPayment.currency || 'USD',
          gateway: updatedPaymentSnap.data().gateway || currentPayment.gateway || 'N/A',
          transactionId: updatedPaymentSnap.data().transactionId || currentPayment.transactionId || 'N/A',
          paymentMethod: updatedPaymentSnap.data().paymentMethod || currentPayment.paymentMethod || 'N/A',
          createdAt: updatedPaymentSnap.data().createdAt || currentPayment.createdAt,
          dueDate: updatedPaymentSnap.data().dueDate || currentPayment.dueDate
        };
        
        await generateInvoicePDF(updatedPayment);

        // 2. Actualizar servicio según el tipo
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
            console.error('Error actualizando servicio después de completar pago:', serviceError);
            // No fallar todo el proceso si falla la actualización del servicio
          }
        }

        addNotification(`Pago completado, servicio actualizado e invoice generado`, "success");
      } else {
        addNotification(`Estado del pago actualizado a ${newStatus}`, "success");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      addNotification("Error al actualizar el estado del pago", "error");
    }
  };


  // Generar y descargar invoice PDF
  const downloadInvoice = async (payment) => {
    try {
      await generateInvoicePDF(payment);
      addNotification('Invoice PDF descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error descargando invoice:', error);
      addNotification('Error al generar el invoice PDF', 'error');
    }
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

      {/* Modal de comprobante */}
      {proofModalOpen && selectedPayment?.proofUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="text-lg font-semibold text-gray-800">Comprobante de Pago</h3>
              <button
                onClick={() => {
                  setProofModalOpen(false);
                  setSelectedPayment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
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
