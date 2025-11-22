import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, setDoc } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { PlusIcon, EditIcon, TrashIcon, SettingsIcon, BellIcon, TemplatesIcon } from '../../icons';

function AdminTemplatesDashboard() {
  const { addNotification } = useNotification();
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [alertSettings, setAlertSettings] = useState({
    preVencimiento: {
      enabled: false,
      days: 7,
      clientTemplate: '',
      adminTemplate: '',
      notifyAdmins: false,
      selectedAdmins: []
    },
    periodoGracia: {
      enabled: false,
      days: 3,
      clientTemplate: '',
      adminTemplate: '',
      notifyAdmins: false,
      selectedAdmins: []
    },
    vencido: {
      enabled: false,
      days: 0,
      clientTemplate: '',
      adminTemplate: '',
      notifyAdmins: false,
      selectedAdmins: []
    },
    suspendido: {
      enabled: false,
      days: 0,
      clientTemplate: '',
      adminTemplate: '',
      notifyAdmins: false,
      selectedAdmins: []
    }
  });
  const [activeTab, setActiveTab] = useState('templates');
  
  const templateSuggestions = {
    // Plantillas para CLIENTES
    preVencimiento: {
      name: "Aviso de Próximo Vencimiento",
      subject: "Recordatorio de Renovación de Servicio: {description}",
      body: "Estimado/a {clientName},\n\nLe escribimos para recordarle que su servicio '{description}' está programado para vencer el próximo {dueDate}.\n\nEl monto correspondiente a la renovación es de {amount} {currency}.\n\nPara garantizar la continuidad de su servicio, le recomendamos realizar el pago antes de la fecha de vencimiento. Puede gestionarlo a través de nuestro portal de clientes.\n\nSi tiene alguna consulta, no dude en contactarnos.\n\nAtentamente,\n{companyName}"
    },
    vencido: {
      name: "Notificación de Servicio Vencido",
      subject: "Importante: Su servicio {description} ha vencido",
      body: "Estimado/a {clientName},\n\nLe informamos que la factura correspondiente a su servicio '{description}', con fecha de vencimiento {dueDate}, se encuentra pendiente de pago.\n\nSu servicio ha entrado en un período de gracia. Para evitar la suspensión del mismo, le solicitamos regularizar su situación a la brevedad posible. El monto pendiente es de {amount} {currency}.\n\nSi usted ya ha realizado el pago, por favor, omita esta notificación.\n\nCordialmente,\n{companyName}"
    },
    suspendido: {
      name: "Aviso de Suspensión de Servicio",
      subject: "Acción Requerida: Suspensión del servicio {description}",
      body: "Estimado/a {clientName},\n\nLamentamos informarle que, debido a la falta de pago, su servicio '{description}' ha sido suspendido.\n\nPara proceder con la reactivación y recuperar el acceso, es necesario saldar el monto pendiente de {amount} {currency}. Por favor, contáctenos para coordinar el pago y la restauración del servicio.\n\nQuedamos a su disposición.\n\nAtentamente,\n{companyName}"
    },
    pagoRecibido: {
      name: "Confirmación de Pago Recibido",
      subject: "Confirmación: Pago recibido para {description}",
      body: "Estimado/a {clientName},\n\nHemos recibido y procesado exitosamente su pago por {amount} {currency} correspondiente al servicio '{description}'.\n\nSu servicio está activo y funcionando correctamente. La próxima fecha de vencimiento será {dueDate}.\n\nGracias por su confianza y por mantener sus pagos al día.\n\nAtentamente,\n{companyName}"
    },
    bienvenida: {
      name: "Bienvenida a Nuevo Cliente",
      subject: "Bienvenido a {companyName} - Servicio {description}",
      body: "Estimado/a {clientName},\n\n¡Bienvenido a {companyName}!\n\nNos complace confirmar que su servicio '{description}' ha sido activado exitosamente.\n\nDetalles del servicio:\n- Descripción: {description}\n- Monto: {amount} {currency}\n- Próximo vencimiento: {dueDate}\n\nPuede acceder a su portal de cliente en cualquier momento para gestionar su cuenta y realizar pagos.\n\nSi tiene alguna pregunta, no dude en contactarnos.\n\n¡Gracias por elegirnos!\n\nAtentamente,\n{companyName}"
    },

    // Plantillas para ADMINISTRADORES
    adminPreVencimiento: {
      name: "Alerta Admin: Próximo Vencimiento",
      subject: "ALERTA: Servicio próximo a vencer - {clientName}",
      body: "Estimado/a Administrador,\n\nSe ha generado una alerta automática para el siguiente servicio:\n\n📋 INFORMACIÓN DEL SERVICIO:\n- Cliente: {clientName} ({clientEmail})\n- Servicio: {description}\n- Tipo: {serviceType}\n- Monto: {amount} {currency}\n- Fecha de vencimiento: {dueDate}\n- Ciclo de facturación: {billingCycle}\n- Días restantes: {daysRemaining}\n\n📊 ESTADO ACTUAL:\n- Estado: Próximo a vencer\n- Notificación enviada al cliente: ✅\n- Plantilla utilizada: Aviso de Próximo Vencimiento\n\n🔔 ACCIONES RECOMENDADAS:\n1. Verificar que el cliente haya recibido la notificación\n2. Contactar al cliente si es necesario\n3. Preparar seguimiento post-vencimiento\n\n📈 ESTADÍSTICAS:\n- Total de servicios próximos a vencer: {totalPending}\n- Ingresos potenciales: {potentialRevenue}\n\nEste es un mensaje automático del sistema de gestión de cobros.\n\nSistema de Gestión - {companyName}"
    },
    adminPeriodoGracia: {
      name: "Alerta Admin: Período de Gracia",
      subject: "URGENTE: Servicio en período de gracia - {clientName}",
      body: "Estimado/a Administrador,\n\n⚠️ ALERTA URGENTE - Servicio en período de gracia:\n\n📋 INFORMACIÓN DEL SERVICIO:\n- Cliente: {clientName} ({clientEmail})\n- Servicio: {description}\n- Tipo: {serviceType}\n- Monto pendiente: {amount} {currency}\n- Fecha de vencimiento original: {dueDate}\n- Días en período de gracia: {graceDays}\n- Días restantes de gracia: {remainingGraceDays}\n\n📊 ESTADO ACTUAL:\n- Estado: Período de Gracia Vencido\n- Notificación enviada al cliente: ✅\n- Plantilla utilizada: Notificación de Servicio Vencido\n- Riesgo de suspensión: ALTO\n\n🚨 ACCIONES INMEDIATAS:\n1. Contactar al cliente por teléfono\n2. Enviar recordatorio personalizado\n3. Evaluar opciones de pago flexibles\n4. Preparar suspensión si no hay respuesta\n\n📈 IMPACTO:\n- Ingresos en riesgo: {amount} {currency}\n- Tiempo de mora: {daysOverdue} días\n- Historial de pagos: {paymentHistory}\n\n⏰ PRÓXIMOS PASOS:\n- Si no se paga en {remainingGraceDays} días: Suspender servicio\n- Seguimiento diario hasta resolución\n- Documentar todas las comunicaciones\n\nEste es un mensaje automático del sistema de gestión de cobros.\n\nSistema de Gestión - {companyName}"
    },
    adminVencido: {
      name: "Alerta Admin: Servicio Vencido",
      subject: "INMEDIATO: Servicio vencido - {clientName}",
      body: "Estimado/a Administrador,\n\n🔴 ALERTA INMEDIATA - Servicio vencido:\n\n📋 INFORMACIÓN DEL SERVICIO:\n- Cliente: {clientName} ({clientEmail})\n- Servicio: {description}\n- Tipo: {serviceType}\n- Monto vencido: {amount} {currency}\n- Fecha de vencimiento: {dueDate}\n- Días de atraso: {daysOverdue}\n- Ciclo de facturación: {billingCycle}\n\n📊 ESTADO ACTUAL:\n- Estado: Vencido\n- Notificación enviada al cliente: ✅\n- Plantilla utilizada: Notificación de Servicio Vencido\n- Próximo paso: Período de gracia\n\n🎯 ACCIONES REQUERIDAS:\n1. Verificar recepción de notificación por cliente\n2. Iniciar período de gracia ({gracePeriod} días)\n3. Contacto directo con el cliente\n4. Evaluar historial de pagos del cliente\n5. Preparar estrategia de cobro\n\n📈 ANÁLISIS:\n- Cliente desde: {clientSince}\n- Pagos anteriores: {previousPayments}\n- Patrón de pago: {paymentPattern}\n- Riesgo de pérdida: {riskLevel}\n\n📞 CONTACTOS:\n- Teléfono: {clientPhone}\n- Email: {clientEmail}\n- Última comunicación: {lastContact}\n\nEste es un mensaje automático del sistema de gestión de cobros.\n\nSistema de Gestión - {companyName}"
    },
    adminSuspendido: {
      name: "Alerta Admin: Servicio Suspendido",
      subject: "SUSPENDIDO: Servicio cancelado por falta de pago - {clientName}",
      body: "Estimado/a Administrador,\n\n❌ SERVICIO SUSPENDIDO - Acción requerida:\n\n📋 INFORMACIÓN DEL SERVICIO:\n- Cliente: {clientName} ({clientEmail})\n- Servicio: {description}\n- Tipo: {serviceType}\n- Monto pendiente: {amount} {currency}\n- Fecha de vencimiento: {dueDate}\n- Días de atraso: {daysOverdue}\n- Período de gracia agotado: {gracePeriod} días\n\n📊 ESTADO ACTUAL:\n- Estado: Cancelado\n- Motivo: Falta de pago\n- Notificación enviada al cliente: ✅\n- Plantilla utilizada: Aviso de Suspensión de Servicio\n- Fecha de suspensión: {suspensionDate}\n\n🔧 ACCIONES INMEDIATAS:\n1. Suspender acceso del cliente al servicio\n2. Documentar suspensión en el sistema\n3. Enviar notificación de suspensión\n4. Iniciar proceso de recuperación de cobros\n5. Evaluar reactivación futura\n\n📈 ANÁLISIS FINANCIERO:\n- Pérdida de ingresos: {amount} {currency}\n- Costo de reactivación: {reactivationCost}\n- Valor del cliente: {clientValue}\n- Probabilidad de recuperación: {recoveryProbability}%\n\n📞 SEGUIMIENTO:\n- Contactar para negociación de pago\n- Ofrecer planes de pago flexibles\n- Documentar todas las comunicaciones\n- Evaluar cancelación definitiva\n\n📋 DOCUMENTACIÓN:\n- Historial de pagos: {paymentHistory}\n- Comunicaciones previas: {communicationHistory}\n- Términos del servicio: {serviceTerms}\n- Política de suspensión: {suspensionPolicy}\n\nEste es un mensaje automático del sistema de gestión de cobros.\n\nSistema de Gestión - {companyName}"
    },
    adminPagoRecibido: {
      name: "Notificación Admin: Pago Recibido",
      subject: "CONFIRMADO: Pago recibido - {clientName}",
      body: "Estimado/a Administrador,\n\n✅ PAGO CONFIRMADO - Servicio reactivado:\n\n📋 INFORMACIÓN DEL PAGO:\n- Cliente: {clientName} ({clientEmail})\n- Servicio: {description}\n- Monto recibido: {amount} {currency}\n- Fecha de pago: {paymentDate}\n- Método de pago: {paymentMethod}\n- Referencia: {paymentReference}\n\n📊 ESTADO ACTUAL:\n- Estado: Activo\n- Servicio reactivado: ✅\n- Notificación enviada al cliente: ✅\n- Plantilla utilizada: Confirmación de Pago Recibido\n- Próximo vencimiento: {nextDueDate}\n\n🎯 ACCIONES COMPLETADAS:\n1. Pago procesado y verificado\n2. Servicio reactivado automáticamente\n3. Cliente notificado del pago\n4. Próxima fecha de vencimiento actualizada\n5. Historial de pagos actualizado\n\n📈 IMPACTO POSITIVO:\n- Ingresos recuperados: {amount} {currency}\n- Cliente retenido: ✅\n- Servicio activo: ✅\n- Próximo ciclo iniciado\n\n📊 ESTADÍSTICAS:\n- Tiempo de pago: {paymentTime} días\n- Eficiencia de cobro: {collectionEfficiency}%\n- Satisfacción del cliente: {clientSatisfaction}\n- Ingresos mensuales: {monthlyRevenue}\n\n📋 SEGUIMIENTO:\n- Monitorear estabilidad del servicio\n- Preparar próximo recordatorio\n- Actualizar perfil del cliente\n- Documentar éxito de cobro\n\nEste es un mensaje automático del sistema de gestión de cobros.\n\nSistema de Gestión - {companyName}"
    },
    adminNuevoCliente: {
      name: "Notificación Admin: Nuevo Cliente",
      subject: "NUEVO CLIENTE: {clientName} - Servicio {description}",
      body: "Estimado/a Administrador,\n\n🎉 NUEVO CLIENTE REGISTRADO:\n\n📋 INFORMACIÓN DEL CLIENTE:\n- Nombre: {clientName}\n- Email: {clientEmail}\n- Identificación: {clientId}\n- Teléfono: {clientPhone}\n- Fecha de registro: {registrationDate}\n\n📋 INFORMACIÓN DEL SERVICIO:\n- Descripción: {description}\n- Tipo: {serviceType}\n- Monto: {amount} {currency}\n- Ciclo de facturación: {billingCycle}\n- Fecha de vencimiento: {dueDate}\n- Estado: Activo\n\n📊 CONFIGURACIÓN:\n- Servicio activado: ✅\n- Notificación de bienvenida enviada: ✅\n- Plantilla utilizada: Bienvenida a Nuevo Cliente\n- Portal de cliente habilitado: ✅\n- Método de pago configurado: {paymentMethod}\n\n🎯 ACCIONES INICIALES:\n1. Verificar activación del servicio\n2. Confirmar recepción de bienvenida\n3. Programar seguimiento inicial\n4. Configurar recordatorios automáticos\n5. Documentar preferencias del cliente\n\n📈 ANÁLISIS:\n- Valor del cliente: {clientValue}\n- Potencial de crecimiento: {growthPotential}\n- Segmento: {clientSegment}\n- Fuente de adquisición: {acquisitionSource}\n\n📋 PRÓXIMOS PASOS:\n- Seguimiento en 7 días\n- Verificar satisfacción inicial\n- Preparar próximo recordatorio\n- Monitorear uso del servicio\n\nEste es un mensaje automático del sistema de gestión de cobros.\n\nSistema de Gestión - {companyName}"
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCurrentTemplate(null);
    setIsEditing(false);
    setName(suggestion.name);
    setSubject(suggestion.subject);
    setBody(suggestion.body);
    addNotification("Sugerencia cargada en el editor.", "success");
  };

  // Cargar administradores
  useEffect(() => {
    const usersCollection = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const unsubscribe = onSnapshot(
      query(usersCollection, where('role', 'in', ['admin', 'superadmin'])),
      snapshot => {
        setAdmins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );
    return unsubscribe;
  }, []);

  // Cargar configuraciones de alertas
  useEffect(() => {
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'alertSettings');
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        setAlertSettings(doc.data());
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const templatesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'messageTemplates');
    const unsubscribe = onSnapshot(query(templatesCollection, orderBy('name')), snapshot => {
      setTemplates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    if (currentTemplate) {
      setName(currentTemplate.name);
      setSubject(currentTemplate.subject);
      setBody(currentTemplate.body);
      setIsEditing(true);
    } else {
      setName('');
      setSubject('');
      setBody('');
      setIsEditing(false);
    }
  }, [currentTemplate]);

  const handleSaveTemplate = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      addNotification("Por favor, complete todos los campos de la plantilla.", "error");
      return;
    }
    
    const data = { 
      name: name.trim(), 
      subject: subject.trim(), 
      body: body.trim(),
      updatedAt: new Date()
    };
    
    const templatesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'messageTemplates');
    
    try {
      if (currentTemplate) {
        await updateDoc(doc(templatesCollection, currentTemplate.id), data);
        addNotification("Plantilla actualizada exitosamente.", "success");
      } else {
        await addDoc(templatesCollection, { ...data, createdAt: new Date() });
        addNotification("Plantilla creada exitosamente.", "success");
      }
      setCurrentTemplate(null);
    } catch (error) {
      console.error("Error saving template:", error);
      addNotification("Error al guardar la plantilla.", "error");
    }
  };
  
  const handleDeleteTemplate = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar esta plantilla?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'messageTemplates', id));
        addNotification("Plantilla eliminada.", "success");
        setCurrentTemplate(null);
      } catch(error) {
        console.error("Error deleting template:", error);
        addNotification("Error al eliminar la plantilla.", "error");
      }
    }
  };

  const handleNewTemplate = () => {
    setCurrentTemplate(null);
    setIsEditing(false);
    setName('');
    setSubject('');
    setBody('');
  };

  const handleEditTemplate = (template) => {
    setCurrentTemplate(template);
    setIsEditing(true);
  };

  // Funciones para manejar configuraciones de alertas
  const handleAlertSettingChange = (alertType, field, value) => {
    setAlertSettings(prev => ({
      ...prev,
      [alertType]: {
        ...prev[alertType],
        [field]: value
      }
    }));
  };

  const handleAdminSelection = (alertType, adminId, checked) => {
    setAlertSettings(prev => ({
      ...prev,
      [alertType]: {
        ...prev[alertType],
        selectedAdmins: checked 
          ? [...prev[alertType].selectedAdmins, adminId]
          : prev[alertType].selectedAdmins.filter(id => id !== adminId)
      }
    }));
  };

  const saveAlertSettings = async () => {
    try {
      const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'alertSettings');
      await setDoc(settingsRef, alertSettings, { merge: true });
      addNotification("Configuración de alertas guardada exitosamente.", "success");
    } catch (error) {
      console.error("Error saving alert settings:", error);
      addNotification("Error al guardar la configuración de alertas.", "error");
    }
  };

  const availableVariables = [
    '{clientName}', '{serviceType}', '{description}', 
    '{amount}', '{currency}', '{dueDate}', '{companyName}',
    '{billingCycle}', '{clientEmail}'
  ];

  const adminVariables = [
    '{clientName}', '{clientEmail}', '{clientPhone}', '{clientId}',
    '{serviceType}', '{description}', '{amount}', '{currency}', 
    '{dueDate}', '{billingCycle}', '{companyName}',
    '{daysRemaining}', '{daysOverdue}', '{graceDays}', '{remainingGraceDays}',
    '{totalPending}', '{potentialRevenue}', '{paymentHistory}', '{clientSince}',
    '{previousPayments}', '{paymentPattern}', '{riskLevel}', '{lastContact}',
    '{suspensionDate}', '{reactivationCost}', '{clientValue}', '{recoveryProbability}',
    '{paymentDate}', '{paymentMethod}', '{paymentReference}', '{nextDueDate}',
    '{paymentTime}', '{collectionEfficiency}', '{clientSatisfaction}', '{monthlyRevenue}',
    '{registrationDate}', '{growthPotential}', '{clientSegment}', '{acquisitionSource}',
    '{gracePeriod}', '{communicationHistory}', '{serviceTerms}', '{suspensionPolicy}'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Plantillas y Alertas</h2>
        <p className="text-gray-600 mt-2">Gestiona las plantillas de correo y configura alertas automáticas</p>
      </div>

      {/* Pestañas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TemplatesIcon />
              <span className="ml-2">Plantillas</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BellIcon />
              <span className="ml-2">Alertas Automáticas</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de Plantillas */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel izquierdo - Lista de plantillas y sugerencias */}
        <div className="lg:col-span-1 space-y-6">
          {/* Lista de plantillas existentes */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Plantillas Guardadas</h3>
              <p className="text-sm text-gray-500">Haz clic para editar una plantilla</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {templates.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No hay plantillas guardadas</p>
                  <p className="text-sm">Crea tu primera plantilla</p>
                </div>
              ) : (
                templates.map(template => (
                  <div key={template.id} className="p-4 border-b hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{template.name}</h4>
                        <p className="text-sm text-gray-500 truncate mt-1">{template.subject}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {template.createdAt ? new Date(template.createdAt.seconds * 1000).toLocaleDateString() : 'Sin fecha'}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <button 
                          onClick={() => handleEditTemplate(template)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Editar plantilla"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Eliminar plantilla"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4">
              <button 
                onClick={handleNewTemplate}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon />
                <span className="ml-2">Nueva Plantilla</span>
              </button>
            </div>
          </div>
          
          {/* Sugerencias de plantillas para CLIENTES */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Plantillas para Clientes</h3>
              <p className="text-sm text-gray-500">Mensajes dirigidos a los clientes</p>
            </div>
            <div className="p-4 space-y-2">
              <button 
                onClick={() => handleSuggestionClick(templateSuggestions.preVencimiento)} 
                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-blue-900">Aviso de Próximo Vencimiento</div>
                <div className="text-sm text-blue-700">Recordatorio antes del vencimiento</div>
              </button>
              
              <button 
                onClick={() => handleSuggestionClick(templateSuggestions.vencido)} 
                className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-yellow-900">Servicio Vencido</div>
                <div className="text-sm text-yellow-700">Notificación de período de gracia</div>
              </button>
              
              <button 
                onClick={() => handleSuggestionClick(templateSuggestions.suspendido)} 
                className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-red-900">Aviso de Suspensión</div>
                <div className="text-sm text-red-700">Servicio suspendido por falta de pago</div>
              </button>
              
              <button 
                onClick={() => handleSuggestionClick(templateSuggestions.pagoRecibido)} 
                className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-green-900">Confirmación de Pago</div>
                <div className="text-sm text-green-700">Confirmación de pago recibido</div>
              </button>
              
              <button 
                onClick={() => handleSuggestionClick(templateSuggestions.bienvenida)} 
                className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-purple-900">Bienvenida</div>
                <div className="text-sm text-purple-700">Mensaje de bienvenida a nuevos clientes</div>
              </button>
            </div>
          </div>

          {/* Sugerencias de plantillas para ADMINISTRADORES */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Plantillas para Administradores</h3>
              <p className="text-sm text-gray-500">Alertas y notificaciones internas</p>
            </div>
            <div className="p-4 space-y-2">
              <button 
                onClick={() => handleSuggestionClick(templateSuggestions.adminPreVencimiento)} 
                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-blue-900">🔔 Alerta: Próximo Vencimiento</div>
                <div className="text-sm text-blue-700">Notificación interna de servicios próximos a vencer</div>
              </button>
              
              <button 
                onClick={() => handleSuggestionClick(templateSuggestions.adminPeriodoGracia)} 
                className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-orange-900">⚠️ Alerta: Período de Gracia</div>
                <div className="text-sm text-orange-700">Alerta urgente de servicios en período de gracia</div>
              </button>
              
              <button 
                onClick={() => handleSuggestionClick(templateSuggestions.adminVencido)} 
                className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-red-900">🔴 Alerta: Servicio Vencido</div>
                <div className="text-sm text-red-700">Notificación inmediata de servicios vencidos</div>
              </button>
              
              <button 
                onClick={() => handleSuggestionClick(templateSuggestions.adminSuspendido)} 
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-gray-900">❌ Alerta: Servicio Suspendido</div>
                <div className="text-sm text-gray-700">Notificación de servicios cancelados por falta de pago</div>
              </button>
              
              <button 
                onClick={() => handleSuggestionClick(templateSuggestions.adminPagoRecibido)} 
                className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-green-900">✅ Notificación: Pago Recibido</div>
                <div className="text-sm text-green-700">Confirmación interna de pagos procesados</div>
              </button>
              
              <button 
                onClick={() => handleSuggestionClick(templateSuggestions.adminNuevoCliente)} 
                className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-purple-900">🎉 Notificación: Nuevo Cliente</div>
                <div className="text-sm text-purple-700">Alerta de nuevos clientes registrados</div>
              </button>
            </div>
          </div>

          {/* Variables disponibles */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Variables para Clientes</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-medium">Información básica:</p>
              <p>{availableVariables.slice(0, 3).join(', ')}</p>
              
              <p className="font-medium mt-2">Información del servicio:</p>
              <p>{availableVariables.slice(3, 6).join(', ')}</p>
              
              <p className="font-medium mt-2">Información adicional:</p>
              <p>{availableVariables.slice(6).join(', ')}</p>
            </div>
          </div>

          {/* Variables para administradores */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Variables para Administradores</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-medium">Información del cliente:</p>
              <p>{adminVariables.slice(0, 4).join(', ')}</p>
              
              <p className="font-medium mt-2">Información del servicio:</p>
              <p>{adminVariables.slice(4, 11).join(', ')}</p>
              
              <p className="font-medium mt-2">Fechas y tiempos:</p>
              <p>{adminVariables.slice(11, 15).join(', ')}</p>
              
              <p className="font-medium mt-2">Estadísticas:</p>
              <p>{adminVariables.slice(15, 19).join(', ')}</p>
              
              <p className="font-medium mt-2">Análisis de riesgo:</p>
              <p>{adminVariables.slice(19, 23).join(', ')}</p>
              
              <p className="font-medium mt-2">Información de pago:</p>
              <p>{adminVariables.slice(23, 27).join(', ')}</p>
              
              <p className="font-medium mt-2">Métricas de rendimiento:</p>
              <p>{adminVariables.slice(27, 31).join(', ')}</p>
              
              <p className="font-medium mt-2">Información de registro:</p>
              <p>{adminVariables.slice(31, 35).join(', ')}</p>
              
              <p className="font-medium mt-2">Configuración:</p>
              <p>{adminVariables.slice(35).join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Panel derecho - Editor de plantillas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Editando Plantilla' : 'Nueva Plantilla'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isEditing ? 'Modifica los campos de la plantilla' : 'Completa los campos para crear una nueva plantilla'}
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Nombre de la plantilla */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Plantilla
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Ej: Primer Recordatorio de Pago" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>

              {/* Asunto del correo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto del Correo
                </label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  placeholder="Ej: Recordatorio de Renovación: {description}" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>

              {/* Cuerpo del mensaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuerpo del Mensaje
                </label>
                <textarea 
                  value={body} 
                  onChange={e => setBody(e.target.value)} 
                  placeholder="Escribe el contenido del mensaje aquí..." 
                  rows="12" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" 
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button 
                  onClick={handleNewTemplate}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Limpiar
                </button>
                <button 
                  onClick={handleSaveTemplate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {isEditing ? 'Guardar Cambios' : 'Crear Plantilla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Contenido de Alertas Automáticas */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Configuración de Alertas Pre-vencimiento */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                Alerta de Próximo Vencimiento
              </h3>
              <p className="text-sm text-gray-600 mt-1">Notificaciones antes del vencimiento del servicio</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Activar alerta</label>
                  <p className="text-xs text-gray-500">Enviar notificaciones antes del vencimiento</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertSettings.preVencimiento.enabled}
                    onChange={(e) => handleAlertSettingChange('preVencimiento', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {alertSettings.preVencimiento.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Días antes del vencimiento</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={alertSettings.preVencimiento.days}
                        onChange={(e) => handleAlertSettingChange('preVencimiento', 'days', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plantilla para cliente</label>
                      <select
                        value={alertSettings.preVencimiento.clientTemplate}
                        onChange={(e) => handleAlertSettingChange('preVencimiento', 'clientTemplate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccionar plantilla</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Notificar administradores</label>
                        <p className="text-xs text-gray-500">Enviar copia a administradores seleccionados</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertSettings.preVencimiento.notifyAdmins}
                          onChange={(e) => handleAlertSettingChange('preVencimiento', 'notifyAdmins', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {alertSettings.preVencimiento.notifyAdmins && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plantilla para administradores</label>
                          <select
                            value={alertSettings.preVencimiento.adminTemplate}
                            onChange={(e) => handleAlertSettingChange('preVencimiento', 'adminTemplate', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Seleccionar plantilla</option>
                            {templates.map(template => (
                              <option key={template.id} value={template.id}>{template.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Administradores a notificar</label>
                          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                            {admins.map(admin => (
                              <label key={admin.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={alertSettings.preVencimiento.selectedAdmins.includes(admin.id)}
                                  onChange={(e) => handleAdminSelection('preVencimiento', admin.id, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{admin.fullName} ({admin.email})</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Configuración de Período de Gracia */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                Período de Gracia
              </h3>
              <p className="text-sm text-gray-600 mt-1">Notificaciones durante el período de gracia después del vencimiento</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Activar período de gracia</label>
                  <p className="text-xs text-gray-500">Tiempo adicional para pagar antes de suspender</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertSettings.periodoGracia.enabled}
                    onChange={(e) => handleAlertSettingChange('periodoGracia', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {alertSettings.periodoGracia.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Días de gracia</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={alertSettings.periodoGracia.days}
                        onChange={(e) => handleAlertSettingChange('periodoGracia', 'days', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plantilla para cliente</label>
                      <select
                        value={alertSettings.periodoGracia.clientTemplate}
                        onChange={(e) => handleAlertSettingChange('periodoGracia', 'clientTemplate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccionar plantilla</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Notificar administradores</label>
                        <p className="text-xs text-gray-500">Enviar copia a administradores seleccionados</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertSettings.periodoGracia.notifyAdmins}
                          onChange={(e) => handleAlertSettingChange('periodoGracia', 'notifyAdmins', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {alertSettings.periodoGracia.notifyAdmins && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plantilla para administradores</label>
                          <select
                            value={alertSettings.periodoGracia.adminTemplate}
                            onChange={(e) => handleAlertSettingChange('periodoGracia', 'adminTemplate', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Seleccionar plantilla</option>
                            {templates.map(template => (
                              <option key={template.id} value={template.id}>{template.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Administradores a notificar</label>
                          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                            {admins.map(admin => (
                              <label key={admin.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={alertSettings.periodoGracia.selectedAdmins.includes(admin.id)}
                                  onChange={(e) => handleAdminSelection('periodoGracia', admin.id, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{admin.fullName} ({admin.email})</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Configuración de Servicio Vencido */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                Servicio Vencido
              </h3>
              <p className="text-sm text-gray-600 mt-1">Notificaciones cuando el servicio ha vencido</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Activar alerta</label>
                  <p className="text-xs text-gray-500">Enviar notificaciones cuando el servicio vence</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertSettings.vencido.enabled}
                    onChange={(e) => handleAlertSettingChange('vencido', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {alertSettings.vencido.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plantilla para cliente</label>
                      <select
                        value={alertSettings.vencido.clientTemplate}
                        onChange={(e) => handleAlertSettingChange('vencido', 'clientTemplate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccionar plantilla</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plantilla para administradores</label>
                      <select
                        value={alertSettings.vencido.adminTemplate}
                        onChange={(e) => handleAlertSettingChange('vencido', 'adminTemplate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccionar plantilla</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notificar administradores</label>
                      <p className="text-xs text-gray-500">Enviar copia a administradores seleccionados</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertSettings.vencido.notifyAdmins}
                        onChange={(e) => handleAlertSettingChange('vencido', 'notifyAdmins', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {alertSettings.vencido.notifyAdmins && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Administradores a notificar</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {admins.map(admin => (
                          <label key={admin.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={alertSettings.vencido.selectedAdmins.includes(admin.id)}
                              onChange={(e) => handleAdminSelection('vencido', admin.id, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{admin.fullName} ({admin.email})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botón de guardar configuración */}
          <div className="flex justify-end">
            <button
              onClick={saveAlertSettings}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              <SettingsIcon />
              <span className="ml-2">Guardar Configuración de Alertas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTemplatesDashboard;
