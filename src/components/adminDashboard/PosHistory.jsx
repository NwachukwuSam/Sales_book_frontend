import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Calendar,
  DollarSign,
  CreditCard,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import TopNav from './../TopNav'
import axios from 'axios';

const API_BASE_URL = 'https://sales-book.onrender.com/api';

const POSHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    totalServiceCharges: 0,
    todayTransactions: 0
  });
  const [userData, setUserData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [exporting, setExporting] = useState(false);

  const serviceTypes = ['All', 'Withdrawal', 'Deposit', 'Transfer'];

  // Format currency to Naira
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₦0.00';
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `Today, ${date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-NG', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (err) {
      return dateString;
    }
  };

  // Get transaction method display
  const getTransactionMethodDisplay = (method) => {
    const methods = {
      'Pos-Parallex': 'POS (Parallex)',
      'Pos-Opay': 'POS (Opay)',
      'Transfer-Parallex': 'Transfer (Parallex)',
      'Transfer-Opay': 'Transfer (Opay)'
    };
    return methods[method] || method;
  };

  // Get service type color
  const getServiceTypeColor = (type) => {
    switch(type) {
      case 'Withdrawal': return 'text-red-600 bg-red-50 border border-red-100';
      case 'Deposit': return 'text-green-600 bg-green-50 border border-green-100';
      case 'Transfer': return 'text-blue-600 bg-blue-50 border border-blue-100';
      default: return 'text-gray-600 bg-gray-50 border border-gray-100';
    }
  };

  // Get payment method color
  const getPaymentMethodColor = (method) => {
    switch(method) {
      case 'Cash': return 'text-yellow-600 bg-yellow-50 border border-yellow-100';
      case 'POS': return 'text-purple-600 bg-purple-50 border border-purple-100';
      default: return 'text-gray-600 bg-gray-50 border border-gray-100';
    }
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = localStorage.getItem('userData') || 
                              localStorage.getItem('user') || 
                              sessionStorage.getItem('userData');
        
        if (userDataString) {
          const parsedData = JSON.parse(userDataString);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Fetch POS transactions from API
  const fetchPosTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const response = await axios.get(
        `${API_BASE_URL}/pos-service/get-pos-records`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const transactionsData = response.data.posServices || [];
        setTransactions(transactionsData);
        
        // Calculate statistics
        calculateStatistics(transactionsData);
      } else {
        setError('Failed to load transactions');
      }

    } catch (error) {
      console.error('Error fetching POS transactions:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStatistics = (transactionsData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = transactionsData.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= today;
    });

    const totalAmount = transactionsData.reduce((sum, transaction) => 
      sum + (transaction.transactionAmount || 0), 0);
    
    const totalServiceCharges = transactionsData.reduce((sum, transaction) => 
      sum + (transaction.serviceCharge || 0), 0);

    setStats({
      totalTransactions: transactionsData.length,
      totalAmount,
      totalServiceCharges,
      todayTransactions: todayTransactions.length
    });
  };

  // Load transactions on component mount
  useEffect(() => {
    fetchPosTransactions();
  }, []);

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortConfig.key === 'createdAt') {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (sortConfig.key === 'transactionAmount') {
      return sortConfig.direction === 'asc' 
        ? a.transactionAmount - b.transactionAmount
        : b.transactionAmount - a.transactionAmount;
    }
    
    if (sortConfig.key === 'serviceCharge') {
      return sortConfig.direction === 'asc' 
        ? a.serviceCharge - b.serviceCharge
        : b.serviceCharge - a.serviceCharge;
    }
    
    return 0;
  });

  // Filter transactions based on search and filter
  const filteredTransactions = sortedTransactions.filter(transaction => {
    // Apply service type filter
    if (serviceTypeFilter !== 'All' && transaction.transactionType !== serviceTypeFilter) {
      return false;
    }

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        transaction._id?.toLowerCase().includes(searchLower) ||
        transaction.transactionType?.toLowerCase().includes(searchLower) ||
        getTransactionMethodDisplay(transaction.transactionMethod).toLowerCase().includes(searchLower) ||
        transaction.serviceChargePaymentMethod?.toLowerCase().includes(searchLower) ||
        transaction.processedBy?.firstName?.toLowerCase().includes(searchLower) ||
        transaction.processedBy?.lastName?.toLowerCase().includes(searchLower) ||
        formatCurrency(transaction.transactionAmount).toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Export to CSV
  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = ['Transaction ID', 'Service Type', 'Amount', 'Service Charge', 'Payment Method', 'Transaction Method', 'Date', 'Processed By'];
      
      const csvData = filteredTransactions.map(transaction => [
        transaction._id?.slice(-8).toUpperCase() || 'N/A',
        transaction.transactionType,
        formatCurrency(transaction.transactionAmount),
        formatCurrency(transaction.serviceCharge),
        transaction.serviceChargePaymentMethod,
        getTransactionMethodDisplay(transaction.transactionMethod),
        formatDate(transaction.createdAt),
        `${transaction.processedBy?.firstName || ''} ${transaction.processedBy?.lastName || ''}`
      ]);
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `pos-transactions-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setError(null);
    fetchPosTransactions();
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading POS history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <TopNav />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">POS Services History</h2>
            <p className="text-gray-600 mt-1">{transactions.length} Items</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={exporting || filteredTransactions.length === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by transaction ID, amount, method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Service Type Filter */}
        <div className="flex flex-wrap gap-2">
          {serviceTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setServiceTypeFilter(type);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalTransactions}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Service Charges</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalServiceCharges)}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{stats.todayTransactions}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Date & Time
                    {sortConfig.key === 'createdAt' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4 ml-1" /> : 
                        <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Service Type
                </th>
                <th 
                  className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('transactionAmount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === 'transactionAmount' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4 ml-1" /> : 
                        <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('serviceCharge')}
                >
                  <div className="flex items-center">
                    Service Charge
                    {sortConfig.key === 'serviceCharge' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4 ml-1" /> : 
                        <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Transaction Method
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Processed By
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction, index) => (
                  <tr 
                    key={transaction._id} 
                    className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-gray-600">{formatDate(transaction.createdAt)}</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-mono text-gray-900 font-medium">
                        {transaction._id?.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(transaction.transactionType)}`}>
                        {transaction.transactionType}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-bold text-gray-900">
                        {formatCurrency(transaction.transactionAmount)}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(transaction.serviceChargePaymentMethod)}`}>
                        {formatCurrency(transaction.serviceCharge)}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-gray-700">
                        {transaction.serviceChargePaymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-gray-700">
                        {getTransactionMethodDisplay(transaction.transactionMethod)}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-gray-600">
                        {transaction.processedBy?.firstName} {transaction.processedBy?.lastName}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <CreditCard className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 text-lg">No transactions found</p>
                      <p className="text-gray-400 mt-1">
                        {searchQuery || serviceTypeFilter !== 'All' 
                          ? "Try adjusting your search or filter" 
                          : "No POS transactions recorded yet"}
                      </p>
                      {(searchQuery || serviceTypeFilter !== 'All') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setServiceTypeFilter('All');
                          }}
                          className="mt-3 px-4 py-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)}</span> of{' '}
            <span className="font-semibold">{filteredTransactions.length}</span> transactions
          </p>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSHistory;