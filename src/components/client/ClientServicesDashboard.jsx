import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { collection, onSnapshot, query, where, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import { ServicesIcon, CreditCardIcon, EyeIcon, CalendarIcon } from '../icons';
import PaymentConfirmationModal from '../common/PaymentConfirmationModal';

function ClientServicesDashboard({ user, userProfile }) {
  const { addNotification } = useNotification();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPayments, setGeneratingPayments] = useState(new Set());
  const [pendingPayments, setPendingPayments] = useState(new Set());
  const [pendingPaymentsByService, setPendingPaymentsByService] = useState({});
  const [renewalConfig, setRenewalConfig] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, service: null });
  const [paymentConfig, setPaymentConfig] = useState(null);

  // Calcular fecha de vencimiento basada en el ciclo
  const calculateExpirationDate = (service) => {
    if (!service.dueDate || !service.billingCycle || service.billingCycle === 'One-Time') {
      return service.expirationDate ? new Date(service.expirationDate.seconds * 1000) : null;
    }

    const startDate = new Date(service.dueDate.seconds * 1000);
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
        return null;
    }

    return endDate;
  };

  // Función para formatear fecha para mostrar
  const formatExpirationDate = (service) => {
    const date = calculateExpirationDate(service);
    return date ? date.toLocaleDateString() : 'N/A';
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

  // Mostrar modal de confirmación
  const showPaymentConfirmation = (service) => {
    if (generatingPayments.has(service.id)) {
      addNotification('Ya se está solicitando un pago para este servicio', 'warning');
      return;
    }

    if (pendingPayments.has(service.id)) {
      addNotification('Ya existe una solicitud de pago pendiente para este servicio', 'warning');
      return;
    }

    setConfirmationModal({ isOpen: true, service });
  };

  // Generar pago pendiente para un servicio
  const generatePayment = async (service) => {
    if (isDemo) {
      addNotification('Solicitud de pago creada exitosamente (modo demo)', 'success');
      setConfirmationModal({ isOpen: false, service: null });
      return;
    }

    setGeneratingPayments(prev => new Set(prev).add(service.id));

    try {
      // Calcular fecha de vencimiento para el pago
      let dueDate;
      
      if (service.billingCycle === 'One-Time') {
        // Para pagos únicos, usar la fecha de inicio + 30 días
        dueDate = service.dueDate ? new Date(service.dueDate.seconds * 1000) : new Date();
        dueDate.setDate(dueDate.getDate() + 30);
      } else {
        // Para servicios con ciclo, usar la fecha de vencimiento calculada
        const expirationDate = calculateExpirationDate(service);
        if (expirationDate) {
          dueDate = expirationDate;
        } else {
          // Si no se puede calcular, usar fecha actual + 30 días
          dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
      }

      // Utilidad para obtener la config de gateways igual que MisPagos
      const getGatewaysConfig = (paymentConfigRaw) => {
        if (!paymentConfigRaw) return null;
        if (paymentConfigRaw.gateways) return paymentConfigRaw.gateways;
        const { bold, paypal, payu, bankTransfer } = paymentConfigRaw;
        const gws = {};
        if (bold) gws.bold = { name: 'Bold', ...bold };
        if (paypal) gws.paypal = { name: 'PayPal', ...paypal };
        if (payu) gws.payu = { name: 'PayU', ...payu };
        if (bankTransfer) gws.bankTransfer = { name: 'Transferencia Bancaria', ...bankTransfer };
        return gws;
      };

      // Obtener configuración de gateways
      let gatewaysSelected = paymentConfig ? getGatewaysConfig(paymentConfig) : null;
      if (!gatewaysSelected) {
        // Valores por defecto si no hay configuración
        gatewaysSelected = {
          bankTransfer: { enabled: true, name: 'Transferencia Bancaria', autoApprove: false }
        };
      }
      const activeGateways = gatewaysSelected ? Object.values(gatewaysSelected).filter(gw => gw.enabled) : [];
      let defaultGateway = 'Transferencia Bancaria';
      let defaultMethod = 'Transferencia Bancaria';
      if (activeGateways.length === 1) {
        defaultGateway = activeGateways[0].name;
        defaultMethod = activeGateways[0].name;
      } else if (activeGateways.length > 1) {
        defaultGateway = 'Pendiente de Selección';
        defaultMethod = (service.billingCycle === 'One-Time' ? 'Pago Único' : 'Renovación');
      }
      const paymentData = {
        serviceId: service.id,
        serviceNumber: service.serviceNumber,
        serviceType: service.serviceType,
        description: service.description,
        amount: service.amount,
        currency: service.currency,
        status: 'Pendiente',
        gateway: defaultGateway,
        userId: user.uid,
        clientName: userProfile?.fullName || 'Cliente',
        clientEmail: user.email,
        dueDate: Timestamp.fromDate(dueDate),
        createdAt: Timestamp.now(),
        paymentMethod: defaultMethod,
        notes: `Solicitud de pago automática para servicio ${service.serviceNumber} - Ciclo: ${getCycleLabel(service.billingCycle)}`,
        billingCycle: service.billingCycle,
        isAutoGenerated: true,
        originalServiceDueDate: service.dueDate ? (service.dueDate.toDate ? service.dueDate : Timestamp.fromDate(new Date(service.dueDate))) : null,
        paymentType: service.billingCycle === 'One-Time' ? 'Pago Único' : 'Renovación'
      };

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'payments'), paymentData);
      addNotification('Solicitud de pago creada exitosamente. Revisa la sección de pagos.', 'success');
      setConfirmationModal({ isOpen: false, service: null });
    } catch (error) {
      console.error('Error generating payment:', error);
      addNotification('Error al crear la solicitud de pago. Intenta nuevamente.', 'error');
    } finally {
      setGeneratingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(service.id);
        return newSet;
      });
    }
  };

  // Navegar a renovaciones con servicio específico
  const navigateToRenewals = (service) => {
    // Guardar el servicio seleccionado en localStorage para que las renovaciones lo detecten
    localStorage.setItem('selectedServiceForRenewal', JSON.stringify({
      id: service.id,
      serviceNumber: service.serviceNumber,
      serviceType: service.serviceType,
      description: service.description,
      amount: service.amount,
      currency: service.currency,
      billingCycle: service.billingCycle,
      dueDate: service.dueDate
    }));
    
    // Forzar navegación por hash incluso si ya estamos en #renewals
    if (window.location.hash === '#renewals') {
      window.location.hash = '';
      setTimeout(() => {
        window.location.hash = 'renewals';
      }, 50);
    } else {
      window.location.hash = 'renewals';
    }
    addNotification('Redirigiendo a renovaciones para este servicio', 'success');
  };

  // Cargar pagos pendientes/procesando para deshabilitar botones
  useEffect(() => {
    if (isDemo) {
      setPendingPayments(new Set(['demo1', 'demo2'])); // Simular pagos pendientes en demo
      return;
    }

    if (!user?.uid) return;

    const paymentsQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'payments'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
      const pendingServiceIds = new Set();
      const byService = {};
      const activeStatuses = new Set(['Pendiente', 'Procesando']);
      snapshot.docs.forEach(d => {
        const payment = d.data();
        if (payment.serviceId && activeStatuses.has(payment.status)) {
          pendingServiceIds.add(payment.serviceId);
          byService[payment.serviceId] = { id: d.id, ...payment };
        }
      });
      setPendingPayments(pendingServiceIds);
      setPendingPaymentsByService(byService);
    });

    return () => unsubscribe();
  }, [user?.uid, isDemo]);

  // Cargar configuración de pagos
  useEffect(() => {
    if (isDemo) {
      setPaymentConfig({
        gateways: {
          bankTransfer: { enabled: true, name: 'Transferencia Bancaria', autoApprove: false }
        }
      });
      return;
    }

    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'paymentConfig');
    const unsubscribe = onSnapshot(configRef, (snap) => {
      if (snap.exists()) {
        setPaymentConfig(snap.data());
      } else {
        // Valores por defecto
        setPaymentConfig({
          gateways: {
            bankTransfer: { enabled: true, name: 'Transferencia Bancaria', autoApprove: false }
          }
        });
      }
    });
    return () => unsubscribe();
  }, [isDemo]);

  // Cargar configuración de renovaciones (recordatorios y gracia)
  useEffect(() => {
    if (isDemo) {
      setRenewalConfig({
        renewalSettings: {
          reminderDays: 10,
          gracePeriodDays: 7
        }
      });
      return;
    }

    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'renewalConfig');
    const unsubscribe = onSnapshot(configRef, (snap) => {
      if (snap.exists()) {
        setRenewalConfig(snap.data());
      }
    });
    return () => unsubscribe();
  }, [isDemo]);

  const getDaysUntilDue = (service) => {
    // Aplica solo a servicios de ciclo
    if (!service || service.billingCycle === 'One-Time') return null;
    const expiration = calculateExpirationDate(service);
    if (!expiration) return null;
    const now = new Date();
    const diff = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Mantenimiento automático: crear/cancelar solicitudes según ventana de recordatorio y gracia
  useEffect(() => {
    if (isDemo) return;
    if (!renewalConfig?.renewalSettings) return;
    if (!user?.uid) return;

    const reminderDays = Number(renewalConfig.renewalSettings.reminderDays ?? 0);
    const graceDays = Number(renewalConfig.renewalSettings.gracePeriodDays ?? 0);

    const process = async () => {
      for (const service of services) {
        if (!service || service.billingCycle === 'One-Time') continue;
        const days = getDaysUntilDue(service);
        if (days == null) continue;

        // Dentro de ventana de recordatorio (<= reminder y >= -grace): asegurar solicitud pendiente
        if (days <= reminderDays && days >= -graceDays) {
          if (!pendingPayments.has(service.id)) {
            // Crear solicitud automáticamente usando generatePayment
            try {
              await generatePayment(service);
            } catch (e) {
              console.error('Auto-generate payment failed:', e);
            }
          }
        }

        // Pasó el período de gracia: cancelar solicitud pendiente si existe
        if (days < -graceDays) {
          const pp = pendingPaymentsByService[service.id];
          if (pp?.id) {
            try {
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'payments', pp.id), {
                status: 'Cancelado',
                updatedAt: new Date(),
                cancelReason: 'Periodo de gracia agotado'
              });
              addNotification(`Solicitud de pago cancelada por período de gracia (${service.serviceNumber})`, 'warning');
            } catch (e) {
              console.error('Auto-cancel payment failed:', e);
            }
          }
        }
      }
    };

    process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, renewalConfig, pendingPayments, pendingPaymentsByService, user?.uid, isDemo]);

  useEffect(() => {
    if (isDemo) {
      // Datos de demo
      setServices([
        {
          id: 'demo1',
          serviceNumber: 'SRV-241017-123456',
          serviceType: 'Hosting',
          description: 'Plan Básico - 1GB',
          amount: 10.99,
          currency: 'USD',
          status: 'Activo',
          dueDate: { seconds: Date.now() / 1000 + 30 * 24 * 60 * 60 },
          billingCycle: 'Monthly',
          clientNotes: 'Servicio de hosting básico'
        },
        {
          id: 'demo2',
          serviceNumber: 'SRV-241017-789012',
          serviceType: 'Dominio',
          description: 'midominio.com',
          amount: 15.00,
          currency: 'USD',
          status: 'Pendiente Pago',
          dueDate: { seconds: Date.now() / 1000 + 10 * 24 * 60 * 60 },
          billingCycle: 'Annually',
          clientNotes: 'Renovación de dominio'
        }
      ]);
      setLoading(false);
      return;
    }

    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Cargar servicios asignados al usuario actual
    const servicesQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'services'),
      where('assignedUserId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(servicesQuery, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar por fecha de creación en el cliente
      servicesData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA; // Más reciente primero
      });
      
      setServices(servicesData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading services:', error);
      addNotification('Error al cargar los servicios', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, isDemo, addNotification]);

  const getStatusColor = (status) => {
    const statusMap = {
      'Activo': 'bg-green-100 text-green-800',
      'Periodo de Gracia Vencido': 'bg-yellow-100 text-yellow-800',
      'Pendiente Pago': 'bg-red-100 text-red-800',
      'Pago': 'bg-blue-100 text-blue-800',
      'Cancelado': 'bg-gray-100 text-gray-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '--';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-ES');
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ServicesIcon />
          Mis Servicios Contratados
        </h2>
        <div className="text-sm text-gray-500">
          {services.length} servicio{services.length !== 1 ? 's' : ''} encontrado{services.length !== 1 ? 's' : ''}
        </div>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <ServicesIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes servicios asignados</h3>
          <p className="text-gray-500">Contacta al administrador para que te asigne servicios.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                {['Número', 'Servicio', 'Descripción', 'Monto', 'Estado', 'Ciclo', 'Fecha de Inicio', 'Fecha de Vencimiento', 'Notas', 'Acciones'].map(header => (
                  <th key={header} className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.map(service => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-medium text-blue-600">{service.serviceNumber || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{service.serviceType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{service.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {formatAmount(service.amount, service.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{getCycleLabel(service.billingCycle)}</div>
                    {service.billingCycle === 'Custom' && service.customBillingCycle && (
                      <div className="text-xs text-gray-500">({service.customBillingCycle})</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{formatDate(service.dueDate)}</div>
                    <div className="text-xs text-gray-500">Inicio</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{formatExpirationDate(service)}</div>
                    <div className="text-xs text-gray-500">Vencimiento</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600 text-sm max-w-xs truncate">
                      {service.clientNotes || '--'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {pendingPayments.has(service.id) ? (
                        <div className="text-center">
                          <div className="text-xs text-orange-600 font-medium mb-1">Por pagar</div>
                          <button
                            onClick={() => window.location.href = '#payments'}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                            title="Ir a Pago"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Ir a Pago
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => {
                              // Si es de ciclo y no está en ventana de recordatorio, redirigir a renovaciones
                              const days = getDaysUntilDue(service);
                              if (service.billingCycle !== 'One-Time' && (days == null || (renewalConfig?.renewalSettings && (days > (renewalConfig.renewalSettings.reminderDays ?? 0))))) {
                                navigateToRenewals(service);
                                return;
                              }
                              showPaymentConfirmation(service);
                            }}
                            disabled={generatingPayments.has(service.id)}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                              generatingPayments.has(service.id)
                                ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                                : 'text-white bg-blue-600 hover:bg-blue-700'
                            }`}
                            title={generatingPayments.has(service.id) ? 'Creando solicitud...' : (service.billingCycle === 'One-Time' ? 'Solicitar de Nuevo' : 'Solicitar de Nuevo (irá a Renovaciones fuera de ventana)')}
                          >
                            <CreditCardIcon className="h-4 w-4 mr-1" />
                            {generatingPayments.has(service.id) ? 'Creando...' : (pendingPayments.has(service.id) ? 'Ir a Pago' : 'Solicitar de Nuevo')}
                          </button>
                          {service.billingCycle !== 'One-Time' && (
                            <button
                              onClick={() => navigateToRenewals(service)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              title="Aumentar ciclo de este servicio"
                            >
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              Aumentar Ciclo
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación de pago */}
      {confirmationModal.isOpen && confirmationModal.service && (
        <PaymentConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal({ isOpen: false, service: null })}
          onConfirm={() => generatePayment(confirmationModal.service)}
          service={confirmationModal.service}
          paymentType={confirmationModal.service.billingCycle}
          warningMessage={
            confirmationModal.service.billingCycle === 'One-Time'
              ? `Se creará una solicitud de pago único para el servicio "${confirmationModal.service.serviceType}". La solicitud vencerá en 30 días desde la fecha actual.`
              : `Se creará una solicitud de pago de renovación para el servicio "${confirmationModal.service.serviceType}" con ciclo ${getCycleLabel(confirmationModal.service.billingCycle)}. La solicitud vencerá en la fecha de vencimiento del servicio.`
          }
        />
      )}
    </div>
  );
}

export default ClientServicesDashboard;
