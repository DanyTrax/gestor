import React from 'react';
import { CreditCardIcon } from '../icons';

function BankTransferInstructions({ bankAccounts, serviceNumber, amount, currency, onUpload }) {
  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  if (!bankAccounts || bankAccounts.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No hay cuentas bancarias configuradas. Contacta al administrador.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCardIcon />
        <h3 className="text-lg font-semibold text-gray-800">Instrucciones para Transferencia Bancaria</h3>
      </div>

      <div className="space-y-6">
        {/* Información del pago */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Información del Pago</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Número de Servicio:</span>
              <span className="ml-2 font-mono text-blue-600">{serviceNumber}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Monto a Pagar:</span>
              <span className="ml-2 font-semibold text-green-600">{formatAmount(amount, currency)}</span>
            </div>
          </div>
        </div>

        {/* Cuentas bancarias */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Cuentas Disponibles para Transferencia</h4>
          <div className="space-y-4">
            {bankAccounts.map((account, index) => (
              <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-700">Opción {index + 1}</h5>
                  <span className="text-sm text-gray-500">{account.accountType}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Banco:</span>
                    <span className="ml-2 text-gray-800">{account.bankName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Número de Cuenta:</span>
                    <span className="ml-2 font-mono text-blue-600">{account.accountNumber}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">Titular:</span>
                    <span className="ml-2 text-gray-800">{account.accountHolder}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instrucciones paso a paso */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Instrucciones Paso a Paso</h4>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</span>
              <span>Realiza una transferencia bancaria a cualquiera de las cuentas mostradas arriba</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</span>
              <span>Usa el <strong>Número de Servicio</strong> como referencia en la transferencia</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</span>
              <span>Transfiere el monto exacto: <strong>{formatAmount(amount, currency)}</strong></span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">4</span>
              <span>Guarda el comprobante de transferencia</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">5</span>
              <span>Envía el comprobante por email o sube una foto en el sistema</span>
            </li>
          </ol>
        </div>

        {/* Información adicional */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Información Importante</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• El pago puede tardar hasta 24 horas en ser procesado</li>
            <li>• Asegúrate de incluir el número de servicio como referencia</li>
            <li>• El monto debe ser exacto para evitar retrasos</li>
            <li>• Contacta al administrador si tienes alguna duda</li>
          </ul>
        </div>

        {/* Botón para subir comprobante */}
        <div className="text-center">
          <label className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer">
            Subir Comprobante de Transferencia
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUpload && e.target.files?.[0] && onUpload(e.target.files[0])}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default BankTransferInstructions;




