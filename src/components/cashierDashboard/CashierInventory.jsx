// import React, { useState, useEffect } from 'react';
// import './../adminDashboard/Inventory.css';
// import CashierTopNav from './CashierTopNav';


// const InventoryLoadingModal = ({ isVisible }) => {
//   if (!isVisible) return null;

//   return (
//     <div className="modal-overlay" style={{ backdropFilter: 'blur(2px)' }}>
//       <div className="modal-content" style={{ textAlign: 'center', padding: '60px 40px' }}>
//         <div style={{ 
//           width: '60px', 
//           height: '60px', 
//           border: '4px solid #f3f3f3',
//           borderTop: '4px solid #3b82f6',
//           borderRadius: '50%',
//           animation: 'spin 1s linear infinite',
//           margin: '0 auto 24px'
//         }}></div>
//         <h2 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 8px 0', fontWeight: '600' }}>
//           Loading Inventory
//         </h2>
//         <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>
//           Please wait while we fetch inventory data...
//         </p>
//       </div>
//       <style>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   );
// };

// const CashierInventory = () => {
//   const [inventory, setInventory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

//   useEffect(() => {
//     const fetchInventory = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem('token');
        
//         if (!token) {
//           throw new Error('No authentication token found. Please log in.');
//         }
        
//         const response = await fetch('https://sales-system-production.up.railway.app/api/inventory', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
        
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
        
//         const items = data.items || [];
//         const transformedData = items.map(item => {
//           const quantity = item.quantity || 0;
//           let stockLabel = 'Normal';
//           if (quantity <= 10) stockLabel = 'Low Stock';
//           else if (quantity <= 20) stockLabel = 'Running Low';
          
//           return {
//             id: item._id,
//             name: item.name,
//             quantity: quantity,
//             buyPrice: `₦${item.costPrice || 0}`,
//             sellPrice: `₦${item.sellingPrice || 0}`,
//             lastUpdated: new Date(item.updatedAt).toLocaleDateString(),
//             stockLabel: stockLabel
//           };
//         });
        
//         setInventory(transformedData);
//         setError(null);
//       } catch (err) {
//         console.error('Failed to fetch inventory:', err);
//         setError(err.message);
//         setInventory([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInventory();
//   }, []);

//   const handleSort = (key) => {
//     let direction = 'ascending';
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }
//     setSortConfig({ key, direction });
//   };

//   const sortedInventory = [...inventory].sort((a, b) => {
//     if (!sortConfig.key) return 0;
    
//     const aValue = a[sortConfig.key];
//     const bValue = b[sortConfig.key];
    
//     if (sortConfig.key === 'quantity') {
//       if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
//       if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
//     } else {
//       if (aValue.toLowerCase() < bValue.toLowerCase()) return sortConfig.direction === 'ascending' ? -1 : 1;
//       if (aValue.toLowerCase() > bValue.toLowerCase()) return sortConfig.direction === 'ascending' ? 1 : -1;
//     }
//     return 0;
//   });

//   const handleSelectItem = (id) => {
//     if (selectedItems.includes(id)) {
//       setSelectedItems(selectedItems.filter(itemId => itemId !== id));
//     } else {
//       setSelectedItems([...selectedItems, id]);
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectedItems.length === inventory.length) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems(inventory.map(item => item.id));
//     }
//   };

//   const filteredInventory = sortedInventory.filter(item =>
//     item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     item.stockLabel.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const totalItems = inventory.length;
//   const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
//   const selectedCount = selectedItems.length;

//   const stockStats = {
//     'Normal': inventory.filter(item => item.stockLabel === 'Normal').length,
//     'Running Low': inventory.filter(item => item.stockLabel === 'Running Low').length,
//     'Low Stock': inventory.filter(item => item.stockLabel === 'Low Stock').length,
//   };

//   return (
//     <div className="inventory-dashboard">
//       <CashierTopNav />
//       <InventoryLoadingModal isVisible={loading} />
      
//       {error && (
//         <div style={{ padding: '20px', textAlign: 'center', color: 'red', fontSize: '16px' }}>
//           Error loading inventory: {error}
//         </div>
//       )}
      
