// import React, { useState, useEffect } from 'react';
// import { 
//   BarChart3, 
//   TrendingUp, 
//   Users, 
//   DollarSign, 
//   ShoppingCart,
//   CreditCard,
//   UserCheck,
//   Package,
//   Loader2,
//   RefreshCw,
//   AlertCircle,
//   Database
// } from 'lucide-react';
// import TopNav from '../TopNav';
// import axios from 'axios';

// // Set base URL for all API calls
// const API_BASE_URL = 'https://sales-system-production.up.railway.app/api';

// const Dashboard = () => {
//   const [period, setPeriod] = useState('daily');
//   const [analyticsData, setAnalyticsData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [rawResponse, setRawResponse] = useState(null);

//   // Format currency to Naira
//   const formatCurrency = (amount) => {
//     if (amount === null || amount === undefined || isNaN(amount)) return '₦0.00';
    
//     return new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN',
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(amount);
//   };

//   // Format number with commas
//   const formatNumber = (num) => {
//     if (num === null || num === undefined || isNaN(num)) return '0';
    
//     return new Intl.NumberFormat('en-NG').format(num);
//   };

//   // Debug function to log response structure
//   const debugResponse = (data, endpoint) => {
//     console.log(`=== ${endpoint} Response ===`);
//     console.log('Full response:', data);
    
//     if (data) {
//       console.log('Keys:', Object.keys(data));
      
//       // Check if data is nested under 'analytics'
//       const analyticsData = data.analytics || data;
//       console.log('Analytics data:', analyticsData);
      
//       // Check for totalSales
//       if (analyticsData.totalSales) {
//         console.log('totalSales:', analyticsData.totalSales);
//         console.log('totalSales type:', typeof analyticsData.totalSales);
//         console.log('totalSales keys:', Object.keys(analyticsData.totalSales));
//       }
      
//       // Check for topProducts
//       if (analyticsData.topProducts) {
//         console.log('topProducts:', analyticsData.topProducts);
//         console.log('topProducts length:', analyticsData.topProducts.length);
//         if (analyticsData.topProducts.length > 0) {
//           console.log('First product:', analyticsData.topProducts[0]);
//           console.log('First product keys:', Object.keys(analyticsData.topProducts[0]));
//         }
//       }
//     }
//   };

//   // Fetch main analytics data
//   const fetchAnalytics = async (showRefreshing = false) => {
//     try {
//       if (showRefreshing) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }
//       setError(null);
      
//       const token = localStorage.getItem('token');
//       console.log('Fetching analytics for period:', period);
//       console.log('Token available:', !!token);

//       const response = await axios.get(`${API_BASE_URL}/analytics/${period}`, {
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       console.log('Analytics API Response:', response);
//       console.log('Response data:', response.data);
      
//       // FIX: Extract analytics from response.data.analytics OR use response.data directly
//       const analyticsPayload = response.data.analytics || response.data;
      
//       debugResponse(response.data, 'main-analytics');
//       setRawResponse(response.data);
      
//       // Process the response data
//       const processedData = processAnalyticsData(analyticsPayload);
//       console.log('Processed data:', processedData);
//       setAnalyticsData(processedData);
      
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//       console.error('Error response:', error.response?.data);
//       console.error('Error status:', error.response?.status);
      
//       setError(error.response?.data?.message || error.message || 'Failed to load analytics data');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Process and normalize analytics data
//   const processAnalyticsData = (data) => {
//     if (!data) {
//       console.log('No data to process');
//       return null;
//     }
    
//     console.log('Processing analytics data:', data);
    
//     // Ensure all required fields exist
//     const processed = {
//       ...data,
//       totalSales: data.totalSales || {
//         totalRevenue: 0,
//         totalTransactions: 0,
//         totalItemsSold: 0,
//         formattedRevenue: formatCurrency(0),
//         formattedAverageTransaction: formatCurrency(0)
//       },
//       topProducts: data.topProducts || [],
//       cashierSales: data.cashierSales || [],
//       dateRange: data.dateRange || {
//         startDate: new Date().toISOString().split('T')[0],
//         endDate: new Date().toISOString().split('T')[0]
//       },
//       period: data.period || period
//     };
    
//     // Ensure formatted values exist (fallback to client-side formatting)
//     if (processed.totalSales && !processed.totalSales.formattedRevenue) {
//       processed.totalSales.formattedRevenue = formatCurrency(processed.totalSales.totalRevenue || 0);
//     }
    
//     if (processed.totalSales && !processed.totalSales.formattedAverageTransaction) {
//       const avg = processed.totalSales.totalTransactions > 0 
//         ? (processed.totalSales.totalRevenue || 0) / processed.totalSales.totalTransactions 
//         : 0;
//       processed.totalSales.formattedAverageTransaction = formatCurrency(avg);
//     }
    
//     // Process top products - ensure formatted values exist
//     if (processed.topProducts && processed.topProducts.length > 0) {
//       processed.topProducts = processed.topProducts.map(product => ({
//         ...product,
//         formattedRevenue: product.formattedRevenue || formatCurrency(product.totalRevenue || 0),
//         formattedAveragePrice: product.formattedAveragePrice || formatCurrency(product.averagePrice || 0),
//         productName: product.productName || product._id || 'Unknown Product'
//       }));
//       console.log('Processed products:', processed.topProducts);
//     }
    
