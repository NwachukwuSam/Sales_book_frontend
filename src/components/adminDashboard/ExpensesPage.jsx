 import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Calendar,
  Tag,
  FileText,
  Trash2,
  Edit2,
  Search,
  Filter,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  ChevronDown,
  CreditCard,
  Building,
  FileDigit,
  Phone,
  Upload,
  User,
  Briefcase,
  Clock,
  Eye,
  BarChart3,
  Info,
  AlertTriangle
} from 'lucide-react';
import TopNav from '../TopNav';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ callback: null, message: '', title: '' });
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [statistics, setStatistics] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  const [formData, setFormData] = useState({
    expenseType: '',
    amount: '',
    description: '',
    paymentMethod: 'Cash',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    vendorName: '',
    vendorContact: '',
    department: 'General',
    notes: '',
    isRecurring: false,
    recurrence: {
      frequency: '',
      nextDue: '',
      endDate: ''
    }
  });

  // API Configuration
  const API_BASE_URL = 'https://sales-system-production.up.railway.app/api';
  const EXPENSES_API = `${API_BASE_URL}/expenses`;

  // Constants from backend schema
  const expenseTypes = [
    'Rent',
    'Salaries',
    'Utilities',
    'Office Supplies',
    'Maintenance',
    'Marketing',
    'Transportation',
    'Food & Entertainment',
    'Insurance',
    'Taxes',
    'Software',
    'Equipment',
    'Other'
  ];

  const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'POS', 'Online Transfer', 'Other'];
  const departments = ['Administration', 'Sales', 'Operations', 'Finance', 'Marketing', 'IT', 'General'];
  const statuses = ['Pending', 'Approved', 'Rejected', 'Paid'];
  const recurrenceFrequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];

  // Show notification
  const showAlert = (message, type = 'info') => {
    setNotification({ type, message });
    setShowNotification(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  // Show confirmation modal
  const showConfirmation = (title, message, callback) => {
    setConfirmAction({
      title,
      message,
      callback
    });
    setShowConfirmModal(true);
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (confirmAction.callback) {
      confirmAction.callback();
    }
    setShowConfirmModal(false);
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-NG', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (err) {
      return dateString;
    }
  };

  // Format datetime
  const formatDateTime = (dateString) => {
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

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Approved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border border-red-200';
      case 'Paid': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Rent': 'bg-purple-100 text-purple-800 border border-purple-200',
      'Salaries': 'bg-green-100 text-green-800 border border-green-200',
      'Utilities': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Office Supplies': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'Maintenance': 'bg-red-100 text-red-800 border border-red-200',
      'Marketing': 'bg-pink-100 text-pink-800 border border-pink-200',
      'Transportation': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'Food & Entertainment': 'bg-orange-100 text-orange-800 border border-orange-200',
      'Insurance': 'bg-teal-100 text-teal-800 border border-teal-200',
      'Taxes': 'bg-gray-100 text-gray-800 border border-gray-200',
      'Software': 'bg-cyan-100 text-cyan-800 border border-cyan-200',
      'Equipment': 'bg-amber-100 text-amber-800 border border-amber-200',
      'Other': 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // Get payment method color
  const getPaymentMethodColor = (method) => {
    switch(method) {
      case 'Cash': return 'bg-green-50 text-green-700 border border-green-200';
      case 'Bank Transfer': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'POS': return 'bg-purple-50 text-purple-700 border border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterCategory !== 'all') params.append('expenseType', filterCategory);
      if (filterDepartment !== 'all') params.append('department', filterDepartment);
      if (searchQuery) params.append('search', searchQuery);

      const url = `${EXPENSES_API}?${params.toString()}`;
      
      const response = await fetch(url, {
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
        setExpenses(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
      showAlert('Failed to load expenses. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) return;

      const response = await fetch(`${EXPENSES_API}/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStatistics(data.statistics);
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch recurring expenses
  const fetchRecurringExpenses = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) return [];

      const response = await fetch(`${EXPENSES_API}/recurring`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.success ? data.expenses : [];
      }
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
      showAlert('Failed to load recurring expenses.', 'error');
      return [];
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchStatistics();
  }, [filterStatus, filterCategory, filterDepartment, searchQuery]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('recurrence.')) {
      const recurrenceField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        recurrence: {
          ...prev.recurrence,
          [recurrenceField]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.expenseType || !formData.amount || !formData.description || !formData.paymentMethod) {
      showAlert('Please fill in all required fields', 'warning');
      return;
    }

    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      showAlert('Please enter a valid amount', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        expenseDate: formData.expenseDate || new Date().toISOString().split('T')[0]
      };

      // Clean up recurrence if not recurring
      if (!payload.isRecurring) {
        delete payload.recurrence;
      }

      const url = editingExpense 
        ? `${EXPENSES_API}/${editingExpense.expenseId || editingExpense._id}` 
        : formData.isRecurring 
          ? `${EXPENSES_API}/recurring`
          : EXPENSES_API;

      const method = editingExpense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save expense');
      }

      // Refresh data
      await fetchExpenses();
      await fetchStatistics();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      setEditingExpense(null);
      
      showAlert(data.message || 'Expense saved successfully!', 'success');

    } catch (error) {
      console.error('Error saving expense:', error);
      showAlert(error.message || 'Failed to save expense. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      expenseType: expense.expenseType,
      amount: expense.amount.toString(),
      description: expense.description,
      paymentMethod: expense.paymentMethod,
      expenseDate: expense.expenseDate.split('T')[0],
      receiptNumber: expense.receiptNumber || '',
      vendorName: expense.vendorName || '',
      vendorContact: expense.vendorContact || '',
      department: expense.department || 'General',
      notes: expense.notes || '',
      isRecurring: expense.isRecurring || false,
      recurrence: expense.recurrence || {
        frequency: '',
        nextDue: '',
        endDate: ''
      }
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (expenseId) => {
    showConfirmation(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      async () => {
        try {
          const token = getAuthToken();
          
          const response = await fetch(`${EXPENSES_API}/${expenseId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to delete expense');
          }

          await fetchExpenses();
          await fetchStatistics();
          
          showAlert('Expense deleted successfully!', 'success');

        } catch (error) {
          console.error('Error deleting expense:', error);
          showAlert(error.message || 'Failed to delete expense. Please try again.', 'error');
        }
      }
    );
  };

  // Handle status change (approve/reject/pay)
  const handleStatusChange = async (expenseId, action) => {
    let title, message, actionText;
    
    switch(action) {
      case 'approve':
        title = 'Approve Expense';
        message = 'Are you sure you want to approve this expense?';
        actionText = 'approve';
        break;
      case 'pay':
        title = 'Mark as Paid';
        message = 'Are you sure you want to mark this expense as paid?';
        actionText = 'mark as paid';
        break;
      case 'reject':
        title = 'Reject Expense';
        message = 'Are you sure you want to reject this expense?';
        actionText = 'reject';
        break;
      default:
        return;
    }
    
    showConfirmation(title, message, async () => {
      try {
        const token = getAuthToken();
        let url;
        
        switch(action) {
          case 'approve':
            url = `${EXPENSES_API}/${expenseId}/approve`;
            break;
          case 'pay':
            url = `${EXPENSES_API}/${expenseId}/pay`;
            break;
          case 'reject':
            url = `${EXPENSES_API}/${expenseId}/reject`;
            break;
          default:
            return;
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || `Failed to ${action} expense`);
        }
        
        await fetchExpenses();
        await fetchStatistics();
        
        showAlert(`Expense ${actionText} successfully!`, 'success');
        
      } catch (error) {
        console.error(`Error ${action}ing expense:`, error);
        showAlert(error.message || `Failed to ${action} expense. Please try again.`, 'error');
      }
    });
  };

  // Handle export
  const handleExport = async () => {
    try {
      setExporting(true);
      const token = getAuthToken();
      
      const response = await fetch(`${EXPENSES_API}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showAlert('Export completed successfully!', 'success');
      
    } catch (error) {
      console.error('Export error:', error);
      showAlert('Failed to export expenses. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      expenseType: '',
      amount: '',
      description: '',
      paymentMethod: 'Cash',
      expenseDate: new Date().toISOString().split('T')[0],
      receiptNumber: '',
      vendorName: '',
      vendorContact: '',
      department: 'General',
      notes: '',
      isRecurring: false,
      recurrence: {
        frequency: '',
        nextDue: '',
        endDate: ''
      }
    });
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    resetForm();
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        expense.description.toLowerCase().includes(searchLower) ||
        expense.expenseId.toLowerCase().includes(searchLower) ||
        expense.vendorName?.toLowerCase().includes(searchLower) ||
        expense.receiptNumber?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Calculate totals
  const calculateTotals = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const todayExpenses = filteredExpenses.filter(exp => {
      const expDate = new Date(exp.expenseDate);
      expDate.setHours(0, 0, 0, 0);
      return expDate.getTime() === today.getTime();
    }).reduce((sum, exp) => sum + exp.amount, 0);

    const monthExpenses = filteredExpenses.filter(exp => {
      const expDate = new Date(exp.expenseDate);
      return expDate >= thisMonth;
    }).reduce((sum, exp) => sum + exp.amount, 0);

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return {
      today: todayExpenses,
      month: monthExpenses,
      total: totalExpenses,
      count: filteredExpenses.length
    };
  };

  const totals = calculateTotals();

  if (loading && expenses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading expenses...</span>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Expenses Management</h1>
              <p className="text-gray-600 mt-2">Track, approve, and manage all business expenses</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Statistics</span>
              </button>
              
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">Today's Expenses</p>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totals.today)}</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">This Month</p>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totals.month)}</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">Total Expenses</p>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(totals.total)}</h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">Total Records</p>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{totals.count}</h3>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search expenses by ID, description, vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {expenseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Department Filter */}
            <div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={exporting || expenses.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>Export CSV</span>
              </button>
              
              <button
                onClick={() => setShowRecurring(true)}
                className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Clock className="w-5 h-5" />
                <span>Recurring</span>
              </button>
              
              <button
                onClick={fetchExpenses}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expense ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category & Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount & Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No expenses found</p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700"
                      >
                        Add your first expense
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {expense.expenseId}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(expense.createdAt)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 mb-1">
                            {expense.description}
                          </span>
                          {expense.vendorName && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="w-3 h-3 mr-1" />
                              <span>{expense.vendorName}</span>
                              {expense.receiptNumber && (
                                <>
                                  <span className="mx-2">•</span>
                                  <FileDigit className="w-3 h-3 mr-1" />
                                  <span>{expense.receiptNumber}</span>
                                </>
                              )}
                            </div>
                          )}
                          {expense.notes && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {expense.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.expenseType)}`}>
                            <Tag className="w-3 h-3 mr-1" />
                            {expense.expenseType}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {expense.department}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${getPaymentMethodColor(expense.paymentMethod)}`}>
                            <CreditCard className="w-3 h-3 mr-1" />
                            {expense.paymentMethod}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {expense.status === 'Approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {expense.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                          {expense.status === 'Rejected' && <X className="w-3 h-3 mr-1" />}
                          {expense.status === 'Paid' && <DollarSign className="w-3 h-3 mr-1" />}
                          {expense.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          {expense.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(expense.expenseId, 'approve')}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(expense.expenseId, 'reject')}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {expense.status === 'Approved' && (
                            <button
                              onClick={() => handleStatusChange(expense.expenseId, 'pay')}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Mark as Paid"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          
                          {!['Approved', 'Paid'].includes(expense.status) && (
                            <button
                              onClick={() => handleDelete(expense.expenseId)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ExpenseFormModal
          formData={formData}
          editingExpense={editingExpense}
          submitting={submitting}
          expenseTypes={expenseTypes}
          paymentMethods={paymentMethods}
          departments={departments}
          recurrenceFrequencies={recurrenceFrequencies}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleCloseModal={handleCloseModal}
        />
      )}

      {/* Statistics Modal */}
      {showStats && statistics && (
        <StatisticsModal
          statistics={statistics}
          getCategoryColor={getCategoryColor}
          getStatusColor={getStatusColor}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Recurring Expenses Modal */}
      {showRecurring && (
        <RecurringExpensesModal
          onClose={() => setShowRecurring(false)}
          fetchRecurringExpenses={fetchRecurringExpenses}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          showAlert={showAlert}
        />
      )}

      {/* Notification Modal */}
      {showNotification && (
        <NotificationModal
          type={notification.type}
          message={notification.message}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmationModal
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
};

// Expense Form Modal Component
const ExpenseFormModal = ({
  formData,
  editingExpense,
  submitting,
  expenseTypes,
  paymentMethods,
  departments,
  recurrenceFrequencies,
  handleInputChange,
  handleSubmit,
  handleCloseModal
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        <button
          onClick={handleCloseModal}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Expense Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Type *
              </label>
              <select
                name="expenseType"
                value={formData.expenseType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select type</option>
                {expenseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₦) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Detailed description of the expense..."
                required
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Date *
              </label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Vendor Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name
                </label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleInputChange}
                  placeholder="Vendor name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Number
                </label>
                <input
                  type="text"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleInputChange}
                  placeholder="Receipt #"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Vendor Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Contact
              </label>
              <input
                type="text"
                name="vendorContact"
                value={formData.vendorContact}
                onChange={handleInputChange}
                placeholder="Phone or email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes..."
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Recurring Expense */}
            <div className="border-t pt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  This is a recurring expense
                </span>
              </label>

              {formData.isRecurring && (
                <div className="mt-4 space-y-3 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Frequency *
                      </label>
                      <select
                        name="recurrence.frequency"
                        value={formData.recurrence.frequency}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select frequency</option>
                        {recurrenceFrequencies.map(freq => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Next Due *
                      </label>
                      <input
                        type="date"
                        name="recurrence.nextDue"
                        value={formData.recurrence.nextDue}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="recurrence.endDate"
                      value={formData.recurrence.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t">
          <button
            type="button"
            onClick={handleCloseModal}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : editingExpense ? (
              'Update Expense'
            ) : (
              'Add Expense'
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// Statistics Modal Component
const StatisticsModal = ({ statistics, getCategoryColor, getStatusColor, formatCurrency, formatDate, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Expenses Statistics</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Overall Statistics */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Expenses</span>
              <span className="text-2xl font-bold text-gray-800">
                {formatCurrency(statistics.totalAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Number of Expenses</span>
              <span className="text-2xl font-bold text-gray-800">
                {statistics.totalCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Expense</span>
              <span className="text-2xl font-bold text-gray-800">
                {formatCurrency(statistics.averageAmount || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <div className="text-right">
                <div className="text-xl font-bold text-yellow-600">
                  {statistics.pendingCount || 0}
                </div>
                <div className="text-sm text-gray-500">
                  {formatCurrency(statistics.pendingAmount || 0)}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved</span>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">
                  {statistics.approvedCount || 0}
                </div>
                <div className="text-sm text-gray-500">
                  {formatCurrency(statistics.approvedAmount || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Expenses */}
      {statistics.topExpenses && statistics.topExpenses.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Highest Expenses</h3>
          <div className="space-y-3">
            {statistics.topExpenses.map((expense, index) => (
              <div key={expense._id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {expense.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {expense.expenseId} • {formatDate(expense.expenseDate)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </div>
                  <div className={`text-xs ${getStatusColor(expense.status)} px-2 py-1 rounded-full`}>
                    {expense.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses by Type */}
      {statistics.expensesByType && statistics.expensesByType.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Type</h3>
          <div className="space-y-3">
            {statistics.expensesByType.map((type) => (
              <div key={type._id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(type._id)}`}>
                    {type._id}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatCurrency(type.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {type.count} expenses
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Recurring Expenses Modal Component
const RecurringExpensesModal = ({ onClose, fetchRecurringExpenses, formatCurrency, formatDate, showAlert }) => {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecurringExpenses = async () => {
      setLoading(true);
      try {
        const expenses = await fetchRecurringExpenses();
        setRecurringExpenses(expenses);
      } catch (error) {
        console.error('Error loading recurring expenses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRecurringExpenses();
  }, [fetchRecurringExpenses]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recurring Expenses</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading recurring expenses...</span>
          </div>
        ) : recurringExpenses.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recurring expenses found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recurringExpenses.map((expense) => (
              <div key={expense._id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{expense.description}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <span className="mr-3">
                        <span className="font-medium">Type:</span> {expense.expenseType}
                      </span>
                      <span className="mr-3">
                        <span className="font-medium">Amount:</span> {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-600 border border-blue-300`}>
                    {expense.recurrence?.frequency || 'Recurring'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center mt-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Next due: {formatDate(expense.recurrence?.nextDue)}</span>
                    {expense.recurrence?.endDate && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Ends: {formatDate(expense.recurrence.endDate)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Notification Modal Component
const NotificationModal = ({ type, message, onClose }) => {
  const getIcon = () => {
    switch(type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch(type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch(type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4 max-w-md`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600">{message}</p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;