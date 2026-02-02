import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Login from './auth/Login';
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

import ProtectedRoute from './auth/ProtedtedRoutes';
import { AuthProvider } from './auth/AuthContext';
import ProfilePage from './components/adminDashboard/ProfilePage';
import CashierProfile from './components/cashierDashboard/CashierProfile';
import POSPage from './components/cashierDashboard/POSPage';
import ExpensesPage from './components/adminDashboard/ExpensesPage';
import Profit from './components/adminDashboard/Profit';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<WelcomeTwo />} />
        <Route path="/login" element={<Login />} />
     

        {/* Admin Routes - Protected */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <Inventory />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/sales-history" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <SalesHistory />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/pos-history" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <PosHistory />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/report" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <Report />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <Users />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/user-details" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <UserDetails />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <ExpensesPage/>
            </Layout>
          </ProtectedRoute>
        } />
         <Route path="/report" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <Report/>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profit" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
              <Profit/>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Cashier Routes - Protected */}
        <Route path="/cashier-dashboard" element={
          <ProtectedRoute allowedRoles={['cashier']}>
            <CashierLayout activeSection={activeSection} setActiveSection={setActiveSection}>
              <CashierDashboard />
            </CashierLayout>
          </ProtectedRoute>
        } />

        <Route path="/quick-sale" element={
          <ProtectedRoute allowedRoles={['cashier']}>
            <CashierLayout activeSection={activeSection} setActiveSection={setActiveSection}>
              <QuickSale />
            </CashierLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/cashier-inventory" element={
          <ProtectedRoute allowedRoles={['cashier']}>
            <CashierLayout activeSection={activeSection} setActiveSection={setActiveSection}>
              <CashierInventory />
            </CashierLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/cashier-sales-history" element={
          <ProtectedRoute allowedRoles={['cashier']}>
            <CashierLayout activeSection={activeSection} setActiveSection={setActiveSection}>
              <CashierSalesHistory />
            </CashierLayout>
          </ProtectedRoute>
        } />
        <Route path="/cashier-profile" element={
          <ProtectedRoute allowedRoles={['cashier']}>
            <CashierLayout activeSection={activeSection} setActiveSection={setActiveSection}>
              <CashierProfile />
            </CashierLayout>
          </ProtectedRoute>
        } />
        <Route path="/pos-page" element={
          <ProtectedRoute allowedRoles={['cashier']}>
            <CashierLayout activeSection={activeSection} setActiveSection={setActiveSection}>
              <POSPage/>
            </CashierLayout>
          </ProtectedRoute>
        } />

        {/* Shared Routes (if any - both admin and cashier can access) */}
        {/* Example: <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['admin', 'cashier']}>
            <Profile />
          </ProtectedRoute>
        } /> */}

        {/* Catch-all redirect based on user role */}
        <Route path="*" element={
          <ProtectedRoute>
            {() => {
              const role = localStorage.getItem('userRole');
              if (role === 'admin') {
                return <Navigate to="/admin-dashboard" replace />;
              } else if (role === 'cashier') {
                return <Navigate to="/cashier-dashboard" replace />;
              } else {
                return <Navigate to="/login" replace />;
              }
            }}
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