//     // Process cashier sales - ensure formatted values exist
//     if (processed.cashierSales && processed.cashierSales.length > 0) {
//       processed.cashierSales = processed.cashierSales.map(cashier => ({
//         ...cashier,
//         formattedRevenue: cashier.formattedRevenue || formatCurrency(cashier.totalRevenue || 0),
//         formattedAverageTransactionValue: cashier.formattedAverageTransactionValue || 
//           formatCurrency(cashier.averageTransactionValue || 0),
//         cashierName: cashier.cashierName || cashier._id || 'Unknown Cashier'
//       }));
//       console.log('Processed cashiers:', processed.cashierSales);
//     }
    
//     console.log('Final processed data:', processed);
//     return processed;
//   };
//   // Fetch additional data for specific tabs
// const fetchAdditionalData = async () => {
//   try {
//     const token = localStorage.getItem('token');
    
//     if (activeTab === 'payments') {
//       console.log('Fetching additional payment data...');
      
//       const [cashResponse, posResponse, paymentMethodsResponse] = await Promise.all([
//         axios.get(`${API_BASE_URL}/analytics/${period}/combined-cash`, {
//           headers: { Authorization: `Bearer ${token}` }
//         }).catch(err => {
//           console.error('Error fetching cash data:', err);
//           return { data: null };
//         }),
//         axios.get(`${API_BASE_URL}/analytics/${period}/combined-pos`, {
//           headers: { Authorization: `Bearer ${token}` }
//         }).catch(err => {
//           console.error('Error fetching POS data:', err);
//           return { data: null };
//         }),
//         axios.get(`${API_BASE_URL}/analytics/${period}/payment-method-analysis`, {
//           headers: { Authorization: `Bearer ${token}` }
//         }).catch(err => {
//           console.error('Error fetching payment methods:', err);
//           return { data: null };
//         })
//       ]);

//       // FIX: Extract data from nested response structure
//       const cashData = cashResponse.data?.combinedCash || cashResponse.data;
//       const posData = posResponse.data?.combinedPos || posResponse.data;
//       const paymentMethodsData = paymentMethodsResponse.data?.paymentMethods || paymentMethodsResponse.data;

//       console.log('Extracted Cash data:', cashData);
//       console.log('Extracted POS data:', posData);
//       console.log('Extracted Payment methods:', paymentMethodsData);

//       setAnalyticsData(prev => {
//         const updated = {
//           ...prev,
//           combinedCash: cashData,
//           combinedPos: posData,
//           paymentMethods: paymentMethodsData
//         };
        
//         console.log('Updated analytics data with payment info:', updated);
        
//         // Process the additional data - ensure formatted values exist
//         if (updated.combinedCash && !updated.combinedCash.formattedTotalCashFromSales) {
//           updated.combinedCash.formattedTotalCashFromSales = formatCurrency(updated.combinedCash.totalCashFromSales || 0);
//           updated.combinedCash.formattedTotalCashFromServices = formatCurrency(updated.combinedCash.totalCashFromServices || 0);
//           updated.combinedCash.formattedTotalCombinedCash = formatCurrency(updated.combinedCash.totalCombinedCash || 0);
//         }
        
//         // Process POS data - add formatted values if missing
//         if (updated.combinedPos && Array.isArray(updated.combinedPos)) {
//           updated.combinedPos = updated.combinedPos.map(method => ({
//             ...method,
//             formattedCombinedTotal: method.formattedCombinedTotal || formatCurrency(method.combinedTotal || 0),
//             formattedTotalFromSales: method.formattedTotalFromSales || formatCurrency(method.totalFromSales || 0),
//             formattedTotalFromServices: method.formattedTotalFromServices || formatCurrency(method.totalFromServices || 0)
//           }));
//         }
        
//         return updated;
//       });
//     }
//   } catch (error) {
//     console.error('Error fetching additional data:', error);
//   }
// };

//   useEffect(() => {
//     fetchAnalytics();
//   }, [period]);

//   useEffect(() => {
//     if (analyticsData && activeTab === 'payments') {
//       fetchAdditionalData();
//     }
//   }, [activeTab, analyticsData]);

//   // Get period display name
//   const getPeriodDisplay = (period) => {
//     const periodMap = {
//       daily: 'Today',
//       weekly: 'This Week',
//       monthly: 'This Month',
//       yearly: 'This Year'
//     };
//     return periodMap[period] || period;
//   };

//   // Refresh data
//   const handleRefresh = () => {
//     fetchAnalytics(true);
//   };

//   // Show raw data for debugging
//   const showRawData = () => {
//     console.log('Current analyticsData:', analyticsData);
//     console.log('Raw API response:', rawResponse);
    
//     if (rawResponse) {
//       alert('Check console for raw data');
//     }
//   };

//   // Loading skeleton
//   if (loading && !refreshing) {
//     return (
//       <div className="p-6">
//         <TopNav />
//         <div className="animate-pulse">
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
//               <div className="h-4 bg-gray-200 rounded w-48"></div>
//             </div>
//             <div className="h-10 bg-gray-200 rounded w-64"></div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="bg-gray-200 rounded-xl p-6 h-32"></div>
//             ))}
//           </div>
//           <div className="bg-gray-200 rounded-xl p-6 h-96"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <TopNav />
      
//       <header className="mb-8">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <p className="text-gray-600 mt-19 text-sm sm:text-base">
             
