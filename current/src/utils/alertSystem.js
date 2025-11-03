// Sistema de Alertas Automáticas
import { collection, query, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

// Calcular fecha de vencimiento basada en el ciclo
export const calculateExpirationDate = (service) => {
  if (!service.dueDate || !service.billingCycle || service.billingCycle === 'One-Time') {
    return service.expirationDate ? service.expirationDate.toDate() : null;
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
      return null;
  }

  return endDate;
};

// Verificar si un servicio necesita alerta de pre-vencimiento
export const checkPreVencimientoAlert = (service, alertSettings) => {
  if (!alertSettings.preVencimiento.enabled || !service.dueDate) return false;
  
  const expirationDate = calculateExpirationDate(service);
  if (!expirationDate) return false;
  
  const now = new Date();
  const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiration <= alertSettings.preVencimiento.days && daysUntilExpiration > 0;
};

// Verificar si un servicio está en período de gracia
export const checkPeriodoGraciaAlert = (service, alertSettings) => {
  if (!alertSettings.periodoGracia.enabled || !service.dueDate) return false;
  
  const expirationDate = calculateExpirationDate(service);
  if (!expirationDate) return false;
  
  const now = new Date();
  const daysOverdue = Math.ceil((now - expirationDate) / (1000 * 60 * 60 * 24));
  
  return daysOverdue > 0 && daysOverdue <= alertSettings.periodoGracia.days;
};

// Verificar si un servicio ha vencido
export const checkVencidoAlert = (service, alertSettings) => {
  if (!alertSettings.vencido.enabled || !service.dueDate) return false;
  
  const expirationDate = calculateExpirationDate(service);
  if (!expirationDate) return false;
  
  const now = new Date();
  const daysOverdue = Math.ceil((now - expirationDate) / (1000 * 60 * 60 * 24));
  
  return daysOverdue > alertSettings.periodoGracia.days;
};

// Procesar alertas automáticas
export const processAutomaticAlerts = async (services, alertSettings, templates, admins) => {
  const alerts = [];
  
  for (const service of services) {
    const expirationDate = calculateExpirationDate(service);
    if (!expirationDate) continue;
    
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
    const daysOverdue = Math.ceil((now - expirationDate) / (1000 * 60 * 60 * 24));
    
    // Alerta de pre-vencimiento
    if (checkPreVencimientoAlert(service, alertSettings)) {
      const clientTemplate = templates.find(t => t.id === alertSettings.preVencimiento.clientTemplate);
      const adminTemplate = templates.find(t => t.id === alertSettings.preVencimiento.adminTemplate);
      
      if (clientTemplate) {
        alerts.push({
          type: 'preVencimiento',
          serviceId: service.id,
          clientId: service.assignedUserId,
          template: clientTemplate,
          daysUntilExpiration,
          expirationDate: expirationDate.toISOString()
        });
      }
      
      if (alertSettings.preVencimiento.notifyAdmins && adminTemplate) {
        for (const adminId of alertSettings.preVencimiento.selectedAdmins) {
          alerts.push({
            type: 'adminPreVencimiento',
            serviceId: service.id,
            adminId,
            template: adminTemplate,
            daysUntilExpiration,
            expirationDate: expirationDate.toISOString()
          });
        }
      }
    }
    
    // Alerta de período de gracia
    if (checkPeriodoGraciaAlert(service, alertSettings)) {
      const clientTemplate = templates.find(t => t.id === alertSettings.periodoGracia.clientTemplate);
      const adminTemplate = templates.find(t => t.id === alertSettings.periodoGracia.adminTemplate);
      
      if (clientTemplate) {
        alerts.push({
          type: 'periodoGracia',
          serviceId: service.id,
          clientId: service.assignedUserId,
          template: clientTemplate,
          daysOverdue,
          expirationDate: expirationDate.toISOString()
        });
      }
      
      if (alertSettings.periodoGracia.notifyAdmins && adminTemplate) {
        for (const adminId of alertSettings.periodoGracia.selectedAdmins) {
          alerts.push({
            type: 'adminPeriodoGracia',
            serviceId: service.id,
            adminId,
            template: adminTemplate,
            daysOverdue,
            expirationDate: expirationDate.toISOString()
          });
        }
      }
    }
    
    // Alerta de servicio vencido
    if (checkVencidoAlert(service, alertSettings)) {
      const clientTemplate = templates.find(t => t.id === alertSettings.vencido.clientTemplate);
      const adminTemplate = templates.find(t => t.id === alertSettings.vencido.adminTemplate);
      
      if (clientTemplate) {
        alerts.push({
          type: 'vencido',
          serviceId: service.id,
          clientId: service.assignedUserId,
          template: clientTemplate,
          daysOverdue,
          expirationDate: expirationDate.toISOString()
        });
      }
      
      if (alertSettings.vencido.notifyAdmins && adminTemplate) {
        for (const adminId of alertSettings.vencido.selectedAdmins) {
          alerts.push({
            type: 'adminVencido',
            serviceId: service.id,
            adminId,
            template: adminTemplate,
            daysOverdue,
            expirationDate: expirationDate.toISOString()
          });
        }
      }
    }
  }
  
  return alerts;
};

// Enviar alerta
export const sendAlert = async (alert, service, client, admin = null) => {
  try {
    const messageData = {
      type: alert.type,
      serviceId: alert.serviceId,
      recipientId: alert.clientId || alert.adminId,
      recipientEmail: client?.email || admin?.email,
      recipientName: client?.fullName || admin?.fullName,
      templateId: alert.template.id,
      subject: alert.template.subject,
      body: alert.template.body,
      status: 'pending',
      createdAt: Timestamp.now(),
      scheduledFor: Timestamp.now(),
      variables: {
        clientName: client?.fullName || 'Cliente',
        clientEmail: client?.email || 'N/A',
        serviceType: service.serviceType,
        description: service.description,
        amount: service.amount,
        currency: service.currency,
        dueDate: service.dueDate?.toDate().toLocaleDateString() || 'N/A',
        expirationDate: alert.expirationDate,
        daysUntilExpiration: alert.daysUntilExpiration || 0,
        daysOverdue: alert.daysOverdue || 0,
        billingCycle: service.billingCycle,
        serviceNumber: service.serviceNumber
      }
    };
    
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), messageData);
    return true;
  } catch (error) {
    console.error('Error sending alert:', error);
    return false;
  }
};




