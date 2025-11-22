import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';

function AdminSettingsDashboard({ onLogout }) {
  const { addNotification } = useNotification();
  const [settings, setSettings] = useState({});
  const settingsId = 'company_info';

  useEffect(() => {
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', settingsId);
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });
    return unsubscribe;
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({...prev, [name]: value}));
  };

  const handleSave = async () => {
    try {
      const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', settingsId);
      await setDoc(settingsRef, settings, { merge: true });
      addNotification("Configuración de la empresa guardada.", "success");
    } catch (error) {
      addNotification("Error al guardar la configuración.", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold mb-6">Configuración</h2>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto space-y-8">
         <div>
          <h3 className="text-xl font-bold mb-4">Información de Facturación y Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="companyName" value={settings.companyName || ''} onChange={handleChange} placeholder="Nombre de la Empresa" className="w-full p-2 border rounded-md" />
            <input name="identification" value={settings.identification || ''} onChange={handleChange} placeholder="NIT / Identificación Fiscal" className="w-full p-2 border rounded-md" />
            <input name="address" value={settings.address || ''} onChange={handleChange} placeholder="Dirección" className="w-full p-2 border rounded-md" />
            <input name="phone" value={settings.phone || ''} onChange={handleChange} placeholder="Teléfono" className="w-full p-2 border rounded-md" />
            <input name="email" type="email" value={settings.email || ''} onChange={handleChange} placeholder="Email de Contacto" className="w-full p-2 border rounded-md" />
            <input name="website" value={settings.website || ''} onChange={handleChange} placeholder="Sitio Web" className="w-full p-2 border rounded-md" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mt-8 mb-4">Seguridad</h3>
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <p className="font-medium text-gray-800 mb-2">Tiempo de Inactividad (minutos)</p>
                <p className="text-sm text-gray-500">Tiempo máximo de inactividad antes de cerrar sesión automáticamente. Mínimo: 1 minuto, Máximo: 120 minutos.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="inactivityTimeoutMinutes"
                  value={settings.inactivityTimeoutMinutes || 10}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  className="w-24 p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10"
                />
                <span className="text-gray-600 font-medium">min</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800 font-medium">
                <strong>⚙️ Configuración Actual:</strong> {settings.inactivityTimeoutMinutes || 10} minutos de inactividad
              </p>
              <p className="text-xs text-blue-700 mt-1">
                La sesión se cerrará automáticamente si no hay actividad del usuario (movimiento del mouse, teclado, clics, scroll).
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mt-8 mb-4">Branding</h3>
          <input name="logoUrl" value={settings.logoUrl || ''} onChange={handleChange} placeholder="URL del Logo (enlace a la imagen)" className="w-full p-2 border rounded-md" />
          {settings.logoUrl && <img src={settings.logoUrl} alt="Vista previa del logo" className="mt-4 max-h-20 bg-gray-100 p-2 rounded" />}
        </div>
         

        <button onClick={handleSave} className="mt-4 px-5 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">Guardar Configuración</button>
      </div>
    </div>
  );
}

export default AdminSettingsDashboard;

