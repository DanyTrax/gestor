import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { collection, onSnapshot, query, where, doc, addDoc, Timestamp } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import { CalendarIcon, CreditCardIcon, PercentIcon } from '../icons';

function ClientRenewalDashboard({ user, userProfile }) {
  const { addNotification } = useNotification();
  const [services, setServices] = useState([]);
  const [renewalConfig, setRenewalConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [pendingRenewals, setPendingRenewals] = useState(new Set());
  const [isCreatingRenewal, setIsCreatingRenewal] = useState(false);

  const renewalPeriods = [
    { key: 'monthly', label: 'Mensual', months: 1 },
    { key: 'quarterly', label: 'Trimestral', months: 3 },
    { key: 'semiAnnual', label: 'Semestral', months: 6 },
    { key: 'annual', label: 'Anual', months: 12 },
    { key: 'biennial', label: 'Bienal (2 años)', months: 24 },
    { key: 'triennial', label: 'Trienal (3 años)', months: 36 }
  ];

  // Cargar configuraciones de renovación
  useEffect(() => {
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'renewalConfig');
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setRenewalConfig(doc.data());
        console.log('Renewal config loaded:', doc.data());
      } else {
        console.log('No renewal config found, using defaults');
        setRenewalConfig({
          discounts: {
            monthly: { enabled: false, percentage: 0 },
            quarterly: { enabled: true, percentage: 5 },
            semiAnnual: { enabled: true, percentage: 10 },
            annual: { enabled: true, percentage: 15 },
            biennial: { enabled: true, percentage: 25 },
            triennial: { enabled: true, percentage: 35 }
          },
          taxSettings: {
            ivaEnabled: true,
            ivaPercentage: 19,
            ivaIncluded: false,
            taxName: 'IVA'
          }
        });
      }
    }, (error) => {
      console.error('Error loading renewal config:', error);
    });

    return () => unsubscribe();
  }, []);

  // Detectar servicio seleccionado desde servicios
  useEffect(() => {
    const selectedServiceData = localStorage.getItem('selectedServiceForRenewal');
    if (selectedServiceData) {
      try {
        const service = JSON.parse(selectedServiceData);
        setSelectedService(service);
        addNotification(`Servicio "${service.serviceType}" seleccionado para renovación`, 'success');
        // Limpiar el localStorage después de usar
        localStorage.removeItem('selectedServiceForRenewal');
      } catch (error) {
        console.error('Error parsing selected service:', error);
      }
    }
  }, []);

  // Al tener servicio seleccionado y lista cargada, hacer scroll hasta él
  useEffect(() => {
    if (!selectedService || services.length === 0) return;
    const el = document.getElementById(`service-${selectedService.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedService, services]);

  // Cargar renovaciones pendientes
  useEffect(() => {
    if (!user?.uid) return;

    const pendingRenewalsQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'payments'),
      where('userId', '==', user.uid),
      where('status', '==', 'Pendiente'),
      where('isRenewal', '==', true)
    );

    const unsubscribe = onSnapshot(pendingRenewalsQuery, (snapshot) => {
      const serviceIds = new Set();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.serviceId) {
          serviceIds.add(data.serviceId);
        }
      });
      setPendingRenewals(serviceIds);
    }, (error) => {
      console.error('Error loading pending renewals:', error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

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

  // Obtener la fecha base para renovación (vencimiento para ciclos, inicio para únicos)
  const getRenewalBaseDate = (service) => {
    if (service.billingCycle === 'One-Time') {
      // Para pagos únicos, usar la fecha de inicio (dueDate)
      return service.dueDate ? new Date(service.dueDate.seconds * 1000) : null;
    } else {
      // Para servicios con ciclo, usar la fecha de vencimiento calculada
      return calculateExpirationDate(service);
    }
  };

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Cargar servicios del cliente
    const servicesQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'services'),
      where('assignedUserId', '==', user.uid)
    );

    const unsubscribeServices = onSnapshot(servicesQuery, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesData);
    }, (error) => {
      console.error('Error loading services:', error);
      addNotification('Error al cargar los servicios', 'error');
    });

    // Cargar configuración de renovaciones
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'renewalConfig');
    const unsubscribeConfig = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setRenewalConfig(doc.data());
      }
      setLoading(false);
    });

    return () => {
      unsubscribeServices();
      unsubscribeConfig();
    };
  }, [user?.uid, addNotification]);

  const calculateDiscountedPrice = (originalPrice, period) => {
    if (!renewalConfig?.discounts?.[period]?.enabled) return originalPrice;
    
    const discount = renewalConfig.discounts[period];
    const discountAmount = (originalPrice * discount.discount) / 100;
    const discountedPrice = originalPrice - discountAmount;
    
    // Aplicar redondeo
    const roundedPrice = Math.round(discountedPrice / renewalConfig.pricingSettings.roundToNearest) * renewalConfig.pricingSettings.roundToNearest;
    
    return Math.max(roundedPrice, renewalConfig.pricingSettings.minimumAmount);
  };

  const calculateWithTax = (price) => {
    if (!renewalConfig?.taxSettings?.ivaEnabled) return price;
    
    if (renewalConfig.taxSettings.ivaIncluded) {
      return price;
    } else {
      const taxAmount = (price * renewalConfig.taxSettings.ivaPercentage) / 100;
      return price + taxAmount;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  };

  const getDaysUntilDue = (service) => {
    const baseDate = getRenewalBaseDate(service);
    if (!baseDate) return 0;
    const now = new Date();
    const diffTime = baseDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Periodo de Gracia Vencido': return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente Pago': return 'bg-orange-100 text-orange-800';
      case 'Pago': return 'bg-blue-100 text-blue-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceBillingCycleMonths = (billingCycle) => {
    switch (billingCycle) {
      case 'Monthly': return 1;
      case 'Quarterly': return 3;
      case 'Semi-Annual': return 6;
      case 'Annually': return 12;
      case 'Biennial': return 24;
      case 'Triennial': return 36;
      case 'One-Time': return 0; // Pago único
      default: return 1;
    }
  };

  const isRenewalValid = (service, period) => {
    const serviceCycleMonths = getServiceBillingCycleMonths(service.billingCycle);
    const renewalMonths = renewalPeriods.find(p => p.key === period)?.months || 0;
    
    // Si es pago único, no se puede renovar
    if (serviceCycleMonths === 0) {
      return false;
    }
    
    // El período de renovación no puede ser inferior al ciclo del servicio
    return renewalMonths >= serviceCycleMonths;
  };

  // Función para calcular fechas de renovación basadas en la fecha de vencimiento actual
  const calculateRenewalDates = (service, period) => {
    const baseDate = getRenewalBaseDate(service);
    if (!baseDate) return { startDate: null, endDate: null };

    const renewalMonths = renewalPeriods.find(p => p.key === period)?.months || 0;
    const startDate = new Date(baseDate); // Fecha de inicio = fecha de vencimiento actual
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + renewalMonths);

    return { startDate, endDate };
  };

  const getRenewalActionText = (service, period) => {
    const serviceCycleMonths = getServiceBillingCycleMonths(service.billingCycle);
    
    if (serviceCycleMonths === 0) {
      return 'Volver a Comprar';
    }
    
    const renewalMonths = renewalPeriods.find(p => p.key === period)?.months || 0;
    if (renewalMonths < serviceCycleMonths) {
      return 'Período Insuficiente';
    }
    
    return 'Renovar';
  };

  const navigateToPayments = () => {
    window.location.href = '#payments';
  };

  // Utilidad: obtener config de pasarelas igual que Mis Pagos
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

  // Configuración de pasarelas de pago
  const [paymentConfig, setPaymentConfig] = useState(null);
  useEffect(() => {
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'paymentConfig');
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) setPaymentConfig(doc.data());
    });
    return () => unsubscribe();
  }, []);

  const handleRenewal = async (service, period) => {
    // Verificar si ya hay una renovación pendiente para este servicio
    if (pendingRenewals.has(service.id)) {
      addNotification('Ya tienes una solicitud de renovación pendiente para este servicio', 'warning');
      return;
    }

    // Verificar si ya se está creando una renovación
    if (isCreatingRenewal) {
      addNotification('Ya se está procesando una solicitud de renovación', 'warning');
      return;
    }

    setIsCreatingRenewal(true);

    try {
      // Calcular fechas de renovación
      const { startDate, endDate } = calculateRenewalDates(service, period);
      const originalPrice = service.amount;
      const discountedPrice = calculateDiscountedPrice(originalPrice, period);
      const finalPrice = calculateWithTax(discountedPrice);
      
      // Obtener pasarelas habilitadas
      let gatewaysSelected = paymentConfig && getGatewaysConfig(paymentConfig);
      const activeGateways = gatewaysSelected ? Object.values(gatewaysSelected).filter(gw => gw.enabled) : [];
      let defaultGateway = 'Pendiente de Selección';
      let defaultMethod = 'Renovación';
      if (activeGateways.length === 1) {
        defaultGateway = activeGateways[0].name;
        defaultMethod = activeGateways[0].name;
      }
      // Crear solicitud de pago en Firestore
      // Usar la moneda del servicio (puede ser COP o USD)
      const serviceCurrency = service.currency || 'USD';
      const paymentData = {
        userId: user.uid,
        serviceId: service.id,
        serviceName: service.serviceType,
        serviceType: service.serviceType,
        serviceDescription: service.description,
        serviceNumber: service.serviceNumber,
        amount: finalPrice,
        originalAmount: originalPrice,
        discount: originalPrice - discountedPrice,
        currency: serviceCurrency, // Usar la moneda del servicio
        status: 'Pendiente',
        paymentMethod: defaultMethod,
        paymentType: 'Renovación',
        gateway: defaultGateway,
        transactionId: null,
        dueDate: Timestamp.fromDate(new Date(startDate)),
        renewalPeriod: renewalPeriods.find(p => p.key === period)?.label || period,
        renewalMonths: renewalPeriods.find(p => p.key === period)?.months || 0,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        notes: `Renovación de ${renewalPeriods.find(p => p.key === period)?.label} para el servicio ${service.serviceType}`,
        isRenewal: true
      };

      // Agregar a la colección de pagos
      const paymentsRef = collection(db, `artifacts/${appId}/public/data/payments`);
      await addDoc(paymentsRef, paymentData);

      // Guardar datos de renovación en localStorage para la navegación
      const renewalData = {
        service,
        period,
        startDate,
        endDate,
        originalPrice,
        discountedPrice,
        finalPrice
      };
      localStorage.setItem('renewalData', JSON.stringify(renewalData));
      
      const actionText = getRenewalActionText(service, period);
      addNotification(`${actionText} ${renewalPeriods.find(p => p.key === period)?.label} - Redirigiendo a pagos`, "success");
      
      // Marcar el servicio como pendiente de renovación
      setPendingRenewals(prev => new Set([...prev, service.id]));
      
      // Navegar a la sección de pagos
      setTimeout(() => {
        window.location.href = '#payments';
      }, 1500);
    } catch (error) {
      console.error('Error creating renewal payment:', error);
      addNotification('Error al crear la solicitud de renovación. Intenta nuevamente.', 'error');
    } finally {
      setIsCreatingRenewal(false);
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
          <CalendarIcon />
          Renovaciones de Servicios
        </h2>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes servicios para renovar</h3>
          <p className="text-gray-500">Contacta al administrador para que te asigne servicios.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {services.map(service => {
            const daysUntilDue = getDaysUntilDue(service);
            const isNearExpiry = daysUntilDue <= 30 && daysUntilDue > 0;
            const isExpired = daysUntilDue <= 0;
            const isSelected = selectedService && selectedService.id === service.id;
            
            return (
              <div id={`service-${service.id}`} key={service.id} className={`bg-white rounded-xl shadow-lg p-6 ${isSelected ? 'ring-2 ring-blue-500 border-blue-200' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">{service.serviceType}</h3>
                      {isSelected && (
                        <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                          Seleccionado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-mono">{service.serviceNumber}</p>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <span className="text-sm text-gray-500">Precio Actual:</span>
                    <div className="font-semibold text-lg text-gray-900">
                      {formatPrice(service.amount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      {service.billingCycle === 'One-Time' ? 'Fecha de Inicio:' : 'Fecha de Vencimiento:'}
                    </span>
                    <div className={`font-semibold ${isExpired ? 'text-red-600' : isNearExpiry ? 'text-orange-600' : 'text-gray-900'}`}>
                      {(() => {
                        const baseDate = getRenewalBaseDate(service);
                        return baseDate ? baseDate.toLocaleDateString() : 'N/A';
                      })()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isExpired ? 'Vencido' : isNearExpiry ? `${daysUntilDue} días restantes` : `${daysUntilDue} días restantes`}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Ciclo Actual:</span>
                    <div className="font-semibold text-gray-900">
                      {service.billingCycle}
                    </div>
                  </div>
                </div>

                {/* Opciones de renovación */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <PercentIcon />
                    {getServiceBillingCycleMonths(service.billingCycle) === 0 ? 'Opciones de Compra' : 'Opciones de Renovación'}
                  </h4>
                  
                  {getServiceBillingCycleMonths(service.billingCycle) === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Servicio de Pago Único
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>Este servicio es de pago único. Para volver a adquirirlo, contacta al administrador o selecciona "Volver a Comprar" si está disponible.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Renovación de Período Actual - Destacada */}
                      {(() => {
                        const currentPeriod = renewalPeriods.find(p => 
                          getServiceBillingCycleMonths(service.billingCycle) === p.months
                        );
                        
                        if (currentPeriod) {
                          const originalPrice = service.amount;
                          const discountedPrice = calculateDiscountedPrice(originalPrice, currentPeriod.key);
                          const finalPrice = calculateWithTax(discountedPrice);
                          const discount = renewalConfig?.discounts?.[currentPeriod.key];
                          const savings = originalPrice - discountedPrice;
                          const { startDate, endDate } = calculateRenewalDates(service, currentPeriod.key);

                          return (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-semibold text-blue-900 flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4" />
                                  Renovación de Período Actual
                                </h5>
                                <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm font-semibold rounded-full">
                                  {currentPeriod.label}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-gray-600 mb-2">
                                    <div>Precio base: {formatPrice(originalPrice)}</div>
                                    {discount?.enabled && savings > 0 && (
                                      <div className="text-green-600">
                                        Ahorras: {formatPrice(savings)}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="font-bold text-xl text-blue-600">
                                    {formatPrice(finalPrice)}
                                  </div>
                                  
                                  {renewalConfig?.taxSettings?.ivaEnabled && (
                                    <div className="text-xs text-gray-500">
                                      {renewalConfig.taxSettings.ivaIncluded ? 'IVA incluido' : `+ ${renewalConfig.taxSettings.taxName} ${renewalConfig.taxSettings.ivaPercentage}%`}
                                    </div>
                                  )}
                                </div>
                                
                                <div>
                                  {startDate && endDate && (
                                    <div className="p-3 bg-white border border-blue-200 rounded-lg">
                                      <div className="text-xs font-medium text-blue-800 mb-2">Fechas de Renovación:</div>
                                      <div className="text-xs text-blue-700 space-y-1">
                                        <div>Fecha de Vencimiento: {startDate.toLocaleDateString()}</div>
                                        <div>Fecha Nueva Renovación: {endDate.toLocaleDateString()}</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {pendingRenewals.has(service.id) ? (
                                <button
                                  onClick={navigateToPayments}
                                  className="w-full mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Ver Solicitud Pendiente
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRenewal(service, currentPeriod.key)}
                                  disabled={isCreatingRenewal}
                                  className={`w-full mt-4 px-6 py-3 font-semibold rounded-lg transition-colors ${
                                    isCreatingRenewal 
                                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {isCreatingRenewal ? 'Creando...' : `Renovar ${currentPeriod.label}`}
                                </button>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Otras opciones de renovación */}
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-3">Otras Opciones de Renovación:</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {renewalPeriods.map(period => {
                            const originalPrice = service.amount;
                            const discountedPrice = calculateDiscountedPrice(originalPrice, period.key);
                            const finalPrice = calculateWithTax(discountedPrice);
                            const discount = renewalConfig?.discounts?.[period.key];
                            const savings = originalPrice - discountedPrice;
                            const isValid = isRenewalValid(service, period);
                            const actionText = getRenewalActionText(service, period);
                            
                            // No mostrar el período actual aquí (ya se muestra destacado arriba)
                            const isCurrentCycle = getServiceBillingCycleMonths(service.billingCycle) === period.months;
                            
                            // Mostrar si:
                            // 1. Es válido (período >= ciclo actual)
                            // 2. No es el ciclo actual (ya se muestra destacado)
                            // 3. Está habilitado en la configuración (si existe)
                            const isEnabled = !renewalConfig?.discounts?.[period.key] || renewalConfig.discounts[period.key].enabled;
                            const shouldShow = isValid && !isCurrentCycle && isEnabled;

                            // Solo mostrar si debe mostrarse
                            if (!shouldShow) return null;

                            return (
                              <div key={period.key} className="border rounded-lg p-4 transition-shadow border-gray-200 hover:shadow-md">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-gray-800">
                                    {period.label}
                                  </h5>
                                  {discount?.enabled && shouldShow && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                      -{discount.discount}%
                                    </span>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="text-sm text-gray-600">
                                    <div>Precio base: {formatPrice(originalPrice)}</div>
                                    {discount?.enabled && savings > 0 && (
                                      <div className="text-green-600">
                                        Ahorras: {formatPrice(savings)}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="font-semibold text-lg text-blue-600">
                                    {formatPrice(finalPrice)}
                                  </div>
                                  
                                  {renewalConfig?.taxSettings?.ivaEnabled && (
                                    <div className="text-xs text-gray-500">
                                      {renewalConfig.taxSettings.ivaIncluded ? 'IVA incluido' : `+ ${renewalConfig.taxSettings.taxName} ${renewalConfig.taxSettings.ivaPercentage}%`}
                                    </div>
                                  )}

                                  {/* Mostrar fechas de renovación */}
                                  {(() => {
                                    const { startDate, endDate } = calculateRenewalDates(service, period);
                                    if (startDate && endDate) {
                                      return (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                          <div className="text-xs font-medium text-blue-800 mb-2">Fechas de Renovación:</div>
                                          <div className="text-xs text-blue-700 space-y-1">
                                            <div>Fecha de Vencimiento: {startDate.toLocaleDateString()}</div>
                                            <div>Fecha Nueva Renovación: {endDate.toLocaleDateString()}</div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                  
                                  {pendingRenewals.has(service.id) ? (
                                    <button
                                      onClick={navigateToPayments}
                                      className="w-full px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                                    >
                                      Ver Solicitud
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleRenewal(service, period.key)}
                                      disabled={isCreatingRenewal}
                                      className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                                        isCreatingRenewal 
                                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                                          : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                    >
                                      {isCreatingRenewal ? 'Creando...' : `${actionText} ${period.label}`}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Información adicional */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Información Importante</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>La "Renovación de Período Actual" siempre está disponible y destacada</strong></li>
                    <li>• <strong>Fecha de Vencimiento</strong>: Fecha actual de vencimiento del servicio</li>
                    <li>• <strong>Fecha Nueva Renovación</strong>: Fecha calculada después de sumar el período</li>
                    <li>• Los descuentos se aplican automáticamente según el período seleccionado (si están configurados)</li>
                    <li>• Los precios se redondean para evitar decimales</li>
                    <li>• El IVA se calcula según la configuración actual</li>
                    <li>• <strong>La renovación extiende el servicio desde la fecha de vencimiento actual</strong></li>
                    <li>• El período de renovación no puede ser inferior al ciclo actual del servicio</li>
                    <li>• Los servicios de pago único requieren "Volver a Comprar" en lugar de renovar</li>
                    <li>• Al seleccionar una renovación, serás redirigido a la sección de pagos para proceder</li>
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default ClientRenewalDashboard;