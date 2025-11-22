import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';

function ManualReminderModal({ isOpen, onClose, onSend, service, templates, companySettings }) {
  const { addNotification } = useNotification();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (templates.length > 0 && isOpen) {
      setSelectedTemplateId(templates[0]?.id || '');
    }
  }, [templates, isOpen]);

  useEffect(() => {
    if (selectedTemplateId && service) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        const formattedDueDate = service.dueDate ? new Date(service.dueDate.seconds * 1000).toLocaleDateString() : 'N/A';
        const replacements = {
          '{clientName}': service.clientName || '',
          '{serviceType}': service.serviceType || '',
          '{description}': service.description || '',
          '{amount}': `$${service.amount?.toFixed(2)} ${service.currency}` || '',
          '{dueDate}': formattedDueDate,
          '{companyName}': companySettings.companyName || 'Tu Empresa'
        };
        let finalSubject = template.subject;
        let finalBody = template.body;
        for (const key in replacements) {
          const regex = new RegExp(key.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
          finalSubject = finalSubject.replace(regex, replacements[key]);
          finalBody = finalBody.replace(regex, replacements[key]);
        }
        setSubject(finalSubject);
        setBody(finalBody);
      }
    }
  }, [selectedTemplateId, service, templates, companySettings]);

  if (!isOpen) return null;

  const handleSend = () => {
    onSend({
      to: service.clientEmail,
      subject,
      body,
      reason: `Notificación Manual: ${templates.find(t=>t.id === selectedTemplateId)?.name || 'Mensaje Personalizado'}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Enviar Notificación a {service.clientName}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Seleccionar Plantilla</label>
            <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} className="mt-1 w-full p-2 border rounded-md">
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Asunto</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cuerpo del Mensaje (Editable)</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows="10" className="mt-1 w-full p-2 border rounded-md font-mono text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
          <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded-md">Enviar</button>
        </div>
      </div>
    </div>
  );
}

export default ManualReminderModal;







