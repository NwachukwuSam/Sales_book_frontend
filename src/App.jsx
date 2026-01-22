import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Login from './pages/Login';
import Analytics from './components/adminDashboard/Dashboard';
import Inventory from './components/adminDashboard/Inventory';
import PosHistory from './components/adminDashboard/PosHistory';
import SalesHistory from './components/adminDashboard/SalesHistory';
import WelcomeTwo from './pages/WelcomeTwo';
import Users from './components/adminDashboard/Users';
import UserDetails from './components/adminDashboard/UserDetails';

import Dashboard from './components/adminDashboard/Dashboard';
import Report from './components/adminDashboard/Report';
import CashierLayout from './components/CashierLayout';
import CashierDashboard from './components/cashierDashboard/CashierDashboard';
import QuickSale from './components/cashierDashboard/QuickSale';
import CashierInventory from './components/cashierDashboard/CashierInventory';
import CashierSalesHistory from './components/cashierDashboard/CashierSalesHistory';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<WelcomeTwo />} />
          <Route path="/login" element={<Login />} />

        {/* All routes use the same Layout with Sidebar */}
        <Route path="/" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <Navigate to="/admin-dashboard" replace />
          </Layout>
        } />
        
        <Route path="/admin-dashboard" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <Dashboard />
          </Layout>
        } />
        
        <Route path="/analytics" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <Analytics />
          </Layout>
        } />
        
        <Route path="/inventory" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <Inventory />
          </Layout>
        } />
        <Route path="/sales-history" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <SalesHistory/>
          </Layout>
        } />
        
        <Route path="/pos-history" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <PosHistory />
          </Layout>
        } />
        
        <Route path="/report" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <Report />
          </Layout>
        } />
        
        <Route path="/users" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <Users />
          </Layout>
        } />
        
        <Route path="/user-details" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <UserDetails/>
          </Layout>
        } />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />

        {/* All Cashier routes use the CashierLayout with CashierSidebar */}
         <Route path="/cashier-dashboard" element={
          <CashierLayout activeSection={activeSection} setActiveSection={setActiveSection}>
            <CashierDashboard/>
          </CashierLayout>
        } />

        <Route path="/quick-sale" element={
          <CashierLayout activeSection={activeSection} setActiveSection={setActiveSection}>
            <QuickSale/>
          </CashierLayout>
        } />
        <Route path="/cashier-inventory" element={
          <CashierLayout activeSection={activeSection} setActiveSection={setActiveSection}>
            <CashierInventory/>
          </CashierLayout>
        } />
        <Route path="/cashier-sales-history" element={
          <CashierLayout activeSection={activeSection} setActiveSection={setActiveSection}>
            <CashierSalesHistory/>
          </CashierLayout>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
