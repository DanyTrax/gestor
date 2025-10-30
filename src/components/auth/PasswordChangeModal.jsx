import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

function PasswordChangeModal({ isOpen, onSave }) {
  const { addNotification } = useNotification();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError('');
    try {
      await onSave(newPassword);
      addNotification("Contraseña cambiada exitosamente.", "success");
    } catch(e) {
      addNotification("Error al cambiar la contraseña.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Cambio de Contraseña Requerido</h2>
        <p className="text-sm text-gray-600 mb-6">Por seguridad, debes establecer una nueva contraseña para continuar.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva Contraseña" className="w-full p-2 border rounded-md" required />
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar Nueva Contraseña" className="w-full p-2 border rounded-md" required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md">Guardar Contraseña</button>
        </form>
      </div>
    </div>
  );
}

export default PasswordChangeModal;







