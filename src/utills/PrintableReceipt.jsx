import React from 'react';

const PrintableReceipt = ({ data }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₦0.00';
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="printable-receipt bg-white p-8 max-w-md mx-auto">
      {/* Receipt Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Springcore Africa POS</h1>
        <p className="text-gray-600 text-sm">Main Branch, Lagos</p>
        <p className="text-gray-600 text-sm">Tel: 01-2345678 | Email: info@springcore.africa</p>
      </div>
      
      <div className="border-t border-b border-gray-300 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-800">RECEIPT</p>
            <p className="text-sm text-gray-600">#{data.transactionId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{data.date}</p>
            <p className="text-xs text-gray-500">Printed: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Customer & Cashier Info */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">CASHIER</p>
          <p className="text-gray-800">{data.cashier}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">CUSTOMER</p>
          <p className="text-gray-800">{data.customer}</p>
        </div>
      </div>
      
      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 text-sm font-medium text-gray-600">ITEM</th>
              <th className="text-center py-2 text-sm font-medium text-gray-600">QTY</th>
              <th className="text-right py-2 text-sm font-medium text-gray-600">PRICE</th>
              <th className="text-right py-2 text-sm font-medium text-gray-600">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3">
                  <div className="text-sm text-gray-800">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </td>
                <td className="text-center py-3 text-sm text-gray-800">{item.quantity}</td>
                <td className="text-right py-3 text-sm text-gray-800">{formatCurrency(item.price)}</td>
                <td className="text-right py-3 text-sm text-gray-800 font-medium">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals */}
      <div className="mb-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(data.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (5% VAT)</span>
            <span className="font-medium">{formatCurrency(data.tax)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-red-600">-{formatCurrency(data.discount)}</span>
            </div>
          )}
          <div className="border-t border-gray-300 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">TOTAL</span>
              <span className="font-bold text-xl text-gray-800">{formatCurrency(data.total)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-2">PAYMENT INFORMATION</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Method</p>
            <p className="font-medium">{data.paymentMethod}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount Paid</p>
            <p className="font-medium">{formatCurrency(data.amountPaid)}</p>
          </div>
          {data.changeDue > 0 && (
            <div>
              <p className="text-sm text-gray-600">Change Due</p>
              <p className="font-medium text-green-600">{formatCurrency(data.changeDue)}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-300">
        <p className="text-gray-600 text-sm mb-2">Thank you for your business!</p>
        <p className="text-gray-500 text-xs">This receipt is computer generated and does not require a signature</p>
        <div className="mt-4 flex justify-center space-x-4 text-xs text-gray-500">
          <span>📍 Visit: www.springcore.africa</span>
          <span>📧 Email: support@springcore.africa</span>
          <span>📱 Tel: 01-2345678</span>
        </div>
        <div className="mt-4 text-xs text-gray-400">
          Receipt ID: {data.transactionId} | Printed at: {new Date().toLocaleString()}
        </div>
      </div>
      
      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          .printable-receipt {
            max-width: 80mm !important;
            padding: 16px !important;
            font-size: 12px !important;
          }
          h1 { font-size: 18px !important; }
          h2, h3 { font-size: 14px !important; }
          .text-xl { font-size: 16px !important; }
          .text-2xl { font-size: 18px !important; }
          .text-sm { font-size: 10px !important; }
          .text-xs { font-size: 8px !important; }
          .p-8 { padding: 16px !important; }
          .mb-6 { margin-bottom: 12px !important; }
          .py-3 { padding-top: 6px !important; padding-bottom: 6px !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintableReceipt;