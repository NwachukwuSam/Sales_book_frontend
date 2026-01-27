import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Users,
  Package
} from 'lucide-react';
import TopNav from '../TopNav';

const Report = () => {
  const [reportData, setReportData] = useState(null);
  const [posTransactions, setPosTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('daily');

  const API_BASE_URL = 'https://sales-system-production.up.railway.app/api';

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

  // Fetch all data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch all data in parallel
      const [analyticsResponse, paymentMethodsResponse, posServicesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/${period}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/analytics/${period}/payment-method-analysis`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        // Same API as POSHistory - fetch all POS service records
        fetch(`${API_BASE_URL}/pos-service/get-pos-records`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Check responses
      if (!analyticsResponse.ok || !paymentMethodsResponse.ok) {
        throw new Error('Failed to fetch report data');
      }

      const analyticsData = await analyticsResponse.json();
      const paymentMethodsData = await paymentMethodsResponse.json();
      
      // Handle POS services response
      let posServicesData = [];
      if (posServicesResponse.ok) {
        const posData = await posServicesResponse.json();
        posServicesData = posData.posServices || [];
      }

      console.log('POS Services Data:', posServicesData);

      // Process all data
      const processedData = processReportData(
        analyticsData.analytics || analyticsData,
        paymentMethodsData.analysis || paymentMethodsData,
        posServicesData,
        period
      );

      setReportData(processedData);
      setPosTransactions(posServicesData);

    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  // Filter POS transactions by period
  const filterByPeriod = (transactions, period) => {
    if (!transactions || transactions.length === 0) return [];
    
    const now = new Date();
    const periodStart = new Date();
    
    switch (period.toLowerCase()) {
      case 'daily':
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      default:
        return transactions;
    }
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= periodStart && transactionDate <= now;
    });
  };

  // Process all data
  const processReportData = (analytics, paymentMethods, posServices, period) => {
    // Extract sales by payment method
    const salesByMethod = paymentMethods?.salesByPaymentMethod || [];
    
    // Calculate totals for each payment method
    const cashTotal = salesByMethod.find(s => s._id === 'Cash')?.totalAmount || 0;
    const posOpayTotal = salesByMethod.find(s => s._id === 'Pos-Opay')?.totalAmount || 0;
    const posParallexTotal = salesByMethod.find(s => s._id === 'Pos-Paralex')?.totalAmount || 0;
    const transferOpayTotal = salesByMethod.find(s => s._id === 'Transfer-Opay')?.totalAmount || 0;
    const transferParallexTotal = salesByMethod.find(s => s._id === 'Transfer-Parallex')?.totalAmount || 0;

    // Filter POS services by period
    const filteredPosServices = filterByPeriod(posServices, period);
    
    // Calculate POS service totals from filtered data
    const calculatePosTotals = (transactions) => {
      let withdrawal = 0;
      let deposit = 0;
      let transfer = 0;
      let serviceCharges = 0;
      
      transactions.forEach(transaction => {
        const amount = transaction.transactionAmount || 0;
        const serviceCharge = transaction.serviceCharge || 0;
        
        switch (transaction.transactionType) {
          case 'Withdrawal':
            withdrawal += amount;
            break;
          case 'Deposit':
            deposit += amount;
            break;
          case 'Transfer':
            transfer += amount;
            break;
        }
        
        serviceCharges += serviceCharge;
      });
      
      return {
        withdrawal,
        deposit,
        transfer,
        serviceCharges,
        totalTransactions: transactions.length,
        totalAmount: withdrawal + deposit + transfer
      };
    };

    const posTotals = calculatePosTotals(filteredPosServices);
    
    console.log('Calculated POS Totals:', posTotals);
    console.log('Filtered POS Services count:', filteredPosServices.length);

    // Calculate adjusted cash (cash from sales - withdrawals + deposits + transfers)
    const adjustedCash = cashTotal - posTotals.withdrawal + posTotals.deposit + posTotals.transfer;

    return {
      // Total Sales Breakdown
      totalSales: {
        cash: cashTotal,
        posOpay: posOpayTotal,
        posParallex: posParallexTotal,
        transferOpay: transferOpayTotal,
        transferParallex: transferParallexTotal,
        grandTotal: cashTotal + posOpayTotal + posParallexTotal + transferOpayTotal + transferParallexTotal
      },
      // POS Transactions
      posTransactions: {
        withdrawal: posTotals.withdrawal,
        deposit: posTotals.deposit,
        transfer: posTotals.transfer,
        serviceCharges: posTotals.serviceCharges,
        totalPosRevenue: posTotals.totalAmount,
        totalTransactions: posTotals.totalTransactions,
        rawData: filteredPosServices
      },
      // Cash Analysis
      cashAnalysis: {
        initialCash: cashTotal,
        withdrawals: posTotals.withdrawal,
        deposits: posTotals.deposit,
        transfers: posTotals.transfer,
        finalCash: adjustedCash
      },
      // Overall metrics
      metrics: {
        totalRevenue: analytics?.totalSales?.totalRevenue || 0,
        totalTransactions: analytics?.totalSales?.totalTransactions || 0,
        totalItemsSold: analytics?.totalSales?.totalItemsSold || 0,
        averageTransactionValue: analytics?.totalSales?.totalRevenue / (analytics?.totalSales?.totalTransactions || 1) || 0
      },
      // Debug info
      debug: {
        posServicesCount: posServices.length,
        filteredPosServicesCount: filteredPosServices.length,
        posServicesSample: filteredPosServices.slice(0, 3)
      }
    };
  };

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const handleRefresh = () => {
    fetchReportData();
  };

  const handleExport = () => {
    if (!reportData) return;
    
    // Create CSV content
    let csv = 'SALES REPORT\n\n';
    csv += `Period: ${period.charAt(0).toUpperCase() + period.slice(1)}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    csv += 'TOTAL SALES BREAKDOWN\n';
    csv += 'Payment Method,Amount\n';
    csv += `Cash,${reportData.totalSales.cash}\n`;
    csv += `POS Opay,${reportData.totalSales.posOpay}\n`;
    csv += `POS Parallex,${reportData.totalSales.posParallex}\n`;
    csv += `Transfer Opay,${reportData.totalSales.transferOpay}\n`;
    csv += `Transfer Parallex,${reportData.totalSales.transferParallex}\n`;
    csv += `Grand Total,${reportData.totalSales.grandTotal}\n\n`;
    
    csv += 'POS SERVICE TRANSACTIONS\n';
    csv += 'Type,Amount,Service Charge,Transaction Count\n';
    csv += `Withdrawal,${reportData.posTransactions.withdrawal},${getServiceChargeByType('Withdrawal')},${getPosTransactionCount('Withdrawal')}\n`;
    csv += `Deposit,${reportData.posTransactions.deposit},${getServiceChargeByType('Deposit')},${getPosTransactionCount('Deposit')}\n`;
    csv += `Transfer,${reportData.posTransactions.transfer},${getServiceChargeByType('Transfer')},${getPosTransactionCount('Transfer')}\n`;
    csv += `Total POS,${reportData.posTransactions.totalPosRevenue},${reportData.posTransactions.serviceCharges},${reportData.posTransactions.totalTransactions}\n\n`;
    
    csv += 'CASH ANALYSIS\n';
    csv += `Initial Cash from Sales,${reportData.cashAnalysis.initialCash}\n`;
    csv += `Less: Withdrawals,${reportData.cashAnalysis.withdrawals}\n`;
    csv += `Add: Deposits,${reportData.cashAnalysis.deposits}\n`;
    csv += `Add: Transfers,${reportData.cashAnalysis.transfers}\n`;
    csv += `Final Cash Balance,${reportData.cashAnalysis.finalCash}\n\n`;
    
    csv += 'SUMMARY METRICS\n';
    csv += `Total Revenue,${reportData.metrics.totalRevenue}\n`;
    csv += `Total Items Sold,${reportData.metrics.totalItemsSold}\n`;
    csv += `Average Transaction Value,${reportData.metrics.averageTransactionValue}\n`;
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Helper functions for export
  const getServiceChargeByType = (type) => {
    if (!reportData?.posTransactions?.rawData) return 0;
    return reportData.posTransactions.rawData
      .filter(record => record.transactionType === type)
      .reduce((sum, record) => sum + (record.serviceCharge || 0), 0);
  };

  const getPosTransactionCount = (type) => {
    if (!reportData?.posTransactions?.rawData) return 0;
    return reportData.posTransactions.rawData
      .filter(record => record.transactionType === type).length;
  };

  const getDateRangeText = (period) => {
    const now = new Date();
    const start = new Date();
    
    switch (period.toLowerCase()) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        return `${start.toLocaleDateString()} - ${now.toLocaleDateString()}`;
      case 'weekly':
        start.setDate(now.getDate() - 7);
        return `${start.toLocaleDateString()} - ${now.toLocaleDateString()}`;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        return `${start.toLocaleDateString()} - ${now.toLocaleDateString()}`;
      default:
        return 'All time';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Error</h2>
          <p className="text-gray-600 text-center">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Sales Analytics Report</h1>
              <p className="text-gray-600 mt-2">{getDateRangeText(period)}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1">
                {['daily', 'weekly', 'monthly'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      period === p
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh report"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span className="hidden md:inline">Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-sm">Total Revenue</p>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
            <h3 className="text-3xl font-bold">{formatCurrency(reportData?.totalSales.grandTotal || 0)}</h3>
            <p className="text-blue-100 text-sm mt-2">{reportData?.metrics.totalTransactions || 0} transactions</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-100 text-sm">Final Cash Balance</p>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
            <h3 className="text-3xl font-bold">{formatCurrency(reportData?.cashAnalysis.finalCash || 0)}</h3>
            <p className="text-green-100 text-sm mt-2">Cash in hand</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-100 text-sm">POS Services</p>
              <CreditCard className="w-8 h-8 text-purple-200" />
            </div>
            <h3 className="text-3xl font-bold">{formatCurrency(reportData?.posTransactions.totalPosRevenue || 0)}</h3>
            <p className="text-purple-100 text-sm mt-2">{reportData?.posTransactions.totalTransactions || 0} transactions</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-orange-100 text-sm">Items Sold</p>
              <Package className="w-8 h-8 text-orange-200" />
            </div>
            <h3 className="text-3xl font-bold">{reportData?.metrics.totalItemsSold || 0}</h3>
            <p className="text-orange-100 text-sm mt-2">Avg: {formatCurrency(reportData?.metrics.averageTransactionValue || 0)}/sale</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Sales by Payment Method</h2>
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>

            <div className="space-y-4">
              {[
                { label: 'Cash', value: reportData?.totalSales.cash || 0, color: 'green', icon: DollarSign },
                { label: 'POS Opay', value: reportData?.totalSales.posOpay || 0, color: 'blue', icon: CreditCard },
                { label: 'POS Parallex', value: reportData?.totalSales.posParallex || 0, color: 'blue', icon: CreditCard },
                { label: 'Transfer Opay', value: reportData?.totalSales.transferOpay || 0, color: 'purple', icon: TrendingUp },
                { label: 'Transfer Parallex', value: reportData?.totalSales.transferParallex || 0, color: 'purple', icon: TrendingUp },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-500">Payment method</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{formatCurrency(item.value)}</p>
                </div>
              ))}
              
              {/* Grand Total */}
              <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Grand Total</p>
                      <p className="text-xs text-blue-600">All payment methods</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(reportData?.totalSales.grandTotal || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* POS Services Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">POS Services</h2>
              <PieChart className="w-6 h-6 text-gray-400" />
            </div>

            <div className="space-y-4">
              {/* Withdrawal */}
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Withdrawal</p>
                    <p className="text-xs text-gray-500">Reduces cash</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{formatCurrency(reportData?.posTransactions.withdrawal || 0)}</p>
                  <p className="text-xs text-red-500">Charges: {formatCurrency(getServiceChargeByType('Withdrawal'))}</p>
                </div>
              </div>

              {/* Deposit */}
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Deposit</p>
                    <p className="text-xs text-gray-500">Adds cash</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(reportData?.posTransactions.deposit || 0)}</p>
                  <p className="text-xs text-green-500">Charges: {formatCurrency(getServiceChargeByType('Deposit'))}</p>
                </div>
              </div>

              {/* Transfer */}
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Transfer</p>
                    <p className="text-xs text-gray-500">Adds cash</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(reportData?.posTransactions.transfer || 0)}</p>
                  <p className="text-xs text-blue-500">Charges: {formatCurrency(getServiceChargeByType('Transfer'))}</p>
                </div>
              </div>

              {/* Total POS */}
              <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-purple-800">Total POS Services</p>
                    <p className="text-xs text-purple-600">All transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-900">{formatCurrency(reportData?.posTransactions.totalPosRevenue || 0)}</p>
                    <p className="text-xs text-purple-700">Total Charges: {formatCurrency(reportData?.posTransactions.serviceCharges || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Analysis */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Cash Flow Analysis</h2>
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Starting Cash</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(reportData?.cashAnalysis.initialCash || 0)}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-sm text-red-700 mb-2">Withdrawals</p>
              <p className="text-xl font-bold text-red-700">- {formatCurrency(reportData?.cashAnalysis.withdrawals || 0)}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-green-700 mb-2">Deposits</p>
              <p className="text-xl font-bold text-green-700">+ {formatCurrency(reportData?.cashAnalysis.deposits || 0)}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-700 mb-2">Transfers</p>
              <p className="text-xl font-bold text-blue-700">+ {formatCurrency(reportData?.cashAnalysis.transfers || 0)}</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-center">
              <p className="text-sm text-green-100 mb-2">Final Cash</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(reportData?.cashAnalysis.finalCash || 0)}</p>
            </div>
          </div>

          {/* Cash Flow Visualization */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Cash Flow Visualization</span>
              <span className="text-sm font-medium text-gray-700">
                Net Change: {formatCurrency(reportData?.cashAnalysis.finalCash - reportData?.cashAnalysis.initialCash || 0)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600"
                style={{ 
                  width: `${Math.min(100, (reportData?.cashAnalysis.finalCash / (reportData?.cashAnalysis.initialCash || 1)) * 100)}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Start: {formatCurrency(reportData?.cashAnalysis.initialCash || 0)}</span>
              <span>End: {formatCurrency(reportData?.cashAnalysis.finalCash || 0)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Report generated on {new Date().toLocaleString('en-NG')}</p>
          <p className="mt-1">Period: {period.charAt(0).toUpperCase() + period.slice(1)} • {getDateRangeText(period)}</p>
        </div>
      </div>
    </div>
  );
};

export default Report;