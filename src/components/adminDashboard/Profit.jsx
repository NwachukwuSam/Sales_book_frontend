import React, { useState, useEffect } from 'react';
import TopNav from '../TopNav';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Package, 
  RefreshCw, 
  Loader2,
  Download,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShoppingBag,
  Receipt,
  Percent,
  Calculator,
  PieChart,
  Target,
  Scale,
  TrendingDown,
  Shield,
  AlertTriangle
} from 'lucide-react';

const Profit = () => {
  const [profitData, setProfitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentTime, setCurrentTime] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);

  const API_BASE_URL = 'https://sales-book.onrender.com/api';

  // Get Lagos time
  const getLagosTime = () => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  };

  // Get Lagos date string in YYYY-MM-DD format
  const getLagosDateString = (date) => {
    const lagosTime = new Date(date.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
    const year = lagosTime.getFullYear();
    const month = String(lagosTime.getMonth() + 1).padStart(2, '0');
    const day = String(lagosTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  // Format number
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-NG').format(num);
  };

  // Update current time
  const updateCurrentTime = () => {
    const lagosTime = getLagosTime();
    const hours = lagosTime.getHours().toString().padStart(2, '0');
    const minutes = lagosTime.getMinutes().toString().padStart(2, '0');
    const seconds = lagosTime.getSeconds().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}:${seconds} WAT`);
  };

  // Quick date range selectors - FIXED
  const setQuickRange = (range) => {
    const lagosNow = getLagosTime();
    const start = new Date(lagosNow);
    const end = new Date(lagosNow);
    
    switch (range) {
      case 'today':
        // Set to beginning of today in Lagos time
        start.setHours(0, 0, 0, 0);
        // Set end to end of today
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(lagosNow.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setMonth(lagosNow.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        start.setFullYear(lagosNow.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return;
    }
    
    setDateRange({
      startDate: getLagosDateString(start),
      endDate: getLagosDateString(end)
    });
  };

  // Get date range text - FIXED
  const getDateRangeText = () => {
    if (!dateRange.startDate || !dateRange.endDate) return '';
    
    const start = new Date(dateRange.startDate + 'T12:00:00');
    const end = new Date(dateRange.endDate + 'T12:00:00');
    
    return `${start.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })}`;
  };

  // Initialize date range on component mount - FIXED
  useEffect(() => {
    const lagosNow = getLagosTime();
    const thirtyDaysAgo = new Date(lagosNow);
    thirtyDaysAgo.setDate(lagosNow.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    
    setDateRange({
      startDate: getLagosDateString(thirtyDaysAgo),
      endDate: getLagosDateString(lagosNow)
    });
    
    updateCurrentTime();
    const timerId = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Fetch profit data - FIXED with proper date handling
  const fetchProfitData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Create start and end dates with proper boundaries
      const startDateObj = new Date(dateRange.startDate + 'T00:00:00');
      const endDateObj = new Date(dateRange.endDate + 'T23:59:59');
      
      // Convert to UTC for consistent backend handling
      const startDateUTC = startDateObj.toISOString();
      const endDateUTC = endDateObj.toISOString();

      console.log('Fetching profit data for period:', {
        localStart: dateRange.startDate,
        localEnd: dateRange.endDate,
        utcStart: startDateUTC,
        utcEnd: endDateUTC
      });

      // Fetch profit analytics - send UTC dates
      const response = await fetch(
        `${API_BASE_URL}/profit/analytics?startDate=${encodeURIComponent(startDateUTC)}&endDate=${encodeURIComponent(endDateUTC)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch profit data');
      }

      const result = await response.json();
      
      if (result.success) {
        setProfitData(result.data);
        // Fetch expenses for net profit calculation
        fetchExpensesData(token, startDateUTC, endDateUTC);
      } else {
        throw new Error(result.message || 'Failed to load profit data');
      }

    } catch (err) {
      console.error('Error fetching profit data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch expenses data with proper date handling - FIXED
  const fetchExpensesData = async (token, startDateUTC, endDateUTC) => {
    try {
      setExpensesLoading(true);
      
      // Build query parameters with UTC dates
      const params = new URLSearchParams({
        startDate: startDateUTC,
        endDate: endDateUTC,
        status: 'Paid' // Only include paid expenses for net profit calculation
      });

      const response = await fetch(
        `${API_BASE_URL}/expenses?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setExpenses(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setExpensesLoading(false);
    }
  };

  // Calculate Gross and Net Profit
  const calculateProfitMetrics = () => {
    if (!profitData?.summary) return null;

    const summary = profitData.summary;
    
    // DATA VALIDATION - Check if COGS is higher than revenue (which shouldn't happen)
    const hasDataIssue = summary.totalCost > summary.totalRevenue;
    
    // Log warning to console for debugging
    if (hasDataIssue) {
      console.warn('⚠️ DATA INTEGRITY WARNING:');
      console.warn('Total Cost of Goods Sold is higher than Total Revenue');
      console.warn('Revenue:', summary.totalRevenue);
      console.warn('COGS:', summary.totalCost);
      console.warn('Profit:', summary.totalProfit);
    }
    
    // Calculate total expenses for the period
    const totalExpenses = expenses
      .filter(exp => exp.status === 'Paid')
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Gross Profit = Total Revenue - Cost of Goods Sold
    const grossProfit = summary.totalRevenue - summary.totalCost;
    
    // Gross Profit Margin
    const grossProfitMargin = summary.totalRevenue > 0 
      ? (grossProfit / summary.totalRevenue) * 100 
      : 0;
    
    // Net Profit = Gross Profit - Total Operating Expenses
    const netProfit = grossProfit - totalExpenses;
    
    // Net Profit Margin
    const netProfitMargin = summary.totalRevenue > 0 
      ? (netProfit / summary.totalRevenue) * 100 
      : 0;

    // Expense to Revenue Ratio
    const expenseRatio = summary.totalRevenue > 0 
      ? (totalExpenses / summary.totalRevenue) * 100 
      : 0;

    // Calculate expense breakdown by category
    const expenseByCategory = expenses.reduce((acc, expense) => {
      const category = expense.expenseType || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount || 0;
      return acc;
    }, {});

    // Sort expenses by amount (descending)
    const sortedExpenseCategories = Object.entries(expenseByCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({ category, amount }));

    return {
      grossProfit,
      grossProfitMargin,
      netProfit,
      netProfitMargin,
      totalExpenses,
      expenseRatio,
      expenseByCategory: sortedExpenseCategories,
      topExpenses: sortedExpenseCategories.slice(0, 5),
      hasDataIssue,
      backendProfit: summary.totalProfit || 0
    };
  };

  // Export data as CSV
  const handleExport = () => {
    if (!profitData) return;
    
    let csv = 'PROFIT REPORT\n\n';
    csv += `Date Range: ${getDateRangeText()}\n`;
    csv += `Generated: ${getLagosTime().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}\n\n`;
    
    if (selectedTab === 'overview' && profitData.summary) {
      csv += 'PROFIT SUMMARY\n';
      csv += `Total Profit:,${profitData.summary.totalProfit || 0}\n`;
      csv += `Total Revenue:,${profitData.summary.totalRevenue || 0}\n`;
      csv += `Total Cost:,${profitData.summary.totalCost || 0}\n`;
      csv += `Average Profit Margin:,${profitData.summary.averageProfitMargin || 0}%\n`;
      csv += `Total Transactions:,${profitData.summary.totalTransactions || 0}\n\n`;
      
      const profitMetrics = calculateProfitMetrics();
      if (profitMetrics) {
        csv += 'GROSS & NET PROFIT CALCULATION\n';
        csv += `Gross Profit:,${profitMetrics.grossProfit}\n`;
        csv += `Gross Profit Margin:,${profitMetrics.grossProfitMargin.toFixed(1)}%\n`;
        csv += `Total Expenses:,${profitMetrics.totalExpenses}\n`;
        csv += `Net Profit:,${profitMetrics.netProfit}\n`;
        csv += `Net Profit Margin:,${profitMetrics.netProfitMargin.toFixed(1)}%\n`;
        csv += `Expense to Revenue Ratio:,${profitMetrics.expenseRatio.toFixed(1)}%\n\n`;
      }
    }
    
    if (selectedTab === 'items' && profitData.itemPerformance) {
      csv += 'PROFIT PER ITEM\n';
      csv += 'Item Name,Units Sold,Revenue,Profit,Profit Margin,Avg Profit/Unit\n';
      
      profitData.itemPerformance.forEach(item => {
        csv += `${item.name},${item.quantitySold},${item.revenue},${item.profit},${item.profitMargin.toFixed(1)}%,${item.averageProfitPerUnit}\n`;
      });
    }
    
    if (selectedTab === 'trends' && profitData.dailyBreakdown) {
      csv += 'DAILY PROFIT TRENDS\n';
      csv += 'Date,Profit,Revenue,Transactions,Profit Margin\n';
      
      profitData.dailyBreakdown.forEach(day => {
        csv += `${day.date},${day.profit},${day.revenue},${day.transactions},${day.profitMargin.toFixed(1)}%\n`;
      });
    }
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-report-${dateRange.startDate}-${dateRange.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Fetch data when date range changes
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchProfitData();
    }
  }, [dateRange]);

  if (loading && !profitData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading profit data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Profit Data</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={fetchProfitData}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profitData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Profit Data Available</h3>
                <p className="text-yellow-700">No profit data found for the selected date range.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const summary = profitData.summary || {};
  const dailyBreakdown = profitData.dailyBreakdown || [];
  const itemPerformance = profitData.itemPerformance || [];
  const profitMetrics = calculateProfitMetrics();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Data Integrity Warning - Show if COGS > Revenue */}
        {profitMetrics?.hasDataIssue && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-800 mb-2">Data Integrity Warning</h3>
                <p className="text-red-700 text-sm mb-3">
                  Your Cost of Goods Sold ({formatCurrency(summary.totalCost)}) is higher than your Total Revenue ({formatCurrency(summary.totalRevenue)}). 
                  This indicates incorrect product pricing in your inventory database.
                </p>
                <div className="bg-red-100 rounded p-3 mb-3">
                  <p className="font-semibold text-red-800 text-sm mb-1">Common causes:</p>
                  <ul className="text-red-700 text-sm list-disc ml-5 space-y-1">
                    <li>Products with <strong>Cost Price</strong> higher than <strong>Selling Price</strong></li>
                    <li>Incorrect cost prices entered in inventory</li>
                    <li>Selling prices not updated after cost increases</li>
                    <li>Data entry errors in product database</li>
                  </ul>
                </div>
                <p className="text-red-700 text-sm font-medium">
                  ⚠️ Action Required: Review your product pricing in the Inventory section and ensure all items have selling prices higher than cost prices.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profit Analytics</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{getDateRangeText()}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{currentTime}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchProfitData}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh profit data"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Download className="w-5 h-5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Date Range Selector - FIXED with proper Lagos time handling */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex gap-2">
              {['today', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setQuickRange(range)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'items', label: 'Items', icon: Package },
                { id: 'trends', label: 'Trends', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                      selectedTab === tab.id
                        ? 'text-green-600 border-green-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {selectedTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-green-100 text-sm font-medium">Total Profit</p>
                  <DollarSign className="w-8 h-8 text-green-200" />
                </div>
                <h3 className="text-3xl font-bold mb-2">{formatCurrency(summary.totalProfit || 0)}</h3>
                <div className="flex items-center gap-1 text-green-100 text-sm">
                  <Percent className="w-4 h-4" />
                  <span>Margin: {formatPercentage(summary.averageProfitMargin || 0)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                  <TrendingUp className="w-8 h-8 text-blue-200" />
                </div>
                <h3 className="text-3xl font-bold mb-2">{formatCurrency(summary.totalRevenue || 0)}</h3>
                <div className="flex items-center gap-1 text-blue-100 text-sm">
                  <Receipt className="w-4 h-4" />
                  <span>{formatNumber(summary.totalTransactions || 0)} transactions</span>
                </div>
              </div>

              <div className={`bg-gradient-to-br rounded-xl shadow-lg p-6 text-white ${
                profitMetrics?.hasDataIssue 
                  ? 'from-red-500 to-red-600' 
                  : 'from-purple-500 to-purple-600'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-sm font-medium ${
                    profitMetrics?.hasDataIssue ? 'text-red-100' : 'text-purple-100'
                  }`}>
                    Total Cost {profitMetrics?.hasDataIssue && '⚠️'}
                  </p>
                  <ShoppingBag className={`w-8 h-8 ${
                    profitMetrics?.hasDataIssue ? 'text-red-200' : 'text-purple-200'
                  }`} />
                </div>
                <h3 className="text-3xl font-bold mb-2">{formatCurrency(summary.totalCost || 0)}</h3>
                <div className={`flex items-center gap-1 text-sm ${
                  profitMetrics?.hasDataIssue ? 'text-red-100' : 'text-purple-100'
                }`}>
                  <BarChart3 className="w-4 h-4" />
                  <span>{profitMetrics?.hasDataIssue ? 'Exceeds revenue!' : 'Cost of goods sold'}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-orange-100 text-sm font-medium">Profit Margin</p>
                  <Percent className="w-8 h-8 text-orange-200" />
                </div>
                <h3 className="text-3xl font-bold mb-2">{formatPercentage(summary.averageProfitMargin || 0)}</h3>
                <div className="flex items-center gap-1 text-orange-100 text-sm">
                  {summary.averageProfitMargin >= 25 ? (
                    <>
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Healthy margin</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-4 h-4" />
                      <span>Below target</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* GROSS & NET PROFIT CALCULATION SECTION */}
            {profitMetrics && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calculator className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-800">Gross & Net Profit Calculation</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Gross Profit Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Scale className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-800">Gross Profit</h3>
                      </div>
                      <span className="text-sm text-gray-500">Revenue - COGS</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Revenue</span>
                        <span className="font-medium text-gray-800">{formatCurrency(summary.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cost of Goods Sold</span>
                        <span className={`font-medium ${
                          profitMetrics.hasDataIssue ? 'text-red-600' : 'text-gray-800'
                        }`}>
                          -{formatCurrency(summary.totalCost)}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800">Gross Profit</span>
                          <span className={`text-xl font-bold ${
                            profitMetrics.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(profitMetrics.grossProfit)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">Gross Profit Margin</span>
                          <span className={`font-bold ${
                            profitMetrics.grossProfitMargin >= 30 ? 'text-green-600' :
                            profitMetrics.grossProfitMargin >= 20 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {formatPercentage(profitMetrics.grossProfitMargin)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="font-bold text-gray-800">Operating Expenses</h3>
                      </div>
                      <span className="text-sm text-gray-500">{formatCurrency(profitMetrics.totalExpenses)}</span>
                    </div>
                    
                    <div className="space-y-3">
                      {expensesLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                          <span className="ml-2 text-gray-500">Loading...</span>
                        </div>
                      ) : profitMetrics.topExpenses.length > 0 ? (
                        <>
                          {profitMetrics.topExpenses.map((expense, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                <span className="text-sm text-gray-700 truncate max-w-[120px]">
                                  {expense.category}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-red-600">
                                {formatCurrency(expense.amount)}
                              </span>
                            </div>
                          ))}
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Expense Ratio</span>
                              <span className={`text-sm font-medium ${
                                profitMetrics.expenseRatio <= 30 ? 'text-green-600' :
                                profitMetrics.expenseRatio <= 50 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {formatPercentage(profitMetrics.expenseRatio)}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No expenses recorded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Net Profit Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-800">Net Profit</h3>
                      </div>
                      <span className="text-sm text-gray-500">GP - Expenses</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Gross Profit</span>
                        <span className={`font-medium ${
                          profitMetrics.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(profitMetrics.grossProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Expenses</span>
                        <span className="font-medium text-red-600">-{formatCurrency(profitMetrics.totalExpenses)}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800">Net Profit</span>
                          <span className={`text-2xl font-bold ${
                            profitMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(profitMetrics.netProfit)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">Net Margin</span>
                          <span className={`font-bold ${
                            profitMetrics.netProfitMargin >= 15 ? 'text-green-600' :
                            profitMetrics.netProfitMargin >= 10 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {formatPercentage(profitMetrics.netProfitMargin)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profit Analysis Summary */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`bg-gradient-to-r border rounded-lg p-4 ${
                    profitMetrics.hasDataIssue 
                      ? 'from-red-50 to-red-100 border-red-200' 
                      : 'from-green-50 to-emerald-50 border-green-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className={`w-4 h-4 ${
                        profitMetrics.hasDataIssue ? 'text-red-600' : 'text-green-600'
                      }`} />
                      <h4 className={`font-semibold ${
                        profitMetrics.hasDataIssue ? 'text-red-800' : 'text-green-800'
                      }`}>
                        Profit Health
                      </h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl font-bold ${
                        profitMetrics.hasDataIssue ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {profitMetrics.hasDataIssue ? 'F' :
                         profitMetrics.netProfitMargin >= 20 ? 'A' :
                         profitMetrics.netProfitMargin >= 15 ? 'B' :
                         profitMetrics.netProfitMargin >= 10 ? 'C' :
                         profitMetrics.netProfitMargin >= 5 ? 'D' : 'F'}
                      </div>
                      <div className={`text-sm ${
                        profitMetrics.hasDataIssue ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {profitMetrics.hasDataIssue ? 'Data error - Fix pricing' :
                         profitMetrics.netProfitMargin >= 20 ? 'Excellent' :
                         profitMetrics.netProfitMargin >= 15 ? 'Good' :
                         profitMetrics.netProfitMargin >= 10 ? 'Fair' :
                         profitMetrics.netProfitMargin >= 5 ? 'Needs attention' :
                         'Critical'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <PieChart className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Expense Efficiency</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-blue-600">
                        {profitMetrics.expenseRatio <= 20 ? 'Excellent' :
                         profitMetrics.expenseRatio <= 30 ? 'Good' :
                         profitMetrics.expenseRatio <= 40 ? 'Fair' :
                         'Poor'}
                      </div>
                      <div className="text-sm text-blue-700">
                        {profitMetrics.expenseRatio <= 20 ? 'Very efficient' :
                         profitMetrics.expenseRatio <= 30 ? 'Good control' :
                         profitMetrics.expenseRatio <= 40 ? 'Moderate levels' :
                         'High expenses'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-4 h-4 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">Key Ratio</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700">Net/Gross</span>
                        <span className="font-bold text-purple-800">
                          {(profitMetrics.grossProfit > 0 
                            ? (profitMetrics.netProfit / profitMetrics.grossProfit) * 100 
                            : 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-700">Coverage</span>
                        <span className="font-bold text-purple-800">
                          {(profitMetrics.totalExpenses > 0 
                            ? (profitMetrics.grossProfit / profitMetrics.totalExpenses) * 100 
                            : 0).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Profitable Items */}
            {itemPerformance.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Top Profitable Items</h2>
                  <Package className="w-6 h-6 text-gray-400" />
                </div>

                <div className="space-y-4">
                  {itemPerformance.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100' :
                          index === 1 ? 'bg-gray-100' :
                          index === 2 ? 'bg-orange-100' :
                          'bg-blue-50'
                        }`}>
                          <span className={`font-bold ${
                            index === 0 ? 'text-yellow-600' :
                            index === 1 ? 'text-gray-600' :
                            index === 2 ? 'text-orange-600' :
                            'text-blue-600'
                          }`}>
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{formatNumber(item.quantitySold)} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(item.profit)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Margin: {formatPercentage(item.profitMargin)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ITEMS TAB */}
        {selectedTab === 'items' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Profit per Item</h2>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {itemPerformance.length} items
                  </span>
                </div>
              </div>
            </div>

            {itemPerformance.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No items found for the selected period</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Item</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Sold</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Revenue</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Profit</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Profit/Unit</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-gray-600">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemPerformance.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="font-medium text-gray-800">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="font-medium text-gray-800">{formatNumber(item.quantitySold)}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-gray-600">{formatCurrency(item.revenue)}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="font-bold text-green-700">{formatCurrency(item.profit)}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="font-medium text-green-600">{formatCurrency(item.averageProfitPerUnit)}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    item.profitMargin >= 30 ? 'bg-green-500' :
                                    item.profitMargin >= 20 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(item.profitMargin, 100)}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-medium ${
                                item.profitMargin >= 30 ? 'text-green-600' :
                                item.profitMargin >= 20 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {formatPercentage(item.profitMargin)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Showing <span className="font-medium">{itemPerformance.length}</span> items
                    </p>
                    <p className="text-sm text-gray-600">
                      Total Profit: <span className="font-bold text-green-600">
                        {formatCurrency(itemPerformance.reduce((sum, item) => sum + (item.profit || 0), 0))}
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TRENDS TAB */}
        {selectedTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Daily Profit Trends</h2>
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>

              {dailyBreakdown.length === 0 ? (
                <div className="py-12 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No trend data available for the selected period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dailyBreakdown.map((day, index) => {
                    const isPositive = day.profitMargin >= 20;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            isPositive ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {isPositive ? (
                              <ArrowUpRight className="w-6 h-6 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-6 h-6 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {new Date(day.date).toLocaleDateString('en-NG', { 
                                weekday: 'short',
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatNumber(day.transactions)} transactions • Revenue: {formatCurrency(day.revenue)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(day.profit)}
                          </p>
                          <p className={`text-sm ${
                            isPositive ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {formatPercentage(day.profitMargin)} margin
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Profit report generated on {getLagosTime().toLocaleString('en-NG', { 
              timeZone: 'Africa/Lagos',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })} WAT
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Gross Profit = Revenue - Cost of Goods Sold • Net Profit = Gross Profit - Operating Expenses
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profit;