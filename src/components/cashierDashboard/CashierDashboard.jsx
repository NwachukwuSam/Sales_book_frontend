import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Package,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import CashierTopNav from '../cashierDashboard/CashierTopNav.jsx';
import axios from 'axios';

const API_BASE_URL = 'https://sales-system-production.up.railway.app/api';

const CashierDashboard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    todayCustomers: 0,
    inventoryLowStock: 0
  });
  
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [dailyStats, setDailyStats] = useState({
    bestSellingHour: '',
    highestTransaction: 0,
    avgTransactionTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [quickActions, setQuickActions] = useState([
    { id: 1, title: 'New Sale', icon: Plus, color: 'bg-blue-500', link: '/quick-sale' },
    { id: 2, title: 'View Inventory', icon: Package, color: 'bg-green-500', link: '/cashier-inventory' },
    { id: 3, title: 'Sales History', icon: BarChart3, color: 'bg-purple-500', link: '/cashier-sales-history' },
    { id: 4, title: 'Customer List', icon: Users, color: 'bg-orange-500', link: '/customers' }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [shiftStatus, setShiftStatus] = useState('Active');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // cleanup
  }, []);
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

  // Format date and time
  const formatDateTime = (date) => {
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch today's analytics
  const fetchTodayAnalytics = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/analytics/daily`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data.analytics || response.data;
      return {
        totalRevenue: data.totalSales?.totalRevenue || 0,
        totalTransactions: data.totalSales?.totalTransactions || 0,
        customersServed: data.cashierSales?.length || data.totalSales?.totalCustomers || 0
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  };

  // Fetch recent sales
  const fetchRecentSales = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/sales/recent?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent sales:', error);
      return [];
    }
  };

  // Fetch low stock inventory
  const fetchLowStockItems = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/inventory/low-stock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  };

  // Fetch daily statistics
  const fetchDailyStats = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/analytics/daily-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data || {
        bestSellingHour: '',
        highestTransaction: 0,
        avgTransactionTime: 0
      };
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      return {
        bestSellingHour: '2:00 PM - 3:00 PM',
        highestTransaction: 0,
        avgTransactionTime: 0
      };
    }
  };

  // Calculate shift duration
  const calculateShiftDuration = () => {
    // In a real app, you would fetch shift start time from API
    const shiftStart = new Date();
    shiftStart.setHours(8, 0, 0, 0); // Example: shift started at 8:00 AM
    
    const diffMs = currentTime - shiftStart;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel for better performance
      const [
        analytics,
        recentSales,
        lowStock,
        dailyStatistics
      ] = await Promise.all([
        fetchTodayAnalytics(),
        fetchRecentSales(),
        fetchLowStockItems(),
        fetchDailyStats()
      ]);

      // Update stats
      if (analytics) {
        setStats({
          todaySales: analytics.totalRevenue || 0,
          todayTransactions: analytics.totalTransactions || 0,
          todayCustomers: analytics.customersServed || 0,
          inventoryLowStock: lowStock.length || 0
        });
      }

      // Update recent transactions
      setRecentTransactions(recentSales);

      // Update low stock items
      setLowStockItems(lowStock);

      // Update daily stats
      setDailyStats(dailyStatistics);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback sample data for demo
      setStats({
        todaySales: 1250000,
        todayTransactions: 24,
        todayCustomers: 18,
        inventoryLowStock: 3
      });

      setRecentTransactions([
        { _id: '1', transactionId: 'TXN-001', totalAmount: 95000, customer: 'John Doe', paymentMethod: 'Cash', createdAt: new Date().toISOString() },
        { _id: '2', transactionId: 'TXN-002', totalAmount: 125000, customer: 'Jane Smith', paymentMethod: 'Pos-UBA', createdAt: new Date().toISOString() },
        { _id: '3', transactionId: 'TXN-003', totalAmount: 45000, customer: 'Walk-in', paymentMethod: 'Cash', createdAt: new Date().toISOString() },
        { _id: '4', transactionId: 'TXN-004', totalAmount: 220000, customer: 'Michael Brown', paymentMethod: 'Transfer-UBA', createdAt: new Date().toISOString() },
        { _id: '5', transactionId: 'TXN-005', totalAmount: 75000, customer: 'Sarah Johnson', paymentMethod: 'Pos-Wema', createdAt: new Date().toISOString() }
      ]);

      setLowStockItems([
        { productName: 'Product A', currentStock: 5, minimumStock: 10 },
        { productName: 'Product B', currentStock: 3, minimumStock: 15 },
        { productName: 'Product C', currentStock: 2, minimumStock: 10 }
      ]);

      setDailyStats({
        bestSellingHour: '2:00 PM - 3:00 PM',
        highestTransaction: 250000,
        avgTransactionTime: 3.5
      });

    } finally {
      setLoading(false);
    }
  };

  // Handle shift actions
  const handleShiftAction = async (action) => {
    try {
      const token = getAuthToken();
      
      switch (action) {
        case 'break':
          await axios.post(`${API_BASE_URL}/shifts/break`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setShiftStatus('Break');
          alert('Shift paused. You are now on break.');
          break;
          
        case 'resume':
          await axios.post(`${API_BASE_URL}/shifts/resume`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setShiftStatus('Active');
          alert('Shift resumed. Welcome back!');
          break;
          
        case 'end':
          if (window.confirm('Are you sure you want to end your shift?')) {
            await axios.post(`${API_BASE_URL}/shifts/end`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setShiftStatus('Ended');
            alert('Shift ended successfully. Good job today!');
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Error updating shift status:', error);
      alert('Failed to update shift status. Please try again.');
    }
  };

  // Calculate transactions per hour
  const calculateTransactionsPerHour = () => {
    const shiftStart = 8; // 8 AM
    const currentHour = currentTime.getHours();
    const hoursWorked = Math.max(currentHour - shiftStart, 1);
    
    return Math.round(stats.todayTransactions / hoursWorked);
  };

  // Calculate average transaction value
  const calculateAverageTransaction = () => {
    if (stats.todayTransactions === 0) return 0;
    return stats.todaySales / stats.todayTransactions;
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Get shift status color
  const getShiftStatusColor = () => {
    switch (shiftStatus) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Break': return 'bg-yellow-100 text-yellow-800';
      case 'Ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) {
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Cashier Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back! Here's your performance overview for today.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time and Date */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {currentTime.toLocaleTimeString('en-NG', { 
                      hour: '2-digit', 
                      minute: '2-digit' ,
                      second: '2-digit',
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(currentTime)}
                  </div>
                </div>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Refresh dashboard"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Shift Status Banner */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center">
                <div className={`px-3 py-1 rounded-full ${getShiftStatusColor()} flex items-center`}>
                  <span className="h-2 w-2 rounded-full mr-2 bg-current animate-pulse"></span>
                  <span className="font-medium">Shift: {shiftStatus}</span>
                </div>
                <span className="ml-4 text-gray-600 text-sm">
                  Started: 8:00 AM • Duration: {calculateShiftDuration()}
                </span>
              </div>
              
              <div className="flex space-x-3">
                {shiftStatus === 'Active' && (
                  <button
                    onClick={() => handleShiftAction('break')}
                    className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100"
                  >
                    Take Break
                  </button>
                )}
                
                {shiftStatus === 'Break' && (
                  <button
                    onClick={() => handleShiftAction('resume')}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                  >
                    Resume Shift
                  </button>
                )}
                
                {shiftStatus !== 'Ended' && (
                  <button
                    onClick={() => handleShiftAction('end')}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                  >
                    End Shift
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  <span>Good performance today</span>
                </>
              ) : (
                <span>No sales yet</span>
              )}
            </div>
          </div>

          {/* Transactions Today */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm font-medium">Transactions</p>
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

          {/* Customers Served */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm font-medium">Customers Served</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  {stats.todayCustomers}
                </h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center text-purple-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Excellent service</span>
            </div>
          </div>

          {/* Low Stock Alert */}
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
            <div className="flex items-center text-orange-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Requires attention</span>
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
                {quickActions.map((action) => (
                  <a
                    key={action.id}
                    href={action.link}
                    className="group flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className={`h-14 w-14 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="font-medium text-gray-800 text-center group-hover:text-blue-600">
                      {action.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Performance Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-800">Performance Tips</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Increase Average Transaction</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Suggest add-ons to increase sales value. Current average: {formatCurrency(calculateAverageTransaction())}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Speed Up Transactions</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Use keyboard shortcuts and presets for faster checkout.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Customer Service</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Greet customers warmly and ask for feedback.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Transactions & Alerts */}
          <div className="space-y-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                <a href="/sales" className="text-blue-600 hover:text-blue-700 text-sm">
                  View All
                </a>
              </div>
              
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-gray-800">
                          {transaction.transactionId || `TXN-${transaction._id?.slice(-4) || '0000'}`}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <span>{transaction.customer?.name || transaction.customer || 'Walk-in Customer'}</span>
                          <span className="mx-2">•</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.paymentMethod === 'Cash' ? 'bg-green-100 text-green-800' :
                            transaction.paymentMethod?.includes('POS') ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {transaction.paymentMethod || 'Cash'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">
                          {formatCurrency(transaction.totalAmount || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString('en-NG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Just now'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent transactions</p>
                  </div>
                )}
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <AlertCircle className="h-6 w-6 text-orange-500 mr-3" />
                <h2 className="text-lg font-semibold text-gray-800">System Alerts</h2>
              </div>
              
              <div className="space-y-4">
                {stats.inventoryLowStock > 0 ? (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-orange-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-orange-800">Low Stock Alert</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          {stats.inventoryLowStock} item{stats.inventoryLowStock !== 1 ? 's' : ''} {stats.inventoryLowStock === 1 ? 'is' : 'are'} running low. Please restock.
                        </p>
                        {lowStockItems.length > 0 && (
                          <ul className="mt-2 text-xs text-orange-600">
                            {lowStockItems.slice(0, 2).map((item, index) => (
                              <li key={index}>• {item.productName}: {item.currentStock} left</li>
                            ))}
                            {lowStockItems.length > 2 && (
                              <li>• and {lowStockItems.length - 2} more...</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-green-800">All Systems Operational</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Inventory levels are good. No immediate actions needed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-800">Shift Reminder</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your shift ends in 2 hours. Ensure all transactions are complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Best Selling Hour</p>
                <p className="font-medium text-gray-800">{dailyStats.bestSellingHour}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Highest Transaction</p>
                <p className="font-medium text-gray-800">{formatCurrency(dailyStats.highestTransaction)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Transaction Time</p>
                <p className="font-medium text-gray-800">{dailyStats.avgTransactionTime || 0} minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Dashboard updated at {currentTime.toLocaleTimeString('en-NG', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })} • Powered by Springcore Africa POS</p>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;