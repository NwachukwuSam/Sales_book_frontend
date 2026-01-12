// components/Layout.jsx
import React from 'react';
import Sidebar from './SideBar';

const Layout = ({ children, activeSection, setActiveSection }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;