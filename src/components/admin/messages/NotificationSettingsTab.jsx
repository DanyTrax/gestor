import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';

function NotificationSettingsTab() {
  const { addNotification } = useNotification();
  
  // Configuración por defecto
  const defaultSettings = {
    admin: {
      payments: { approval: true, rejection: true, newPayment: true },
      services: { expirationReminder: true, newService: true },
      users: { newUser: true, userActivation: true },
      tickets: { newTicket: true, ticketUpdate: true },
      renewals: { renewalRequest: true }
    },
    client: {
      payments: { approval: true, rejection: true, pendingPayment: true },
      services: { expirationReminder: true, serviceActivated: true, serviceExpired: true },
      tickets: { ticketReply: true, ticketResolved: true },
      renewals: { renewalReminder: true, renewalConfirmed: true }
    }
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'notification_settings');
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        // Mergear con valores por defecto
        const saved = doc.data();
        setSettings({
          admin: { ...defaultSettings.admin, ...saved.admin },
          client: { ...defaultSettings.client, ...saved.client }
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggle = (role, module, event) => {
    setSettings(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role][module],
          [event]: !prev[role][module]?.[event]
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'notification_settings');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date()
      }, { merge: true });
      addNotification('Configuración de notificaciones guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      addNotification('Error al guardar la configuración', 'error');
    }
  };

  const moduleConfigs = {
    payments: {
      label: 'Pagos',
      icon: '💳',
      admin: [
        { key: 'approval', label: 'Aprobación de pago' },
        { key: 'rejection', label: 'Rechazo de pago' },
        { key: 'newPayment', label: 'Nuevo pago recibido' }
      ],
      client: [
        { key: 'approval', label: 'Pago aprobado' },
        { key: 'rejection', label: 'Pago rechazado' },
        { key: 'pendingPayment', label: 'Recordatorio de pago pendiente' }
      ]
    },
    services: {
      label: 'Servicios',
      icon: '🔧',
      admin: [
        { key: 'expirationReminder', label: 'Recordatorio de vencimiento' },
        { key: 'newService', label: 'Nuevo servicio creado' }
      ],
      client: [
        { key: 'expirationReminder', label: 'Recordatorio de vencimiento' },
        { key: 'serviceActivated', label: 'Servicio activado' },
        { key: 'serviceExpired', label: 'Servicio vencido' }
      ]
    },
    users: {
      label: 'Usuarios',
      icon: '👥',
      admin: [
        { key: 'newUser', label: 'Nuevo usuario registrado' },
        { key: 'userActivation', label: 'Activación de usuario' }
      ],
      client: []
    },
    tickets: {
      label: 'Tickets',
      icon: '🎫',
      admin: [
        { key: 'newTicket', label: 'Nuevo ticket creado' },
        { key: 'ticketUpdate', label: 'Actualización de ticket' }
      ],
      client: [
        { key: 'ticketReply', label: 'Respuesta a ticket' },
        { key: 'ticketResolved', label: 'Ticket resuelto' }
      ]
    },
    renewals: {
      label: 'Renovaciones',
      icon: '🔄',
      admin: [
        { key: 'renewalRequest', label: 'Solicitud de renovación' }
      ],
      client: [
        { key: 'renewalReminder', label: 'Recordatorio de renovación' },
        { key: 'renewalConfirmed', label: 'Renovación confirmada' }
      ]
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
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Configuración de Notificaciones</h3>
        <p className="text-sm text-gray-600 mb-6">
          Activa o desactiva las notificaciones por email según el módulo y el tipo de usuario.
        </p>
      </div>

      {/* Admin Notifications */}
      <div>
        <h4 className="text-lg font-semibold mb-4 bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
          👨‍💼 Notificaciones para Administradores
        </h4>
        <div className="space-y-6">
          {Object.entries(moduleConfigs).map(([moduleKey, moduleConfig]) => {
            if (!moduleConfig.admin || moduleConfig.admin.length === 0) return null;
            
            return (
              <div key={moduleKey} className="bg-white p-6 rounded-lg shadow-md">
                <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">{moduleConfig.icon}</span>
                  {moduleConfig.label}
                </h5>
                <div className="space-y-3">
                  {moduleConfig.admin.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-gray-700">{label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.admin[moduleKey]?.[key] ?? false}
                          onChange={() => handleToggle('admin', moduleKey, key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Notifications */}
      <div>
        <h4 className="text-lg font-semibold mb-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
          👤 Notificaciones para Clientes
        </h4>
        <div className="space-y-6">
          {Object.entries(moduleConfigs).map(([moduleKey, moduleConfig]) => {
            if (!moduleConfig.client || moduleConfig.client.length === 0) return null;
            
            return (
              <div key={moduleKey} className="bg-white p-6 rounded-lg shadow-md">
                <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">{moduleConfig.icon}</span>
                  {moduleConfig.label}
                </h5>
                <div className="space-y-3">
                  {moduleConfig.client.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-gray-700">{label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.client[moduleKey]?.[key] ?? false}
                          onChange={() => handleToggle('client', moduleKey, key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Guardar Configuración
        </button>
      </div>
    </div>
  );
}

export default NotificationSettingsTab;