//       {!loading && !error && (
//         <>
//           <div className="inventory-header">
//             <h1 className="dashboard-title">Inventory (View Only)</h1>
//             <div className="header-stats">
//               <div className="stat-item">
//                 <span className="stat-label">Total Items</span>
//                 <span className="stat-value">{totalItems}</span>
//               </div>
//               <div className="stat-item">
//                 <span className="stat-label">Total Quantity</span>
//                 <span className="stat-value">{totalQuantity}</span>
//               </div>
//               <div className="stat-item">
//                 <span className="stat-label">In Stock</span>
//                 <span className="stat-value normal-stock">{stockStats.Normal}</span>
//               </div>
//             </div>
//           </div>

//           <div className="action-bar">
//             <div className="action-left">
//             </div>
            
//             <div className="action-right">
//               <div className="inventory-search-container">
//                 <input
//                   type="text"
//                   className="inventory-search-input"
//                   placeholder="Search items or stock status..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//                 <svg className="inventory-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="stock-summary">
//             <div className="stock-summary-item normal">
//               <span className="stock-label">Normal</span>
//               <span className="stock-count">{stockStats.Normal}</span>
//             </div>
//             <div className="stock-summary-item running-low">
//               <span className="stock-label">Running Low</span>
//               <span className="stock-count">{stockStats['Running Low']}</span>
//             </div>
//             <div className="stock-summary-item low-stock">
//               <span className="stock-label">Low Stock</span>
//               <span className="stock-count">{stockStats['Low Stock']}</span>
//             </div>
//           </div>

//           <div className="inventory-table-container">
//             <table className="inventory-table">
//               <thead>
//                 <tr>
//                   <th className="checkbox-column">
//                     <input
//                       type="checkbox"
//                       checked={selectedItems.length === inventory.length && inventory.length > 0}
//                       onChange={handleSelectAll}
//                       className="checkbox"
//                     />
//                   </th>
//                   <th>Product Name</th>
//                   <th 
//                     className="sortable-column"
//                     onClick={() => handleSort('quantity')}
//                   >
//                     Quantity
//                     {sortConfig.key === 'quantity' && (
//                       <span className="sort-indicator">
//                         {sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}
//                       </span>
//                     )}
//                   </th>
//                   <th>Buy Price</th>
//                   <th>Sell Price</th>
//                   <th 
//                     className="sortable-column"
//                     onClick={() => handleSort('stockLabel')}
//                   >
//                     Stock Label
//                     {sortConfig.key === 'stockLabel' && (
//                       <span className="sort-indicator">
//                         {sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}
//                       </span>
//                     )}
//                   </th>
//                   <th>Last Updated</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredInventory.map((item) => (
//                   <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}>
//                     <td className="checkbox-column">
//                       <input
//                         type="checkbox"
//                         checked={selectedItems.includes(item.id)}
//                         onChange={() => handleSelectItem(item.id)}
//                         className="checkbox"
//                       />
//                     </td>
//                     <td className="product-name">
//                       <span className="product-text">{item.name}</span>
//                     </td>
//                     <td>
//                       <span className={`quantity-badge ${item.quantity < 20 ? 'low' : item.quantity < 50 ? 'medium' : 'high'}`}>
//                         {item.quantity}
//                       </span>
//                     </td>
//                     <td className="price-cell buy-price">{item.buyPrice}</td>
//                     <td className="price-cell sell-price">{item.sellPrice}</td>
//                     <td>
//                       <div className={`stock-label-badge ${item.stockLabel.toLowerCase().replace(' ', '-')}`}>
//                         {item.stockLabel}
//                       </div>
//                     </td>
//                     <td className="timestamp">{item.lastUpdated}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
            
//             {filteredInventory.length === 0 && (
//               <div className="empty-state">
//                 <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                 </svg>
//                 <p>No inventory items found{searchQuery && ` for "${searchQuery}"`}</p>
//               </div>
//             )}
//           </div>

