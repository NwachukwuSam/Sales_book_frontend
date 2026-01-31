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
  Package,
  Calculator,
  Clock
} from 'lucide-react';
import TopNav from '../TopNav';

const Report = () => {
  const [reportData, setReportData] = useState(null);
  const [posTransactions, setPosTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [currentTime, setCurrentTime] = useState('');

  const API_BASE_URL = 'https://sales-book.onrender.com/api';

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

  // Get Lagos time (WAT +1 GMT)
  const getLagosTime = () => {
    const now = new Date();
    // Convert to Lagos time (UTC+1)
    const lagosTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
    return lagosTime;
  };

  // Format date in Lagos time
  const formatLagosDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-NG', { 
        timeZone: 'Africa/Lagos',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return dateString;
    }
  };

  // Update current time
  const updateCurrentTime = () => {
    const lagosTime = getLagosTime();
    const hours = lagosTime.getHours().toString().padStart(2, '0');
    const minutes = lagosTime.getMinutes().toString().padStart(2, '0');
    const seconds = lagosTime.getSeconds().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}:${seconds} WAT`);
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
    
    const now = getLagosTime();
    const periodStart = getLagosTime();
    
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
    const posParallexTotal = salesByMethod.find(s => s._id === 'Pos-Parallex')?.totalAmount || 0;
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
    
    // Calculate adjusted cash (cash from sales - withdrawals + deposits + transfers)
    const adjustedCash = cashTotal - posTotals.withdrawal + posTotals.deposit + posTotals.transfer;

    // Calculate Parallex and Opay balances
    const calculateAccountBalance = (transactions) => {
      let depositAmount = 0;
      let withdrawalAmount = 0;
      let transferAmount = 0;
      
      transactions.forEach(transaction => {
        const amount = transaction.transactionAmount || 0;
        
        switch (transaction.transactionType) {
          case 'Deposit':
            depositAmount += amount;
            break;
          case 'Withdrawal':
            withdrawalAmount += amount;
            break;
          case 'Transfer':
            transferAmount += amount;
            break;
        }
      });
      
      return {
        depositAmount,
        withdrawalAmount,
        transferAmount
      };
    };
    
    const parallexTransactions = filteredPosServices.filter(t => 
      t.transactionMethod === 'Pos-Parallex' || t.transactionMethod === 'Transfer-Parallex'
    );
    
    const opayTransactions = filteredPosServices.filter(t => 
      t.transactionMethod === 'Pos-Opay' || t.transactionMethod === 'Transfer-Opay'
    );
    
    const parallexPosData = calculateAccountBalance(parallexTransactions);
    const opayPosData = calculateAccountBalance(opayTransactions);
    
    const parallexSales = posParallexTotal + transferParallexTotal;
    const opaySales = posOpayTotal + transferOpayTotal;
    
    const parallexBalance = parallexSales + parallexPosData.withdrawalAmount 
      - parallexPosData.depositAmount - parallexPosData.transferAmount;
    
    const opayBalance = opaySales + opayPosData.withdrawalAmount 
      - opayPosData.depositAmount - opayPosData.transferAmount;

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
      // Account Balances
      accountBalances: {
        parallexBalance,
        opayBalance,
        totalDigitalBalance: parallexBalance + opayBalance,
        parallexSales,
        opaySales
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
      }
    };
  };

  useEffect(() => {
    fetchReportData();
    updateCurrentTime();
    const timerId = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(timerId);
  }, [period]);

  const handleRefresh = () => {
    fetchReportData();
  };

  const handleExport = () => {
    if (!reportData) return;
    
    // Create CSV content
    let csv = 'SALES REPORT\n\n';
    csv += `Period: ${period.charAt(0).toUpperCase() + period.slice(1)}\n`;
    csv += `Generated: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}\n\n`;
    
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
    
    csv += 'ACCOUNT BALANCES\n';
    csv += `Parallex Account Balance,${reportData.accountBalances.parallexBalance}\n`;
    csv += `Opay Account Balance,${reportData.accountBalances.opayBalance}\n`;
    csv += `Total Digital Balance,${reportData.accountBalances.totalDigitalBalance}\n\n`;
    
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
    const now = getLagosTime();
    const start = getLagosTime();
    
    switch (period.toLowerCase()) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        return `${start.toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })} - ${now.toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })}`;
      case 'weekly':
        start.setDate(now.getDate() - 7);
        return `${start.toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })} - ${now.toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })}`;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        return `${start.toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })} - ${now.toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })}`;
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
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-gray-600">{getDateRangeText(period)}</p>
                <span className="mx-2 text-gray-400">•</span>
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-gray-600">{currentTime}</p>
              </div>
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

        {/* Summary Cards - UPDATED */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-sm">Total Product Sales</p>
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

          {/* CHANGED: From "POS Services" to "Parallex Balance" */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-100 text-sm">Parallex Balance</p>
              <CreditCard className="w-8 h-8 text-purple-200" />
            </div>
            <h3 className="text-3xl font-bold">{formatCurrency(reportData?.accountBalances?.parallexBalance || 0)}</h3>
            <p className="text-purple-100 text-sm mt-2">
              Sales: {formatCurrency(reportData?.accountBalances?.parallexSales || 0)}
            </p>
          </div>

          {/* CHANGED: From "Items Sold" to "Opay Balance" */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-orange-100 text-sm">Opay Balance</p>
              <CreditCard className="w-8 h-8 text-orange-200" />
            </div>
            <h3 className="text-3xl font-bold">{formatCurrency(reportData?.accountBalances?.opayBalance || 0)}</h3>
            <p className="text-orange-100 text-sm mt-2">
              Sales: {formatCurrency(reportData?.accountBalances?.opaySales || 0)}
            </p>
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

          {/* POS Services Summary - UPDATED */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Account Overview</h2>
              <Calculator className="w-6 h-6 text-gray-400" />
            </div>

            <div className="space-y-4">
              {/* Parallex Balance */}
              <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Parallex Balance</p>
                    <p className="text-xs text-gray-500">Expected in account</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(reportData?.accountBalances?.parallexBalance || 0)}</p>
                  <p className="text-xs text-purple-500">
                    Sales: {formatCurrency(reportData?.accountBalances?.parallexSales || 0)}
                  </p>
                </div>
              </div>

              {/* Opay Balance */}
              <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Opay Balance</p>
                    <p className="text-xs text-gray-500">Expected in account</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(reportData?.accountBalances?.opayBalance || 0)}</p>
                  <p className="text-xs text-orange-500">
                    Sales: {formatCurrency(reportData?.accountBalances?.opaySales || 0)}
                  </p>
                </div>
              </div>

              {/* Total Digital Balance */}
              <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Total Digital Balance</p>
                    <p className="text-xs text-blue-600">Parallex + Opay</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-900">{formatCurrency(reportData?.accountBalances?.totalDigitalBalance || 0)}</p>
                    <p className="text-xs text-blue-700">
                      {formatCurrency((reportData?.accountBalances?.parallexSales || 0) + (reportData?.accountBalances?.opaySales || 0))} total sales
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* POS Methods Table */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">POS Methods - Transaction Type Breakdown</h2>
            <CreditCard className="w-6 h-6 text-gray-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Deposit</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Withdrawal</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Transfer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { method: 'Pos-Parallex', label: 'POS (Parallex)', color: 'blue' },
                  { method: 'Pos-Opay', label: 'POS (Opay)', color: 'green' },
                  { method: 'Transfer-Parallex', label: 'Transfer (Parallex)', color: 'purple' },
                  { method: 'Transfer-Opay', label: 'Transfer (Opay)', color: 'orange' }
                ].map((item) => {
                  const methodTransactions = reportData?.posTransactions?.rawData
                    ?.filter(record => record.transactionMethod === item.method) || [];
                  
                  const depositAmount = methodTransactions
                    .filter(t => t.transactionType === 'Deposit')
                    .reduce((sum, t) => sum + (t.transactionAmount || 0), 0);
                  
                  const withdrawalAmount = methodTransactions
                    .filter(t => t.transactionType === 'Withdrawal')
                    .reduce((sum, t) => sum + (t.transactionAmount || 0), 0);
                  
                  const transferAmount = methodTransactions
                    .filter(t => t.transactionType === 'Transfer')
                    .reduce((sum, t) => sum + (t.transactionAmount || 0), 0);
                  
                  const depositCount = methodTransactions.filter(t => t.transactionType === 'Deposit').length;
                  const withdrawalCount = methodTransactions.filter(t => t.transactionType === 'Withdrawal').length;
                  const transferCount = methodTransactions.filter(t => t.transactionType === 'Transfer').length;
                  
                  const methodTotal = depositAmount + withdrawalAmount + transferAmount;
                  const totalCount = depositCount + withdrawalCount + transferCount;

                  return (
                    <tr key={item.method} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                          <span className="font-medium text-gray-800">{item.label}</span>
                          <span className="text-xs text-gray-500">({totalCount})</span>
                        </div>
                      </td>
                      
                      {/* Deposit Column */}
                      <td className="py-3 px-4">
                        {depositCount > 0 ? (
                          <div className="space-y-1">
                            <p className="font-medium text-green-700">{formatCurrency(depositAmount)}</p>
                            <p className="text-xs text-gray-500">{depositCount} transaction{depositCount !== 1 ? 's' : ''}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      
                      {/* Withdrawal Column */}
                      <td className="py-3 px-4">
                        {withdrawalCount > 0 ? (
                          <div className="space-y-1">
                            <p className="font-medium text-red-700">{formatCurrency(withdrawalAmount)}</p>
                            <p className="text-xs text-gray-500">{withdrawalCount} transaction{withdrawalCount !== 1 ? 's' : ''}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      
                      {/* Transfer Column */}
                      <td className="py-3 px-4">
                        {transferCount > 0 ? (
                          <div className="space-y-1">
                            <p className="font-medium text-blue-700">{formatCurrency(transferAmount)}</p>
                            <p className="text-xs text-gray-500">{transferCount} transaction{transferCount !== 1 ? 's' : ''}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      
                      {/* Total Column */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-800">{formatCurrency(methodTotal)}</p>
                          <p className="text-xs text-gray-500">
                            {totalCount} transaction{totalCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Totals Row */}
                <tr className="bg-gray-50 font-bold">
                  <td className="py-3 px-4 text-gray-800">TOTAL</td>
                  <td className="py-3 px-4 text-green-700">
                    {formatCurrency(
                      reportData?.posTransactions?.rawData
                        ?.filter(t => t.transactionType === 'Deposit')
                        .reduce((sum, t) => sum + (t.transactionAmount || 0), 0) || 0
                    )}
                  </td>
                  <td className="py-3 px-4 text-red-700">
                    {formatCurrency(
                      reportData?.posTransactions?.rawData
                        ?.filter(t => t.transactionType === 'Withdrawal')
                        .reduce((sum, t) => sum + (t.transactionAmount || 0), 0) || 0
                    )}
                  </td>
                  <td className="py-3 px-4 text-blue-700">
                    {formatCurrency(
                      reportData?.posTransactions?.rawData
                        ?.filter(t => t.transactionType === 'Transfer')
                        .reduce((sum, t) => sum + (t.transactionAmount || 0), 0) || 0
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {formatCurrency(reportData?.posTransactions?.totalPosRevenue || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
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

        {/* Expected Account Balances - Updated with cleaner design */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Expected Account Balances</h2>
            <div className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-500">Based on POS service transactions</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parallex Account */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-800">Parallex Account</h3>
                    <p className="text-sm text-blue-600">POS & Transfer Parallex</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Expected Balance</p>
                  <p className={`text-3xl font-bold ${reportData?.accountBalances?.parallexBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(reportData?.accountBalances?.parallexBalance || 0)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Calculation Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Product Sales:</span>
                      <span className="font-medium text-blue-700">+ {formatCurrency(reportData?.accountBalances?.parallexSales || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Withdrawals:</span>
                      <span className="font-medium text-green-600">+ {formatCurrency(reportData?.posTransactions?.rawData
                        ?.filter(t => (t.transactionMethod === 'Pos-Parallex' || t.transactionMethod === 'Transfer-Parallex') && t.transactionType === 'Withdrawal')
                        .reduce((sum, t) => sum + (t.transactionAmount || 0), 0) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Deposits:</span>
                      <span className="font-medium text-red-600">- {formatCurrency(reportData?.posTransactions?.rawData
                        ?.filter(t => (t.transactionMethod === 'Pos-Parallex' || t.transactionMethod === 'Transfer-Parallex') && t.transactionType === 'Deposit')
                        .reduce((sum, t) => sum + (t.transactionAmount || 0), 0) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transfers:</span>
                      <span className="font-medium text-red-600">- {formatCurrency(reportData?.posTransactions?.rawData
                        ?.filter(t => (t.transactionMethod === 'Pos-Parallex' || t.transactionMethod === 'Transfer-Parallex') && t.transactionType === 'Transfer')
                        .reduce((sum, t) => sum + (t.transactionAmount || 0), 0) || 0)}</span>
                    </div>
                    <div className="h-px bg-blue-200 my-2"></div>
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-blue-800">Expected Balance:</span>
                      <span className={`text-lg ${reportData?.accountBalances?.parallexBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(reportData?.accountBalances?.parallexBalance || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Opay Account */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">Opay Account</h3>
                    <p className="text-sm text-green-600">POS & Transfer Opay</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Expected Balance</p>
                  <p className={`text-3xl font-bold ${reportData?.accountBalances?.opayBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(reportData?.accountBalances?.opayBalance || 0)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Calculation Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Product Sales:</span>
                      <span className="font-medium text-green-700">+ {formatCurrency(reportData?.accountBalances?.opaySales || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Withdrawals:</span>
                      <span className="font-medium text-green-600">+ {formatCurrency(reportData?.posTransactions?.rawData
                        ?.filter(t => (t.transactionMethod === 'Pos-Opay' || t.transactionMethod === 'Transfer-Opay') && t.transactionType === 'Withdrawal')
                        .reduce((sum, t) => sum + (t.transactionAmount || 0), 0) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Deposits:</span>
                      <span className="font-medium text-red-600">- {formatCurrency(reportData?.posTransactions?.rawData
                        ?.filter(t => (t.transactionMethod === 'Pos-Opay' || t.transactionMethod === 'Transfer-Opay') && t.transactionType === 'Deposit')
                        .reduce((sum, t) => sum + (t.transactionAmount || 0), 0) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transfers:</span>
                      <span className="font-medium text-red-600">- {formatCurrency(reportData?.posTransactions?.rawData
                        ?.filter(t => (t.transactionMethod === 'Pos-Opay' || t.transactionMethod === 'Transfer-Opay') && t.transactionType === 'Transfer')
                        .reduce((sum, t) => sum + (t.transactionAmount || 0), 0) || 0)}</span>
                    </div>
                    <div className="h-px bg-green-200 my-2"></div>
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-green-800">Expected Balance:</span>
                      <span className={`text-lg ${reportData?.accountBalances?.opayBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(reportData?.accountBalances?.opayBalance || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
              
          {/* Combined Summary */}
          <div className="mt-8 pt-8 border-t border-gray-300">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-6 text-center">Digital Accounts Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-5 bg-white border-2 border-blue-300 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">Total Digital Balance</p>
                  <p className={`text-2xl font-bold ${reportData?.accountBalances?.totalDigitalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(reportData?.accountBalances?.totalDigitalBalance || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Parallex + Opay combined</p>
                </div>
                <div className="text-center p-5 bg-white border-2 border-purple-300 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">Total Digital Sales</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency((reportData?.accountBalances?.parallexSales || 0) + (reportData?.accountBalances?.opaySales || 0))}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">All non-cash methods</p>
                </div>
                <div className="text-center p-5 bg-white border-2 border-green-300 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">POS Service Transactions</p>
                  <p className="text-2xl font-bold text-purple-600">{reportData?.posTransactions?.totalTransactions || 0}</p>
                  <p className="text-xs text-gray-500 mt-2">Total adjustment transactions</p>
                </div>
              </div>
            </div>
          </div>


          {/* Alternative: POS Methods with Service Charges in Card View */}
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">POS Services - Detailed Breakdown</h2>
                    <CreditCard className="w-6 h-6 text-gray-400" />
                  </div>

                  {/* Service Charges Summary Card */}
                  <div className="mb-6 p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <h3 className="text-xl font-bold mb-1">Total Service Charges</h3>
                        <p className="text-purple-100">2% on deposits, 1% on withdrawals, transfers may vary</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{formatCurrency(reportData?.posTransactions?.serviceCharges || 0)}</p>
                        <p className="text-purple-100 text-sm mt-1">
                          {reportData?.posTransactions?.totalTransactions || 0} transactions
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <p className="text-white/90 text-sm">Deposit Charges</p>
                        <p className="text-white text-lg font-bold">
                          {formatCurrency(
                            reportData?.posTransactions?.rawData
                              ?.filter(t => t.transactionType === 'Deposit')
                              .reduce((sum, t) => sum + (t.serviceCharge || 0), 0) || 0
                          )}
                        </p>
                        <p className="text-white/80 text-xs">2% of deposit amount</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <p className="text-white/90 text-sm">Withdrawal Charges</p>
                        <p className="text-white text-lg font-bold">
                          {formatCurrency(
                            reportData?.posTransactions?.rawData
                              ?.filter(t => t.transactionType === 'Withdrawal')
                              .reduce((sum, t) => sum + (t.serviceCharge || 0), 0) || 0
                          )}
                        </p>
                        <p className="text-white/80 text-xs">1% of withdrawal amount</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <p className="text-white/90 text-sm">Transfer Charges</p>
                        <p className="text-white text-lg font-bold">
                          {formatCurrency(
                            reportData?.posTransactions?.rawData
                              ?.filter(t => t.transactionType === 'Transfer')
                              .reduce((sum, t) => sum + (t.serviceCharge || 0), 0) || 0
                          )}
                        </p>
                        <p className="text-white/80 text-xs">Varies per transaction</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Method</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Transactions</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Service Charges</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Net Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { method: 'Pos-Parallex', label: 'POS (Parallex)', color: 'blue' },
                          { method: 'Pos-Opay', label: 'POS (Opay)', color: 'green' },
                          { method: 'Transfer-Parallex', label: 'Transfer (Parallex)', color: 'purple' },
                          { method: 'Transfer-Opay', label: 'Transfer (Opay)', color: 'orange' }
                        ].map((item) => {
                          const methodTransactions = reportData?.posTransactions?.rawData
                            ?.filter(record => record.transactionMethod === item.method) || [];
                          
                          const methodTotal = methodTransactions
                            .reduce((sum, t) => sum + (t.transactionAmount || 0), 0);
                          
                          const methodServiceCharges = methodTransactions
                            .reduce((sum, t) => sum + (t.serviceCharge || 0), 0);
                          
                          const netAmount = methodTotal - methodServiceCharges;
                          const transactionCount = methodTransactions.length;

                          // Calculate breakdown by type
                          const depositTransactions = methodTransactions.filter(t => t.transactionType === 'Deposit');
                          const withdrawalTransactions = methodTransactions.filter(t => t.transactionType === 'Withdrawal');
                          const transferTransactions = methodTransactions.filter(t => t.transactionType === 'Transfer');

                          return (
                            <tr key={item.method} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                                  <span className="font-medium text-gray-800">{item.label}</span>
                                </div>
                                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                  {depositTransactions.length > 0 && (
                                    <span className="text-green-600">{depositTransactions.length} Deposit</span>
                                  )}
                                  {withdrawalTransactions.length > 0 && (
                                    <span className="text-red-600">{withdrawalTransactions.length} Withdrawal</span>
                                  )}
                                  {transferTransactions.length > 0 && (
                                    <span className="text-blue-600">{transferTransactions.length} Transfer</span>
                                  )}
                                </div>
                              </td>
                              
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <p className="font-medium text-gray-800">{transactionCount}</p>
                                  <p className="text-xs text-gray-500">
                                    {depositTransactions.length + withdrawalTransactions.length + transferTransactions.length} total
                                  </p>
                                </div>
                              </td>
                              
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <p className="font-bold text-gray-800">{formatCurrency(methodTotal)}</p>
                                  <p className="text-xs text-gray-500">
                                    Avg: {formatCurrency(transactionCount > 0 ? methodTotal / transactionCount : 0)}
                                  </p>
                                </div>
                              </td>
                              
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <p className="font-medium text-purple-700">{formatCurrency(methodServiceCharges)}</p>
                                  <p className="text-xs text-gray-500">
                                    {methodServiceCharges > 0 ? `${((methodServiceCharges / methodTotal) * 100).toFixed(2)}% of total` : '-'}
                                  </p>
                                </div>
                              </td>
                              
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <p className="font-bold text-green-700">{formatCurrency(netAmount)}</p>
                                  <p className="text-xs text-gray-500">
                                    After service charges
                                  </p>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        
                        {/* Totals Row */}
                        <tr className="bg-gray-50 font-bold">
                          <td className="py-3 px-4 text-gray-800">TOTAL</td>
                          <td className="py-3 px-4 text-gray-800">
                            {reportData?.posTransactions?.totalTransactions || 0}
                          </td>
                          <td className="py-3 px-4 text-gray-800">
                            {formatCurrency(reportData?.posTransactions?.totalPosRevenue || 0)}
                          </td>
                          <td className="py-3 px-4 text-purple-800">
                            {formatCurrency(reportData?.posTransactions?.serviceCharges || 0)}
                          </td>
                          <td className="py-3 px-4 text-green-800">
                            {formatCurrency(
                              (reportData?.posTransactions?.totalPosRevenue || 0) - 
                              (reportData?.posTransactions?.serviceCharges || 0)
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Report generated on {getLagosTime().toLocaleString('en-NG', { 
            timeZone: 'Africa/Lagos',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })} WAT</p>
          <p className="mt-1">Period: {period.charAt(0).toUpperCase() + period.slice(1)} • {getDateRangeText(period)}</p>
        </div>
      </div>
    </div>
  );
};

export default Report;