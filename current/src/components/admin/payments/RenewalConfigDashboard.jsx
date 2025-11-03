import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../../config/firebase';
import { CreditCardIcon, SettingsIcon, CalendarIcon, PercentIcon } from '../../icons';

function RenewalConfigDashboard({ isDemo }) {
  const { addNotification } = useNotification();
  const [config, setConfig] = useState({
    renewalSettings: {
      enabled: true,
      maxRenewalYears: 3,
      autoRenewal: true,
      gracePeriodDays: 7,
      reminderDays: 3
    },
    discounts: {
      monthly: {
        enabled: false,
        discount: 0,
        description: 'Descuento por pago mensual'
      },
      quarterly: {
        enabled: false,
        discount: 5,
        description: 'Descuento por pago trimestral'
      },
      semiAnnual: {
        enabled: false,
        discount: 10,
        description: 'Descuento por pago semestral'
      },
      annual: {
        enabled: false,
        discount: 15,
        description: 'Descuento por pago anual'
      },
      biennial: {
        enabled: false,
        discount: 25,
        description: 'Descuento por pago bienal (2 años)'
      },
      triennial: {
        enabled: false,
        discount: 35,
        description: 'Descuento por pago trienal (3 años)'
      }
    },
    taxSettings: {
      ivaEnabled: true,
      ivaPercentage: 19,
      ivaIncluded: false, // false = se suma al precio, true = incluido en el precio
      taxName: 'IVA'
    },
    documentSettings: {
      invoiceName: 'Factura',
      receiptName: 'Remisión',
      invoicePrefix: 'FAC',
      receiptPrefix: 'REM',
      invoiceNumberFormat: 'FAC-{year}-{month}-{number}',
      receiptNumberFormat: 'REM-{year}-{month}-{number}'
    },
    pricingSettings: {
      roundToNearest: 100, // Redondear al múltiplo más cercano
      minimumAmount: 1000,
      maximumAmount: 10000000
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setConfig({
        renewalSettings: {
          enabled: true,
          maxRenewalYears: 3,
          autoRenewal: true,
          gracePeriodDays: 7,
          reminderDays: 3
        },
        discounts: {
          monthly: { enabled: false, discount: 0, description: 'Descuento por pago mensual' },
          quarterly: { enabled: true, discount: 5, description: 'Descuento por pago trimestral' },
          semiAnnual: { enabled: true, discount: 10, description: 'Descuento por pago semestral' },
          annual: { enabled: true, discount: 15, description: 'Descuento por pago anual' },
          biennial: { enabled: true, discount: 25, description: 'Descuento por pago bienal (2 años)' },
          triennial: { enabled: true, discount: 35, description: 'Descuento por pago trienal (3 años)' }
        },
        taxSettings: {
          ivaEnabled: true,
          ivaPercentage: 19,
          ivaIncluded: false,
          taxName: 'IVA'
        },
        documentSettings: {
          invoiceName: 'Factura',
          receiptName: 'Remisión',
          invoicePrefix: 'FAC',
          receiptPrefix: 'REM',
          invoiceNumberFormat: 'FAC-{year}-{month}-{number}',
          receiptNumberFormat: 'REM-{year}-{month}-{number}'
        },
        pricingSettings: {
          roundToNearest: 100,
          minimumAmount: 1000,
          maximumAmount: 10000000
        }
      });
      return;
    }

    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'renewalConfig');
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setConfig(doc.data());
      }
    });

    return () => unsubscribe();
  }, [isDemo]);

  const handleConfigChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDiscountChange = (period, field, value) => {
    setConfig(prev => ({
      ...prev,
      discounts: {
        ...prev.discounts,
        [period]: {
          ...prev.discounts[period],
          [field]: value
        }
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
      const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'renewalConfig');
      await setDoc(configRef, config);
      addNotification("Configuración de renovaciones guardada exitosamente", "success");
    } catch (error) {
      console.error("Error saving renewal config:", error);
      addNotification("Error al guardar la configuración", "error");
    }
    setLoading(false);
  };

  const calculateDiscountedPrice = (originalPrice, period) => {
    const discount = config.discounts[period];
    if (!discount.enabled) return originalPrice;
    
    const discountAmount = (originalPrice * discount.discount) / 100;
    const discountedPrice = originalPrice - discountAmount;
    
    // Aplicar redondeo
    const roundedPrice = Math.round(discountedPrice / config.pricingSettings.roundToNearest) * config.pricingSettings.roundToNearest;
    
    return Math.max(roundedPrice, config.pricingSettings.minimumAmount);
  };

  const calculateWithTax = (price) => {
    if (!config.taxSettings.ivaEnabled) return price;
    
    if (config.taxSettings.ivaIncluded) {
      return price; // El precio ya incluye IVA
    } else {
      const taxAmount = (price * config.taxSettings.ivaPercentage) / 100;
      return price + taxAmount;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  };

  const renewalPeriods = [
    { key: 'monthly', label: 'Mensual', months: 1 },
    { key: 'quarterly', label: 'Trimestral', months: 3 },
    { key: 'semiAnnual', label: 'Semestral', months: 6 },
    { key: 'annual', label: 'Anual', months: 12 },
    { key: 'biennial', label: 'Bienal (2 años)', months: 24 },
    { key: 'triennial', label: 'Trienal (3 años)', months: 36 }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon />
          Configuración de Renovaciones
        </h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      {/* Configuración General de Renovaciones */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <SettingsIcon />
          Configuración General
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={config.renewalSettings.enabled}
                onChange={(e) => handleConfigChange('renewalSettings', 'enabled', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Habilitar renovaciones automáticas</span>
            </label>
          </div>
          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={config.renewalSettings.autoRenewal}
                onChange={(e) => handleConfigChange('renewalSettings', 'autoRenewal', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Renovación automática</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de años para renovación</label>
            <select
              value={config.renewalSettings.maxRenewalYears}
              onChange={(e) => handleConfigChange('renewalSettings', 'maxRenewalYears', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              <option value={1}>1 año</option>
              <option value={2}>2 años</option>
              <option value={3}>3 años</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Días de gracia</label>
            <input
              type="number"
              value={config.renewalSettings.gracePeriodDays}
              onChange={(e) => handleConfigChange('renewalSettings', 'gracePeriodDays', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="0"
              max="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Días de recordatorio</label>
            <input
              type="number"
              value={config.renewalSettings.reminderDays}
              onChange={(e) => handleConfigChange('renewalSettings', 'reminderDays', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="1"
              max="30"
            />
          </div>
        </div>
      </div>

      {/* Configuración de Descuentos */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <PercentIcon />
          Descuentos por Período de Renovación
        </h3>
        <div className="space-y-4">
          {renewalPeriods.map(period => (
            <div key={period.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">{period.label}</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.discounts[period.key].enabled}
                    onChange={(e) => handleDiscountChange(period.key, 'enabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Habilitado</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                  <input
                    type="number"
                    value={config.discounts[period.key].discount}
                    onChange={(e) => handleDiscountChange(period.key, 'discount', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded-md"
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={!config.discounts[period.key].enabled}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={config.discounts[period.key].description}
                    onChange={(e) => handleDiscountChange(period.key, 'description', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    disabled={!config.discounts[period.key].enabled}
                  />
                </div>
              </div>

              {/* Simulación de precio */}
              {config.discounts[period.key].enabled && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Simulación de Precio</h5>
                  <div className="text-sm text-gray-600">
                    <div>Precio original: {formatPrice(100000)}</div>
                    <div>Descuento ({config.discounts[period.key].discount}%): {formatPrice(100000 - calculateDiscountedPrice(100000, period.key))}</div>
                    <div className="font-semibold text-green-600">
                      Precio final: {formatPrice(calculateDiscountedPrice(100000, period.key))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Configuración de Impuestos */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCardIcon />
          Configuración de Impuestos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={config.taxSettings.ivaEnabled}
                onChange={(e) => handleConfigChange('taxSettings', 'ivaEnabled', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Habilitar IVA</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje de IVA (%)</label>
            <input
              type="number"
              value={config.taxSettings.ivaPercentage}
              onChange={(e) => handleConfigChange('taxSettings', 'ivaPercentage', parseFloat(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="0"
              max="100"
              step="0.1"
              disabled={!config.taxSettings.ivaEnabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de IVA</label>
            <select
              value={config.taxSettings.ivaIncluded ? 'included' : 'excluded'}
              onChange={(e) => handleConfigChange('taxSettings', 'ivaIncluded', e.target.value === 'included')}
              className="w-full p-2 border rounded-md"
              disabled={!config.taxSettings.ivaEnabled}
            >
              <option value="excluded">IVA se suma al precio</option>
              <option value="included">IVA incluido en el precio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del impuesto</label>
            <input
              type="text"
              value={config.taxSettings.taxName}
              onChange={(e) => handleConfigChange('taxSettings', 'taxName', e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={!config.taxSettings.ivaEnabled}
            />
          </div>
        </div>

        {/* Simulación de impuestos */}
        {config.taxSettings.ivaEnabled && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Simulación de Impuestos</h5>
            <div className="text-sm text-gray-600">
              <div>Precio base: {formatPrice(100000)}</div>
              {!config.taxSettings.ivaIncluded && (
                <div>IVA ({config.taxSettings.ivaPercentage}%): {formatPrice((100000 * config.taxSettings.ivaPercentage) / 100)}</div>
              )}
              <div className="font-semibold text-blue-600">
                Precio final: {formatPrice(calculateWithTax(100000))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuración de Documentos */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Documentos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Factura</label>
            <input
              type="text"
              value={config.documentSettings.invoiceName}
              onChange={(e) => handleConfigChange('documentSettings', 'invoiceName', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Remisión</label>
            <input
              type="text"
              value={config.documentSettings.receiptName}
              onChange={(e) => handleConfigChange('documentSettings', 'receiptName', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prefijo de Factura</label>
            <input
              type="text"
              value={config.documentSettings.invoicePrefix}
              onChange={(e) => handleConfigChange('documentSettings', 'invoicePrefix', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prefijo de Remisión</label>
            <input
              type="text"
              value={config.documentSettings.receiptPrefix}
              onChange={(e) => handleConfigChange('documentSettings', 'receiptPrefix', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Formato de Número de Factura</label>
            <input
              type="text"
              value={config.documentSettings.invoiceNumberFormat}
              onChange={(e) => handleConfigChange('documentSettings', 'invoiceNumberFormat', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="FAC-{year}-{month}-{number}"
            />
            <p className="text-xs text-gray-500 mt-1">Variables disponibles: {'{year}'}, {'{month}'}, {'{number}'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Formato de Número de Remisión</label>
            <input
              type="text"
              value={config.documentSettings.receiptNumberFormat}
              onChange={(e) => handleConfigChange('documentSettings', 'receiptNumberFormat', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="REM-{year}-{month}-{number}"
            />
            <p className="text-xs text-gray-500 mt-1">Variables disponibles: {'{year}'}, {'{month}'}, {'{number}'}</p>
          </div>
        </div>
      </div>

      {/* Configuración de Precios */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Precios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Redondear al múltiplo más cercano</label>
            <input
              type="number"
              value={config.pricingSettings.roundToNearest}
              onChange={(e) => handleConfigChange('pricingSettings', 'roundToNearest', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">Ej: 100 para redondear a centenas</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto mínimo</label>
            <input
              type="number"
              value={config.pricingSettings.minimumAmount}
              onChange={(e) => handleConfigChange('pricingSettings', 'minimumAmount', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto máximo</label>
            <input
              type="number"
              value={config.pricingSettings.maximumAmount}
              onChange={(e) => handleConfigChange('pricingSettings', 'maximumAmount', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">⚠️ Información Importante</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Los descuentos se aplican automáticamente según el período de renovación seleccionado</li>
          <li>• Los precios se redondean automáticamente para evitar decimales</li>
          <li>• El IVA se calcula según la configuración establecida</li>
          <li>• Los nombres de documentos se pueden personalizar según las necesidades</li>
        </ul>
      </div>
    </div>
  );
}

export default RenewalConfigDashboard;
