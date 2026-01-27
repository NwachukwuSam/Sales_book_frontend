import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Plus,
  RefreshCw,
  ArrowUpRight,
  Loader2,
  Users,
  Clock
} from 'lucide-react';
import CashierTopNav from '../cashierDashboard/CashierTopNav.jsx';
import axios from 'axios';

const API_BASE_URL = 'https://sales-system-production.up.railway.app/api';

const CashierDashboard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    inventoryLowStock: 0
  });
  
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState('');

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
        return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (err) {
      return dateString;
    }
  };

  // Get payment method color
  const getPaymentColor = (paymentMethod) => {
    if (!paymentMethod) return 'bg-gray-100 text-gray-800';
    if (paymentMethod.includes('Cash')) return 'bg-green-100 text-green-800';
    if (paymentMethod.includes('Pos')) return 'bg-blue-100 text-blue-800';
    if (paymentMethod.includes('Transfer')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
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

  // Fetch user data from API
  const fetchUserDataFromAPI = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No token found');
        return null;
      }

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        setUserData(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        return userData;
      } else if (response.data.user) {
        const userData = response.data.user;
        setUserData(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user data from API:', error);
      return null;
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Try to get from localStorage first
        const userDataString = localStorage.getItem('userData') || 
                              localStorage.getItem('user') || 
                              sessionStorage.getItem('userData');
        
        if (userDataString) {
          const parsedData = JSON.parse(userDataString);
          setUserData(parsedData);
        } else {
          // If not in storage, fetch from API
          await fetchUserDataFromAPI();
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Try to fetch from API as fallback
        await fetchUserDataFromAPI();
      }
    };

    loadUserData();
  }, []);

  // Get cashier ID from user data
  const getCashierId = () => {
    if (!userData) {
      return null;
    }
    
    return userData.id || userData._id || userData.userId;
  };

  // Fetch cashier's sales data using the same endpoint as sales history
  const fetchCashierSales = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return { total: 0, transactions: [], count: 0 };
      }

      // Use the same endpoint as CashierSalesHistory with limit parameter
      const response = await axios.get(`${API_BASE_URL}/sales/sales-history`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: 100, // Get more records to filter for today
          page: 1,
          sortBy: 'date',
          sortOrder: 'desc'
        }
      });
      
      // Extract sales data
      const salesData = response.data.data?.sales || response.data.sales || [];
      
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Filter for today's sales only
      const todaySales = salesData.filter(sale => {
        const saleDate = new Date(sale.createdAt || sale.timestamp);
        return saleDate >= today && saleDate < tomorrow;
      });
      
      // Calculate today's totals
      const totalAmount = todaySales.reduce((sum, sale) => {
        const amount = sale.totalAmount || 0;
        return sum + amount;
      }, 0);
      
      const transactionCount = todaySales.length;
      
      // Get recent transactions (last 5 from today)
      const recentSales = todaySales
        .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))
        .slice(0, 5);
      
      return {
        total: totalAmount,
        transactions: recentSales,
        count: transactionCount
      };
      
    } catch (error) {
      console.error('Error fetching cashier sales:', error);
      return { total: 0, transactions: [], count: 0 };
    }
  };

  // Fetch low stock items
  const fetchLowStockItems = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        return [];
      }
      
      const response = await axios.get(`${API_BASE_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const inventoryItems = response.data.data?.items || response.data.items || response.data || [];
      
      // Find low stock items (less than 10 items)
      const lowStock = inventoryItems.filter(item => 
        item.quantity !== undefined && item.quantity < 10
      );
      
      return lowStock;
      
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure we have user data
      let currentUserData = userData;
      if (!currentUserData) {
        currentUserData = await fetchUserDataFromAPI();
      }
      
      // Fetch data in parallel
      const [salesData, lowStockItems] = await Promise.all([
        fetchCashierSales(),
        fetchLowStockItems()
      ]);

      // Update stats
      setStats({
        todaySales: salesData.total || 0,
        todayTransactions: salesData.count || 0,
        inventoryLowStock: lowStockItems.length || 0
      });

      // Update recent transactions
      setRecentTransactions(salesData.transactions || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Unable to load dashboard data. Please try again.');
      
      // Show empty state
      setStats({
        todaySales: 0,
        todayTransactions: 0,
        inventoryLowStock: 0
      });
      setRecentTransactions([]);
      
    } finally {
      setLoading(false);
    }
  };

  // Calculate transactions per hour
  const calculateTransactionsPerHour = () => {
    const shiftStart = 8; // 8 AM
    const currentHour = new Date().getHours();
    const hoursWorked = Math.max(currentHour - shiftStart, 1);
    
    return Math.round(stats.todayTransactions / hoursWorked) || 0;
  };

  // Calculate average transaction value
  const calculateAverageTransaction = () => {
    if (stats.todayTransactions === 0) return 0;
    return stats.todaySales / stats.todayTransactions;
  };

  // Get item display from sale
  const getItemDisplay = (sale) => {
    if (!sale.items || sale.items.length === 0) {
      // Fallback to old format
      if (sale.item?.name) return sale.item.name;
      return 'No items';
    }
    
    if (sale.items.length === 1) {
      return sale.items[0].name || 'Item';
    }
    
    return `${sale.items.length} items`;
  };

  // Get total quantity from sale
  const getTotalQuantity = (sale) => {
    if (!sale.items || sale.items.length === 0) {
      // Fallback to old format
      return sale.quantity || 0;
    }
    return sale.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // Fetch data when userData is available
  useEffect(() => {
    if (userData) {
      fetchDashboardData();
    }
  }, [userData]);

  // Initial load - fetch even if no userData (will fetch userData inside)
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchDashboardData();
    }
  }, []);

  // Set up timer for current time
  useEffect(() => {
    // Initialize time
    updateCurrentTime();
    
    // Update every second
    const timerId = setInterval(updateCurrentTime, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timerId);
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Loading state
  if (loading && recentTransactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CashierTopNav />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
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
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {userData?.firstName ? `Welcome, ${userData.firstName}!` : 'Cashier Dashboard'}
              </h1>
              <p className="text-gray-600 mt-2">
                Here's your performance overview for today.
              </p>
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
                  <div className="text-xs">@{userData.username || 'cashier'}</div>
                </div>
              )}
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Refresh dashboard"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-yellow-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Today's Sales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm font-medium">Today's Sales</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  {formatCurrency(stats.todaySales)}
                </h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className={`flex items-center ${stats.todaySales > 0 ? 'text-green-600' : 'text-gray-500'} text-sm`}>
              {stats.todaySales > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>Your sales today</span>
                </>
              ) : (
                <span>No sales yet</span>
              )}
            </div>
          </div>

          {/* Your Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm font-medium">Your Transactions</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  {stats.todayTransactions}
                </h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center text-blue-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>{calculateTransactionsPerHour()} per hour</span>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  {stats.inventoryLowStock}
                </h3>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className={`flex items-center ${stats.inventoryLowStock > 0 ? 'text-orange-600' : 'text-green-600'} text-sm`}>
              {stats.inventoryLowStock > 0 ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Needs attention</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Stock good</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="/quick-sale"
                  className="group flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="h-14 w-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-7 w-7 text-white" />
                  </div>
                  <span className="font-medium text-gray-800 text-center group-hover:text-blue-600">
                    New Sale
                  </span>
                </a>
                
                <a
                  href="/cashier-inventory"
                  className="group flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all"
                >
                  <div className="h-14 w-14 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Package className="h-7 w-7 text-white" />
                  </div>
                  <span className="font-medium text-gray-800 text-center group-hover:text-green-600">
                    View Inventory
                  </span>
                </a>
                
                <a
                  href="/cashier-sales-history"
                  className="group flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="h-14 w-14 bg-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <span className="font-medium text-gray-800 text-center group-hover:text-purple-600">
                    Sales History
                  </span>
                </a>
                
                <a
                  href="/customers"
                  className="group flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className="h-14 w-14 bg-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <span className="font-medium text-gray-800 text-center group-hover:text-orange-600">
                    Customers
                  </span>
                </a>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Your Recent Transactions</h2>
                <a href="/cashier-sales-history" className="text-blue-600 hover:text-blue-700 text-sm">
                  View All
                </a>
              </div>
              
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction, index) => (
                    <div key={transaction._id || index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-gray-800">
                          {transaction.transactionId || `TXN-${(transaction._id || '').slice(-4) || '000'}`}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <span>{getItemDisplay(transaction)}</span>
                          <span className="mx-2">•</span>
                          <span className={`px-2 py-1 rounded text-xs ${getPaymentColor(transaction.paymentMethod)}`}>
                            {transaction.paymentMethod?.split('-')[0] || 'Cash'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">
                          {formatCurrency(transaction.totalAmount || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getTotalQuantity(transaction)} items
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No transactions yet today</p>
                    <a href="/quick-sale" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                      Start your first sale
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-800">Your Performance</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-800">Average Transaction</h4>
                      <p className="text-lg font-bold text-blue-900 mt-1">
                        {formatCurrency(calculateAverageTransaction())}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-800">Transaction Rate</h4>
                      <p className="text-lg font-bold text-green-900 mt-1">
                        {calculateTransactionsPerHour()} per hour
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-800">Quick Info</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <ShoppingCart className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Total Sales Today</h4>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formatCurrency(stats.todaySales)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Transactions</h4>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {stats.todayTransactions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;