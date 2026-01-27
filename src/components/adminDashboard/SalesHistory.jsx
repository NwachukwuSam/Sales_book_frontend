import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  CreditCard,
  Package,
  Hash,
  DollarSign,
  Clock,
  Eye,
  MoreVertical,
  Loader2,
  FileText
} from 'lucide-react';
import TopNav from '../TopNav';
import { format } from 'date-fns';

const SalesHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  const itemsPerPage = 10;
  const API_URL = 'https://sales-system-production.up.railway.app/api/sales';

  // Filter options
  const filterOptions = [
    { id: 'transaction', label: 'ID', icon: <Hash className="w-3 h-3" /> },
    { id: 'item', label: 'Item', icon: <Package className="w-3 h-3" /> },
    { id: 'quantity', label: 'Qty', icon: <Hash className="w-3 h-3" /> },
    { id: 'total', label: 'Total', icon: <DollarSign className="w-3 h-3" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="w-3 h-3" /> },
    { id: 'user', label: 'User', icon: <User className="w-3 h-3" /> },
    { id: 'date', label: 'Date', icon: <Calendar className="w-3 h-3" /> },
  ];

  // Fetch sales data from API
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage or wherever you store it
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder
      });
      
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${API_URL}/sales-history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSalesData(data.data.sales || []);
        setPagination(data.data.pagination || {
          page: currentPage,
          limit: itemsPerPage,
          total: 0,
          pages: 1
        });
      } else {
        throw new Error(data.message || 'Failed to fetch sales data');
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [currentPage, sortBy, sortOrder, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        fetchSalesData();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFilterToggle = (filterId) => {
    if (selectedFilters.includes(filterId)) {
      setSelectedFilters(selectedFilters.filter(id => id !== filterId));
    } else {
      setSelectedFilters([...selectedFilters, filterId]);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Export to CSV function
  const handleExport = async (format = 'csv') => {
    try {
      setExporting(true);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // If there's an export API endpoint, use it
      try {
        const exportResponse = await fetch(`${API_URL}/export?format=${format}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (exportResponse.ok) {
          const blob = await exportResponse.blob();
          downloadBlob(blob, `sales-history-${format}-${new Date().toISOString().split('T')[0]}.${format}`);
          return;
        }
      } catch (apiErr) {
        console.log('Export API not available, using client-side export');
      }
      
      // Client-side CSV generation
      const csvData = generateCSVData();
      
      // Create CSV content
      const csvContent = arrayToCSV(csvData);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: `text/${format};charset=utf-8;` });
      downloadBlob(blob, `sales-history-${new Date().toISOString().split('T')[0]}.${format}`);
      
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Generate CSV data from sales
  const generateCSVData = () => {
    const headers = [
      'Transaction ID',
      'Date & Time',
      'Items',
      'Quantity',
      'Unit Price',
      'Total Amount',
      'Payment Method',
      'Cashier',
      'Status'
    ];
    
    const rows = salesData.map(sale => {
      // Combine all items into a string
      const itemsList = sale.items?.map(item => 
        `${item.name || 'Unknown Item'} (${item.quantity || 0})`
      ).join('; ') || 'No items';
      
      // Calculate total quantity
      const totalQuantity = sale.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      
      // Get first item's price for reference (or calculate average)
      const unitPrice = sale.items?.length > 0 
        ? sale.items[0].price || 0 
        : sale.totalAmount / Math.max(totalQuantity, 1);
      
      return [
        sale.transactionId || sale._id?.slice(-8).toUpperCase() || 'N/A',
        format(new Date(sale.createdAt || sale.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        itemsList,
        totalQuantity.toString(),
        formatCurrencyValue(unitPrice),
        formatCurrencyValue(sale.totalAmount || 0),
        sale.paymentMethod || 'Unknown',
        sale.soldBy?.name || sale.soldBy?.username || 'Unknown',
        'Completed'
      ];
    });
    
    // Add summary row
    const summary = calculateSummary();
    rows.push([
      '', '', '', '', '', '', '', '', ''
    ]);
    rows.push([
      'SUMMARY', '', '', '', '', '', '', '', ''
    ]);
    rows.push([
      'Total Transactions:', '', summary.transactions.toString(), '', '', '', '', '', ''
    ]);
    rows.push([
      'Today\'s Sales:', '', '', '', '', formatCurrencyValue(summary.today), '', '', ''
    ]);
    rows.push([
      'Total Revenue:', '', '', '', '', formatCurrencyValue(summary.total), '', '', ''
    ]);
    rows.push([
      'Average Sale:', '', '', '', '', formatCurrencyValue(summary.average), '', '', ''
    ]);
    rows.push([
      'Generated:', format(new Date(), 'yyyy-MM-dd HH:mm:ss'), '', '', '', '', '', '', ''
    ]);
    
    return [headers, ...rows];
  };

  // Helper function to convert array to CSV
  const arrayToCSV = (data) => {
    return data.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quotes, or newline
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');
  };

  // Helper function to download blob
  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Format currency value for CSV (without symbol)
  const formatCurrencyValue = (amount) => {
    if (!amount) return '0.00';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
    return num.toFixed(2);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₦0';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
    return `₦${num.toLocaleString('en-NG')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `Today, ${format(date, 'h:mm a')}`;
      } else if (diffDays === 1) {
        return `Yesterday, ${format(date, 'h:mm a')}`;
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (err) {
      return dateString;
    }
  };

  const getPaymentColor = (paymentMethod) => {
    if (!paymentMethod) return 'bg-gray-50 text-gray-700 border border-gray-200';
    if (paymentMethod.includes('Cash')) return 'bg-green-50 text-green-700 border border-green-200';
    if (paymentMethod.includes('POS')) return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (paymentMethod.includes('Transfer')) return 'bg-purple-50 text-purple-700 border border-purple-200';
    return 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getColumnClasses = (columnId) => {
    switch(columnId) {
      case 'transaction': return 'w-24';
      case 'item': return 'min-w-32';
      case 'quantity': return 'w-16';
      case 'total': return 'w-20';
      case 'payment': return 'w-28';
      case 'user': return 'w-20';
      case 'date': return 'w-28';
      default: return '';
    }
  };

  const calculateSummary = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = salesData.filter(sale => {
      const saleDate = new Date(sale.createdAt || sale.timestamp);
      return saleDate >= today;
    }).reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    
    const totalSales = salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    
    return {
      transactions: salesData.length,
      today: todaySales,
      total: totalSales,
      average: salesData.length > 0 ? totalSales / salesData.length : 0
    };
  };

  const summary = calculateSummary();

  // Export dropdown component
  const ExportDropdown = () => (
    <div className="relative">
      <button
        disabled={exporting || salesData.length === 0}
        onClick={() => document.getElementById('export-dropdown').classList.toggle('hidden')}
        className="flex items-center space-x-1 px-2 py-1.5 md:px-3 md:py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs md:text-sm disabled:opacity-50"
      >
        {exporting ? (
          <>
            <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
          </>
        )}
      </button>
      
      <div
        id="export-dropdown"
        className="hidden absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
      >
        <div className="py-1">
          <button
            onClick={() => {
              handleExport('csv');
              document.getElementById('export-dropdown').classList.add('hidden');
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export as CSV
          </button>
          <button
            onClick={() => {
              exportToPDF();
              document.getElementById('export-dropdown').classList.add('hidden');
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );

  const exportToPDF = () => {
    
    const printContent = `
      <html>
        <head>
          <title>Sales History Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; color: #666; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .summary-item { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .summary-title { font-size: 12px; color: #666; margin-bottom: 5px; }
            .summary-value { font-size: 18px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f3f4f6; text-align: left; padding: 8px; border: 1px solid #ddd; font-size: 12px; }
            td { padding: 8px; border: 1px solid #ddd; font-size: 12px; }
            .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #333; font-size: 12px; color: #666; text-align: center; }
            @media print {
              @page { margin: 0.5in; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sales History Report</h1>
            <p>Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
            <p>Total Records: ${salesData.length}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-title">Total Transactions</div>
              <div class="summary-value">${summary.transactions}</div>
            </div>
            <div class="summary-item">
              <div class="summary-title">Today's Sales</div>
              <div class="summary-value">${formatCurrency(summary.today)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-title">Average Sale</div>
              <div class="summary-value">${formatCurrency(summary.average)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-title">Total Revenue</div>
              <div class="summary-value">${formatCurrency(summary.total)}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Qty</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Cashier</th>
              </tr>
            </thead>
            <tbody>
              ${salesData.map(sale => {
                const itemsList = sale.items?.map(item => 
                  `${item.name || 'Unknown Item'} (${item.quantity || 0})`
                ).join(', ') || 'No items';
                const totalQuantity = sale.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                
                return `
                  <tr>
                    <td>${sale.transactionId || sale._id?.slice(-8).toUpperCase() || 'N/A'}</td>
                    <td>${format(new Date(sale.createdAt || sale.timestamp), 'yyyy-MM-dd HH:mm')}</td>
                    <td>${itemsList}</td>
                    <td>${totalQuantity}</td>
                    <td>${formatCurrency(sale.totalAmount || 0)}</td>
                    <td>${sale.paymentMethod || 'Unknown'}</td>
                    <td>${sale.soldBy?.name || sale.soldBy?.username || 'Unknown'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Report generated by Sales System</p>
            <p>Page 1 of 1</p>
          </div>
        </body>
      </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (loading && salesData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading sales history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4 lg:p-6">
      <TopNav />
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
             
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {error ? 'Using demo data' : `${pagination.total} transactions found`}
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-5">
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center space-x-1 px-2 py-1.5 md:px-3 md:py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-xs md:text-sm"
              >
                <Filter className="w-3 h-3 md:w-4 md:h-4" />
                <span>Filters</span>
              </button>
              
              <ExportDropdown />
            </div>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by transaction ID, item, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
               {error}. Showing demo data.
            </p>
          </div>
        )}

        {/* Filter Panel */}
        {filterOpen && (
          <div className="mb-4 bg-white rounded border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Show columns:</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedFilters(filterOptions.map(f => f.id))}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  All
                </button>
                <button 
                  onClick={() => setSelectedFilters([])}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  None
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterToggle(filter.id)}
                  className={`
                    flex items-center space-x-1 px-2 py-1 rounded border text-xs transition-colors
                    ${selectedFilters.includes(filter.id)
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && salesData.length > 0 && (
          <div className="mb-4 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Updating...</span>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {filterOptions.map((filter) => (
                    <th 
                      key={filter.id}
                      className={`px-3 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${getColumnClasses(filter.id)}`}
                      onClick={() => handleSort(filter.id)}
                    >
                      <div className="flex items-center space-x-1">
                        {filter.icon}
                        <span className="text-xs">{filter.label}</span>
                        {sortBy === filter.id && (
                          <ChevronDown className={`w-3 h-3 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-3 py-8 text-center">
                      <div className="text-gray-500">No sales records found</div>
                    </td>
                  </tr>
                ) : (
                  salesData.map((sale) => (
                    <tr key={sale._id || sale.transactionId} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 text-xs">
                            {sale.transactionId || sale._id?.slice(-6)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                          <div className="flex flex-col">
                            {sale.items?.map ((item, index) => (
                              <div key={index} className="flex items-center justify-between mb-1 last:mb-0">
                                <span className="text-gray-900 text-xs truncate max-w-[100px]">
                                  {item.name}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">
                                  x{item.quantity}
                                </span>
                              </div>
                            )) || 'No items'}
                          </div>
                        </td>

                        {/* Quantity Cell - Show total quantity */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {sale.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                          </span>
                        </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="font-semibold text-gray-900 text-xs">
                          {formatCurrency(sale.totalAmount)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentColor(sale.paymentMethod)}`}>
                          {sale.paymentMethod || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-gray-900 text-xs">
                            {sale.soldBy?.name || sale.soldBy?.username || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-gray-900 text-xs">
                            {formatDate(sale.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs">
                        <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tablet View */}
        <div className="hidden md:block lg:hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-2 py-6 text-center">
                      <div className="text-gray-500">No sales records found</div>
                    </td>
                  </tr>
                ) : (
                  salesData.map((sale) => (
                    <tr key={sale._id || sale.transactionId} className="hover:bg-gray-50">
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          {sale.transactionId?.slice(-6) || sale._id?.slice(-6)}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <span className="text-gray-900 truncate block max-w-[100px]">
                          {sale.item?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded font-medium bg-blue-50 text-blue-700">
                          {sale.quantity || 0}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(sale.totalAmount)}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium ${getPaymentColor(sale.paymentMethod)}`}>
                          {sale.paymentMethod?.split('-')[0] || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="text-gray-900">
                          {formatDate(sale.createdAt)?.split(',')[0]}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-2">
          {salesData.length === 0 ? (
            <div className="bg-white rounded border border-gray-200 p-6 text-center">
              <div className="text-gray-500">No sales records found</div>
            </div>
          ) : (
            salesData.map((sale) => (
              <div key={sale._id || sale.transactionId} className="bg-white rounded border border-gray-200 p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center space-x-1 mb-0.5">
                      <span className="font-medium text-gray-900 text-xs">
                        {sale.transactionId?.slice(-6) || sale._id?.slice(-6)}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-600">
                        {formatDate(sale.createdAt)}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 block truncate">
                      {sale.item?.name || 'Unknown Item'}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${getPaymentColor(sale.paymentMethod)}`}>
                    {sale.paymentMethod?.includes('Cash') ? 'Cash' : sale.paymentMethod?.includes('POS') ? 'POS' : 'Transfer'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {sale.soldBy?.name || sale.soldBy?.username || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                        {sale.quantity || 0} pcs
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(sale.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{pagination.pages}</span>
              {pagination.total > 0 && (
                <span className="ml-2">
                  ({pagination.total} total records)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1.5 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Prev
              </button>
              
              <div className="flex space-x-1">
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded text-xs ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {pagination.pages > 5 && (
                  <span className="px-2 flex items-center text-xs">...</span>
                )}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="px-2 py-1.5 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-lg md:text-xl font-bold text-gray-900">
              {summary.transactions}
            </div>
            <div className="text-xs text-gray-600">Transactions</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-lg md:text-xl font-bold text-green-600">
              {formatCurrency(summary.today)}
            </div>
            <div className="text-xs text-gray-600">Today</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-lg md:text-xl font-bold text-blue-600">
              {formatCurrency(summary.average)}
            </div>
            <div className="text-xs text-gray-600">Average Sale</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-lg md:text-xl font-bold text-purple-600">
              {formatCurrency(summary.total)}
            </div>
            <div className="text-xs text-gray-600">Total Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;