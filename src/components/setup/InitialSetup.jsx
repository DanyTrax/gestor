import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, appId } from '../../config/firebase';

function InitialSetup({ onComplete }) {
  const { addNotification } = useNotification();
  const [step, setStep] = useState(1); // 1: Empresa, 2: Superadmin, 3: Completado
  const [companyData, setCompanyData] = useState({
    companyName: '',
    identification: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    identification: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanySubmit = (e) => {
    e.preventDefault();
    if (!companyData.companyName) {
      addNotification("El nombre de la empresa es obligatorio", "error");
      return;
    }
    setStep(2);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    
    if (adminData.password !== adminData.confirmPassword) {
      addNotification("Las contraseñas no coinciden", "error");
      return;
    }
    
    if (adminData.password.length < 6) {
      addNotification("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    setLoading(true);
    
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, adminData.email, adminData.password);
      
      // Crear documento de usuario en Firestore
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userCredential.user.uid), {
        email: adminData.email,
        fullName: adminData.fullName,
        identification: adminData.identification,
        role: 'superadmin',
        status: 'active',
        isProfileComplete: true,
        createdAt: Timestamp.now(),
        requiresPasswordChange: false
      });

      // Guardar configuración de empresa
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'company_info'), {
        ...companyData,
        isDemoMode: false,
        createdAt: Timestamp.now()
      });

      addNotification("¡Configuración inicial completada exitosamente!", "success");
      setStep(3);
      
      // Esperar un momento y completar
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error("Error en configuración inicial:", error);
      addNotification(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Configuración Inicial</h2>
            <p className="text-gray-600 mt-2">Paso 1 de 2: Información de la Empresa</p>
          </div>
          
          <form onSubmit={handleCompanySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="companyName" 
                value={companyData.companyName} 
                onChange={handleCompanyChange} 
                placeholder="Nombre de la Empresa *" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
                required 
              />
              <input 
                name="identification" 
                value={companyData.identification} 
                onChange={handleCompanyChange} 
                placeholder="NIT / Identificación Fiscal" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="address" 
                value={companyData.address} 
                onChange={handleCompanyChange} 
                placeholder="Dirección" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
              <input 
                name="phone" 
                value={companyData.phone} 
                onChange={handleCompanyChange} 
                placeholder="Teléfono" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="email" 
                type="email" 
                value={companyData.email} 
                onChange={handleCompanyChange} 
                placeholder="Email de Contacto" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
              <input 
                name="website" 
                value={companyData.website} 
                onChange={handleCompanyChange} 
                placeholder="Sitio Web" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Crear Superadministrador</h2>
            <p className="text-gray-600 mt-2">Paso 2 de 2: Cuenta de Administrador Principal</p>
          </div>
          
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="fullName" 
                value={adminData.fullName} 
                onChange={handleAdminChange} 
                placeholder="Nombre Completo *" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
                required 
              />
              <input 
                name="identification" 
                value={adminData.identification} 
                onChange={handleAdminChange} 
                placeholder="Identificación" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <input 
              name="email" 
              type="email" 
              value={adminData.email} 
              onChange={handleAdminChange} 
              placeholder="Email del Administrador *" 
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
              required 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="password" 
                type="password" 
                value={adminData.password} 
                onChange={handleAdminChange} 
                placeholder="Contraseña *" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
                required 
              />
              <input 
                name="confirmPassword" 
                type="password" 
                value={adminData.confirmPassword} 
                onChange={handleAdminChange} 
                placeholder="Confirmar Contraseña *" 
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <div className="flex justify-between pt-4">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
              >
                Atrás
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Completar Configuración'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Configuración Completada!</h2>
          <p className="text-gray-600 mb-6">
            El sistema está listo para usar. Serás redirigido al dashboard en unos segundos...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return null;
}

export default InitialSetup;
