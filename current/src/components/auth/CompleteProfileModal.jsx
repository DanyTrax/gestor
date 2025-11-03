import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';

function CompleteProfileModal({ isOpen, onComplete, user, userProfile }) {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || '',
    identification: userProfile?.identification || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || ''
  });
  const [loading, setLoading] = useState(false);

  // Detectar parámetros de URL para pre-cargar datos
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('uid');
    const email = urlParams.get('email');
    const name = urlParams.get('name');
    const id = urlParams.get('id');

    // Si hay parámetros de activación y coinciden con el usuario actual
    if (uid && uid === user?.uid && (name || id)) {
      setFormData(prev => ({
        ...prev,
        fullName: name ? decodeURIComponent(name) : prev.fullName,
        identification: id ? decodeURIComponent(id) : prev.identification
      }));
    }
  }, [user?.uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      addNotification("El nombre completo es obligatorio", "error");
      return;
    }

    setLoading(true);
    
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
      await updateDoc(userDocRef, {
        fullName: formData.fullName.trim(),
        identification: formData.identification.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        isProfileComplete: true,
        profileCompletedAt: new Date()
      });

      addNotification("Perfil completado exitosamente", "success");
      onComplete();
    } catch (error) {
      console.error("Error completing profile:", error);
      addNotification("Error al completar el perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Completar Perfil</h2>
          <p className="text-gray-600 mt-2">
            Bienvenido {user.email}! Confirma o actualiza tu información para continuar.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                placeholder="Tu nombre completo" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificación
              </label>
              <input 
                name="identification" 
                value={formData.identification} 
                onChange={handleChange} 
                placeholder="Cédula, DNI, etc." 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+57 300 123 4567" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="Tu dirección" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Información Importante</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Los datos mostrados fueron configurados por el administrador</li>
              <li>• Puedes confirmar o modificar la información</li>
              <li>• Esta información se usará para la facturación</li>
              <li>• Puedes actualizar estos datos más tarde</li>
            </ul>
          </div>
          
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Completando...
                </>
              ) : (
                'Completar Perfil'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfileModal;

