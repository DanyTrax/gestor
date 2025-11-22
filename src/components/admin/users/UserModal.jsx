import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';

function UserModal({ isOpen, onClose, onSave, user }) {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
      addNotification("Usuario actualizado.", "success");
      onClose();
    } catch(e) {
      addNotification("Error al actualizar usuario.", "error");
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-6">Editar Usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="fullName" value={formData.fullName || ''} onChange={handleChange} placeholder="Nombre Completo" className="w-full p-2 border rounded-md" />
          <input name="identification" value={formData.identification || ''} onChange={handleChange} placeholder="Identificación" className="w-full p-2 border rounded-md" />
          <input type="email" value={formData.email || ''} readOnly disabled className="w-full p-2 border rounded-md bg-gray-100" />
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;







