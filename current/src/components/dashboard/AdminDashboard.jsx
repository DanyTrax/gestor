import React, { useState } from 'react';
import { ServicesIcon, UsersIcon, TemplatesIcon, MessagesIcon, TicketIcon, BuildingIcon, CreditCardIcon } from '../icons';
import AdminServicesDashboard from '../admin/services/AdminServicesDashboard';
import AdminUsersDashboard from '../admin/users/AdminUsersDashboard';
import AdminTemplatesDashboard from '../admin/templates/AdminTemplatesDashboard';
import PaymentConfigDashboard from '../admin/payments/PaymentConfigDashboard';
import AdminPaymentsDashboard from '../admin/payments/AdminPaymentsDashboard';
import AdminMessagesDashboard from '../admin/messages/AdminMessagesDashboard';
import AdminTicketsDashboard from '../admin/tickets/AdminTicketsDashboard';
import AdminSettingsDashboard from '../admin/settings/AdminSettingsDashboard';

function AdminDashboard({ user, isDemo, setIsDemoMode, userRole, companySettings, onLogout }) {
  const [activeTab, setActiveTab] = useState('services');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users': return <AdminUsersDashboard isDemo={isDemo} userRole={userRole} />;
      case 'templates': return <AdminTemplatesDashboard isDemo={isDemo} />;
      case 'messages': return <AdminMessagesDashboard isDemo={isDemo} userRole={userRole} />;
      case 'tickets': return <AdminTicketsDashboard isDemo={isDemo} userRole={userRole} />;
      case 'payments': return <AdminPaymentsDashboard isDemo={isDemo} userRole={userRole} />;
      case 'payment-config': return <PaymentConfigDashboard isDemo={isDemo} />;
      case 'settings': return <AdminSettingsDashboard isDemo={isDemo} setIsDemoMode={setIsDemoMode} onLogout={onLogout} />;
      case 'services': default: return <AdminServicesDashboard isDemo={isDemo} userRole={userRole} />;
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