//           <div className="inventory-summary">
//             <div className="summary-left">
//               Showing <strong>{filteredInventory.length}</strong> of <strong>{inventory.length}</strong> items
//               {selectedCount > 0 && (
//                 <span className="selected-count">
//                   • <strong>{selectedCount}</strong> selected
//                 </span>
//               )}
//             </div>
//             <div className="summary-right">
//               <button className="summary-btn prev-btn" disabled>
//                 Previous
//               </button>
//               <span className="page-info">Page 1 of 1</span>
//               <button className="summary-btn next-btn" disabled>
//                 Next
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default CashierInventory;

import React, { useState, useEffect } from 'react';
import CashierTopNav from './CashierTopNav';
import './../adminDashboard/Inventory.css';

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
          Please wait while we fetch inventory data...
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

const CashierInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        
        const response = await fetch('https://sales-system-production.up.railway.app/api/inventory', {
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
          let stockLabel = 'Normal';
          if (quantity <= 10) stockLabel = 'Low Stock';
          else if (quantity <= 20) stockLabel = 'Running Low';
          
          return {
            id: item._id,
            name: item.name,
            quantity: quantity,
            buyPrice: `₦${item.costPrice || 0}`,
            sellPrice: `₦${item.sellingPrice || 0}`,
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
    <div className="cashier-inventory-container">
      <CashierTopNav />
      
      <main className="cashier-inventory-main">
        <InventoryLoadingModal isVisible={loading} />
        
        {error && (
          <div className="error-message">
            <div className="error-content">
              <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3>Error loading inventory</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {!loading && !error && (
          <div className="cashier-inventory-content">
            <header className="inventory-header">
              <div className="header-left">
                
                <p className="dashboard-subtitle">View product stock levels and pricing</p>
              </div>
              
              <div className="header-right">
                <div className="inventory-search-container">
                  <input
                    type="text"
                    className="inventory-search-input"
                    placeholder="      Search items or stock status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg className="inventory-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </header>

            <div className="stats-summary">
              <div className="stat-card">
                <div className="stat-icon total-items">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Items</span>
                  <span className="stat-value">{totalItems}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon total-quantity">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Quantity</span>
                  <span className="stat-value">{totalQuantity}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon stock-level">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Normal Stock</span>
                  <span className="stat-value">{stockStats.Normal}</span>
                </div>
              </div>
            </div>

            <div className="stock-indicators">
              <div className="stock-indicator normal">
                <div className="indicator-dot"></div>
                <span>Normal ({stockStats.Normal})</span>
              </div>
              <div className="stock-indicator running-low">
                <div className="indicator-dot"></div>
                <span>Running Low ({stockStats['Running Low']})</span>
              </div>
              <div className="stock-indicator low-stock">
                <div className="indicator-dot"></div>
                <span>Low Stock ({stockStats['Low Stock']})</span>
              </div>
            </div>

            <div className="inventory-table-container">
              <div className="table-header">
                <div className="selected-count">
                  {selectedCount > 0 ? (
                    <span className="selected-text">
                      {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                    </span>
                  ) : (
                    <span className="total-text">
                      {filteredInventory.length} of {inventory.length} items
                    </span>
                  )}
                </div>
              </div>
              
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
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredInventory.length === 0 && (
                <div className="empty-state">
                  <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <div className="empty-state-content">
                    <h3>No items found</h3>
                    <p>
                      {searchQuery 
                        ? `No inventory items match "${searchQuery}"` 
                        : 'No inventory items available'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <style jsx>{`
        .cashier-inventory-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .cashier-inventory-main {
          margin-top: 15px; /* Adjust based on your CashierTopNav height */
          min-height: calc(100vh - 64px);
          padding: 20px;
        }
        
        .cashier-inventory-content {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .error-message {
          margin: 20px auto;
          max-width: 800px;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 20px;
        }
        
        .error-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .error-icon {
          width: 24px;
          height: 24px;
          color: #dc2626;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .error-content h3 {
          margin: 0 0 4px 0;
          color: #dc2626;
          font-size: 16px;
          font-weight: 600;
        }
        
        .error-content p {
          margin: 0;
          color: #b91c1c;
          font-size: 14px;
        }
        
        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .header-left {
          flex: 1;
          min-width: 300px;
        }
        
        .dashboard-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
        }
        
        .dashboard-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }
        
        .header-right {
          min-width: 300px;
        }
        
        .inventory-search-container {
          position: relative;
        }
        
        .inventory-search-input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.2s;
          background: white;
        }
        
        .inventory-search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .inventory-search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #94a3b8;
        }
        
        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-icon svg {
          width: 24px;
          height: 24px;
        }
        
        .stat-icon.total-items {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1d4ed8;
        }
        
        .stat-icon.total-quantity {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #15803d;
        }
        
        .stat-icon.stock-level {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #d97706;
        }
        
        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }
        
        .stock-indicators {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .stock-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .stock-indicator.normal {
          color: #059669;
        }
        
        .stock-indicator.normal .indicator-dot {
          background: #10b981;
        }
        
        .stock-indicator.running-low {
          color: #d97706;
        }
        
        .stock-indicator.running-low .indicator-dot {
          background: #f59e0b;
        }
        
        .stock-indicator.low-stock {
          color: #dc2626;
        }
        
        .stock-indicator.low-stock .indicator-dot {
          background: #ef4444;
        }
        
        .inventory-table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        
        .table-header {
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        
        .selected-count {
          font-size: 14px;
          color: #64748b;
        }
        
        .selected-text {
          color: #3b82f6;
          font-weight: 500;
        }
        
        .total-text {
          color: #64748b;
        }
        
        .inventory-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .inventory-table th {
          padding: 16px 24px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .inventory-table td {
          padding: 16px 24px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .inventory-table tr:last-child td {
          border-bottom: none;
        }
        
        .inventory-table tr:hover {
          background: #f8fafc;
        }
        
        .inventory-table tr.selected {
          background: #eff6ff;
        }
        
        .checkbox-column {
          width: 48px;
          padding-right: 0 !important;
        }
        
        .checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 2px solid #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .checkbox:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .product-name {
          font-weight: 500;
          color: #1e293b;
        }
        
        .quantity-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .quantity-badge.high {
          background: #dcfce7;
          color: #166534;
        }
        
        .quantity-badge.medium {
          background: #fef3c7;
          color: #92400e;
        }
        
        .quantity-badge.low {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .price-cell {
          font-family: 'SF Mono', Monaco, Consolas, monospace;
          font-weight: 500;
        }
        
        .buy-price {
          color: #059669;
        }
        
        .sell-price {
          color: #3b82f6;
        }
        
        .stock-label-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .stock-label-badge.normal {
          background: #dcfce7;
          color: #166534;
        }
        
        .stock-label-badge.running-low {
          background: #fef3c7;
          color: #92400e;
        }
        
        .stock-label-badge.low-stock {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .timestamp {
          font-size: 12px;
          color: #64748b;
        }
        
        .sortable-column {
          cursor: pointer;
          user-select: none;
          transition: color 0.2s;
        }
        
        .sortable-column:hover {
          color: #1e293b;
        }
        
        .sort-indicator {
          margin-left: 4px;
          font-weight: bold;
        }
        
        .empty-state {
          padding: 60px 20px;
          text-align: center;
        }
        
        .empty-icon {
          width: 64px;
          height: 64px;
          color: #cbd5e1;
          margin: 0 auto 16px;
        }
        
        .empty-state-content h3 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 18px;
          font-weight: 600;
        }
        
        .empty-state-content p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .cashier-inventory-main {
            padding: 16px;
            margin-top: 56px;
          }
          
          .inventory-header {
            flex-direction: column;
            gap: 16px;
          }
          
          .header-left, .header-right {
            min-width: 100%;
          }
          
          .stats-summary {
            grid-template-columns: 1fr;
          }
          
          .inventory-table {
            display: block;
            overflow-x: auto;
          }
          
          .inventory-table th,
          .inventory-table td {
            padding: 12px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default CashierInventory;