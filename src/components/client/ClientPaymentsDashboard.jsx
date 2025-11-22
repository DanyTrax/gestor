import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import { CreditCardIcon, SearchIcon, EyeIcon, TrashIcon } from '../icons';
import BankTransferInstructions from '../payments/BankTransferInstructions';

function ClientPaymentsDashboard({ user, userProfile }) {
  const { addNotification } = useNotification();
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showTransferInstructions, setShowTransferInstructions] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [uploadingProofById, setUploadingProofById] = useState({});
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofImageUrl, setProofImageUrl] = useState(null);

  const getGatewaysConfig = () => {
    if (!paymentConfig) return null;
    if (paymentConfig.gateways) return paymentConfig.gateways;
    // Compatibilidad: configuración guardada por PaymentConfigDashboard (sin "gateways")
    const { bold, paypal, payu, bankTransfer } = paymentConfig;
    const gw = {};
    if (bold) gw.bold = { name: 'Bold', ...bold };
    if (paypal) gw.paypal = { name: 'PayPal', ...paypal };
    if (payu) gw.payu = { name: 'PayU', ...payu };
    if (bankTransfer) gw.bankTransfer = { name: 'Transferencia Bancaria', ...bankTransfer };
    return gw;
  };

  const paymentStatusOptions = ['Todos', 'Pendiente', 'Procesando', 'Completado', 'Fallido', 'Cancelado', 'Reembolsado'];

  // Cargar configuraciones de medios de pago
  useEffect(() => {
    if (isDemo) {
      setPaymentConfig({
        gateways: {
          bold: { enabled: true, name: 'Bold', autoApprove: false },
          paypal: { enabled: true, name: 'PayPal', autoApprove: false },
          payu: { enabled: true, name: 'PayU', autoApprove: false },
          bankTransfer: { enabled: true, name: 'Transferencia Bancaria', autoApprove: false }
        },
        bankAccounts: [
          { id: '1', bank: 'Banco Nacional', accountNumber: '1234567890', accountHolder: 'Mi Empresa' },
          { id: '2', bank: 'Banco Popular', accountNumber: '0987654321', accountHolder: 'Mi Empresa' }
        ]
      });
      return;
    }

    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'paymentConfig');
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setPaymentConfig(doc.data());
        console.log('Payment config loaded:', doc.data());
      } else {
        console.log('No payment config found, using defaults');
        setPaymentConfig({
          gateways: {
            bold: { enabled: true, name: 'Bold', autoApprove: false },
            paypal: { enabled: true, name: 'PayPal', autoApprove: false },
            payu: { enabled: true, name: 'PayU', autoApprove: false },
            bankTransfer: { enabled: true, name: 'Transferencia Bancaria', autoApprove: false }
          },
          bankAccounts: []
        });
      }
    }, (error) => {
      console.error('Error loading payment config:', error);
    });

    return () => unsubscribe();
  }, [isDemo]);

  useEffect(() => {
    if (isDemo) {
      setPayments([
        {
          id: 'demo1',
          serviceNumber: 'SRV-241017-123456',
          serviceType: 'Hosting',
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
          serviceType: 'Dominio',
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
          serviceType: 'Hosting Premium',
          amount: 50.00,
          currency: 'USD',
          status: 'Completado',
          gateway: 'Transferencia Bancaria',
          transactionId: 'TRF-123456789',
          createdAt: { seconds: Date.now() / 1000 - 10800 },
          completedAt: { seconds: Date.now() / 1000 - 9000 }
        }
      ]);
      
      // Datos de demo para cuentas bancarias
      setBankAccounts([
        {
          id: '1',
          bankName: 'Banco Nacional',
          accountNumber: '1234567890',
          accountHolder: 'Empresa Demo',
          accountType: 'Ahorros'
        },
        {
          id: '2',
          bankName: 'Banco Popular',
          accountNumber: '0987654321',
          accountHolder: 'Empresa Demo',
          accountType: 'Corriente'
        }
      ]);
      
      setLoading(false);
      return;
    }

    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Cargar pagos del usuario actual
    const paymentsQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'payments'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Payments loaded:', paymentsData.length, paymentsData);
      
      // Ordenar por fecha de creación en el cliente para evitar necesidad de índice compuesto
      paymentsData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA; // Orden descendente (más recientes primero)
      });
      
      setPayments(paymentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading payments:', error);
      addNotification('Error al cargar los pagos', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, isDemo, addNotification]);

  // Cargar cuentas bancarias
  useEffect(() => {
    if (isDemo) return;

    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'paymentConfig');
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        const config = doc.data();
        if (config.bankTransfer?.accounts) {
          setBankAccounts(config.bankTransfer.accounts);
        }
      }
    });

    return () => unsubscribe();
  }, [isDemo]);

  const filteredPayments = payments.filter(payment => {
    // Filtro de búsqueda - más permisivo
    const matchesSearch = searchTerm === '' || 
      (payment.serviceNumber && payment.serviceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.serviceType && payment.serviceType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.serviceName && payment.serviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.transactionId && payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro de estado
    const matchesStatus = statusFilter === 'Todos' || payment.status === statusFilter;

    const result = matchesSearch && matchesStatus;
    console.log('Payment filter:', {
      payment: payment.id,
      serviceType: payment.serviceType,
      serviceName: payment.serviceName,
      status: payment.status,
      searchTerm,
      statusFilter,
      matchesSearch,
      matchesStatus,
      result
    });

    return result;
  });

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

  // Generar y descargar invoice
  const downloadInvoice = (payment) => {
    const invoiceData = {
      invoiceNumber: `INV-${payment.id.slice(-8).toUpperCase()}`,
      date: new Date(payment.createdAt.seconds * 1000).toLocaleDateString(),
      dueDate: payment.dueDate ? new Date(payment.dueDate.seconds * 1000).toLocaleDateString() : 'N/A',
      clientName: payment.clientName || userProfile?.fullName || 'Cliente',
      clientEmail: payment.clientEmail || user?.email || 'N/A',
      serviceNumber: payment.serviceNumber || 'N/A',
      serviceType: payment.serviceType || 'Servicio',
      description: payment.description || 'Descripción del servicio',
      amount: payment.amount || 0,
      currency: payment.currency || 'USD',
      status: payment.status || 'Pendiente',
      gateway: payment.gateway || 'N/A',
      transactionId: payment.transactionId || 'N/A',
      paymentMethod: payment.paymentMethod || 'N/A'
    };

    // Crear contenido HTML del invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .invoice { background: white; max-width: 800px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e5e5; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
          .invoice-title { font-size: 18px; color: #666; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .client-info, .invoice-info { flex: 1; }
          .client-info h3, .invoice-info h3 { margin: 0 0 10px 0; color: #333; font-size: 16px; }
          .client-info p, .invoice-info p { margin: 5px 0; color: #666; font-size: 14px; }
          .service-details { margin-bottom: 30px; }
          .service-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .service-table th, .service-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
          .service-table th { background: #f8f9fa; font-weight: bold; color: #333; }
          .service-table .amount { text-align: right; font-weight: bold; }
          .total { text-align: right; margin-top: 20px; }
          .total-amount { font-size: 20px; font-weight: bold; color: #2563eb; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status.completado { background: #d1fae5; color: #065f46; }
          .status.pendiente { background: #fef3c7; color: #92400e; }
          .status.fallido { background: #fee2e2; color: #991b1b; }
          .status.cancelado { background: #f3f4f6; color: #374151; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="company-name">Gestor de Cobros</div>
            <div class="invoice-title">FACTURA</div>
          </div>
          
          <div class="invoice-details">
            <div class="client-info">
              <h3>Cliente</h3>
              <p><strong>${invoiceData.clientName}</strong></p>
              <p>${invoiceData.clientEmail}</p>
            </div>
            <div class="invoice-info">
              <h3>Detalles de la Factura</h3>
              <p><strong>Número:</strong> ${invoiceData.invoiceNumber}</p>
              <p><strong>Fecha:</strong> ${invoiceData.date}</p>
              <p><strong>Vencimiento:</strong> ${invoiceData.dueDate}</p>
              <p><strong>Estado:</strong> <span class="status ${invoiceData.status.toLowerCase()}">${invoiceData.status}</span></p>
            </div>
          </div>
          
          <div class="service-details">
            <h3>Detalles del Servicio</h3>
            <table class="service-table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${invoiceData.serviceType}</td>
                  <td>${invoiceData.description}</td>
                  <td class="amount">${invoiceData.currency} ${invoiceData.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="total">
            <div class="total-amount">Total: ${invoiceData.currency} ${invoiceData.amount.toFixed(2)}</div>
          </div>
          
          <div class="footer">
            <p>Método de Pago: ${invoiceData.paymentMethod}</p>
            <p>Gateway: ${invoiceData.gateway}</p>
            ${invoiceData.transactionId !== 'N/A' ? `<p>ID de Transacción: ${invoiceData.transactionId}</p>` : ''}
            <p>Gracias por su negocio</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Crear y descargar el archivo
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceData.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification('Invoice descargado exitosamente', 'success');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completado':
        return '✅';
      case 'Pendiente':
        return '⏳';
      case 'Procesando':
        return '🔄';
      case 'Fallido':
        return '❌';
      case 'Cancelado':
        return '🚫';
      case 'Reembolsado':
        return '↩️';
      default:
        return '❓';
    }
  };

  const handleShowTransferInstructions = (payment) => {
    setSelectedPayment(payment);
    setShowTransferInstructions(true);
  };

  const handlePaymentMethod = async (payment, gatewayKey) => {
    const gateways = getGatewaysConfig();
    const gateway = gateways?.[gatewayKey];
    if (!gateway) return;

    if (gatewayKey === 'bankTransfer') {
      // Si el pago aún no tiene el gateway definitivo, actualizar en Firestore
      if (payment.gateway !== 'Transferencia Bancaria') {
        try {
          const paymentRef = doc(db, 'artifacts', appId, 'public', 'data', 'payments', payment.id);
          await updateDoc(paymentRef, {
            gateway: 'Transferencia Bancaria',
            updatedAt: new Date(),
          });
          addNotification('Pasarela cambiada a Transferencia Bancaria', 'success');
        } catch (err) {
          addNotification('No se pudo actualizar la pasarela del pago', 'error');
        }
      }
      handleShowTransferInstructions({ ...payment, gateway: 'Transferencia Bancaria' });
    } else {
      // Aquí se integraría con la pasarela de pago real
      addNotification(`Redirigiendo a ${gateway.name} para procesar el pago`, 'info');
      // TODO: Implementar integración real con pasarelas de pago
    }
  };

  const handleUploadProof = async (payment, file) => {
    if (!file || !payment?.id) {
      addNotification('Selecciona una imagen válida', 'warning');
      return;
    }
    try {
      setUploadingProofById(prev => ({ ...prev, [payment.id]: true }));
      console.log('🔄 Iniciando subida de comprobante vía PHP...');
      
      const form = new FormData();
      form.append('file', file);
      
      // Ruta absoluta desde la raíz del dominio (funciona en /dist/ y raíz)
      const uploadUrl = window.location.origin + '/upload.php';
      console.log('📤 Enviando a:', uploadUrl);
      
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: form,
      });
      
      console.log('📥 Respuesta recibida:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`upload_failed_${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log('✅ Respuesta JSON:', data);
      
      const url = data?.url;
      if (!url) {
        console.error('❌ No se recibió URL en la respuesta:', data);
        throw new Error('missing_url');
      }
      
      const paymentRef = doc(db, 'artifacts', appId, 'public', 'data', 'payments', payment.id);
      await updateDoc(paymentRef, { 
        proofUrl: url, 
        proofUploadedAt: new Date(),
        status: 'Procesando' // Cambiar a Procesando cuando se sube el comprobante
      });
      console.log('✅ Comprobante guardado en Firestore:', url);
      
      // Actualizar UI local inmediata
      setSelectedPayment(prev => prev && prev.id === payment.id ? { ...prev, proofUrl: url, status: 'Procesando' } : prev);
      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, proofUrl: url, status: 'Procesando' } : p));
      setShowTransferInstructions(false);
      addNotification('Comprobante subido correctamente', 'success');
    } catch (e) {
      console.error('❌ Upload proof failed:', e);
      addNotification(`No se pudo subir el comprobante: ${e.message}`, 'error');
    } finally {
      setUploadingProofById(prev => ({ ...prev, [payment.id]: false }));
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCardIcon />
          Mis Pagos
        </h2>
        <div className="text-sm text-gray-500">
          {filteredPayments.length} pago{filteredPayments.length !== 1 ? 's' : ''} encontrado{filteredPayments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por servicio o transacción..."
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
        </div>
      </div>

      {/* Resumen de Pagos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-500">Total Pagado</div>
          <div className="text-2xl font-bold text-green-600">
            {formatAmount(
              payments
                .filter(p => p.status === 'Completado')
                .reduce((sum, p) => sum + (p.amount || 0), 0),
              'USD'
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-500">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-600">
            {payments.filter(p => p.status === 'Pendiente').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-500">Completados</div>
          <div className="text-2xl font-bold text-green-600">
            {payments.filter(p => p.status === 'Completado').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-500">Fallidos</div>
          <div className="text-2xl font-bold text-red-600">
            {payments.filter(p => p.status === 'Fallido').length}
          </div>
        </div>
      </div>

      {/* Lista de Pagos */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes pagos registrados</h3>
          <p className="text-gray-500">Los pagos aparecerán aquí una vez que realices una transacción.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map(payment => (
            <div key={payment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getStatusIcon(payment.status)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {payment.serviceName || payment.serviceType || 'Servicio'}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">
                        {payment.serviceNumber || payment.id}
                      </p>
                      {payment.serviceDescription && (
                        <p className="text-xs text-gray-400 mt-1">
                          {payment.serviceDescription}
                        </p>
                      )}
                      {payment.isRenewal && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          Renovación: {payment.renewalPeriod || 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <span className="text-sm text-gray-500">Monto:</span>
                      <div className="font-semibold text-lg text-gray-900">
                        {formatAmount(payment.amount, payment.currency)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Estado:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Pasarela:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGatewayColor(payment.gateway)}`}>
                          {payment.gateway}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    <div>Fecha: {formatDate(payment.createdAt)}</div>
                    {payment.completedAt && (
                      <div>Completado: {formatDate(payment.completedAt)}</div>
                    )}
                    {payment.startDate && payment.endDate && (
                      <div className="text-blue-600 mt-2">
                        <div>Período: {formatDate(payment.startDate)} - {formatDate(payment.endDate)}</div>
                      </div>
                    )}
                    {payment.transactionId && (
                      <div className="font-mono">ID: {payment.transactionId}</div>
                    )}
                    {payment.isRenewal && payment.renewalMonths && (
                      <div className="text-green-600">Duración: {payment.renewalMonths} meses</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-4 flex flex-wrap gap-2">
                  {(payment.status === 'Completado' || payment.status === 'Fallido' || payment.status === 'Cancelado') && (
                    <button 
                      onClick={() => downloadInvoice(payment)}
                      className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Descargar Invoice
                    </button>
                  )}
                  {payment.status === 'Pendiente' && (
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const gws = getGatewaysConfig();
                        if (!gws) return null;
                        return Object.entries(gws).map(([key, gateway]) => {
                        if (!gateway.enabled) return null;
                        return (
                          <button
                            key={key}
                            onClick={() => handlePaymentMethod(payment, key)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Pagar con {gateway.name}
                          </button>
                        );
                        });
                      })()}
                    </div>
                  )}
                  {payment.gateway === 'Transferencia Bancaria' && (
                    <div className="flex flex-wrap gap-2 items-center">
                      {payment.status === 'Pendiente' && (
                        <label className={`px-4 py-2 ${uploadingProofById[payment.id] ? 'bg-gray-200 text-gray-400 cursor-wait' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer'} rounded-lg text-sm`}>
                          {uploadingProofById[payment.id] ? 'Subiendo...' : 'Subir Comprobante'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleUploadProof(payment, e.target.files[0])}
                          />
                        </label>
                      )}
                      {payment.proofUrl && (
                        <button
                          onClick={() => {
                            setProofImageUrl(payment.proofUrl);
                            setShowProofModal(true);
                          }}
                          className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm"
                        >
                          Ver Comprobante
                        </button>
                      )}
                      {payment.status === 'Procesando' && (
                        <span className="text-sm text-blue-600 font-medium">
                          Comprobante en revisión
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de instrucciones de transferencia */}
      {showTransferInstructions && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Instrucciones de Transferencia</h3>
                <button
                  onClick={() => setShowTransferInstructions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <BankTransferInstructions
                bankAccounts={bankAccounts}
                serviceNumber={selectedPayment.serviceNumber}
                amount={selectedPayment.amount}
                currency={selectedPayment.currency}
                onUpload={(file) => handleUploadProof(selectedPayment, file)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualización de comprobante */}
      {showProofModal && proofImageUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4"
          onClick={() => setShowProofModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Comprobante de Pago</h3>
              <button
                onClick={() => setShowProofModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100 flex justify-center items-center min-h-[400px]">
              <img
                src={proofImageUrl}
                alt="Comprobante de pago"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo se pudo cargar la imagen%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <a
                href={proofImageUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Abrir en Nueva Pestaña
              </a>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = proofImageUrl;
                  link.download = `comprobante-${Date.now()}.${proofImageUrl.split('.').pop().split('?')[0]}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Descargar
              </button>
              <button
                onClick={() => setShowProofModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientPaymentsDashboard;