//             </p>
//           </div>
//           <div className="flex items-center space-x-4 w-full sm:w-auto">
//             <div className="bg-white rounded-lg shadow-sm p-1 flex flex-wrap gap-1">
//               {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
//                 <button
//                   key={p}
//                   onClick={() => setPeriod(p)}
//                   disabled={refreshing}
//                   className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
//                     period === p
//                       ? 'bg-blue-600 text-white'
//                       : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
//                   } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
//                 >
//                   {p.charAt(0).toUpperCase() + p.slice(1)}
//                 </button>
//               ))}
//             </div>
//             <button
//               onClick={handleRefresh}
//               disabled={refreshing}
//               className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               title="Refresh data"
//             >
//               {refreshing ? (
//                 <Loader2 className="h-5 w-5 animate-spin" />
//               ) : (
//                 <RefreshCw className="h-5 w-5" />
//               )}
//             </button>
//             <button
//               onClick={showRawData}
//               className="flex items-center justify-center p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
//               title="Debug data"
//             >
//               <Database className="h-5 w-5" />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <div className="flex items-center">
//             <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
//             <div>
//               <p className="text-red-700 font-medium">{error}</p>
//               <p className="text-red-600 text-sm mt-1">
//                 The API is responding but there might be a data format issue. Check console for details.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Debug Info */}
//       {analyticsData && (
//         <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <Database className="h-5 w-5 text-blue-600 mr-2" />
//               <span className="text-blue-700 text-sm">
//                 Loaded {analyticsData.totalSales?.totalTransactions || 0} transactions for {getPeriodDisplay(period)}
//               </span>
//             </div>
//             <span className="text-xs text-blue-600">
//               API Status: Connected ✓
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="mb-6 border-b border-gray-200 overflow-x-auto">
//         <nav className="flex space-x-2 sm:space-x-8 min-w-max sm:min-w-0">
//           {['overview', 'products', 'cashiers', 'payments'].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
//                 activeTab === tab
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* Overview Tab */}
//       {activeTab === 'overview' && analyticsData && (
//         <>
//           {/* Key Metrics */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
//             {/* Total Revenue Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
//               <div className="flex items-center justify-between">
//                 <div className="w-full">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-gray-500 text-xs sm:text-sm">Total Revenue</p>
//                     <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0 ml-2" />
//                   </div>
//                   <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
//                     {analyticsData.totalSales?.formattedRevenue || formatCurrency(analyticsData.totalSales?.totalRevenue || 0)}
//                   </h3>
//                   <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs sm:text-sm">
//                     <span className="text-gray-600">
//                       {formatNumber(analyticsData.totalSales?.totalTransactions || 0)} transactions
//                     </span>
//                     <span className="text-green-600 font-medium">
//                       {getPeriodDisplay(period)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Total Items Sold Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
//               <div className="flex items-center justify-between">
//                 <div className="w-full">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-gray-500 text-xs sm:text-sm">Items Sold</p>
//                     <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0 ml-2" />
//                   </div>
//                   <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
//                     {formatNumber(analyticsData.totalSales?.totalItemsSold || 0)}
//                   </h3>
//                   <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs sm:text-sm">
//                     <span className="text-gray-600">
//                       Avg: {formatNumber(
//                         Math.round((analyticsData.totalSales?.totalItemsSold || 0) / 
//                         Math.max(analyticsData.totalSales?.totalTransactions || 1, 1))
//                       )} per transaction
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Average Transaction Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
//               <div className="flex items-center justify-between">
//                 <div className="w-full">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-gray-500 text-xs sm:text-sm">Avg. Transaction</p>
//                     <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0 ml-2" />
//                   </div>
//                   <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
//                     {analyticsData.totalSales?.formattedAverageTransaction || 
//                      formatCurrency(
//                        (analyticsData.totalSales?.totalRevenue || 0) / 
//                        Math.max(analyticsData.totalSales?.totalTransactions || 1, 1)
//                      )}
//                   </h3>
//                   <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs sm:text-sm">
//                     <span className="text-gray-600">
//                       Per transaction
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Active Cashiers Card */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
//               <div className="flex items-center justify-between">
//                 <div className="w-full">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-gray-500 text-xs sm:text-sm">Active Cashiers</p>
//                     <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0 ml-2" />
//                   </div>
//                   <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
//                     {formatNumber(analyticsData.cashierSales?.length || 0)}
//                   </h3>
//                   <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs sm:text-sm">
//                     <span className="text-gray-600">
//                       {formatNumber(analyticsData.topProducts?.length || 0)} top products
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Data Summary */}
//           {analyticsData.totalSales?.totalTransactions === 0 && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
//               <div className="flex items-center">
//                 <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
//                 <div>
//                   <h3 className="font-semibold text-yellow-800">No Transactions Found</h3>
//                   <p className="text-yellow-700 text-sm mt-1">
//                     No sales data found for {getPeriodDisplay(period)}. Try selecting a different period or check if sales have been recorded.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Quick Stats Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
//             {/* Top Product Quick View */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
//               <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
//                 Top Product
//                 {refreshing && <Loader2 className="h-4 w-4 animate-spin inline ml-2" />}
//               </h3>
//               {analyticsData.topProducts?.[0] ? (
//                 <div className="space-y-2 sm:space-y-3">
//                   <div className="flex items-center justify-between">
//                     <span className="font-medium text-gray-700 text-sm sm:text-base">
//                       {analyticsData.topProducts[0].productName}
//                     </span>
//                     <span className="text-green-600 font-bold text-sm sm:text-base">
//                       {formatNumber(analyticsData.topProducts[0].totalQuantitySold)} sold
//                     </span>
//                   </div>
//                   <div className="text-xs sm:text-sm text-gray-600">
//                     Revenue: {analyticsData.topProducts[0].formattedRevenue || 
//                              formatCurrency(analyticsData.topProducts[0].totalRevenue)}
//                   </div>
//                   <div className="text-xs sm:text-sm text-gray-500">
//                     {formatNumber(analyticsData.topProducts[0].transactionCount)} transactions
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-gray-500 text-sm">No sales data available</p>
//               )}
//             </div>

