import React, { useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';

function CreateUserModal({ isOpen, onClose, onSave }) {
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [identification, setIdentification] = useState('');
  const [role, setRole] = useState('client');
  const [status, setStatus] = useState('active');
  const [notify, setNotify] = useState(false);
  const [error, setError] = useState('');

  const roleOptions = [
    { value: 'client', label: 'Cliente' },
    { value: 'admin', label: 'Administrador' },
    { value: 'superadmin', label: 'Super Administrador' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'pending', label: 'Pendiente' }
  ];

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setIdentification('');
    setRole('client');
    setStatus('active');
    setNotify(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setError('');
    try {
      await onSave({ 
        email, 
        password, 
        notify, 
        fullName, 
        identification, 
        role, 
        status 
      });
      onClose();
    } catch(e) {
      addNotification("Error al crear usuario.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Crear Nuevo Usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email del nuevo usuario" className="w-full p-2 border rounded-md" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña temporal" className="w-full p-2 border rounded-md" required />
          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nombre Completo" className="w-full p-2 border rounded-md" />
          <input value={identification} onChange={e => setIdentification(e.target.value)} placeholder="Identificación" className="w-full p-2 border rounded-md" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)} 
                className="w-full p-2 border rounded-md"
                required
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)} 
                className="w-full p-2 border rounded-md"
                required
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex items-center">
            <input id="notify" type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="notify" className="ml-2 block text-sm text-gray-900">Notificar al usuario por correo</label>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Crear Usuario</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserModal;


