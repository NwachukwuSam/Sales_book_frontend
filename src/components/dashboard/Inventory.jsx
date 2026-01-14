// // import React from 'react'
// // import TopNav from '../TopNav'

// // function Inventory() {
// //   return (
// //     <div>
// //       <TopNav/>
// //     </div>
// //   )
// // }

// // export default Inventory

// import React, { useState } from 'react';
// import './Inventory.css';
// import TopNav from '../TopNav';

// const Inventory = () => {
//   // Sample inventory data
//   const [inventory, setInventory] = useState([
//     { id: 1, name: 'Indomie Super Pack', quantity: 240, buyPrice: 'M350', sellPrice: 'M500', lastUpdated: '2 days ago' },
//     { id: 2, name: 'Coca-Cola 50cl', quantity: 96, buyPrice: 'M180', sellPrice: 'M250', lastUpdated: 'Yesterday' },
//     { id: 3, name: 'Peak Milk Sachet', quantity: 60, buyPrice: 'M120', sellPrice: 'M180', lastUpdated: '3 hours ago' },
//     { id: 4, name: 'Jollof Rice Pack', quantity: 15, buyPrice: 'M900', sellPrice: 'M1,500', lastUpdated: 'Today, 10:15 AM' },
//     { id: 5, name: 'Golden Mom Sachet', quantity: 120, buyPrice: 'M250', sellPrice: 'M350', lastUpdated: '4 days ago' },
//     { id: 6, name: 'MTN Recharge Card', quantity: 5, buyPrice: 'M95', sellPrice: 'M100', lastUpdated: '1 hour ago' },
//     { id: 7, name: 'Bag of Pure Water', quantity: 22, buyPrice: 'M150', sellPrice: 'M200', lastUpdated: 'Yesterday' },
//     { id: 8, name: 'Sprite 50cl', quantity: 12, buyPrice: 'M170', sellPrice: 'M250', lastUpdated: 'Today, 8:00 AM' },
//     { id: 9, name: 'Power Oil Small', quantity: 18, buyPrice: 'M260', sellPrice: 'M350', lastUpdated: '5 days ago' },
//   ]);

//   const [selectedItems, setSelectedItems] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');

//   // Handle checkbox selection
//   const handleSelectItem = (id) => {
//     if (selectedItems.includes(id)) {
//       setSelectedItems(selectedItems.filter(itemId => itemId !== id));
//     } else {
//       setSelectedItems([...selectedItems, id]);
//     }
//   };

//   // Handle select all
//   const handleSelectAll = () => {
//     if (selectedItems.length === inventory.length) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems(inventory.map(item => item.id));
//     }
//   };

//   // Handle delete selected items
//   const handleDeleteSelected = () => {
//     if (selectedItems.length === 0) return;
    
//     if (window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
//       const updatedInventory = inventory.filter(item => !selectedItems.includes(item.id));
//       setInventory(updatedInventory);
//       setSelectedItems([]);
//     }
//   };

//   // Handle export
//   const handleExport = () => {
//     // In a real app, this would generate and download a CSV/Excel file
//     console.log('Exporting data:', inventory);
//     alert('Export functionality would be implemented here');
//   };

//   // Handle add item
//   const handleAddItem = () => {
//     const newItem = {
//       id: inventory.length + 1,
//       name: 'New Product',
//       quantity: 0,
//       buyPrice: 'M0',
//       sellPrice: 'M0',
//       lastUpdated: 'Just now'
//     };
//     setInventory([...inventory, newItem]);
//   };

//   // Filter inventory based on search
//   const filteredInventory = inventory.filter(item =>
//     item.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Calculate totals
//   const totalItems = inventory.length;
//   const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
//   const selectedCount = selectedItems.length;

//   return (
//     <div className="inventory-dashboard">
//         <TopNav/>
//       {/* Header Section */}
//       <div className="inventory-header">

//         <p className="text-gray-600 mt-2">Monitor inventory status and prevent stock shortages</p>
//         <div className="header-stats">
//           <div className="stat-item">
//             <span className="stat-label">Total Items</span>
//             <span className="stat-value">{totalItems}</span>
//           </div>
//           <div className="stat-item">
//             <span className="stat-label">Total Quantity</span>
//             <span className="stat-value">{totalQuantity}</span>
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="action-bar">
//         <div className="action-left">
//           <button 
//             className={`action-btn delete-btn ${selectedCount === 0 ? 'disabled' : ''}`}
//             onClick={handleDeleteSelected}
//             disabled={selectedCount === 0}
//           >
//             <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//             </svg>
//             Delete {selectedCount > 0 ? `(${selectedCount})` : ''}
//           </button>
//         </div>
        