//             {/* Top Cashier Quick View */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
//               <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
//                 Top Cashier
//                 {refreshing && <Loader2 className="h-4 w-4 animate-spin inline ml-2" />}
//               </h3>
//               {analyticsData.cashierSales?.[0] ? (
//                 <div className="space-y-2 sm:space-y-3">
//                   <div className="flex items-center justify-between">
//                     <span className="font-medium text-gray-700 text-sm sm:text-base">
//                       {analyticsData.cashierSales[0].cashierName}
//                     </span>
//                     <span className="text-blue-600 font-bold text-sm sm:text-base">
//                       {analyticsData.cashierSales[0].formattedRevenue || 
//                        formatCurrency(analyticsData.cashierSales[0].totalRevenue)}
//                     </span>
//                   </div>
//                   <div className="text-xs sm:text-sm text-gray-600">
//                     {formatNumber(analyticsData.cashierSales[0].totalTransactions)} transactions
//                   </div>
//                   <div className="text-xs sm:text-sm text-gray-500">
//                     {formatNumber(analyticsData.cashierSales[0].totalItemsSold)} items sold
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-gray-500 text-sm">No cashier data available</p>
//               )}
//             </div>

//             {/* Period Summary */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
//               <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
//                 Period Summary
//               </h3>
//               <div className="space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Period:</span>
//                   <span className="font-medium">{getPeriodDisplay(period)}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Transactions:</span>
//                   <span className="font-medium">
//                     {formatNumber(analyticsData.totalSales?.totalTransactions || 0)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Items Sold:</span>
//                   <span className="font-medium">
//                     {formatNumber(analyticsData.totalSales?.totalItemsSold || 0)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Total Revenue:</span>
//                   <span className="font-medium">
//                     {formatCurrency(analyticsData.totalSales?.totalRevenue || 0)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Products Tab */}
//       {activeTab === 'products' && analyticsData && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
//             <h2 className="text-lg sm:text-xl font-bold text-gray-800">Top Products</h2>
//             <div className="flex items-center space-x-2">
//               <span className="text-xs sm:text-sm text-gray-600">
//                 Showing {analyticsData.topProducts?.length || 0} products
//               </span>
//               {refreshing && <Loader2 className="h-4 w-4 animate-spin" />}
//             </div>
//           </div>
          
