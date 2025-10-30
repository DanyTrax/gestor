import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { CreditCardIcon, CheckIcon, XIcon } from '../../icons';

function PaymentMessageModal({ isOpen, onClose, payment, onSend, isDemo }) {
  const { addNotification } = useNotification();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [messageType, setMessageType] = useState('approval'); // 'approval' o 'rejection'
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const templateSuggestions = {
    approval: [
      {
        id: 'approval_1',
        name: 'Pago Aprobado - Estándar',
        subject: 'Pago Aprobado - {serviceNumber}',
        body: `Estimado/a {clientName},

Su pago por el servicio {serviceNumber} ha sido aprobado exitosamente.

Detalles del pago:
- Servicio: {serviceType}
- Monto: {amount} {currency}
- Fecha: {paymentDate}
- Método: {gateway}

Su servicio está ahora activo. Gracias por su pago.

Saludos cordiales,
Equipo de Soporte`
      },
      {
        id: 'approval_2',
        name: 'Pago Aprobado - Con Acceso',
        subject: 'Pago Confirmado - Acceso Activado',
        body: `Hola {clientName},

¡Excelente noticia! Su pago de {amount} {currency} ha sido procesado correctamente.

Su servicio {serviceType} (Ref: {serviceNumber}) está ahora activo y disponible.

Puede acceder a su panel de cliente en: {clientPortalUrl}

Si tiene alguna pregunta, no dude en contactarnos.

¡Gracias por confiar en nosotros!`
      }
    ],
    rejection: [
      {
        id: 'rejection_1',
        name: 'Pago Rechazado - Estándar',
        subject: 'Pago Rechazado - {serviceNumber}',
        body: `Estimado/a {clientName},

Lamentamos informarle que su pago por el servicio {serviceNumber} no pudo ser procesado.

Detalles del pago:
- Servicio: {serviceType}
- Monto: {amount} {currency}
- Fecha: {paymentDate}
- Método: {gateway}

Por favor, verifique los datos de su método de pago e intente nuevamente.

Si necesita ayuda, contacte a nuestro equipo de soporte.

Saludos cordiales,
Equipo de Soporte`
      },
      {
        id: 'rejection_2',
        name: 'Pago Rechazado - Con Alternativas',
        subject: 'Problema con el Pago - Alternativas Disponibles',
        body: `Hola {clientName},

Hemos detectado un problema con su pago de {amount} {currency} para el servicio {serviceNumber}.

Métodos de pago alternativos disponibles:
- Transferencia bancaria
- PayPal
- Pago en efectivo (oficina)

Para más información, visite: {paymentMethodsUrl}

¿Necesita ayuda? Contáctenos: {supportEmail}

¡Estamos aquí para ayudarle!`
      }
    ]
  };

  useEffect(() => {
    if (isDemo) {
      setTemplates([]);
      return;
    }

    // Cargar plantillas personalizadas desde Firestore
    const templatesQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'templates'),
      where('type', '==', 'payment_message')
    );

    const unsubscribe = onSnapshot(templatesQuery, (snapshot) => {
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTemplates(templatesData);
    });

    return () => unsubscribe();
  }, [isDemo]);

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    
    // Buscar en plantillas personalizadas
    const customTemplate = templates.find(t => t.id === templateId);
    if (customTemplate) {
      setCustomMessage(customTemplate.body);
      return;
    }

    // Buscar en plantillas sugeridas
    const suggestions = templateSuggestions[messageType];
    const suggestedTemplate = suggestions.find(t => t.id === templateId);
    if (suggestedTemplate) {
      setCustomMessage(suggestedTemplate.body);
    }
  };

  const replaceVariables = (message) => {
    if (!payment) return message;
    
    return message
      .replace(/{clientName}/g, payment.clientName || 'Cliente')
      .replace(/{serviceNumber}/g, payment.serviceNumber || 'N/A')
      .replace(/{serviceType}/g, payment.serviceType || 'Servicio')
      .replace(/{amount}/g, payment.amount || '0')
      .replace(/{currency}/g, payment.currency || 'USD')
      .replace(/{gateway}/g, payment.gateway || 'N/A')
      .replace(/{paymentDate}/g, new Date().toLocaleDateString('es-ES'))
      .replace(/{clientPortalUrl}/g, window.location.origin)
      .replace(/{paymentMethodsUrl}/g, `${window.location.origin}/payment-methods`)
      .replace(/{supportEmail}/g, 'soporte@empresa.com');
  };

  const handleSend = async () => {
    if (!customMessage.trim()) {
      addNotification("Por favor, ingrese un mensaje", "error");
      return;
    }

    setLoading(true);
    try {
      const messageData = {
        paymentId: payment.id,
        type: messageType,
        templateId: selectedTemplate,
        message: replaceVariables(customMessage),
        sentAt: new Date(),
        status: 'sent'
      };

      await onSend(messageData);
      addNotification(`Mensaje de ${messageType === 'approval' ? 'aprobación' : 'rechazo'} enviado`, "success");
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
      addNotification("Error al enviar el mensaje", "error");
    }
    setLoading(false);
  };

  if (!isOpen || !payment) return null;

  const currentSuggestions = templateSuggestions[messageType];
  const allTemplates = [...templates, ...currentSuggestions];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCardIcon />
            Enviar Mensaje de {messageType === 'approval' ? 'Aprobación' : 'Rechazo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Información del pago */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Información del Pago</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Cliente:</span>
              <span className="ml-2">{payment.clientName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Servicio:</span>
              <span className="ml-2 font-mono">{payment.serviceNumber}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Monto:</span>
              <span className="ml-2">{payment.amount} {payment.currency}</span>
            </div>
          </div>
        </div>

        {/* Tipo de mensaje */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Mensaje</label>
          <div className="flex space-x-4">
            <button
              onClick={() => setMessageType('approval')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                messageType === 'approval'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <CheckIcon />
              Aprobación
            </button>
            <button
              onClick={() => setMessageType('rejection')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                messageType === 'rejection'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <XIcon />
              Rechazo
            </button>
          </div>
        </div>

        {/* Selección de plantilla */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Seleccionar Plantilla</label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">-- Seleccionar plantilla --</option>
            {allTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* Editor de mensaje */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje Personalizado</label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Escriba su mensaje personalizado aquí..."
            rows={12}
            className="w-full p-3 border rounded-md font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Variables disponibles: {clientName}, {serviceNumber}, {serviceType}, {amount}, {currency}, {gateway}, {paymentDate}
          </p>
        </div>

        {/* Vista previa */}
        {customMessage && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Vista Previa</label>
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="font-semibold text-gray-800 mb-2">
                {messageType === 'approval' ? '✅ Pago Aprobado' : '❌ Pago Rechazado'}
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {replaceVariables(customMessage)}
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !customMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : `Enviar ${messageType === 'approval' ? 'Aprobación' : 'Rechazo'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentMessageModal;





