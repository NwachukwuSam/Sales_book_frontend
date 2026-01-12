

// // App.jsx
// import React, { useState } from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './components/Layout';
// import SalesDashboard from './pages/SalesDashboard';
// import Welcome from './pages/Welcome';
// import Login from './pages/Login';
// import Analytics from './components/dashboard/Analytics';
// import Inventory from './components/dashboard/Inventory';
// import PosHistory from './components/dashboard/PosHistory';
// import SalesHistory from './components/dashboard/SalesHistory';
// import SalesItems from './components/dashboard/SalesItems';
// import UserDetails from './components/dashboard/UserDetails';
// import UserRoles from './components/dashboard/UserRoles';

// function App() {
//   const [activeSection, setActiveSection] = useState('dashboard');

//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public routes without sidebar */}
//         <Route path="/" element={<Welcome />} />
//         <Route path="/login" element={<Login />} />
        
//         {/* Protected routes with sidebar */}
//         <Route path="/sales-dashboard" element={
//           <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
//             <SalesDashboard />
//           </Layout>
//         } />
        
//         <Route path="/analytics" element={
//           <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
//             <Analytics />
//           </Layout>
//         } />
        
//         <Route path="/inventory" element={
//           <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
//             <Inventory />
//           </Layout>
//         } />
        
//         <Route path="/pos-history" element={
//           <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
//             <PosHistory />
//           </Layout>
//         } />
        
//         <Route path="/sales-history" element={
//           <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
//             <SalesHistory />
//           </Layout>
//         } />
        
//         <Route path="/sales-items" element={
//           <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
//             <SalesItems />
//           </Layout>
//         } />
        
//         <Route path="/user-details" element={
//           <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
//             <UserDetails />
//           </Layout>
//         } />
        
//         <Route path="/user-roles" element={
//           <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
//             <UserRoles />
//           </Layout>
//         } />
        
//         {/* Redirect to sales-dashboard by default */}
//         <Route path="*" element={<Navigate to="/sales-dashboard" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

// App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import SalesDashboard from './pages/SalesDashboard';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Analytics from './components/dashboard/Analytics';
import Inventory from './components/dashboard/Inventory';
import PosHistory from './components/dashboard/PosHistory';
import SalesHistory from './components/dashboard/SalesHistory';
import SalesItems from './components/dashboard/SalesItems';
import UserDetails from './components/dashboard/UserDetails';
import UserRoles from './components/dashboard/UserRoles';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
        {/* All routes use the same Layout with Sidebar */}
        <Route path="/" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <Navigate to="/sales-dashboard" replace />
          </Layout>
        } />
        
        <Route path="/sales-dashboard" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <SalesDashboard />
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
        
        <Route path="/user-details" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <UserDetails />
          </Layout>
        } />
        
        <Route path="/user-roles" element={
          <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
            <UserRoles />
          </Layout>
        } />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/sales-dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
