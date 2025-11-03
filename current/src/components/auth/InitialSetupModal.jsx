import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';

function InitialSetupModal({ isOpen, onComplete }) {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    companyName: '',
    identification: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'company_info');
      await setDoc(settingsRef, formData);
      addNotification("Configuración inicial guardada exitosamente.", "success");
      onComplete();
    } catch (error) {
      addNotification("Error al guardar la configuración inicial.", "error");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Configuración Inicial de la Empresa</h2>
        <p className="text-gray-600 mb-6">
          Como superadministrador, configura la información básica de tu empresa para comenzar.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="companyName" 
              value={formData.companyName} 
              onChange={handleChange} 
              placeholder="Nombre de la Empresa" 
              className="w-full p-2 border rounded-md" 
              required 
            />
            <input 
              name="identification" 
              value={formData.identification} 
              onChange={handleChange} 
              placeholder="NIT / Identificación Fiscal" 
              className="w-full p-2 border rounded-md" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="Dirección" 
              className="w-full p-2 border rounded-md" 
            />
            <input 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="Teléfono" 
              className="w-full p-2 border rounded-md" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Email de Contacto" 
              className="w-full p-2 border rounded-md" 
            />
            <input 
              name="website" 
              value={formData.website} 
              onChange={handleChange} 
              placeholder="Sitio Web" 
              className="w-full p-2 border rounded-md" 
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar y Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InitialSetupModal;






