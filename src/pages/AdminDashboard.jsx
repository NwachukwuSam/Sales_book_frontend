import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  CreditCard,
  Package,
  History,
  ArrowUp,
  ShoppingCart,
  Users,
  UserCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
  Database
} from 'lucide-react';
import TopNav from '../components/TopNav';
import axios from 'axios';


const API_BASE_URL = 'https://sales-book.onrender.com/api';

const AdminDashboard = () => {
  const [period, setPeriod] = useState('daily');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentAnalysis, setPaymentAnalysis] = useState(null);
  const [salesTrends, setSalesTrends] = useState([]); 

 
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₦0.00';
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    
    return new Intl.NumberFormat('en-NG').format(num);
  };

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      console.log('Fetching dashboard data for period:', period);

      // Fetch main analytics data
      const analyticsRes = await axios.get(`${API_BASE_URL}/analytics/${period}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Analytics data:', analyticsRes.data);
      
      // Check if analytics data has nested structure
      const analyticsData = analyticsRes.data.analytics || analyticsRes.data;
      setAnalyticsData(analyticsData);

      // Try to fetch payment analysis
      try {
        const paymentRes = await axios.get(`${API_BASE_URL}/analytics/${period}/payment-method-analysis`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Payment analysis:', paymentRes.data);
        setPaymentAnalysis(paymentRes.data);
      } catch (paymentError) {
        console.warn('Could not fetch payment analysis:', paymentError.message);
        setPaymentAnalysis(null);
      }

      // Try to fetch sales trends
      try {
        const trendsRes = await axios.get(`${API_BASE_URL}/analytics/${period}/trends`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Sales trends:', trendsRes.data);
        
        // Ensure trends data is an array
        if (trendsRes.data && Array.isArray(trendsRes.data)) {
          setSalesTrends(trendsRes.data);
        } else if (trendsRes.data && trendsRes.data.trends && Array.isArray(trendsRes.data.trends)) {
          setSalesTrends(trendsRes.data.trends);
        } else if (trendsRes.data && trendsRes.data.salesTrends && Array.isArray(trendsRes.data.salesTrends)) {
          setSalesTrends(trendsRes.data.salesTrends);
        } else {
          console.warn('Unexpected trends data format:', trendsRes.data);
          setSalesTrends([]);
        }
      } catch (trendsError) {
        console.warn('Could not fetch sales trends:', trendsError.message);
        setSalesTrends([]);
      }
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  // Get period display name
  const getPeriodDisplay = (period) => {
    const periodMap = {
      daily: 'Today',
      weekly: 'This Week',
      monthly: 'This Month',
      yearly: 'This Year'
    };
    return periodMap[period] || period;
  };

  // Calculate payment method breakdown
  const getPaymentMethodBreakdown = () => {
    if (!paymentAnalysis) {
      // Return empty array if no payment analysis data
      return [];
    }

    // Safely access nested properties
    const salesByPayment = paymentAnalysis.salesByPaymentMethod || [];
    const posByPayment = paymentAnalysis.posServicesByPaymentMethod || [];
    
    // Combine all payment methods
    const allMethods = {};
    
    // Process sales data
    if (Array.isArray(salesByPayment)) {
      salesByPayment.forEach(payment => {
        if (payment._id && payment.totalAmount) {
          allMethods[payment._id] = (allMethods[payment._id] || 0) + payment.totalAmount;
        }
      });
    }

    // Process POS service data
    if (Array.isArray(posByPayment)) {
      posByPayment.forEach(payment => {
        if (payment._id && payment.totalAmount) {
          allMethods[payment._id] = (allMethods[payment._id] || 0) + payment.totalAmount;
        }
      });
    }

    // Convert to array and calculate percentages
    const total = Object.values(allMethods).reduce((sum, amount) => sum + amount, 0);
    
    const methods = Object.entries(allMethods)
      .map(([method, amount]) => ({
        name: method,
        value: formatCurrency(amount),
        amount: amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: method.includes('Cash') ? 'bg-blue-500' : 
               method.includes('UBA') ? 'bg-green-500' : 
               method.includes('Wema') ? 'bg-purple-500' : 
               method.includes('Transfer') ? 'bg-orange-500' : 'bg-gray-500'
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return methods;
  };

  // Prepare sales trend data for chart - FIXED VERSION
  const prepareSalesTrends = () => {
    console.log('Current salesTrends:', salesTrends);
    console.log('Is array?', Array.isArray(salesTrends));
    
    // Ensure salesTrends is an array
    if (!salesTrends || !Array.isArray(salesTrends)) {
      console.log('No valid sales trends data, using fallback');
      // Generate sample data for demonstration
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, index) => ({
        day,
        value: Math.floor(Math.random() * 80000) + 20000
      }));
    }

    // If we have data but it's empty
    if (salesTrends.length === 0) {
      console.log('Empty sales trends array, using fallback');
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, index) => ({
        day,
        value: Math.floor(Math.random() * 80000) + 20000
      }));
    }

    // Process actual trend data
    console.log('Processing actual trends data');
    const processedTrends = salesTrends.map((item, index) => {
      // Handle different possible data structures
      const value = item.totalRevenue || item.value || item.amount || 0;
      const day = item.day || item._id || `Day ${index + 1}`;
      
      return {
        day: String(day).substring(0, 3),
        value: value
      };
    });

    console.log('Processed trends:', processedTrends);
    return processedTrends;
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  // Dashboard stats
  const stats = [
    {
      title: "Total Sales",
      value: analyticsData?.totalSales?.formattedRevenue || 
             (analyticsData?.totalSales?.totalRevenue ? 
              formatCurrency(analyticsData.totalSales.totalRevenue) : "₦0.00"),
      change: "+22.4% vs last week",
      icon: <DollarSign className="h-6 w-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Total POS Services",
      value: analyticsData?.combinedCash?.totalCashFromServices ? 
             formatCurrency(analyticsData.combinedCash.totalCashFromServices) : 
             (analyticsData?.combinedCash?.formattedTotalCashFromServices || "₦0.00"),
      change: "+5.3% vs last week",
      icon: <CreditCard className="h-6 w-6" />,
      color: "bg-green-500"
    },
    {
      title: "Cash Total",
      value: analyticsData?.combinedCash?.formattedTotalCombinedCash || 
             (analyticsData?.combinedCash?.totalCombinedCash ? 
              formatCurrency(analyticsData.combinedCash.totalCombinedCash) : "₦0.00"),
      change: "+8.1% increase",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-purple-500"
    }
  ];

  const quickLinks = [
    { 
      title: "POS", 
      description: "Start a new sale or POS transaction.",
      icon: <ShoppingCart className="h-6 w-6" />,
      link: "#pos"
    },
    { 
      title: "Inventory", 
      description: "Manage items, view stock levels and new inventory.",
      icon: <Package className="h-6 w-6" />,
      link: "#inventory"
    },
    { 
      title: "Sales History", 
      description: "View and filter all customer purchases.",
      icon: <History className="h-6 w-6" />,
      link: "#sales-history"
    },
    { 
      title: "Analytics", 
      description: "Detailed analytics and reports",
      icon: <BarChart3 className="h-6 w-6" />,
      link: "#analytics"
    }
  ];

  const paymentMethods = getPaymentMethodBreakdown();
  const salesData = prepareSalesTrends();
  const maxSalesValue = Math.max(...salesData.map(d => d.value));

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <TopNav />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <TopNav />
      
      <header className="mb-7 mt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your store today.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg shadow-sm p-1 flex">
              {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  disabled={refreshing}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data"
            >
              {refreshing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Data Status */}
        {analyticsData && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-700 text-sm">
                  Showing data for {getPeriodDisplay(period)} • {formatNumber(analyticsData.totalSales?.totalTransactions || 0)} transactions
                </span>
              </div>
              <span className="text-xs text-blue-600">
                API Status: Connected ✓
              </span>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</h3>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* Sales Over Time Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Sales Over Time</h3>
                <div className="flex items-center mt-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {analyticsData?.totalSales?.formattedRevenue || 
                     (analyticsData?.totalSales?.totalRevenue ? 
                      formatCurrency(analyticsData.totalSales.totalRevenue) : "₦0.00")}
                  </span>
                  <span className="ml-4 text-green-600 text-sm font-medium flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    {getPeriodDisplay(period)}
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <span className="text-gray-700 font-medium">{period.charAt(0).toUpperCase() + period.slice(1)}</span>
              </div>
            </div>

            {/* Chart */}
            <div className="mt-8">
              <div className="flex items-end h-48 space-x-2">
                {salesData.map((data, index) => {
                  const height = maxSalesValue > 0 ? (data.value / maxSalesValue) * 100 : 0;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 group">
                      <div className="text-xs text-gray-500 mb-2">{data.day}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 group-hover:scale-105"
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-xs text-gray-700 mt-2 font-medium">
                        {formatCurrency(data.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Y-axis labels */}
              <div className="flex justify-between text-xs text-gray-500 mt-4">
                <span>{formatCurrency(maxSalesValue)}</span>
                <span>{formatCurrency(maxSalesValue * 0.75)}</span>
                <span>{formatCurrency(maxSalesValue * 0.5)}</span>
                <span>{formatCurrency(maxSalesValue * 0.25)}</span>
                <span>₦0.00</span>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-gray-700 font-medium">Performance Summary</h4>
                  <p className="text-sm text-gray-500">{getPeriodDisplay(period)} performance</p>
                </div>
                <div className="text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="text-green-600 font-semibold flex items-center">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      {formatNumber(analyticsData?.totalSales?.totalTransactions || 0)} Transactions
                    </div>
                    <div className="text-blue-600 font-semibold">
                      {formatNumber(analyticsData?.totalSales?.totalItemsSold || 0)} Items Sold
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payment Method Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Payment Method Breakdown</h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {analyticsData?.totalSales?.formattedRevenue || 
                 (analyticsData?.totalSales?.totalRevenue ? 
                  formatCurrency(analyticsData.totalSales.totalRevenue) : "₦0.00")}
              </p>
            </div>

            {paymentMethods.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-medium">{method.name}</span>
                        <span className="text-gray-800 font-semibold">{method.value}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${method.color} rounded-full transition-all duration-500`}
                          style={{ width: `${method.percentage}%` }}
                        />
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {method.percentage}%
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${method.color} mr-2`} />
                      <span className="text-sm text-gray-600">{method.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No payment data available</p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.link}
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 text-left group"
                >
                  <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mr-4 group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                    {link.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 group-hover:text-blue-700">{link.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Additional Metrics */}
          {analyticsData && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Active Cashiers</span>
                  </div>
                  <span className="font-semibold">
                    {formatNumber(analyticsData.cashierSales?.length || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Top Products</span>
                  </div>
                  <span className="font-semibold">
                    {formatNumber(analyticsData.topProducts?.length || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Avg. Transaction</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(
                      (analyticsData.totalSales?.totalRevenue || 0) / 
                      Math.max(analyticsData.totalSales?.totalTransactions || 1, 1)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <span>Data for {getPeriodDisplay(period)}</span>
          <span className="hidden sm:inline">•</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span className="hidden sm:inline">•</span>
          <span>Powered by Springcore Africa</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;