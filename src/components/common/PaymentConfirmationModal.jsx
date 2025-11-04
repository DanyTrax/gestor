import React from 'react';
import { CreditCardIcon, CalendarIcon, ExclamationTriangleIcon } from '../icons';

function PaymentConfirmationModal({ isOpen, onClose, onConfirm, service, paymentType, warningMessage }) {
  if (!isOpen) return null;

  const getIcon = () => {
    if (paymentType === 'One-Time') {
      return <CreditCardIcon className="h-8 w-8 text-blue-600" />;
    }
    return <CalendarIcon className="h-8 w-8 text-green-600" />;
  };

  const getTitle = () => {
    if (paymentType === 'One-Time') {
      return 'Solicitar Pago Único';
    }
    return 'Solicitar Pago de Renovación';
  };

  const getSubtitle = () => {
    if (paymentType === 'One-Time') {
      return 'Esta es una solicitud de pago único que no se renovará automáticamente';
    }
    return 'Esta solicitud renovará tu servicio por el período seleccionado';
  };

  const getButtonColor = () => {
    if (paymentType === 'One-Time') {
      return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
    return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {getTitle()}
              </h3>
              <p className="text-sm text-gray-500">
                {getSubtitle()}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Service Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{service.serviceType}</h4>
              <span className="text-sm font-semibold text-gray-600">
                {service.currency} {service.amount.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{service.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Número: {service.serviceNumber}</span>
              {paymentType !== 'One-Time' && (
                <span>Ciclo: {service.billingCycle}</span>
              )}
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-amber-800 mb-1">
                  Información Importante
                </h5>
                <p className="text-sm text-amber-700">
                  {warningMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo de Pago:</span>
              <span className="font-medium text-gray-900">
                {paymentType === 'One-Time' ? 'Pago Único' : 'Renovación'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monto:</span>
              <span className="font-medium text-gray-900">
                {service.currency} {service.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Método de Pago:</span>
              <span className="font-medium text-gray-900">Transferencia Bancaria</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estado Inicial:</span>
              <span className="font-medium text-amber-600">Pendiente</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getButtonColor()}`}
          >
            {paymentType === 'One-Time' ? 'Solicitar Pago Único' : 'Solicitar Renovación'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentConfirmationModal;
