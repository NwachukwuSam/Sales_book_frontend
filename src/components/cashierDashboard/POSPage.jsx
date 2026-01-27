import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Calculator, 
  Receipt,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Clock,
  Printer,
  Eye,
  Search,
  Filter,
  Loader2,
  WifiOff
} from 'lucide-react';
import CashierTopNav from '../cashierDashboard/CashierTopNav.jsx';
import axios from 'axios';

const API_BASE_URL = 'https://sales-system-production.up.railway.app/api';

const POSPage = () => {
  const [formData, setFormData] = useState({
    transactionType: 'Deposit',
    transactionAmount: '',
    serviceCharge: '',
    serviceChargePaymentMethod: 'Cash',
    transactionMethod: 'Pos-Parallex'
  });
  
  const [posTransactions, setPosTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('form');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

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
      return date.toLocaleDateString('en-NG', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return dateString;
    }
  };

  // Get payment method color
  const getPaymentColor = (method) => {
    switch (method) {
      case 'Cash': return 'bg-green-100 text-green-800 border border-green-200';
      case 'POS': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get transaction type color
  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'Deposit': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'Withdrawal': return 'bg-red-50 text-red-700 border border-red-100';
      case 'Transfer': return 'bg-purple-50 text-purple-700 border border-purple-100';
      default: return 'bg-gray-50 text-gray-700 border border-gray-100';
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

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Update current time
  const updateCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}:${seconds}`);
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

  // Set up timer for current time
  useEffect(() => {
    updateCurrentTime();
    const timerId = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value
    };

    // Auto-calculate service charge for deposits (2%)
    if (name === 'transactionAmount' && formData.transactionType === 'Deposit') {
      const amount = parseFloat(value) || 0;
      const serviceCharge = amount * 0.02;
      updatedFormData.serviceCharge = serviceCharge.toFixed(2);
    }

    // Auto-calculate service charge for withdrawals (1%)
    if (name === 'transactionAmount' && formData.transactionType === 'Withdrawal') {
      const amount = parseFloat(value) || 0;
      const serviceCharge = amount * 0.01;
      updatedFormData.serviceCharge = serviceCharge.toFixed(2);
    }

    setFormData(updatedFormData);
  };

  // Calculate total amount
  const calculateTotal = () => {
    const amount = parseFloat(formData.transactionAmount) || 0;
    const service = parseFloat(formData.serviceCharge) || 0;
    
    if (formData.transactionType === 'Withdrawal') {
      return amount - service;
    } else {
      return amount + service;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.transactionAmount || !formData.serviceCharge) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.transactionAmount) <= 0) {
      setError('Transaction amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const payload = {
        transactionType: formData.transactionType,
        transactionAmount: parseFloat(formData.transactionAmount),
        serviceCharge: parseFloat(formData.serviceCharge),
        serviceChargePaymentMethod: formData.serviceChargePaymentMethod,
        transactionMethod: formData.transactionMethod
      };

      console.log('Submitting to:', `${API_BASE_URL}/pos-service/record-pos-sale`);
      console.log('Payload:', payload);

      const response = await axios.post(
        `${API_BASE_URL}/pos-service/record-pos-sale`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('POS transaction recorded successfully!');
        
        // Reset form
        setFormData({
          transactionType: 'Deposit',
          transactionAmount: '',
          serviceCharge: '',
          serviceChargePaymentMethod: 'Cash',
          transactionMethod: 'Pos-Parallex'
        });

        // Refresh transactions list
        fetchPosTransactions();
      } else {
        setError(response.data.message || 'Failed to record transaction');
      }

    } catch (error) {
      console.error('Transaction error:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Failed to record transaction';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch POS transactions
  const fetchPosTransactions = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('Authentication required. Please login.');
        return;
      }

      console.log('Fetching from:', `${API_BASE_URL}/pos-service/get-pos-records`);

      const response = await axios.get(
        `${API_BASE_URL}/pos-service/get-pos-records`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setPosTransactions(response.data.posServices || []);
        setApiStatus('connected');
        console.log('Data received:', response.data.posServices?.length || 0, 'transactions');
      } else {
        setError('Failed to load transactions');
        setApiStatus('disconnected');
      }

    } catch (error) {
      console.error('Error fetching POS transactions:', error);
      setError('Failed to load transactions. Please check your connection.');
      setApiStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on component mount
  useEffect(() => {
    fetchPosTransactions();
  }, []);

  // Filter transactions based on search and filter
  const filteredTransactions = posTransactions.filter(transaction => {
    // Apply type filter
    if (filterType !== 'all' && transaction.transactionType !== filterType) {
      return false;
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction._id?.toLowerCase().includes(searchLower) ||
        transaction.transactionType?.toLowerCase().includes(searchLower) ||
        transaction.transactionMethod?.toLowerCase().includes(searchLower) ||
        transaction.serviceChargePaymentMethod?.toLowerCase().includes(searchLower) ||
        transaction.processedBy?.firstName?.toLowerCase().includes(searchLower) ||
        transaction.processedBy?.lastName?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Calculate statistics
  const calculateStatistics = () => {
    const stats = {
      totalTransactions: filteredTransactions.length,
      totalAmount: 0,
      totalServiceCharge: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalTransfers: 0
    };

    filteredTransactions.forEach(transaction => {
      stats.totalAmount += transaction.transactionAmount || 0;
      stats.totalServiceCharge += transaction.serviceCharge || 0;
      
      if (transaction.transactionType === 'Deposit') {
        stats.totalDeposits++;
      } else if (transaction.transactionType === 'Withdrawal') {
        stats.totalWithdrawals++;
      } else if (transaction.transactionType === 'Transfer') {
        stats.totalTransfers++;
      }
    });

    return stats;
  };

  const statistics = calculateStatistics();

  // View transaction details
  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setViewMode('detail');
  };

  // Print receipt
  const printReceipt = (transaction) => {
    const printWindow = window.open('', '_blank');
    const netAmount = transaction.transactionType === 'Withdrawal'
      ? transaction.transactionAmount - transaction.serviceCharge
      : transaction.transactionAmount + transaction.serviceCharge;

    printWindow.document.write(`
      <html>
        <head>
          <title>POS Transaction Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 14px; }
            .receipt { max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px dashed #000; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 10px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2 style="margin: 0;">POS TRANSACTION RECEIPT</h2>
              <p style="margin: 5px 0;">Transaction ID: ${transaction._id?.slice(-8).toUpperCase() || 'N/A'}</p>
              <p style="margin: 5px 0;">${formatDate(transaction.createdAt)}</p>
            </div>
            
            <div class="row">
              <span>Transaction Type:</span>
              <span class="bold">${transaction.transactionType}</span>
            </div>
            <div class="row">
              <span>Payment Method:</span>
              <span>${getTransactionMethodDisplay(transaction.transactionMethod)}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="row">
              <span>Amount:</span>
              <span>${formatCurrency(transaction.transactionAmount)}</span>
            </div>
            <div class="row">
              <span>Service Charge:</span>
              <span>${formatCurrency(transaction.serviceCharge)}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="row total">
              <span>${transaction.transactionType === 'Withdrawal' ? 'Net Withdrawal:' : 'Total Amount:'}</span>
              <span>${formatCurrency(netAmount)}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="row">
              <span>Service Charge Paid Via:</span>
              <span>${transaction.serviceChargePaymentMethod}</span>
            </div>
            <div class="row">
              <span>Processed By:</span>
              <span>${transaction.processedBy?.firstName || ''} ${transaction.processedBy?.lastName || ''}</span>
            </div>
            
            <div class="footer center">
              <p style="margin: 5px 0;">**************************</p>
              <p style="margin: 5px 0;">Thank you for your business!</p>
              <p style="margin: 5px 0;">**************************</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Handle refresh
  const handleRefresh = () => {
    setError(null);
    setSuccess(null);
    fetchPosTransactions();
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      transactionType: 'Deposit',
      transactionAmount: '',
      serviceCharge: '',
      serviceChargePaymentMethod: 'Cash',
      transactionMethod: 'Pos-Parallex'
    });
    setError(null);
    setSuccess(null);
  };

  if (loading && posTransactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CashierTopNav />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading POS system...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CashierTopNav />
      
      <div className="p-4 md:p-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              {viewMode !== 'form' && (
                <button
                  onClick={() => setViewMode('form')}
                  className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {viewMode === 'detail' ? 'Transaction Details' : 'POS Terminal'}
                  </h1>
                  {apiStatus === 'disconnected' && (
                    <div className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      <WifiOff className="h-4 w-4 mr-1" />
                      Offline
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mt-2">
                  {viewMode === 'detail' 
                    ? 'View transaction details and print receipt'
                    : 'Process POS transactions and view history'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Current Time Display */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2">
                <Clock className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-gray-700 font-medium">{currentTime}</span>
              </div>
              
              {/* User Info */}
              {userData && (
                <div className="text-sm text-gray-600 hidden md:block">
                  <div className="font-medium">{userData.firstName} {userData.lastName}</div>
                  <div className="text-xs">POS Operator</div>
                </div>
              )}
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                {error.includes('401') && (
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Re-login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {viewMode === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Transaction Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Calculator className="h-6 w-6 text-blue-600 mr-3" />
                  <h2 className="text-lg font-semibold text-gray-800">New POS Transaction</h2>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Transaction Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Type *
                      </label>
                      <select
                        name="transactionType"
                        value={formData.transactionType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="Deposit">Deposit</option>
                        <option value="Withdrawal">Withdrawal</option>
                        <option value="Transfer">Transfer</option>
                      </select>
                    </div>

                    {/* Transaction Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Method *
                      </label>
                      <select
                        name="transactionMethod"
                        value={formData.transactionMethod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="Pos-Parallex">POS (Parallex)</option>
                        <option value="Pos-Opay">POS (Opay)</option>
                        <option value="Transfer-Parallex">Transfer (Parallex)</option>
                        <option value="Transfer-Opay">Transfer (Opay)</option>
                      </select>
                    </div>

                    {/* Transaction Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Amount (₦) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          name="transactionAmount"
                          value={formData.transactionAmount}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    {/* Service Charge */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Charge (₦) *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          name="serviceCharge"
                          value={formData.serviceCharge}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    {/* Service Charge Payment Method */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Charge Payment Method *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {['Cash', 'POS'].map(method => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, serviceChargePaymentMethod: method }))}
                            className={`px-4 py-3 border rounded-lg text-center transition-colors ${
                              formData.serviceChargePaymentMethod === method
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Transaction Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction Type:</span>
                        <span className="font-medium">{formData.transactionType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium">{getTransactionMethodDisplay(formData.transactionMethod)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{formatCurrency(formData.transactionAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Charge:</span>
                        <span className="font-medium">{formatCurrency(formData.serviceCharge || 0)}</span>
                      </div>
                      <div className="h-px bg-blue-200 my-2"></div>
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-blue-800">
                          {formData.transactionType === 'Withdrawal' ? 'Net Withdrawal:' : 'Total Amount:'}
                        </span>
                        <span className="text-blue-900">{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Record Transaction
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Reset Form
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className="px-6 py-3 border border-blue-300 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                    >
                      <Receipt className="h-5 w-5 mr-2" />
                      View History ({posTransactions.length})
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Quick Stats */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Calculator className="h-6 w-6 text-blue-600 mr-3" />
                  <h2 className="text-lg font-semibold text-gray-800">Today's Stats</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-blue-800">Total Transactions</h4>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {statistics.totalTransactions}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-green-800">Total Amount</h4>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {formatCurrency(statistics.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-purple-800">Service Charges</h4>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {formatCurrency(statistics.totalServiceCharge)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Types */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction Types</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Deposits</span>
                    <span className="font-bold text-blue-600">{statistics.totalDeposits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Withdrawals</span>
                    <span className="font-bold text-red-600">{statistics.totalWithdrawals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transfers</span>
                    <span className="font-bold text-purple-600">{statistics.totalTransfers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredTransactions.length} of {posTransactions.length} transactions
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="all">All Types</option>
                    <option value="Deposit">Deposits</option>
                    <option value="Withdrawal">Withdrawals</option>
                    <option value="Transfer">Transfers</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Service Charge</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => {
                      return (
                        <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            <span className="font-mono text-gray-700">
                              {transaction._id?.slice(-8).toUpperCase() || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTransactionTypeColor(transaction.transactionType)}`}>
                              {transaction.transactionType}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatCurrency(transaction.transactionAmount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getPaymentColor(transaction.serviceChargePaymentMethod)}`}>
                              {formatCurrency(transaction.serviceCharge)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {getTransactionMethodDisplay(transaction.transactionMethod)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => viewTransactionDetails(transaction)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => printReceipt(transaction)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                title="Print Receipt"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center">
                        <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No transactions found</p>
                        {searchTerm || filterType !== 'all' ? (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setFilterType('all');
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                          >
                            Clear filters
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Back to Form */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setViewMode('form')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to POS Terminal
              </button>
            </div>
          </div>
        )}

        {/* Transaction Detail View */}
        {viewMode === 'detail' && selectedTransaction && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Transaction Details</h2>
              <p className="text-gray-600 mt-2">Complete transaction information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Transaction Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction Information</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium font-mono">{selectedTransaction._id}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Transaction Type:</span>
                      <span className={`font-medium px-2 py-1 rounded text-sm ${getTransactionTypeColor(selectedTransaction.transactionType).replace('border', '')}`}>
                        {selectedTransaction.transactionType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction Method:</span>
                      <span className="font-medium text-gray-800">
                        {getTransactionMethodDisplay(selectedTransaction.transactionMethod)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-gray-800">
                        {formatCurrency(selectedTransaction.transactionAmount)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Service Charge:</span>
                      <span className="font-medium text-purple-800">
                        {formatCurrency(selectedTransaction.serviceCharge)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Charge Payment Method:</span>
                      <span className={`font-medium px-2 py-1 rounded text-sm ${getPaymentColor(selectedTransaction.serviceChargePaymentMethod).replace('border', '')}`}>
                        {selectedTransaction.serviceChargePaymentMethod}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-green-700">Net Amount:</span>
                      <span className="font-bold text-green-900">
                        {formatCurrency(
                          selectedTransaction.transactionType === 'Withdrawal'
                            ? selectedTransaction.transactionAmount - selectedTransaction.serviceCharge
                            : selectedTransaction.transactionAmount + selectedTransaction.serviceCharge
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed By:</span>
                      <span className="font-medium text-gray-800">
                        {selectedTransaction.processedBy?.firstName} {selectedTransaction.processedBy?.lastName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium text-gray-800">
                        {formatDate(selectedTransaction.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Status:</span>
                      <span className="font-medium text-green-600">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => printReceipt(selectedTransaction)}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Printer className="h-5 w-5 mr-2" />
                Print Receipt
              </button>
              
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedTransaction(null);
                }}
                className="px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to List
              </button>
              
              <button
                onClick={() => setViewMode('form')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSPage;