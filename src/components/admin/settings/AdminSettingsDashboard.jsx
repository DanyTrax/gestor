import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';

function AdminSettingsDashboard({ isDemo, setIsDemoMode, onLogout }) {
  const { addNotification } = useNotification();
  const [settings, setSettings] = useState({});
  const settingsId = 'company_info';

  useEffect(() => {
    if (isDemo) {
      setSettings({
        companyName: 'Mi Empresa (Demo)',
        identification: '123.456.789-0',
        address: 'Calle Falsa 123, Ciudad Demo',
        phone: '+57 300 123 4567',
        email: 'contacto@empresa-demo.com',
        website: 'www.empresa-demo.com',
        logoUrl: 'https://placehold.co/200x80/1d4ed8/ffffff?text=Mi+Logo'
      });
      return;
    }
    
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', settingsId);
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });
    return unsubscribe;
  }, [isDemo]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({...prev, [name]: value}));
  };

  const handleDemoModeToggle = () => {
    const newDemoMode = !isDemo;
    setIsDemoMode(newDemoMode);
    
    // Si se está activando el modo demo, mostrar advertencia
    if (newDemoMode) {
      addNotification("Modo demo activado. Recuerda guardar la configuración para aplicar los cambios.", "info");
    }
  };

  const handleSave = async () => {
    if (isDemo) { addNotification("Función no disponible en modo demo.", "error"); return; }
    try {
      const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', settingsId);
      // Incluir el estado del modo demo en la configuración
      const settingsToSave = {
        ...settings,
        isDemoMode: isDemo,
        allowDemoMode: true // Habilitar botones de demo y debug
      };
      await setDoc(settingsRef, settingsToSave, { merge: true });
      addNotification("Configuración de la empresa guardada.", "success");
      
      // Si se activó el modo demo, cerrar sesión para probar los botones
      if (isDemo && onLogout) {
        addNotification("Modo demo activado. Cerrando sesión para probar los botones de demo...", "info");
        setTimeout(() => {
          onLogout();
        }, 2000); // Esperar 2 segundos para que el usuario vea el mensaje
      }
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
          <h3 className="text-xl font-bold mt-8 mb-4">Branding</h3>
          <input name="logoUrl" value={settings.logoUrl || ''} onChange={handleChange} placeholder="URL del Logo (enlace a la imagen)" className="w-full p-2 border rounded-md" />
          {settings.logoUrl && <img src={settings.logoUrl} alt="Vista previa del logo" className="mt-4 max-h-20 bg-gray-100 p-2 rounded" />}
        </div>
         
        <div>
           <h3 className="text-xl font-bold mb-4">Modo de Operación</h3>
          <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
             <div>
              <p className="font-medium text-gray-800">Activar Modo de Prueba</p>
              <p className="text-sm text-gray-500">Usa datos de ejemplo sin afectar la información real. En modo prueba aparecerán botones separados para admin y cliente.</p>
            </div>
            <label htmlFor="demoToggle" className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" id="demoToggle" className="sr-only" checked={isDemo} onChange={handleDemoModeToggle} />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
              </div>
            </label>
          </div>
          
          {isDemo && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Modo de Prueba Activado</h4>
              <p className="text-sm text-blue-700 mb-2">
                En el login aparecerán dos botones:<br/>
                • <strong>Administrador:</strong> Acceso completo al sistema<br/>
                • <strong>Cliente:</strong> Vista limitada de servicios y tickets
              </p>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ Recuerda guardar la configuración para aplicar los cambios. 
                  Se cerrará la sesión automáticamente para probar los botones de demo.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🔧 Herramientas de Desarrollo</h4>
            <p className="text-sm text-green-700 mb-2">
              Al activar el modo de prueba, también se habilitarán:
            </p>
            <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
              <li>Botón de cambio entre modo Demo/Live en el login</li>
              <li>Botón de diagnóstico de Firebase para debugging</li>
              <li>Acceso a herramientas de desarrollo</li>
            </ul>
          </div>
        </div>

        <button onClick={handleSave} className="mt-4 px-5 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">Guardar Configuración</button>
      </div>
    </div>
  );
}

export default AdminSettingsDashboard;

