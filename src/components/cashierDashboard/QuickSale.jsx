import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  X, 
  ShoppingCart, 
  Search, 
  CreditCard, 
  DollarSign,
  Calculator,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  BarChart3,
  Package,
  Save,
  AlertTriangle,
  Info,
  CheckCircle,
  Printer,
  Download,
  Mail,
  User
} from 'lucide-react';
import CashierTopNav from '../cashierDashboard/CashierTopNav.jsx';
import axios from 'axios';

const API_BASE_URL = 'https://sales-system-production.up.railway.app/api';

// Printable Receipt Component
const PrintableReceipt = ({ data }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₦0.00';
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="printable-receipt bg-white p-8 max-w-md mx-auto">
      {/* Receipt Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Springcore Africa POS</h1>
        <p className="text-gray-600 text-sm">Main Branch, Lagos</p>
        <p className="text-gray-600 text-sm">Tel: 01-2345678 | Email: info@springcore.africa</p>
      </div>
      
      <div className="border-t border-b border-gray-300 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-800">RECEIPT</p>
            <p className="text-sm text-gray-600">#{data.transactionId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{data.date}</p>
            <p className="text-xs text-gray-500">Printed: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Customer & Cashier Info */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">CASHIER</p>
          <p className="text-gray-800">{data.cashier}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">CUSTOMER</p>
          <p className="text-gray-800">{data.customer}</p>
        </div>
      </div>
      
      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 text-sm font-medium text-gray-600">ITEM</th>
              <th className="text-center py-2 text-sm font-medium text-gray-600">QTY</th>
              <th className="text-right py-2 text-sm font-medium text-gray-600">PRICE</th>
              <th className="text-right py-2 text-sm font-medium text-gray-600">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3">
                  <div className="text-sm text-gray-800">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </td>
                <td className="text-center py-3 text-sm text-gray-800">{item.quantity}</td>
                <td className="text-right py-3 text-sm text-gray-800">{formatCurrency(item.price)}</td>
                <td className="text-right py-3 text-sm text-gray-800 font-medium">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals */}
      <div className="mb-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(data.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (5% VAT)</span>
            <span className="font-medium">{formatCurrency(data.tax)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-red-600">-{formatCurrency(data.discount)}</span>
            </div>
          )}
          <div className="border-t border-gray-300 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">TOTAL</span>
              <span className="font-bold text-xl text-gray-800">{formatCurrency(data.total)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-2">PAYMENT INFORMATION</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Method</p>
            <p className="font-medium">{data.paymentMethod}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount Paid</p>
            <p className="font-medium">{formatCurrency(data.amountPaid)}</p>
          </div>
          {data.changeDue > 0 && (
            <div>
              <p className="text-sm text-gray-600">Change Due</p>
              <p className="font-medium text-green-600">{formatCurrency(data.changeDue)}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-300">
        <p className="text-gray-600 text-sm mb-2">Thank you for your business!</p>
        <p className="text-gray-500 text-xs">This receipt is computer generated and does not require a signature</p>
        <div className="mt-4 flex justify-center space-x-4 text-xs text-gray-500">
          <span>📍 Visit: www.springcore.africa</span>
          <span>📧 Email: support@springcore.africa</span>
          <span>📱 Tel: 01-2345678</span>
        </div>
        <div className="mt-4 text-xs text-gray-400">
          Receipt ID: {data.transactionId} | Printed at: {new Date().toLocaleString()}
        </div>
      </div>
      
      <style jsx>{`
        @media print {
          .printable-receipt {
            max-width: 80mm !important;
            padding: 16px !important;
            font-size: 12px !important;
            font-family: 'Courier New', monospace !important;
          }
          h1 { font-size: 18px !important; }
          h2, h3 { font-size: 14px !important; }
          .text-xl { font-size: 16px !important; }
          .text-2xl { font-size: 18px !important; }
          .text-sm { font-size: 10px !important; }
          .text-xs { font-size: 8px !important; }
          .p-8 { padding: 16px !important; }
          .mb-6 { margin-bottom: 12px !important; }
          .py-3 { padding-top: 6px !important; padding-bottom: 6px !important; }
          .bg-gray-50 { background: #f9fafb !important; }
          .rounded-lg { border-radius: 4px !important; }
        }
      `}</style>
    </div>
  );
};

const QuickSale = () => {
  // State for products and inventory
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for cart
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('amount'); // 'amount' or 'percentage'
  const [total, setTotal] = useState(0);
  
  // State for payment
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [changeDue, setChangeDue] = useState(0);
  const [notes, setNotes] = useState('');
  
  // State for transaction
  const [processingSale, setProcessingSale] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState(false);
  const [saleError, setSaleError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  // State for quick actions
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [showNotesForm, setShowNotesForm] = useState(false);
  
  // State for receipt
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // State for modal
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'info', 'warning', 'success', 'confirm', 'error'
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    showPrintOption: false
  });

  const searchInputRef = useRef(null);

  // Payment method options
  const paymentMethods = [
    { id: 'Cash', name: 'Cash', icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { id: 'Pos-Parallex', name: 'Pos-Parallex', icon: CreditCard, color: 'bg-blue-100 text-blue-600' },
    { id: 'Pos-Opay', name: 'Pos-Opay', icon: CreditCard, color: 'bg-purple-100 text-purple-600' },
    { id: 'Transfer-Parallex', name: 'Transfer Parallex', icon: CreditCard, color: 'bg-blue-100 text-blue-600' },
    { id: 'Transfer-Opay', name: 'Transfer Opay', icon: CreditCard, color: 'bg-purple-100 text-purple-600' }
  ];

  // Modal functions
  const showModal = ({ type, title, message, onConfirm = null, onCancel = null, showPrintOption = false }) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      onCancel,
      showPrintOption
    });
  };

  const hideModal = () => {
    setModal({
      isOpen: false,
      type: '',
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
      showPrintOption: false
    });
  };

  const showAlert = (title, message, type = 'info') => {
    showModal({ type, title, message });
  };

  const showConfirm = (title, message, onConfirm) => {
    showModal({
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        onConfirm();
        hideModal();
      },
      onCancel: hideModal
    });
  };

  // Get modal icon based on type
  const getModalIcon = () => {
    switch (modal.type) {
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'confirm':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  // Get modal button colors
  const getModalButtonColors = () => {
    switch (modal.type) {
      case 'warning':
        return {
          confirm: 'bg-yellow-600 hover:bg-yellow-700',
          cancel: 'bg-gray-200 hover:bg-gray-300'
        };
      case 'error':
        return {
          confirm: 'bg-red-600 hover:bg-red-700',
          cancel: 'bg-gray-200 hover:bg-gray-300'
        };
      case 'success':
        return {
          confirm: 'bg-green-600 hover:bg-green-700',
          cancel: 'bg-gray-200 hover:bg-gray-300'
        };
      case 'confirm':
        return {
          confirm: 'bg-blue-600 hover:bg-blue-700',
          cancel: 'bg-gray-200 hover:bg-gray-300'
        };
      default:
        return {
          confirm: 'bg-blue-600 hover:bg-blue-700',
          cancel: 'bg-gray-200 hover:bg-gray-300'
        };
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/inventory`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const productsData = response.data.items || [];
      
      // Filter only available products (quantity > 0)
      const availableProducts = productsData
        .filter(product => product && product.quantity > 0)
        .map(product => ({
          ...product,
          sellingPrice: product.sellingPrice || 0,
          name: product.name || 'Unnamed Product',
          description: product.description || '',
          category: product.category || 'Uncategorized'
        }));
      
      setProducts(availableProducts);
      setFilteredProducts(availableProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      showAlert('Error', 'Failed to load products. Please check your connection.', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Calculate cart totals
  useEffect(() => {
    const newSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(newSubtotal);
    
    // Calculate tax (5% VAT)
    const newTax = 0.0 + 0.0;
    setTax(newTax);
    
    // Calculate discount
    let newDiscount = 0;
    if (discountType === 'amount') {
      newDiscount = parseFloat(discount) || 0;
    } else {
      newDiscount = (newSubtotal * (parseFloat(discount) || 0)) / 100;
    }
    
    // Calculate total
    const newTotal = newSubtotal + newTax - newDiscount;
    setTotal(newTotal);
    
    // Calculate change due
    const paid = parseFloat(amountPaid) || 0;
    setChangeDue(paid - newTotal);
    
  }, [cart, discount, discountType, amountPaid]);

  // Add product to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      // Check if we have enough stock
      if (existingItem.quantity + 1 > product.quantity) {
        showAlert('Stock Limit', `Only ${product.quantity} units available in stock`, 'warning');
        return;
      }
      
      setCart(cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Check if we have stock
      if (product.quantity < 1) {
        showAlert('Out of Stock', 'This product is out of stock', 'warning');
        return;
      }
      
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
          price: product.sellingPrice
        }
      ]);
    }
    
    // Clear search
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    // Find the product in inventory to check stock
    const product = products.find(p => p._id === productId);
    if (product && newQuantity > product.quantity) {
      showAlert('Stock Limit', `Only ${product.quantity} units available in stock`, 'warning');
      return;
    }
    
    setCart(cart.map(item =>
      item._id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Handle discount change
  const handleDiscountChange = (value) => {
    if (discountType === 'percentage') {
      if (value > 100) value = 100;
      if (value < 0) value = 0;
    }
    setDiscount(value);
  };

  // Clear cart
  const clearCart = () => {
    if (cart.length === 0) return;
    
    showConfirm(
      'Clear Cart',
      'Are you sure you want to clear all items from the cart?',
      () => {
        setCart([]);
        setDiscount(0);
        setPaymentMethod('Cash');
        setAmountPaid('');
        setNotes('');
        setSaleError('');
        setCustomerInfo({ name: '', email: '', phone: '' });
      }
    );
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

  // Quick add amount
  const quickAddAmount = (amount) => {
    const current = parseFloat(amountPaid) || 0;
    setAmountPaid((current + amount).toString());
  };

  // Focus search on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Calculate average item price
  const calculateAveragePrice = () => {
    if (cart.length === 0) return 0;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    return totalItems > 0 ? subtotal / totalItems : 0;
  };

  // Print receipt
  const printReceipt = () => {
    if (!receiptData) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receiptData.transactionId}</title>
          <style>
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Courier New', monospace; 
                font-size: 12px;
                background: white !important;
                color: black !important;
              }
              .no-print { display: none !important; }
              * {
                box-shadow: none !important;
                border-color: #000 !important;
              }
            }
            @media screen {
              body { 
                padding: 20px; 
                background: #f5f5f5; 
                font-family: Arial, sans-serif;
              }
            }
          </style>
        </head>
        <body>
          <div id="receipt-content"></div>
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Receipt
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; margin-left: 10px; cursor: pointer;">
              Close
            </button>
          </div>
          <script>
            // Copy receipt content
            document.getElementById('receipt-content').innerHTML = window.opener.document.getElementById('receipt-print-content').innerHTML;
            
            // Auto-print if supported
            setTimeout(() => {
              if (window.location.href.indexOf('print=true') > -1) {
                window.print();
              }
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Handle sale success
  const handleSaleSuccess = (transactionData) => {
    setTransactionId(transactionData.transactionId);
    setSaleSuccess(true);
    
    // Prepare receipt data
    const receipt = {
      transactionId: transactionData.transactionId,
      date: new Date().toLocaleString(),
      items: cart,
      subtotal: subtotal,
      tax: tax,
      discount: discountType === 'amount' ? discount : (subtotal * discount / 100),
      total: total,
      paymentMethod: paymentMethod,
      amountPaid: parseFloat(amountPaid) || total,
      changeDue: changeDue > 0 ? changeDue : 0,
      cashier: localStorage.getItem('userName') || 'Cashier',
      customer: customerInfo.name || 'Walk-in Customer'
    };
    
    setReceiptData(receipt);
    
    // Refresh products
    fetchProducts();
  };

  // Download receipt as text file
  const downloadReceipt = () => {
    if (!receiptData) return;
    
    const element = document.createElement('a');
    const text = `
Springcore Africa POS
--------------------------------
Receipt #: ${receiptData.transactionId}
Date: ${receiptData.date}
Cashier: ${receiptData.cashier}
Customer: ${receiptData.customer}
--------------------------------
${receiptData.items.map(item => `${item.quantity}x ${item.name}: ${formatCurrency(item.price * item.quantity)}`).join('\n')}
--------------------------------
Subtotal: ${formatCurrency(receiptData.subtotal)}
Tax (5%): ${formatCurrency(receiptData.tax)}
Discount: -${formatCurrency(receiptData.discount)}
Total: ${formatCurrency(receiptData.total)}
--------------------------------
Payment: ${receiptData.paymentMethod}
Amount Paid: ${formatCurrency(receiptData.amountPaid)}
Change: ${formatCurrency(receiptData.changeDue)}
--------------------------------
Thank you for your business!
📞 Contact: 01-2345678
📍 Location: Main Branch
    `.trim();
    
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `receipt-${receiptData.transactionId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Send receipt via email (mock function)
  const sendReceiptEmail = () => {
    if (!customerInfo.email) {
      showAlert('Email Required', 'Please enter customer email to send receipt', 'warning');
      return;
    }
    
    showAlert('Receipt Sent', `Receipt has been sent to ${customerInfo.email}`, 'success');
  };

  // Clear customer info
  const clearCustomerInfo = () => {
    setCustomerInfo({ name: '', email: '', phone: '' });
  };

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      showAlert('Empty Cart', 'Please add items to cart before processing sale', 'warning');
      return;
    }
    
    if (paymentMethod === 'Cash' && (!amountPaid || parseFloat(amountPaid) < total)) {
      showAlert(
        'Insufficient Payment',
        `Please enter amount paid. Minimum amount required: ${formatCurrency(total)}`,
        'warning'
      );
      return;
    }
    
    try {
      setProcessingSale(true);
      setSaleError('');
      
      const token = localStorage.getItem('token');
      
      // Prepare sale data
      const saleData = {
        items: cart.map(item => ({
          itemId: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: subtotal,
        tax: tax,
        discount: discountType === 'amount' ? discount : (subtotal * discount / 100),
        totalAmount: total,
        paymentMethod,
        amountPaid: parseFloat(amountPaid) || total,
        changeDue: changeDue > 0 ? changeDue : 0,
        notes: notes,
        customerName: customerInfo.name || '',
        customerEmail: customerInfo.email || '',
        customerPhone: customerInfo.phone || ''
      };
      
      const response = await axios.post(`${API_BASE_URL}/sales/record-sales`, saleData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        handleSaleSuccess(response.data.data);
      } else {
        throw new Error(response.data.message || 'Sale failed');
      }
      
    } catch (error) {
      console.error('Error processing sale:', error);
      showAlert(
        'Sale Failed',
        error.response?.data?.message || error.message || 'Failed to process sale. Please try again.',
        'error'
      );
    } finally {
      setProcessingSale(false);
    }
  };

  // Quick discount shortcuts
  const applyQuickDiscount = (percentage) => {
    setDiscountType('percentage');
    setDiscount(percentage);
    setShowDiscountForm(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <CashierTopNav />
        
        <div className="p-4 md:p-6">
          <header className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quick Sale</h1>
                <p className="text-gray-600 mt-2">Quickly record sales transactions</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={clearCart}
                  className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Clear Cart
                </button>
                
                {cart.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-800">{cart.length} items</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Success Message */}
          {saleSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Sale Completed Successfully!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Transaction ID: <span className="font-bold">{transactionId}</span></p>
                    <p>Total Amount: <span className="font-bold">{formatCurrency(total)}</span></p>
                    <p>Payment Method: <span className="font-bold">{paymentMethod}</span></p>
                    {changeDue > 0 && (
                      <p>Change Due: <span className="font-bold">{formatCurrency(changeDue)}</span></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {saleError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">{saleError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Product Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Customer Information (Optional)
                  </h3>
                  {customerInfo.name && (
                    <button
                      onClick={clearCustomerInfo}
                      className="text-sm text-gray-500 hover:text-red-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      placeholder="Walk-in Customer"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="080XXXXXXXX"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Product Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Products Grid */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Available Products</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {filteredProducts.length} products found
                    </span>
                    <button
                      onClick={fetchProducts}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Refresh products"
                    >
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>

                {loadingProducts ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading products...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No products found</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Clear search
                      </button>
                    )}
                    {products.length === 0 && (
                      <button
                        onClick={fetchProducts}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Retry Loading Products
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.slice(0, 12).map((product) => (
                      <div
                        key={product._id}
                        className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => addToCart(product)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 group-hover:text-blue-600 truncate">
                              {product.name}
                            </h3>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-1 truncate">
                                {product.description}
                              </p>
                            )}
                            {product.category && (
                              <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {product.category}
                              </span>
                            )}
                          </div>
                          <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center ml-2">
                            <Plus className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div>
                            <span className="text-lg font-bold text-gray-800">
                              {formatCurrency(product.sellingPrice)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Stock: <span className="font-medium">{product.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredProducts.length > 12 && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-500 text-sm">
                      Showing 12 of {filteredProducts.length} products
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Cart & Checkout */}
            <div className="space-y-6">
              {/* Cart Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                    Cart Summary
                  </h2>
                  <span className="text-sm font-medium text-blue-600">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <p className="text-gray-400 text-sm mt-1">Add products from the left panel</p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                      {cart.map((item) => (
                        <div key={item._id} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{item.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatCurrency(item.price)} each
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="text-gray-400 hover:text-red-600 ml-2"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-bold text-gray-800">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (5% VAT)</span>
                        <span className="font-medium">{formatCurrency(tax)}</span>
                      </div>
                      
                      {/* Discount Section */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-gray-600">Discount</span>
                          {discount > 0 && (
                            <button
                              onClick={() => setShowDiscountForm(!showDiscountForm)}
                              className="ml-2 text-xs text-blue-600 hover:text-blue-700"
                            >
                              {showDiscountForm ? 'Hide' : 'Edit'}
                            </button>
                          )}
                        </div>
                        <div className="text-right">
                          {discount > 0 ? (
                            <div className="text-red-600 font-medium">
                              -{formatCurrency(discountType === 'amount' ? discount : (subtotal * discount / 100))}
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowDiscountForm(!showDiscountForm)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Add Discount
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Discount Form */}
                      {showDiscountForm && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setDiscountType('amount')}
                              className={`flex-1 py-2 text-center rounded-lg ${discountType === 'amount' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                              Amount (₦)
                            </button>
                            <button
                              onClick={() => setDiscountType('percentage')}
                              className={`flex-1 py-2 text-center rounded-lg ${discountType === 'percentage' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                              Percentage (%)
                            </button>
                          </div>
                          
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              value={discount}
                              onChange={(e) => handleDiscountChange(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder={discountType === 'amount' ? 'Amount in ₦' : 'Percentage'}
                              min="0"
                              max={discountType === 'percentage' ? 100 : undefined}
                            />
                            <button
                              onClick={() => {
                                handleDiscountChange(discountType === 'amount' ? 1000 : 5);
                                setShowDiscountForm(false);
                              }}
                              className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            >
                              Quick
                            </button>
                          </div>
                          
                          {/* Quick Discount Buttons */}
                          <div className="grid grid-cols-4 gap-2">
                            {discountType === 'percentage' ? (
                              [5, 10, 15, 20].map(pct => (
                                <button
                                  key={pct}
                                  onClick={() => applyQuickDiscount(pct)}
                                  className="py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                  {pct}%
                                </button>
                              ))
                            ) : (
                              [500, 1000, 2000, 5000].map(amt => (
                                <button
                                  key={amt}
                                  onClick={() => {
                                    setDiscount(amt);
                                    setDiscountType('amount');
                                    setShowDiscountForm(false);
                                  }}
                                  className="py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                  ₦{amt.toLocaleString()}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-300 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-800">Total</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {formatCurrency(total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Payment Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                    Payment Method
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${
                          paymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 ${method.color}`}>
                          <method.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Paid */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                      Amount Paid
                    </h3>
                    {paymentMethod === 'Cash' && amountPaid && changeDue > 0 && (
                      <span className="text-green-600 text-sm font-medium">
                        Change: {formatCurrency(changeDue)}
                      </span>
                    )}
                  </div>
                  
                  <input
                    type="number"
                    placeholder={paymentMethod === 'Cash' ? "Enter amount paid" : "Auto-filled with total"}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full px-3 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    disabled={paymentMethod !== 'Cash'}
                  />
                  
                  {paymentMethod === 'Cash' && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {[1000, 2000, 5000, 10000].map(amount => (
                        <button
                          key={amount}
                          onClick={() => quickAddAmount(amount)}
                          className="py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          +₦{amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
                    <button
                      onClick={() => setShowNotesForm(!showNotesForm)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {showNotesForm ? 'Hide' : 'Add'}
                    </button>
                  </div>
                  
                  {showNotesForm && (
                    <textarea
                      placeholder="Add any notes about this transaction..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  )}
                </div>

                {/* Process Sale Button */}
                <button
                  onClick={processSale}
                  disabled={processingSale || cart.length === 0}
                  className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center transition-all ${
                    cart.length === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {processingSale ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Complete Sale • {formatCurrency(total)}
                    </>
                  )}
                </button>
                
                {cart.length > 0 && paymentMethod === 'Cash' && amountPaid && changeDue < 0 && (
                  <div className="text-center text-red-600 text-sm">
                    Amount paid is less than total. Need {formatCurrency(-changeDue)} more.
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Stats
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items in Cart:</span>
                    <span className="font-medium">{cart.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Item Price:</span>
                    <span className="font-medium">
                      {formatCurrency(calculateAveragePrice())}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-800 font-medium">Estimated Time:</span>
                      <span className="font-medium">2-3 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Actions Modal */}
      {saleSuccess && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Sale Completed!</h2>
                    <p className="text-gray-600">Transaction ID: {transactionId}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSaleSuccess(false);
                    setReceiptData(null);
                    clearCart();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Quick Receipt Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg">Springcore Africa POS</h3>
                  <p className="text-sm text-gray-600">Transaction #{transactionId}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span>{paymentMethod}</span>
                  </div>
                </div>
              </div>
              
              {/* Receipt Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={printReceipt}
                  className="flex flex-col items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <Printer className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-blue-700">Print Receipt</span>
                  <span className="text-xs text-blue-600 mt-1">Thermal/Standard</span>
                </button>
                
                <button
                  onClick={downloadReceipt}
                  className="flex flex-col items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <Download className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-green-700">Download</span>
                  <span className="text-xs text-green-600 mt-1">PDF/Text File</span>
                </button>
                
                <button
                  onClick={sendReceiptEmail}
                  className="flex flex-col items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <Mail className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-purple-700">Email Receipt</span>
                  <span className="text-xs text-purple-600 mt-1">Send to Customer</span>
                </button>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSaleSuccess(false);
                    setReceiptData(null);
                    clearCart();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowReceipt(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Full Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Receipt Details</h2>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <PrintableReceipt data={receiptData} />
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={printReceipt}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-20 backdrop-blur-md transition-opacity duration-300">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center mb-2">
                <div className="flex-shrink-0">
                  {getModalIcon()}
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">
                  {modal.title}
                </h3>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {modal.message}
                </p>
              </div>
            </div>
            
            {/* Print Option */}
            {modal.showPrintOption && (
              <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <Printer className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-blue-700 font-medium">Print Receipt?</span>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={printReceipt}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </button>
                  <button
                    onClick={hideModal}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
            
            {/* Modal Footer */}
            <div className="px-6 pb-6">
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                {modal.type === 'confirm' && (
                  <button
                    onClick={modal.onCancel || hideModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (modal.onConfirm) {
                      modal.onConfirm();
                    } else {
                      hideModal();
                    }
                  }}
                  className={`px-4 py-2 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow ${getModalButtonColors().confirm}`}
                >
                  {modal.type === 'confirm' ? 'Confirm' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden div for printing */}
      {receiptData && (
        <div id="receipt-print-content" style={{ display: 'none' }}>
          <PrintableReceipt data={receiptData} />
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default QuickSale;