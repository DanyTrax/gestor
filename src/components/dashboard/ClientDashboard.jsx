import React, { useState, useEffect } from 'react';
import { ServicesIcon, TicketIcon, SettingsIcon, CreditCardIcon, CalendarIcon } from '../icons';
import ClientServicesDashboard from '../client/ClientServicesDashboard';
import ClientPaymentsDashboard from '../client/ClientPaymentsDashboard';
import ClientRenewalDashboard from '../client/ClientRenewalDashboard';
import ClientTicketsDashboard from '../client/ClientTicketsDashboard';

function ClientDashboard({ user, isDemo, userProfile }) {
  const [activeTab, setActiveTab] = useState('services');

  // Sincronizar hash (#services, #payments, #renewals, #tickets) con pestañas
  useEffect(() => {
    const applyHash = () => {
      const hash = (window.location.hash || '').replace('#', '');
      if (hash === 'services' || hash === 'payments' || hash === 'renewals' || hash === 'tickets') {
        setActiveTab(hash);
      }
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

   const renderTabContent = () => {
    switch(activeTab) {
      case 'tickets': return <ClientTicketsDashboard user={user} isDemo={isDemo} userProfile={userProfile} />;
      case 'payments': return <ClientPaymentsDashboard user={user} isDemo={isDemo} userProfile={userProfile} />;
      case 'renewals': return <ClientRenewalDashboard user={user} isDemo={isDemo} userProfile={userProfile} />;
      case 'services':
      default: return <ClientServicesDashboard user={user} isDemo={isDemo} userProfile={userProfile} />;
    }
  };
  
  return (
    <main className="container mx-auto">
       <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-4 sm:px-6 lg:px-8" aria-label="Tabs">
           <button onClick={() => setActiveTab('services')} className={`${activeTab === 'services' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}><ServicesIcon/> Mis Servicios</button>
           <button onClick={() => setActiveTab('payments')} className={`${activeTab === 'payments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}><CreditCardIcon/> Mis Pagos</button>
           <button onClick={() => setActiveTab('renewals')} className={`${activeTab === 'renewals' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}><CalendarIcon/> Renovaciones</button>
           <button onClick={() => setActiveTab('tickets')} className={`${activeTab === 'tickets' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm`}><TicketIcon/> Tickets de Soporte</button>
        </nav>
      </div>
      {renderTabContent()}
    </main>
  );
}

export default ClientDashboard;


