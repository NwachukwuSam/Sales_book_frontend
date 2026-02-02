import React, { useState, useCallback, useEffect } from 'react';
import './Inventory.css';
import TopNav from '../TopNav';

const EditModal = ({ isVisible, item, onClose, onSave, isSaving }) => {
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');

  useEffect(() => {
    if (item) {
      const sellPriceNum = item.sellPrice ? item.sellPrice.replace('$', '') : '';
      const buyPriceNum = item.buyPrice ? item.buyPrice.replace('$', '') : '';
      
      setSellingPrice(sellPriceNum);
      setCostPrice(buyPriceNum);
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      sellingPrice: parseFloat(sellingPrice) || 0,
      costPrice: parseFloat(costPrice) || 0
    });
  };

  if (!isVisible || !item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Item: {item.name}</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Current quantity: <strong>{item.quantity}</strong>
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="costPrice">Cost Price ($)</label>
            <input
              type="number"
              id="costPrice"
              placeholder="Enter Cost Price"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              min="0"
              step="0.01"
              className="modal-input"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="sellingPrice">Selling Price ($)</label>
            <input
              type="number"
              id="sellingPrice"
              placeholder="Enter Selling Price"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              min="0"
              step="0.01"
              className="modal-input"
              required
            />
          </div>

          <div className="modal-buttons">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InventoryLoadingModal = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(2px)' }}>
      <div className="modal-content" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 24px'
        }}></div>
        <h2 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 8px 0', fontWeight: '600' }}>
          Loading Inventory
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>
          Please wait while we fetch your inventory data...
        </p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const LoadingModal = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ fontSize: '18px', color: '#333', margin: '0' }}>Adding item...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const ErrorModal = ({ isVisible, onClose, message }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '40px', maxWidth: '400px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#e74c3c',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <svg style={{ width: '35px', height: '35px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 style={{ color: '#e74c3c', margin: '20px 0 10px' }}>Error</h2>
        <p style={{ 
          color: '#555', 
          margin: '0 0 20px', 
          whiteSpace: 'pre-line',
          textAlign: 'left',
          lineHeight: '1.5'
        }}>{message}</p>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '10px 30px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const RefillModal = ({ isVisible, item, onQuantityChange, onRefill, onCancel, isRefilling, refillQuantity }) => {
  if (!isVisible || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onRefill();
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Refill Item</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Adding quantity to: <strong>{item.name}</strong>
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="refillQuantity">Quantity to Add</label>
            <input
              type="number"
              id="refillQuantity"
              placeholder="Enter quantity"
              value={refillQuantity}
              onChange={onQuantityChange}
              min="1"
              className="modal-input"
              autoFocus
              disabled={isRefilling}
            />
          </div>

          <div className="modal-buttons">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onCancel}
              disabled={isRefilling}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={isRefilling}
            >
              {isRefilling ? 'Refilling...' : 'Refill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SuccessModal = ({ isVisible, onClose, message = 'Item added successfully to inventory' }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '40px', maxWidth: '400px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#27ae60',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <svg style={{ width: '35px', height: '35px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 style={{ color: '#27ae60', margin: '20px 0 10px' }}>Success!</h2>
        <p style={{ color: '#555', margin: '0 0 20px' }}>{message}</p>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            padding: '10px 30px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

const AddItemModal = ({ showModal, newItem, onInputChange, onSave, onCancel, isSaving, inventory }) => {
  if (!showModal) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault(); 
    onSave();
  };

  const itemExists = inventory.some(item => 
    item.name.toLowerCase() === newItem.name.trim().toLowerCase()
  );

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Item</h2>
        
        {itemExists && newItem.name.trim() && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '10px 15px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#856404'
          }}>
            <strong>⚠️ Item already exists!</strong> 
            <p style={{ margin: '5px 0 0 0' }}>
              An item named "<strong>{newItem.name.trim()}</strong>" is already in your inventory.
              Please use the "Refill" button on the existing item instead.
            </p>
          </div>
        )}
        
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="itemName">Item Name</label>
            <input
              type="text"
              id="itemName"
              name="name"
              placeholder="Enter item name"
              value={newItem.name}
              onChange={onInputChange}
              autoFocus
              className="modal-input"
              style={itemExists && newItem.name.trim() ? { borderColor: '#ffc107' } : {}}
            />
            {itemExists && newItem.name.trim() && (
              <small style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>
                This item already exists in inventory
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              placeholder="Enter quantity"
              value={newItem.quantity}
              onChange={onInputChange}
              min="0"
              className="modal-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="costPrice">Cost Price ($)</label>
            <input
              type="number"
              id="costPrice"
              name="costPrice"
              placeholder="Enter Cost Price"
              value={newItem.costPrice}
              onChange={onInputChange}
              min="0"
              step="0.01"
              className="modal-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sellingPrice">Selling Price ($)</label>
            <input
              type="number"
              id="sellingPrice"
              name="sellingPrice"
              placeholder="Enter Selling Price"
              value={newItem.sellingPrice}
              onChange={onInputChange}
              min="0"
              step="0.01"
              className="modal-input"
            />
          </div>

          <div className="modal-buttons">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={isSaving || (itemExists && newItem.name.trim())}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refillItem, setRefillItem] = useState(null);
  const [refillQuantity, setRefillQuantity] = useState('100');
  const [isRefilling, setIsRefilling] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    costPrice: '',
    sellingPrice: ''
  });

  // Helper function to determine stock label based on quantity
  const getStockLabel = (quantity) => {
    if (quantity <= 2) return 'Low Stock';
    if (quantity >= 3 && quantity <= 9) return 'Running Low';
    return 'Normal';
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        
        const response = await fetch('https://sales-book.onrender.com/api/inventory', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const items = data.items || [];
        const transformedData = items.map(item => {
          const quantity = item.quantity || 0;
          const stockLabel = getStockLabel(quantity);
          
          return {
            id: item._id,
            name: item.name,
            quantity: quantity,
            buyPrice: `$${item.costPrice || 0}`,
            sellPrice: `$${item.sellingPrice || 0}`,
            lastUpdated: new Date(item.updatedAt).toLocaleDateString(),
            stockLabel: stockLabel
          };
        });
        
        setInventory(transformedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
        setError(err.message);
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const openEditModal = (item) => {
    setEditItem(item);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (priceData) => {
    if (!editItem || !priceData) return;

    try {
      setIsEditing(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrorMessage('No authentication token found. Please log in.');
        setShowErrorModal(true);
        return;
      }

      const payload = {
        costPrice: priceData.costPrice,
        sellingPrice: priceData.sellingPrice
      };

      console.log('Updating item:', editItem.id, 'with data:', payload);

      const response = await fetch(`https://sales-book.onrender.com/api/inventory/${editItem.id}/update-price`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Update response:', data);
      
      if (!data.success || !data.item) {
        throw new Error(data.message || 'Failed to update item');
      }

      setInventory(prevInventory => {
        return prevInventory.map(item => {
          if (item.id === editItem.id) {
            return {
              ...item,
              costPrice: `$${priceData.costPrice}`,
              sellingPrice: `$${priceData.sellingPrice}`,
              updatedAt: 'Just now'
            };
          }
          return item;
        });
      });
      setShowEditModal(false);
      setEditItem(null);
      setSuccessMessage(`Successfully updated prices for "${editItem.name}". New prices: Cost: $${priceData.costPrice}, Selling: $${priceData.sellingPrice}`);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to update item:', err);
      setErrorMessage(`Error updating item: ${err.message}`);
      setShowErrorModal(true);
    } finally {
      setIsEditing(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditItem(null);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.key === 'quantity') {
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    } else {
      if (aValue.toLowerCase() < bValue.toLowerCase()) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue.toLowerCase() > bValue.toLowerCase()) return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === inventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inventory.map(item => item.id));
    }
  };

  const handleRefillClick = (item) => {
    setRefillItem(item);
    setRefillQuantity('100');
    setShowRefillModal(true);
  };

  const handleRefillQuantityChange = (e) => {
    setRefillQuantity(e.target.value);
  };

  const handleRefillSubmit = async () => {
    if (!refillQuantity || parseInt(refillQuantity) <= 0) {
      setErrorMessage('Please enter a valid quantity');
      setShowErrorModal(true);
      return;
    }

    try {
      setIsRefilling(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrorMessage('No authentication token found. Please log in.');
        setShowErrorModal(true);
        return;
      }

      const quantityToAdd = parseInt(refillQuantity);
      
      console.log('Refilling item:', refillItem.id, 'with quantity:', quantityToAdd);

      const response = await fetch(`https://sales-book.onrender.com/api/inventory/${refillItem.id}/refill`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantityToAdd })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Refill response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to refill item');
      }
    
      const updatedItem = data.item;
      console.log('Updated item:', updatedItem);

      const oldQuantity = refillItem.quantity;
      const newQuantity = oldQuantity + quantityToAdd;
      const updatedStockLabel = getStockLabel(newQuantity);
      
      setInventory(prevInventory => {
        return prevInventory.map(item => {
          if (item.id === refillItem.id) {
            return {
              ...item,
              quantity: newQuantity,
              buyPrice: updatedItem.costPrice ? `$${updatedItem.costPrice}` : item.buyPrice,
              sellPrice: updatedItem.sellingPrice ? `$${updatedItem.sellingPrice}` : item.sellPrice,
              lastUpdated: 'Just now',
              stockLabel: updatedStockLabel
            };
          }
          return item;
        });
      });
      
      setShowRefillModal(false);
      setRefillItem(null);
      setSuccessMessage(`Successfully added ${quantityToAdd} units to "${refillItem.name}". New quantity: ${newQuantity}`);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to refill item:', err);
      setErrorMessage(`Error refilling item: ${err.message}`);
      setShowErrorModal(true);
    } finally {
      setIsRefilling(false);
    }
  };

  const handleRefillCancel = () => {
    setShowRefillModal(false);
    setRefillItem(null);
    setRefillQuantity('100');
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      const updatedInventory = inventory.filter(item => !selectedItems.includes(item.id));
      setInventory(updatedInventory);
      setSelectedItems([]);
    }
  };

  const handleExport = () => {
    console.log('Exporting data:', inventory);
    alert('Export functionality would be implemented here');
  };

  const handleAddItem = () => {
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: value
    });
  };

  const handleSaveItem = async () => {
    if (!newItem.name.trim()) {
      setErrorMessage('Please enter item name');
      setShowErrorModal(true);
      return false;
    }

    if (!newItem.quantity) {
      setErrorMessage('Please enter quantity');
      setShowErrorModal(true);
      return false;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrorMessage('No authentication token found. Please log in.');
        setShowErrorModal(true);
        return false;
      }

      const payload = {
        name: newItem.name.trim(),
        quantity: parseInt(newItem.quantity) || 0,
        costPrice: parseFloat(newItem.costPrice) || 0,
        sellingPrice: parseFloat(newItem.sellingPrice) || 0
      };

      const response = await fetch('https://sales-book.onrender.com/api/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Check for 409 conflict error (item already exists)
        if (response.status === 409) {
          // Try to extract item name from error message
          const itemNameMatch = data.message?.match(/item "(.+)" already exists/i) || 
                               data.error?.match(/item "(.+)" already exists/i);
          const existingItemName = itemNameMatch ? itemNameMatch[1] : newItem.name.trim();
          
          // Find the existing item in the inventory
          const existingItem = inventory.find(item => 
            item.name.toLowerCase() === existingItemName.toLowerCase()
          );
          
          let errorMsg = `"${existingItemName}" already exists in inventory.\n\n`;
          errorMsg += `Please use the "Refill" button on the existing item to add more stock.`;
          
          if (existingItem) {
            errorMsg += `\n\nCurrent quantity: ${existingItem.quantity}`;
            errorMsg += `\nStock status: ${existingItem.stockLabel}`;
          }
          
          setErrorMessage(errorMsg);
          setShowErrorModal(true);
          
          // Select the existing item in the table
          if (existingItem) {
            setSelectedItems([existingItem.id]);
          }
          
          return false;
        }
        
        // Handle other errors
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      const newBackendItem = data.item || data;

      const quantity = newBackendItem.quantity || 0;
      const stockLabel = getStockLabel(quantity);

      const itemToAdd = {
        id: newBackendItem._id,
        name: newBackendItem.name,
        quantity: quantity,
        buyPrice: `$${newBackendItem.costPrice || 0}`,
        sellPrice: `$${newBackendItem.sellingPrice || 0}`,
        lastUpdated: 'Just now',
        stockLabel: stockLabel
      };

      setInventory([...inventory, itemToAdd]);
      
      setNewItem({
        name: '',
        quantity: '',
        costPrice: '',
        sellingPrice: ''
      });
      setShowModal(false);
      setSuccessMessage(`"${itemToAdd.name}" added successfully to inventory!`);
      setShowSuccessModal(true);
      
      return true;
    } catch (err) {
      console.error('Failed to save item:', err);
      setErrorMessage(`Error adding item: ${err.message}`);
      setShowErrorModal(true);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNewItem({
      name: '',
      quantity: '',
      costPrice: '',
      sellingPrice: ''
    });
    setShowModal(false);
  };

  const filteredInventory = sortedInventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.stockLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const selectedCount = selectedItems.length;

  const stockStats = {
    'Normal': inventory.filter(item => item.stockLabel === 'Normal').length,
    'Running Low': inventory.filter(item => item.stockLabel === 'Running Low').length,
    'Low Stock': inventory.filter(item => item.stockLabel === 'Low Stock').length,
  };

  return (
    <div className="inventory-dashboard">
      <TopNav />
      <InventoryLoadingModal isVisible={loading} />
      
      {error && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red', fontSize: '16px' }}>
          Error loading inventory: {error}
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div className="inventory-header">
            <h1 className="dashboard-title">Inventory</h1>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-label">Total Items</span>
                <span className="stat-value">{totalItems}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Quantity</span>
                <span className="stat-value">{totalQuantity}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">In Stock</span>
                <span className="stat-value normal-stock">{stockStats.Normal}</span>
              </div>
            </div>
          </div>

          <div className="action-bar">
            <div className="action-left">
            </div>
            
            <div className="action-right">
              <div className="inventory-search-container">
                <input
                  type="text"
                  className="inventory-search-input"
                  placeholder="Search items or stock status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="inventory-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <button className="action-btn filter-btn">
                <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              
              <button className="action-btn export-btn" onClick={handleExport}>
                <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              
              <button className="action-btn add-btn" onClick={handleAddItem}>
                <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>
          </div>

          <div className="stock-summary">
            <div className="stock-summary-item normal">
              <span className="stock-label">Normal</span>
              <span className="stock-count">{stockStats.Normal}</span>
            </div>
            <div className="stock-summary-item running-low">
              <span className="stock-label">Running Low</span>
              <span className="stock-count">{stockStats['Running Low']}</span>
            </div>
            <div className="stock-summary-item low-stock">
              <span className="stock-label">Low Stock</span>
              <span className="stock-count">{stockStats['Low Stock']}</span>
            </div>
          </div>

          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === inventory.length && inventory.length > 0}
                      onChange={handleSelectAll}
                      className="checkbox"
                    />
                  </th>
                  <th>Product Name</th>
                  <th 
                    className="sortable-column"
                    onClick={() => handleSort('quantity')}
                  >
                    Quantity
                    {sortConfig.key === 'quantity' && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </th>
                  <th>Buy Price</th>
                  <th>Sell Price</th>
                  <th 
                    className="sortable-column"
                    onClick={() => handleSort('stockLabel')}
                  >
                    Stock Label
                    {sortConfig.key === 'stockLabel' && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </th>
                  <th>Last Updated</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="checkbox"
                      />
                    </td>
                    <td className="product-name">
                      <span className="product-text">{item.name}</span>
                    </td>
                    <td>
                      <span className={`quantity-badge ${item.quantity < 20 ? 'low' : item.quantity < 50 ? 'medium' : 'high'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="price-cell buy-price">{item.buyPrice}</td>
                    <td className="price-cell sell-price">{item.sellPrice}</td>
                    <td>
                      <div className={`stock-label-badge ${item.stockLabel.toLowerCase().replace(' ', '-')}`}>
                        {item.stockLabel}
                      </div>
                    </td>
                    <td className="timestamp">{item.lastUpdated}</td>
                    <td className="actions-column">
                      <button
                        className="table-action-btn edit-btn"
                        onClick={() => openEditModal(item)}
                      >
                        <svg className="table-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button 
                        className="table-action-btn refill-btn"
                        onClick={() => handleRefillClick(item)}
                      >
                        <svg className="table-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredInventory.length === 0 && (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>No inventory items found{searchQuery && ` for "${searchQuery}"`}</p>
                <button className="add-btn" onClick={handleAddItem}>
                  <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Item
                </button>
              </div>
            )}
          </div>

          <div className="inventory-summary">
            <div className="summary-left">
              Showing <strong>{filteredInventory.length}</strong> of <strong>{inventory.length}</strong> items
              {selectedCount > 0 && (
                <span className="selected-count">
                  • <strong>{selectedCount}</strong> selected
                </span>
              )}
            </div>
            <div className="summary-right">
              <button className="summary-btn prev-btn" disabled>
                Previous
              </button>
              <span className="page-info">Page 1 of 1</span>
              <button className="summary-btn next-btn" disabled>
                Next
              </button>
            </div>
          </div>

          <AddItemModal 
            showModal={showModal}
            newItem={newItem}
            onInputChange={handleInputChange}
            onSave={handleSaveItem}
            onCancel={handleCancel}
            isSaving={isSaving}
            inventory={inventory}
          />
          
          <EditModal
            isVisible={showEditModal}
            item={editItem}
            onClose={closeEditModal}
            onSave={handleSaveEdit}
            isSaving={isEditing}
          />
          
          <RefillModal 
            isVisible={showRefillModal}
            item={refillItem}
            onQuantityChange={handleRefillQuantityChange}
            onRefill={handleRefillSubmit}
            onCancel={handleRefillCancel}
            isRefilling={isRefilling}
            refillQuantity={refillQuantity}
          />
          
          <ErrorModal
            isVisible={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            message={errorMessage}
          />
          
          <LoadingModal isVisible={isSaving} />
         
          <SuccessModal 
            isVisible={showSuccessModal} 
            onClose={() => setShowSuccessModal(false)}
            message={successMessage}
          />
        </>
      )}
    </div>
  );
};

export default Inventory;