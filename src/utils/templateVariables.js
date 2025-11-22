/**
 * Utilidades para reemplazar variables en plantillas de email
 */

/**
 * Reemplazar variables comunes en plantillas
 * @param {string} text - Texto con variables a reemplazar
 * @param {object} data - Objeto con los valores para reemplazar
 * @param {object} options - Opciones adicionales (companySettings, etc.)
 * @returns {string} - Texto con variables reemplazadas
 */
export const replaceTemplateVariables = (text, data = {}, options = {}) => {
  if (!text || typeof text !== 'string') return text;

  const loginUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const clientPortalUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const companyName = options.companySettings?.companyName || 'Sistema de Gestión de Cobros';

  // Mapeo de variables comunes
  const defaultReplacements = {
    // URLs del sistema
    '{loginUrl}': loginUrl,
    '{clientPortalUrl}': clientPortalUrl,
    '{clientLoginUrl}': loginUrl,
    '{resetPasswordUrl}': data.resetPasswordUrl || loginUrl + ' (El enlace se generará automáticamente)',
    
    // Información de la empresa
    '{companyName}': companyName,
    
    // Información del cliente
    '{clientName}': data.clientName || data.fullName || 'Cliente',
    '{clientEmail}': data.clientEmail || data.email || '',
    '{clientPhone}': data.clientPhone || data.phone || '',
    '{clientId}': data.clientId || data.userId || '',
    
    // Información del servicio
    '{serviceType}': data.serviceType || '',
    '{description}': data.description || '',
    '{serviceNumber}': data.serviceNumber || '',
    '{amount}': data.amount || '0',
    '{currency}': data.currency || 'USD',
    '{dueDate}': data.dueDate || '',
    '{billingCycle}': data.billingCycle || '',
    
    // Fechas y tiempos
    '{daysRemaining}': data.daysRemaining || data.daysUntilDue || '0',
    '{daysOverdue}': data.daysOverdue || '0',
    '{graceDays}': data.graceDays || '0',
    '{remainingGraceDays}': data.remainingGraceDays || '0',
    
    // Estadísticas
    '{totalPending}': data.totalPending || '0',
    '{potentialRevenue}': data.potentialRevenue || '0',
    '{paymentHistory}': data.paymentHistory || 'N/A',
    '{clientSince}': data.clientSince || '',
    
    // Análisis
    '{previousPayments}': data.previousPayments || '0',
    '{paymentPattern}': data.paymentPattern || 'N/A',
    '{riskLevel}': data.riskLevel || 'N/A',
    '{lastContact}': data.lastContact || 'N/A',
    
    // Suspensión
    '{suspensionDate}': data.suspensionDate || '',
    '{reactivationCost}': data.reactivationCost || '0',
    '{clientValue}': data.clientValue || '0',
    '{recoveryProbability}': data.recoveryProbability || '0',
    
    // Pagos
    '{paymentDate}': data.paymentDate || new Date().toLocaleDateString('es-ES'),
    '{paymentMethod}': data.paymentMethod || '',
    '{paymentReference}': data.paymentReference || '',
    '{nextDueDate}': data.nextDueDate || '',
    
    // Métricas
    '{paymentTime}': data.paymentTime || '0',
    '{collectionEfficiency}': data.collectionEfficiency || '0',
    '{clientSatisfaction}': data.clientSatisfaction || 'N/A',
    '{monthlyRevenue}': data.monthlyRevenue || '0',
    
    // Registro
    '{registrationDate}': data.registrationDate || '',
    '{growthPotential}': data.growthPotential || 'N/A',
    '{clientSegment}': data.clientSegment || 'N/A',
    '{acquisitionSource}': data.acquisitionSource || 'N/A',
    
    // Configuración
    '{gracePeriod}': data.gracePeriod || '0',
    '{communicationHistory}': data.communicationHistory || 'N/A',
    '{serviceTerms}': data.serviceTerms || 'N/A',
    '{suspensionPolicy}': data.suspensionPolicy || 'N/A',
  };

  // Combinar reemplazos por defecto con los proporcionados
  const replacements = { ...defaultReplacements, ...data.replacements };

  // Reemplazar todas las variables
  let result = text;
  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(key.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    result = result.replace(regex, String(value));
  });

  return result;
};

/**
 * Reemplazar variables en plantillas para administradores
 * Incluye todas las variables comunes más las específicas de admin
 */
export const replaceAdminTemplateVariables = (text, data = {}, options = {}) => {
  return replaceTemplateVariables(text, data, options);
};

/**
 * Reemplazar variables en plantillas para clientes
 * Incluye variables básicas para clientes
 */
export const replaceClientTemplateVariables = (text, data = {}, options = {}) => {
  return replaceTemplateVariables(text, data, options);
};