//         <div className="action-right">
//           <div className="search-contain">
//             <input
//               type="text"
//               className="search-input"
//               placeholder="Search items..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <svg className="search-icon1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
          
//           <button className="action-btn filter-btn">
//             <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
//             </svg>
//             Filters
//           </button>
          
//           <button className="action-btn export-btn" onClick={handleExport}>
//             <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             Export
//           </button>
          
//           <button className="action-btn add-btn" onClick={handleAddItem}>
//             <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//             Add Item
//           </button>
//         </div>
//       </div>

//       {/* Inventory Table */}
//       <div className="inventory-table-container">
//         <table className="inventory-table">
//           <thead>
//             <tr>
//               <th className="checkbox-column">
//                 <input
//                   type="checkbox"
//                   checked={selectedItems.length === inventory.length && inventory.length > 0}
//                   onChange={handleSelectAll}
//                   className="checkbox"
//                 />
//               </th>
//               <th>Product Name</th>
//               <th>Quantity</th>
//               <th>Buy Price</th>
//               <th>Sell Price</th>
//               <th>Last Updated</th>
//               <th className="actions-column">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredInventory.map((item) => (
//               <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}>
//                 <td className="checkbox-column">
//                   <input
//                     type="checkbox"
//                     checked={selectedItems.includes(item.id)}
//                     onChange={() => handleSelectItem(item.id)}
//                     className="checkbox"
//                   />
//                 </td>
//                 <td className="product-name">
//                   <span className="product-text">{item.name}</span>
//                 </td>
//                 <td>
//                   <span className={`quantity-badge ${item.quantity < 20 ? 'low' : item.quantity < 50 ? 'medium' : 'high'}`}>
//                     {item.quantity}
//                   </span>
//                 </td>
//                 <td className="price-cell buy-price">{item.buyPrice}</td>
//                 <td className="price-cell sell-price">{item.sellPrice}</td>
//                 <td className="timestamp">{item.lastUpdated}</td>
//                 <td className="actions-column">
//                   <button className="table-action-btn edit-btn">
//                     <svg className="table-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                     </svg>
//                     Edit
//                   </button>
//                   <button 
//                     className="table-action-btn delete-row-btn"
//                     onClick={() => {
//                       if (window.confirm(`Delete ${item.name}?`)) {
//                         setInventory(inventory.filter(i => i.id !== item.id));
//                       }
//                     }}
//                   >
//                     <svg className="table-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                     </svg>
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
        
//         {filteredInventory.length === 0 && (
//           <div className="empty-state">
//             <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="$20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//             </svg>
//             <p>No inventory items found{searchQuery && ` for "${searchQuery}"`}</p>
//             <button className="add-btn" onClick={handleAddItem}>
//               <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="$12 4v16m8-8H4" />
//               </svg>
//               Add Your First Item
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Summary Footer */}
//       <div className="inventory-summary">
//         <div className="summary-left">
//           Showing <strong>{filteredInventory.length}</strong> of <strong>{inventory.length}</strong> items
//           {selectedCount > 0 && (
//             <span className="selected-count">
//               • <strong>{selectedCount}</strong> selected
//             </span>
//           )}
//         </div>
//         <div className="summary-right">
//           <button className="summary-btn prev-btn" disabled>
//             Previous
//           </button>
//           <span className="page-info">Page 1 of 1</span>
//           <button className="summary-btn next-btn" disabled>
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Inventory;

import React, { useState } from 'react';
import './Inventory.css';

