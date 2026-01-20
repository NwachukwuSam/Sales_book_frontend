// import React from 'react'
// import TopNav from '../TopNav'

// function PosHistory() {
//   return (
//     <div>
//       <TopNav/>
//     </div>
//   )
// }

// export default PosHistory

import { Import } from 'lucide-react';
import React, { useState } from 'react';
import TopNav from '../TopNav';

const POSHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All');

  const transactions = [
    { id: 'PSV-00451', serviceType: 'Withdrawal', amount: '₱10,000', serviceCharge: '₱300', paymentMethod: 'Cash', transactionMethod: 'POS – Wema', date: 'Today, 10:14 AM' },
    { id: 'PSV-00450', serviceType: 'Deposit', amount: 'N5,000', serviceCharge: '₱100', paymentMethod: 'POS', transactionMethod: 'POS – UBA', date: 'Today, 9:45 AM' },
    { id: 'PSV-00449', serviceType: 'Transfer', amount: '₱20,000', serviceCharge: '₱150', paymentMethod: 'Transfer', transactionMethod: 'Transfer – UBA', date: 'Today, 9:10 AM' },
    { id: 'PSV-00448', serviceType: 'Withdrawal', amount: '₱50,000', serviceCharge: '₱500', paymentMethod: 'Cash', transactionMethod: 'POS – Wema', date: 'Today, 8:50 AM' },
    { id: 'PSV-00447', serviceType: 'Transfer', amount: '₱7,500', serviceCharge: '₱100', paymentMethod: 'Transfer', transactionMethod: 'Transfer – Wema', date: 'Yesterday, 7:12 PM' },
    { id: 'PSV-00446', serviceType: 'Deposit', amount: '₱3,000', serviceCharge: '₱100', paymentMethod: 'POS', transactionMethod: 'POS – UBA', date: 'Yesterday, 5:33 PM' },
    { id: 'PSV-00445', serviceType: 'Deposit', amount: '₱12,000', serviceCharge: '₱250', paymentMethod: 'Transfer', transactionMethod: 'Transfer – UBA', date: 'Yesterday, 3:17 PM' },
    { id: 'PSV-00444', serviceType: 'Withdrawal', amount: '₱2,000', serviceCharge: '₱100', paymentMethod: 'Cash', transactionMethod: 'POS – UBA', date: '2 days ago' },
    { id: 'PSV-00443', serviceType: 'Transfer', amount: '₱15,000', serviceCharge: '₱200', paymentMethod: 'Cash', transactionMethod: 'Transfer – Wema', date: '2 days ago' },
    { id: 'PSV-00442', serviceType: 'Withdrawal', amount: '₱8,000', serviceCharge: '₱200', paymentMethod: 'POS', transactionMethod: 'POS – UBA', date: '2 days ago' },
    { id: 'PSV-00441', serviceType: 'Deposit', amount: '₱1,000', serviceCharge: '₱50', paymentMethod: 'Cash', transactionMethod: 'POS – Wema', date: '3 days ago' },
    { id: 'PSV-00440', serviceType: 'Transfer', amount: '₱25,000', serviceCharge: '₱300', paymentMethod: 'Transfer', transactionMethod: 'Transfer – UBA', date: '3 days ago' },
    { id: 'PSV-00439', serviceType: 'Deposit', amount: '₱2,500', serviceCharge: '₱80', paymentMethod: 'POS', transactionMethod: 'POS – Wema', date: '4 days ago' },
    { id: 'PSV-00438', serviceType: 'Withdrawal', amount: '₱6,000', serviceCharge: '₱150', paymentMethod: 'Cash', transactionMethod: 'POS – UBA', date: '5 days ago' },
    { id: 'PSV-00437', serviceType: 'Deposit', amount: '₱9,000', serviceCharge: '₱180', paymentMethod: 'Transfer', transactionMethod: 'Transfer – Wema', date: '5 days ago' },
    { id: 'PSV-00436', serviceType: 'Withdrawal', amount: '₱4,500', serviceCharge: '₱120', paymentMethod: 'Cash', transactionMethod: 'POS – UBA', date: '6 days ago' },
  ];

  const serviceTypes = ['All', 'Withdrawal', 'Deposit', 'Transfer'];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.amount.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionMethod.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesServiceType = serviceTypeFilter === 'All' || transaction.serviceType === serviceTypeFilter;
    
    return matchesSearch && matchesServiceType;
  });

  const getServiceTypeColor = (type) => {
    switch(type) {
      case 'Withdrawal': return 'text-red-600 bg-red-50';
      case 'Deposit': return 'text-green-600 bg-green-50';
      case 'Transfer': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch(method) {
      case 'Cash': return 'text-yellow-600 bg-yellow-50';
      case 'POS': return 'text-purple-600 bg-purple-50';
      case 'Transfer': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateStr) => {
    if (dateStr.includes('Today') || dateStr.includes('Yesterday')) {
      return <span className="font-semibold text-gray-800">{dateStr}</span>;
    }
    return <span className="text-gray-600">{dateStr}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <TopNav />
      {/* Header */}
      <div className="mb-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">POS Services History</h2>
            <p className="text-gray-600 mt-1">{transactions.length} Items</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Service Type Filter */}
            <div className="flex space-x-2">
              {serviceTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setServiceTypeFilter(type)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    serviceTypeFilter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by transaction ID, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Service Type
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Service Charge
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Transaction Method
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction, index) => (
                <tr 
                  key={transaction.id} 
                  className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{transaction.id}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(transaction.serviceType)}`}>
                      {transaction.serviceType}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="font-bold text-gray-900">{transaction.amount}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-gray-600">{transaction.serviceCharge}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(transaction.paymentMethod)}`}>
                      {transaction.paymentMethod}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-gray-700">{transaction.transactionMethod}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {formatDate(transaction.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-gray-400 mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-800">₱185,500</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Service Charges</p>
              <p className="text-2xl font-bold text-gray-800">₱2,670</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Transactions</p>
              <p className="text-2xl font-bold text-gray-800">4</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredTransactions.length}</span> of{' '}
          <span className="font-semibold">{transactions.length}</span> transactions
        </p>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            1
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            2
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            3
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSHistory;
