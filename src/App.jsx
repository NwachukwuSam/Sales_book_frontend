import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Analytics from './components/dashboard/Analytics';
import Inventory from './components/dashboard/Inventory';
import PosHistory from './components/dashboard/PosHistory';
import SalesHistory from './components/dashboard/SalesHistory';
import SalesItems from './components/dashboard/SalesItems';
import AdminDashboard from './pages/AdminDashboard';
import WelcomeTwo from './pages/WelcomeTwo';
import Users from './components/dashboard/Users';
import UserDetails from './components/dashboard/UserDetails';

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
            <AdminDashboard />
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
        
        <Route path="/pos-history" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <PosHistory />
          </Layout>
        } />
        
        <Route path="/sales-history" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <SalesHistory />
          </Layout>
        } />
        
        <Route path="/sales-items" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <SalesItems />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