const Inventory = () => {
  // Sample inventory data with stock labels
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Indomie Super Pack', quantity: 240, buyPrice: '$350', sellPrice: '$500', lastUpdated: '2 days ago', stockLabel: 'Normal' },
    { id: 2, name: 'Coca-Cola 50cl', quantity: 96, buyPrice: '$180', sellPrice: '$250', lastUpdated: 'Yesterday', stockLabel: 'Normal' },
    { id: 3, name: 'Peak Milk Sachet', quantity: 60, buyPrice: '$120', sellPrice: '$180', lastUpdated: '3 hours ago', stockLabel: 'Normal' },
    { id: 4, name: 'Jollof Rice Pack', quantity: 15, buyPrice: '$900', sellPrice: '$1,500', lastUpdated: 'Today, 10:15 AM', stockLabel: 'Running Low' },
    { id: 5, name: 'Golden Mom Sachet', quantity: 120, buyPrice: '$250', sellPrice: '$350', lastUpdated: '4 days ago', stockLabel: 'Normal' },
    { id: 6, name: 'MTN Recharge Card', quantity: 5, buyPrice: '$95', sellPrice: '$100', lastUpdated: '1 hour ago', stockLabel: 'Low Stock' },
    { id: 7, name: 'Bag of Pure Water', quantity: 22, buyPrice: '$150', sellPrice: '$200', lastUpdated: 'Yesterday', stockLabel: 'Running Low' },
    { id: 8, name: 'Sprite 50cl', quantity: 12, buyPrice: '$170', sellPrice: '$250', lastUpdated: 'Today, 8:00 AM', stockLabel: 'Running Low' },
    { id: 9, name: 'Power Oil Small', quantity: 18, buyPrice: '$260', sellPrice: '$350', lastUpdated: '5 days ago', stockLabel: 'Running Low' },
    { id: 10, name: 'Fanta 50cl', quantity: 45, buyPrice: '$180', sellPrice: '$250', lastUpdated: 'Today, 11:30 AM', stockLabel: 'Normal' },
    { id: 11, name: 'Bottle Water 75cl', quantity: 8, buyPrice: '$120', sellPrice: '$200', lastUpdated: '2 hours ago', stockLabel: 'Low Stock' },
  ]);

  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort inventory based on sortConfig
  const sortedInventory = [...inventory].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.key === 'quantity') {
      // Numeric sort for quantity
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    } else {
      // String sort for other fields
      if (aValue.toLowerCase() < bValue.toLowerCase()) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue.toLowerCase() > bValue.toLowerCase()) return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Handle checkbox selection
  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === inventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inventory.map(item => item.id));
    }
  };

  // Handle delete selected items
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      const updatedInventory = inventory.filter(item => !selectedItems.includes(item.id));
      setInventory(updatedInventory);
      setSelectedItems([]);
    }
  };

  // Handle export
  const handleExport = () => {
    console.log('Exporting data:', inventory);
    alert('Export functionality would be implemented here');
  };

  // Handle add item
  const handleAddItem = () => {
    const newItem = {
      id: inventory.length + 1,
      name: 'New Product',
      quantity: 0,
      buyPrice: 'M0',
      sellPrice: 'M0',
      lastUpdated: 'Just now',
      stockLabel: 'Normal'
    };
    setInventory([...inventory, newItem]);
  };

  // Filter inventory based on search
  const filteredInventory = sortedInventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.stockLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals and statistics
  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const selectedCount = selectedItems.length;

  // Stock label statistics
  const stockStats = {
    'Normal': inventory.filter(item => item.stockLabel === 'Normal').length,
    'Running Low': inventory.filter(item => item.stockLabel === 'Running Low').length,
    'Low Stock': inventory.filter(item => item.stockLabel === 'Low Stock').length,
  };

  return (
    <div className="inventory-dashboard">
      {/* Header Section */}
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

      {/* Action Buttons */}
      <div className="action-bar">
        <div className="action-left">
          <button 
            className={`action-btn delete-btn ${selectedCount === 0 ? 'disabled' : ''}`}
            onClick={handleDeleteSelected}
            disabled={selectedCount === 0}
          >
            <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete {selectedCount > 0 ? `(${selectedCount})` : ''}
          </button>
        </div>
        
        <div className="action-right">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search items or stock status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Stock Status Summary */}
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

      {/* Inventory Table */}
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
                  <button className="table-action-btn edit-btn">
                    <svg className="table-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    className="table-action-btn delete-row-btn"
                    onClick={() => {
                      if (window.confirm(`Delete ${item.name}?`)) {
                        setInventory(inventory.filter(i => i.id !== item.id));
                      }
                    }}
                  >
                    <svg className="table-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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

      {/* Summary Footer */}
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
    </div>
  );
};

export default Inventory;