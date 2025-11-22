import React, { useState, useEffect } from 'react';
import { ServicesIcon, UsersIcon, TemplatesIcon, MessagesIcon, TicketIcon, BuildingIcon, CreditCardIcon } from '../icons';
import AdminServicesDashboard from '../admin/services/AdminServicesDashboard';
import AdminUsersDashboard from '../admin/users/AdminUsersDashboard';
import AdminTemplatesDashboard from '../admin/templates/AdminTemplatesDashboard';
import PaymentConfigDashboard from '../admin/payments/PaymentConfigDashboard';
import AdminPaymentsDashboard from '../admin/payments/AdminPaymentsDashboard';
import AdminMessagesDashboard from '../admin/messages/AdminMessagesDashboard';
import AdminTicketsDashboard from '../admin/tickets/AdminTicketsDashboard';
import AdminSettingsDashboard from '../admin/settings/AdminSettingsDashboard';

function AdminDashboard({ user, userRole, companySettings, onLogout }) {
  const [activeTab, setActiveTab] = useState('services');

  // Sincronizar hash (#services, #users, #templates, etc.) con pestañas
  useEffect(() => {
    const validTabs = ['services', 'users', 'templates', 'messages', 'payments', 'tickets', 'payment-config', 'settings'];
    
    const applyHash = () => {
      const hash = (window.location.hash || '').replace('#', '');
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    
    // Aplicar hash inicial si existe
    const initialHash = (window.location.hash || '').replace('#', '');
    if (validTabs.includes(initialHash)) {
      setActiveTab(initialHash);
    } else if (!window.location.hash || window.location.hash === '#') {
      // Si no hay hash o es solo '#', establecer el por defecto sin agregar al historial
      window.history.replaceState(null, '', '#services');
      setActiveTab('services');
    }
    
    // Escuchar cambios en el hash
    window.addEventListener('hashchange', applyHash);
    
    return () => window.removeEventListener('hashchange', applyHash);
  }, []); // Solo ejecutar una vez al montar

  // Actualizar URL cuando cambia la pestaña activa
  useEffect(() => {
    const currentHash = (window.location.hash || '').replace('#', '');
    if (activeTab && currentHash !== activeTab) {
      // Usar pushState para que el botón "Atrás" funcione correctamente
      window.history.pushState(null, '', `#${activeTab}`);
    }
  }, [activeTab]);

  // Manejar el botón "Atrás" del navegador
  useEffect(() => {
    const handlePopState = (e) => {
      const hash = (window.location.hash || '').replace('#', '');
      const validTabs = ['services', 'users', 'templates', 'messages', 'payments', 'tickets', 'payment-config', 'settings'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      } else {
        setActiveTab('services');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users': return <AdminUsersDashboard userRole={userRole} companySettings={companySettings} />;
      case 'templates': return <AdminTemplatesDashboard />;
      case 'messages': return <AdminMessagesDashboard userRole={userRole} />;
      case 'tickets': return <AdminTicketsDashboard userRole={userRole} />;
      case 'payments': return <AdminPaymentsDashboard userRole={userRole} companySettings={companySettings} />;
      case 'payment-config': return <PaymentConfigDashboard />;
      case 'settings': return <AdminSettingsDashboard onLogout={onLogout} />;
      case 'services': default: return <AdminServicesDashboard userRole={userRole} />;
    }
  };

  return (
    <main className="container mx-auto">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-4 sm:px-6 lg:px-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('services')} className={`${activeTab === 'services' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}><ServicesIcon/> Servicios</button>
          {userRole === 'superadmin' && <button onClick={() => setActiveTab('users')} className={`${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}><UsersIcon/> Usuarios</button>}
          <button onClick={() => setActiveTab('templates')} className={`${activeTab === 'templates' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}><TemplatesIcon/> Plantillas</button>
          <button onClick={() => setActiveTab('messages')} className={`${activeTab === 'messages' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}><MessagesIcon/> Mensajes</button>
          <button onClick={() => setActiveTab('payments')} className={`${activeTab === 'payments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}><CreditCardIcon/> Pagos</button>
          <button onClick={() => setActiveTab('tickets')} className={`${activeTab === 'tickets' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}><TicketIcon/> Tickets</button>
          {userRole === 'superadmin' && <button onClick={() => setActiveTab('settings')} className={`${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}><BuildingIcon/> Empresa</button>}
        </nav>
      </div>
      {renderTabContent()}
    </main>
  );
}

export default AdminDashboard;