//           {analyticsData.topProducts?.length > 0 ? (
//             <div className="overflow-x-auto -mx-4 sm:mx-0">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead>
//                   <tr>
//                     <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Product
//                     </th>
//                     <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Qty Sold
//                     </th>
//                     <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Revenue
//                     </th>
//                     <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Avg. Price
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {analyticsData.topProducts.map((product, index) => (
//                     <tr key={index} className="hover:bg-gray-50">
//                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
//                           <span className="font-medium text-gray-900 text-sm sm:text-base">
//                             {product.productName || `Product ${index + 1}`}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                         <span className="font-semibold text-blue-600 text-sm sm:text-base">
//                           {formatNumber(product.totalQuantitySold)}
//                         </span>
//                       </td>
//                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                         <span className="font-semibold text-green-600 text-sm sm:text-base">
//                           {product.formattedRevenue || formatCurrency(product.totalRevenue)}
//                         </span>
//                       </td>
//                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                         <span className="text-sm sm:text-base">
//                           {product.formattedAveragePrice || formatCurrency(product.averagePrice || 0)}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500">No product sales data available for this period</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Cashiers Tab */}
//       {activeTab === 'cashiers' && analyticsData && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
//             <h2 className="text-lg sm:text-xl font-bold text-gray-800">Cashier Performance</h2>
//             <div className="flex items-center space-x-2">
//               <span className="text-xs sm:text-sm text-gray-600">
//                 {formatNumber(analyticsData.cashierSales?.length || 0)} cashiers active
//               </span>
//               {refreshing && <Loader2 className="h-4 w-4 animate-spin" />}
//             </div>
//           </div>
          
//           {analyticsData.cashierSales?.length > 0 ? (
//             <div className="overflow-x-auto -mx-4 sm:mx-0">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead>
//                   <tr>
//                     <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Cashier
//                     </th>
//                     <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Revenue
//                     </th>
//                     <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Transactions
//                     </th>
//                     <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Items Sold
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {analyticsData.cashierSales.map((cashier, index) => (
//                     <tr key={index} className="hover:bg-gray-50">
//                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
//                           <div>
//                             <div className="font-medium text-gray-900 text-sm sm:text-base">
//                               {cashier.cashierName || `Cashier ${index + 1}`}
//                             </div>
//                             {cashier.cashierUsername && (
//                               <div className="text-xs text-gray-500">
//                                 @{cashier.cashierUsername}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                         <span className="font-semibold text-green-600 text-sm sm:text-base">
//                           {cashier.formattedRevenue || formatCurrency(cashier.totalRevenue)}
//                         </span>
//                       </td>
//                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                         <span className="text-sm sm:text-base">
//                           {formatNumber(cashier.totalTransactions)}
//                         </span>
//                       </td>
//                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                         <span className="text-sm sm:text-base">
//                           {formatNumber(cashier.totalItemsSold)}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500">No cashier sales data available for this period</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Payments Tab */}
//       {activeTab === 'payments' && analyticsData && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
//           <div className="flex items-center justify-between mb-4 sm:mb-6">
//             <h2 className="text-lg sm:text-xl font-bold text-gray-800">Payment Analytics</h2>
//             {refreshing && <Loader2 className="h-4 w-4 animate-spin" />}
//           </div>
          
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//             {/* Combined Cash Analytics */}
//             <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
//               <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
//                 <DollarSign className="h-5 w-5 text-green-600 mr-2" />
//                 Cash Payments
//               </h3>
//               {analyticsData.combinedCash ? (
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 text-sm sm:text-base">Sales Cash:</span>
//                     <span className="font-semibold text-sm sm:text-base">
//                       {analyticsData.combinedCash.formattedTotalCashFromSales || 
//                        formatCurrency(analyticsData.combinedCash.totalCashFromSales || 0)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 text-sm sm:text-base">Service Cash:</span>
//                     <span className="font-semibold text-sm sm:text-base">
//                       {analyticsData.combinedCash.formattedTotalCashFromServices || 
//                        formatCurrency(analyticsData.combinedCash.totalCashFromServices || 0)}
//                     </span>
//                   </div>
//                   <div className="pt-3 border-t border-blue-200">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-800 font-medium text-sm sm:text-base">Total Cash:</span>
//                       <span className="font-bold text-green-600 text-sm sm:text-base">
//                         {analyticsData.combinedCash.formattedTotalCombinedCash || 
//                          formatCurrency((analyticsData.combinedCash.totalCashFromSales || 0) + 
//                          (analyticsData.combinedCash.totalCashFromServices || 0))}
//                       </span>
//                     </div>
//                     <div className="text-xs text-gray-500 mt-1">
//                       {formatNumber(analyticsData.combinedCash.totalTransactions || 0)} total transactions
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center py-4">
//                   <p className="text-gray-500 text-sm">No cash data available</p>
//                 </div>
//               )}
//             </div>

//             {/* POS Analytics */}
//             <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
//               <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
//                 <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
//                 POS & Transfer Totals
//               </h3>
//               {analyticsData.combinedPos ? (
//                 analyticsData.combinedPos.length > 0 ? (
//                   <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
//                     {analyticsData.combinedPos.map((method, index) => (
//                       <div key={index} className="flex justify-between items-center">
//                         <span className="text-gray-600 text-sm sm:text-base">
//                           {method.method || `Method ${index + 1}`}:
//                         </span>
//                         <span className="font-semibold text-sm sm:text-base">
//                           {method.formattedCombinedTotal || 
//                            formatCurrency(method.combinedTotal || method.totalAmount || 0)}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 text-sm text-center py-4">No POS data available</p>
//                 )
//               ) : (
//                 <div className="text-center py-4">
//                   <p className="text-gray-500 text-sm">Loading POS data...</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Footer */}
//       <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
//         <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          
//           <span className="hidden sm:inline">•</span>
//           <span>
//             Powered by Springcore Africa
//           </span>
//           <span className="hidden sm:inline">•</span>
//           <span>
//             Last updated: {new Date().toLocaleTimeString()}
//           </span>
//         </div>
//         {error && (
//           <div className="mt-2 text-amber-600 text-xs">
//             API is connected but data format may be unexpected
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart,
  CreditCard,
  UserCheck,
  Package,
  Loader2,
  RefreshCw,
  AlertCircle,
  Database
} from 'lucide-react';
import TopNav from '../TopNav';
import axios from 'axios';

// Set base URL for all API calls
const API_BASE_URL = 'https://sales-system-production.up.railway.app/api';

const Dashboard = () => {
  const [period, setPeriod] = useState('daily');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [rawResponse, setRawResponse] = useState(null);

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

  // Format number with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    
    return new Intl.NumberFormat('en-NG').format(num);
  };

  // Debug function to log response structure
  const debugResponse = (data, endpoint) => {
    console.log(`=== ${endpoint} Response ===`);
    console.log('Full response:', data);
    
    if (data) {
      console.log('Keys:', Object.keys(data));
      
      // Check if data is nested under 'analytics'
      const analyticsData = data.analytics || data;
      console.log('Analytics data:', analyticsData);
      
      // Check for totalSales
      if (analyticsData.totalSales) {
        console.log('totalSales:', analyticsData.totalSales);
        console.log('totalSales type:', typeof analyticsData.totalSales);
        console.log('totalSales keys:', Object.keys(analyticsData.totalSales));
      }
      
      // Check for topProducts
      if (analyticsData.topProducts) {
        console.log('topProducts:', analyticsData.topProducts);
        console.log('topProducts length:', analyticsData.topProducts.length);
        if (analyticsData.topProducts.length > 0) {
          console.log('First product:', analyticsData.topProducts[0]);
          console.log('First product keys:', Object.keys(analyticsData.topProducts[0]));
        }
      }
    }
  };

  // Fetch main analytics data
  const fetchAnalytics = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('Fetching analytics for period:', period);
      console.log('Token available:', !!token);

      const response = await axios.get(`${API_BASE_URL}/analytics/${period}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Analytics API Response:', response);
      console.log('Response data:', response.data);
      
      // FIX: Extract analytics from response.data.analytics OR use response.data directly
      const analyticsPayload = response.data.analytics || response.data;
      
      debugResponse(response.data, 'main-analytics');
      setRawResponse(response.data);
      
      // Process the response data
      const processedData = processAnalyticsData(analyticsPayload);
      console.log('Processed data:', processedData);
      setAnalyticsData(processedData);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      setError(error.response?.data?.message || error.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Process and normalize analytics data
  const processAnalyticsData = (data) => {
    if (!data) {
      console.log('No data to process');
      return null;
    }
    
    console.log('Processing analytics data:', data);
    
    // Ensure all required fields exist
    const processed = {
      ...data,
      totalSales: data.totalSales || {
        totalRevenue: 0,
        totalTransactions: 0,
        totalItemsSold: 0,
        formattedRevenue: formatCurrency(0),
        formattedAverageTransaction: formatCurrency(0)
      },
      topProducts: data.topProducts || [],
      cashierSales: data.cashierSales || [],
      dateRange: data.dateRange || {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      period: data.period || period
    };
    
    // Ensure formatted values exist (fallback to client-side formatting)
    if (processed.totalSales && !processed.totalSales.formattedRevenue) {
      processed.totalSales.formattedRevenue = formatCurrency(processed.totalSales.totalRevenue || 0);
    }
    
    if (processed.totalSales && !processed.totalSales.formattedAverageTransaction) {
      const avg = processed.totalSales.totalTransactions > 0 
        ? (processed.totalSales.totalRevenue || 0) / processed.totalSales.totalTransactions 
        : 0;
      processed.totalSales.formattedAverageTransaction = formatCurrency(avg);
    }
    
    // Process top products - ensure formatted values exist
    if (processed.topProducts && processed.topProducts.length > 0) {
      processed.topProducts = processed.topProducts.map(product => ({
        ...product,
        formattedRevenue: product.formattedRevenue || formatCurrency(product.totalRevenue || 0),
        formattedAveragePrice: product.formattedAveragePrice || formatCurrency(product.averagePrice || 0),
        productName: product.productName || product._id || 'Unknown Product'
      }));
      console.log('Processed products:', processed.topProducts);
    }
    
    // Process cashier sales - ensure formatted values exist
    if (processed.cashierSales && processed.cashierSales.length > 0) {
      processed.cashierSales = processed.cashierSales.map(cashier => ({
        ...cashier,
        formattedRevenue: cashier.formattedRevenue || formatCurrency(cashier.totalRevenue || 0),
        formattedAverageTransactionValue: cashier.formattedAverageTransactionValue || 
          formatCurrency(cashier.averageTransactionValue || 0),
        cashierName: cashier.cashierName || cashier._id || 'Unknown Cashier'
      }));
      console.log('Processed cashiers:', processed.cashierSales);
    }
    
    console.log('Final processed data:', processed);
    return processed;
  };

  // Fetch additional data for specific tabs
  const fetchAdditionalData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'payments') {
        console.log('Fetching additional payment data...');
        
        const [cashResponse, posResponse, paymentMethodsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/analytics/${period}/combined-cash`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error('Error fetching cash data:', err);
            return { data: null };
          }),
          axios.get(`${API_BASE_URL}/analytics/${period}/combined-pos`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error('Error fetching POS data:', err);
            return { data: null };
          }),
          axios.get(`${API_BASE_URL}/analytics/${period}/payment-method-analysis`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error('Error fetching payment methods:', err);
            return { data: null };
          })
        ]);

        // FIX: Extract data from nested response structure
        const cashData = cashResponse.data?.combinedCash || cashResponse.data;
        const posData = posResponse.data?.combinedPos || posResponse.data;
        const paymentMethodsData = paymentMethodsResponse.data?.paymentMethods || paymentMethodsResponse.data;

        console.log('Extracted Cash data:', cashData);
        console.log('Extracted POS data:', posData);
        console.log('Extracted Payment methods:', paymentMethodsData);

        setAnalyticsData(prev => {
          const updated = {
            ...prev,
            combinedCash: cashData,
            combinedPos: posData,
            paymentMethods: paymentMethodsData
          };
          
          console.log('Updated analytics data with payment info:', updated);
          
          // Process the additional data - ensure formatted values exist
          if (updated.combinedCash && !updated.combinedCash.formattedTotalCashFromSales) {
            updated.combinedCash.formattedTotalCashFromSales = formatCurrency(updated.combinedCash.totalCashFromSales || 0);
            updated.combinedCash.formattedTotalCashFromServices = formatCurrency(updated.combinedCash.totalCashFromServices || 0);
            updated.combinedCash.formattedTotalCombinedCash = formatCurrency(updated.combinedCash.totalCombinedCash || 0);
          }
          
          // Process POS data - add formatted values if missing
          if (updated.combinedPos && Array.isArray(updated.combinedPos)) {
            updated.combinedPos = updated.combinedPos.map(method => ({
              ...method,
              formattedCombinedTotal: method.formattedCombinedTotal || formatCurrency(method.combinedTotal || 0),
              formattedTotalFromSales: method.formattedTotalFromSales || formatCurrency(method.totalFromSales || 0),
              formattedTotalFromServices: method.formattedTotalFromServices || formatCurrency(method.totalFromServices || 0)
            }));
          }
          
          return updated;
        });
      }
    } catch (error) {
      console.error('Error fetching additional data:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  useEffect(() => {
    if (analyticsData && activeTab === 'payments') {
      fetchAdditionalData();
    }
  }, [activeTab, analyticsData]);

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

  // Refresh data
  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  // Show raw data for debugging
  const showRawData = () => {
    console.log('Current analyticsData:', analyticsData);
    console.log('Raw API response:', rawResponse);
    
    if (rawResponse) {
      alert('Check console for raw data');
    }
  };

  // Loading skeleton
  if (loading && !refreshing) {
    return (
      <div className="p-6">
        <TopNav />
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl p-6 h-32"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-xl p-6 h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <TopNav />
      
      <header className="mb-8 mt-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
      
          </div>
          
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="bg-white rounded-lg shadow-sm p-1 flex flex-wrap gap-1">
              {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  disabled={refreshing}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
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
            <button
              onClick={showRawData}
              className="flex items-center justify-center p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Debug data"
            >
              <Database className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">{error}</p>
              <p className="text-red-600 text-sm mt-1">
                The API is responding but there might be a data format issue. Check console for details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {analyticsData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-700 text-sm">
                Loaded {analyticsData.totalSales?.totalTransactions || 0} transactions for {getPeriodDisplay(period)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-2 sm:space-x-8 min-w-max sm:min-w-0">
          {['overview', 'products', 'cashiers', 'payments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analyticsData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Total Revenue Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs sm:text-sm">Total Revenue</p>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0 ml-2" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {analyticsData.totalSales?.formattedRevenue || formatCurrency(analyticsData.totalSales?.totalRevenue || 0)}
                  </h3>
                  <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs sm:text-sm">
                    <span className="text-gray-600">
                      {formatNumber(analyticsData.totalSales?.totalTransactions || 0)} transactions
                    </span>
                    <span className="text-green-600 font-medium">
                      {getPeriodDisplay(period)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Items Sold Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs sm:text-sm">Items Sold</p>
                    <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0 ml-2" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {formatNumber(analyticsData.totalSales?.totalItemsSold || 0)}
                  </h3>
                  <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs sm:text-sm">
                    <span className="text-gray-600">
                      Avg: {formatNumber(
                        Math.round((analyticsData.totalSales?.totalItemsSold || 0) / 
                        Math.max(analyticsData.totalSales?.totalTransactions || 1, 1))
                      )} per transaction
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Transaction Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs sm:text-sm">Avg. Transaction</p>
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0 ml-2" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {analyticsData.totalSales?.formattedAverageTransaction || 
                     formatCurrency(
                       (analyticsData.totalSales?.totalRevenue || 0) / 
                       Math.max(analyticsData.totalSales?.totalTransactions || 1, 1)
                     )}
                  </h3>
                  <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs sm:text-sm">
                    <span className="text-gray-600">
                      Per transaction
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Cashiers Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs sm:text-sm">Active Cashiers</p>
                    <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0 ml-2" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {formatNumber(analyticsData.cashierSales?.length || 0)}
                  </h3>
                  <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs sm:text-sm">
                    <span className="text-gray-600">
                      {formatNumber(analyticsData.topProducts?.length || 0)} top products
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Summary */}
          {analyticsData.totalSales?.totalTransactions === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-yellow-800">No Transactions Found</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    No sales data found for {getPeriodDisplay(period)}. Try selecting a different period or check if sales have been recorded.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Top Product Quick View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Top Product
                {refreshing && <Loader2 className="h-4 w-4 animate-spin inline ml-2" />}
              </h3>
              {analyticsData.topProducts?.[0] ? (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">
                      {analyticsData.topProducts[0].productName}
                    </span>
                    <span className="text-green-600 font-bold text-sm sm:text-base">
                      {formatNumber(analyticsData.topProducts[0].totalQuantitySold)} sold
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Revenue: {analyticsData.topProducts[0].formattedRevenue || 
                             formatCurrency(analyticsData.topProducts[0].totalRevenue)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {formatNumber(analyticsData.topProducts[0].transactionCount)} transactions
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No sales data available</p>
              )}
            </div>

            {/* Top Cashier Quick View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Top Cashier
                {refreshing && <Loader2 className="h-4 w-4 animate-spin inline ml-2" />}
              </h3>
              {analyticsData.cashierSales?.[0] ? (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">
                      {analyticsData.cashierSales[0].cashierName}
                    </span>
                    <span className="text-blue-600 font-bold text-sm sm:text-base">
                      {analyticsData.cashierSales[0].formattedRevenue || 
                       formatCurrency(analyticsData.cashierSales[0].totalRevenue)}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {formatNumber(analyticsData.cashierSales[0].totalTransactions)} transactions
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {formatNumber(analyticsData.cashierSales[0].totalItemsSold)} items sold
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No cashier data available</p>
              )}
            </div>

            {/* Period Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Period Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">{getPeriodDisplay(period)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-medium">
                    {formatNumber(analyticsData.totalSales?.totalTransactions || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items Sold:</span>
                  <span className="font-medium">
                    {formatNumber(analyticsData.totalSales?.totalItemsSold || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-medium">
                    {formatCurrency(analyticsData.totalSales?.totalRevenue || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && analyticsData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Top Products</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-gray-600">
                Showing {analyticsData.topProducts?.length || 0} products
              </span>
              {refreshing && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>
          
          {analyticsData.topProducts?.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty Sold
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analyticsData.topProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                          <span className="font-medium text-gray-900 text-sm sm:text-base">
                            {product.productName || `Product ${index + 1}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-blue-600 text-sm sm:text-base">
                          {formatNumber(product.totalQuantitySold)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600 text-sm sm:text-base">
                          {product.formattedRevenue || formatCurrency(product.totalRevenue)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm sm:text-base">
                          {product.formattedAveragePrice || formatCurrency(product.averagePrice || 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No product sales data available for this period</p>
            </div>
          )}
        </div>
      )}

      {/* Cashiers Tab */}
      {activeTab === 'cashiers' && analyticsData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Cashier Performance</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-gray-600">
                {formatNumber(analyticsData.cashierSales?.length || 0)} cashiers active
              </span>
              {refreshing && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>
          
          {analyticsData.cashierSales?.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cashier
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Sold
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analyticsData.cashierSales.map((cashier, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-900 text-sm sm:text-base">
                              {cashier.cashierName || `Cashier ${index + 1}`}
                            </div>
                            {cashier.cashierUsername && (
                              <div className="text-xs text-gray-500">
                                @{cashier.cashierUsername}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600 text-sm sm:text-base">
                          {cashier.formattedRevenue || formatCurrency(cashier.totalRevenue)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm sm:text-base">
                          {formatNumber(cashier.totalTransactions)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm sm:text-base">
                          {formatNumber(cashier.totalItemsSold)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No cashier sales data available for this period</p>
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && analyticsData && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Payment Analytics</h2>
              {refreshing && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Combined Cash Analytics */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  Cash Payments
                </h3>
                {analyticsData.combinedCash ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Sales Cash:</span>
                      <span className="font-semibold text-sm sm:text-base">
                        {analyticsData.combinedCash.formattedTotalCashFromSales || 
                         formatCurrency(analyticsData.combinedCash.totalCashFromSales || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Service Cash:</span>
                      <span className="font-semibold text-sm sm:text-base">
                        {analyticsData.combinedCash.formattedTotalCashFromServices || 
                         formatCurrency(analyticsData.combinedCash.totalCashFromServices || 0)}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 font-medium text-sm sm:text-base">Total Cash:</span>
                        <span className="font-bold text-green-600 text-sm sm:text-base">
                          {analyticsData.combinedCash.formattedTotalCombinedCash || 
                           formatCurrency((analyticsData.combinedCash.totalCashFromSales || 0) + 
                           (analyticsData.combinedCash.totalCashFromServices || 0))}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatNumber(analyticsData.combinedCash.totalTransactions || 0)} total transactions
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No cash data available</p>
                  </div>
                )}
              </div>

              {/* POS Analytics */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                  POS & Transfer Totals
                </h3>
                {analyticsData.combinedPos ? (
                  analyticsData.combinedPos.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {analyticsData.combinedPos.map((method, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm sm:text-base">
                            {method.method || `Method ${index + 1}`}:
                          </span>
                          <span className="font-semibold text-sm sm:text-base">
                            {method.formattedCombinedTotal || 
                             formatCurrency(method.combinedTotal || method.totalAmount || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No POS data available</p>
                  )
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Loading POS data...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          {analyticsData.paymentMethods && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">Payment Method Breakdown</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales by Payment Method */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <ShoppingCart className="h-5 w-5 text-green-600 mr-2" />
                    Sales by Payment Method
                  </h3>
                  {analyticsData.paymentMethods.salesByPaymentMethod?.length > 0 ? (
                    <div className="space-y-2">
                      {analyticsData.paymentMethods.salesByPaymentMethod.map((method, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 font-medium">{method._id}:</span>
                          <div className="text-right">
                            <div className="font-semibold text-green-700">
                              {formatCurrency(method.totalAmount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatNumber(method.transactionCount)} transactions
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No sales data</p>
                  )}
                </div>

                {/* POS Services by Payment Method */}
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 text-indigo-600 mr-2" />
                    POS Services
                  </h3>
                  {analyticsData.paymentMethods.posServicesByPaymentMethod?.length > 0 ? (
                    <div className="space-y-2">
                      {analyticsData.paymentMethods.posServicesByPaymentMethod.map((method, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 font-medium">{method._id}:</span>
                          <div className="text-right">
                            <div className="font-semibold text-indigo-700">
                              {formatCurrency(method.totalAmount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Charge: {formatCurrency(method.totalServiceCharge)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatNumber(method.transactionCount)} transactions
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No POS service data</p>
                  )}
                </div>

                {/* Service Charges by Payment Method */}
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 text-amber-600 mr-2" />
                    Service Charges
                  </h3>
                  {analyticsData.paymentMethods.serviceChargesByPaymentMethod?.length > 0 ? (
                    <div className="space-y-2">
                      {analyticsData.paymentMethods.serviceChargesByPaymentMethod.map((method, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 font-medium">{method._id}:</span>
                          <div className="text-right">
                            <div className="font-semibold text-amber-700">
                              {formatCurrency(method.totalServiceCharge)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatNumber(method.transactionCount)} transactions
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No service charge data</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <span>
            Data for {analyticsData?.dateRange?.startDate || 'N/A'} to {analyticsData?.dateRange?.endDate || 'N/A'}
          </span>
          <span className="hidden sm:inline">•</span>
          <span>
            API: sales-system-production.up.railway.app
          </span>
          <span className="hidden sm:inline">•</span>
          <span>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
        {error && (
          <div className="mt-2 text-amber-600 text-xs">
            API is connected but data format may be unexpected
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
