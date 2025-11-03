import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { CreditCardIcon, SettingsIcon } from '../../icons';

function PaymentConfigDashboard({ isDemo }) {
  const { addNotification } = useNotification();
  const [config, setConfig] = useState({
    bold: {
      enabled: false,
      apiKey: '',
      environment: 'sandbox', // sandbox o production
      webhookSecret: '',
      autoApprove: false
    },
    paypal: {
      enabled: false,
      clientId: '',
      clientSecret: '',
      environment: 'sandbox', // sandbox o live
      autoApprove: false
    },
    payu: {
      enabled: false,
      merchantId: '',
      apiKey: '',
      apiLogin: '',
      environment: 'sandbox', // sandbox o production
      autoApprove: false
    },
    bankTransfer: {
      enabled: false,
      accounts: [],
      autoApprove: false,
      requireConfirmation: true
    },
    general: {
      currency: 'USD',
      defaultGateway: 'bold'
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setConfig({
        bold: { enabled: true, apiKey: 'demo_key', environment: 'sandbox', webhookSecret: 'demo_secret', autoApprove: false },
        paypal: { enabled: false, clientId: '', clientSecret: '', environment: 'sandbox', autoApprove: false },
        payu: { enabled: false, merchantId: '', apiKey: '', apiLogin: '', environment: 'sandbox', autoApprove: false },
        bankTransfer: { 
          enabled: true, 
          accounts: [
            { id: '1', bankName: 'Banco Nacional', accountNumber: '1234567890', accountHolder: 'Empresa Demo', accountType: 'Ahorros' },
            { id: '2', bankName: 'Banco Popular', accountNumber: '0987654321', accountHolder: 'Empresa Demo', accountType: 'Corriente' }
          ], 
          autoApprove: false, 
          requireConfirmation: true 
        },
        general: { currency: 'USD', defaultGateway: 'bold' }
      });
      return;
    }

    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'paymentConfig');
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setConfig(doc.data());
      }
    });

    return () => unsubscribe();
  }, [isDemo]);

  const handleConfigChange = (gateway, field, value) => {
    setConfig(prev => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        [field]: value
      }
    }));
  };

  const handleGeneralChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value
      }
    }));
  };

  const handleBankAccountAdd = () => {
    const newAccount = {
      id: Date.now().toString(),
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      accountType: 'Ahorros'
    };
    
    setConfig(prev => ({
      ...prev,
      bankTransfer: {
        ...prev.bankTransfer,
        accounts: [...prev.bankTransfer.accounts, newAccount]
      }
    }));
  };

  const handleBankAccountChange = (accountId, field, value) => {
    setConfig(prev => ({
      ...prev,
      bankTransfer: {
        ...prev.bankTransfer,
        accounts: prev.bankTransfer.accounts.map(account =>
          account.id === accountId ? { ...account, [field]: value } : account
        )
      }
    }));
  };

  const handleBankAccountRemove = (accountId) => {
    setConfig(prev => ({
      ...prev,
      bankTransfer: {
        ...prev.bankTransfer,
        accounts: prev.bankTransfer.accounts.filter(account => account.id !== accountId)
      }
    }));
  };

  const handleSave = async () => {
    if (isDemo) {
      addNotification("Configuración guardada (modo demo)", "success");
      return;
    }

    setLoading(true);
    try {
      const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'paymentConfig');
      await setDoc(configRef, config);
      addNotification("Configuración de pagos guardada exitosamente", "success");
    } catch (error) {
      console.error("Error saving payment config:", error);
      addNotification("Error al guardar la configuración", "error");
    }
    setLoading(false);
  };

  const renderGatewayConfig = (gateway, title, fields) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <CreditCardIcon />
          {title}
        </h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={config[gateway].enabled}
            onChange={(e) => handleConfigChange(gateway, 'enabled', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-600">Habilitado</span>
        </label>
      </div>

      {config[gateway].enabled && (
        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  value={config[gateway][field.name]}
                  onChange={(e) => handleConfigChange(gateway, field.name, e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {field.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={config[gateway][field.name]}
                  onChange={(e) => handleConfigChange(gateway, field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-2 border rounded-md"
                />
              )}
              {field.help && (
                <p className="text-xs text-gray-500 mt-1">{field.help}</p>
              )}
            </div>
          ))}
          
          {/* Opción de auto-aprobación para cada pasarela */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config[gateway].autoApprove}
                onChange={(e) => handleConfigChange(gateway, 'autoApprove', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Aprobar pagos automáticamente</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Los pagos de esta pasarela se marcarán como "Completado" automáticamente
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon />
          Configuración de Pagos
        </h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      {/* Configuración General */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda por Defecto</label>
            <select
              value={config.general.currency}
              onChange={(e) => handleGeneralChange('currency', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="USD">USD - Dólar Americano</option>
              <option value="COP">COP - Peso Colombiano</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pasarela por Defecto</label>
            <select
              value={config.general.defaultGateway}
              onChange={(e) => handleGeneralChange('defaultGateway', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="bold">Bold</option>
              <option value="paypal">PayPal</option>
              <option value="payu">PayU</option>
              <option value="bankTransfer">Transferencia Bancaria</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Cada pasarela tiene su propia configuración de auto-aprobación independiente.
        </p>
      </div>

      {/* Configuración de Pasarelas */}
      {renderGatewayConfig('bold', 'Bold', [
        { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Ingresa tu API Key de Bold' },
        { name: 'environment', label: 'Ambiente', type: 'select', options: [
          { value: 'sandbox', label: 'Sandbox (Pruebas)' },
          { value: 'production', label: 'Producción' }
        ]},
        { name: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'Secreto para webhooks' }
      ])}

      {renderGatewayConfig('paypal', 'PayPal', [
        { name: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Ingresa tu Client ID de PayPal' },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Ingresa tu Client Secret' },
        { name: 'environment', label: 'Ambiente', type: 'select', options: [
          { value: 'sandbox', label: 'Sandbox (Pruebas)' },
          { value: 'live', label: 'Live (Producción)' }
        ]}
      ])}

      {renderGatewayConfig('payu', 'PayU', [
        { name: 'merchantId', label: 'Merchant ID', type: 'text', placeholder: 'ID del comerciante' },
        { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'API Key de PayU' },
        { name: 'apiLogin', label: 'API Login', type: 'text', placeholder: 'API Login de PayU' },
        { name: 'environment', label: 'Ambiente', type: 'select', options: [
          { value: 'sandbox', label: 'Sandbox (Pruebas)' },
          { value: 'production', label: 'Producción' }
        ]}
      ])}

      {/* Configuración de Transferencias Bancarias */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CreditCardIcon />
            Transferencias Bancarias
          </h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.bankTransfer.enabled}
              onChange={(e) => handleConfigChange('bankTransfer', 'enabled', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Habilitado</span>
          </label>
        </div>

        {config.bankTransfer.enabled && (
          <div className="space-y-6">
            {/* Configuración de auto-aprobación */}
            <div className="p-3 bg-gray-50 rounded-md">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.bankTransfer.autoApprove}
                  onChange={(e) => handleConfigChange('bankTransfer', 'autoApprove', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Aprobar transferencias automáticamente</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Las transferencias se marcarán como "Completado" automáticamente
              </p>
            </div>

            {/* Cuentas bancarias */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-800">Cuentas Bancarias</h4>
                <button
                  onClick={handleBankAccountAdd}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  + Agregar Cuenta
                </button>
              </div>

              <div className="space-y-4">
                {config.bankTransfer.accounts.map((account, index) => (
                  <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-700">Cuenta {index + 1}</h5>
                      <button
                        onClick={() => handleBankAccountRemove(account.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Banco</label>
                        <input
                          type="text"
                          value={account.bankName}
                          onChange={(e) => handleBankAccountChange(account.id, 'bankName', e.target.value)}
                          placeholder="Ej: Banco Nacional"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Cuenta</label>
                        <input
                          type="text"
                          value={account.accountNumber}
                          onChange={(e) => handleBankAccountChange(account.id, 'accountNumber', e.target.value)}
                          placeholder="1234567890"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titular de la Cuenta</label>
                        <input
                          type="text"
                          value={account.accountHolder}
                          onChange={(e) => handleBankAccountChange(account.id, 'accountHolder', e.target.value)}
                          placeholder="Nombre del titular"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cuenta</label>
                        <select
                          value={account.accountType}
                          onChange={(e) => handleBankAccountChange(account.id, 'accountType', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="Ahorros">Ahorros</option>
                          <option value="Corriente">Corriente</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {config.bankTransfer.accounts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay cuentas bancarias configuradas</p>
                  <p className="text-sm">Haz clic en "Agregar Cuenta" para comenzar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">⚠️ Información Importante</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Las credenciales se almacenan de forma segura en Firestore</li>
          <li>• Siempre prueba en modo sandbox antes de usar en producción</li>
          <li>• Mantén tus claves API seguras y no las compartas</li>
          <li>• Los webhooks deben configurarse en cada pasarela de pago</li>
        </ul>
      </div>
    </div>
  );
}

export default PaymentConfigDashboard;
