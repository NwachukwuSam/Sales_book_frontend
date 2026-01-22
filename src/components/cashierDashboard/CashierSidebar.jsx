import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  History,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Receipt,
  DollarSign,
  Clock
} from 'lucide-react';
import logo from '../../assets/singleLogo.png';

const CashierSidebar = ({ activeSection, setActiveSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/cashier-dashboard'
    },
    { 
      id: 'quick-sale', 
      label: 'Quick Sale', 
      icon: <DollarSign className="w-5 h-5" />,
      path: '/quick-sale'
    },
    { 
      id: 'pos', 
      label: 'POS System', 
      icon: <ShoppingCart className="w-5 h-5" />,
      path: '/pos'
    },
    
    // { 
    //   id: 'inventory', 
    //   label: 'Inventory', 
    //   icon: <Package className="w-5 h-5" />,
    //   path: '/cashier-inventory'
    // },
    { 
      id: 'sales-history', 
      label: 'My Sales', 
      icon: <History className="w-5 h-5" />,
      path: '/cashier-sales-history'
    },
    // { 
    //   id: 'today-transactions', 
    //   label: 'Today\'s Transactions', 
    //   icon: <Clock className="w-5 h-5" />,
    //   path: '/today-transactions'
    // },
    { 
      id: 'receipts', 
      label: 'Receipts', 
      icon: <Receipt className="w-5 h-5" />,
      path: '/receipts'
    },
    { 
      id: 'reports', 
      label: 'Daily Report', 
      icon: <FileText className="w-5 h-5" />,
      path: '/cashier-report'
    },
    { 
      id: 'settings', 
      label: 'My Settings', 
      icon: <Settings className="w-5 h-5" />,
      path: '/cashier-settings'
    },
  ];

  // Determine active section based on current route
  const getActiveSectionFromPath = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find(item => item.path === currentPath);
    return menuItem ? menuItem.id : 'dashboard';
  };

  const handleNavigation = (item) => {
    setActiveSection(item.id);
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  // Update active section when route changes
  React.useEffect(() => {
    const sectionId = getActiveSectionFromPath();
    setActiveSection(sectionId);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gradient-to-b from-blue-700 to-blue-800
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-blue-400">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
             <img src={logo} alt="logo" />
            </div>
            <h1 className="text-white text-2xl font-bold">PASORIDO</h1>
          </div>
          <p className="text-blue-200 text-sm mt-2">Cashier Panel</p>
          {/* Optional: Show cashier name */}
          <div className="mt-1 text-white text-sm font-medium">
            Welcome, Cashier!
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${activeSection === item.id
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'text-white hover:bg-blue-400 hover:text-white hover:cursor-pointer'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Cashier info and logout */}
        <div className="p-4 border-t border-blue-300 space-y-4">
          {/* Cashier shift info (optional) */}
          <div className="text-white text-sm p-2 bg-blue-600/50 rounded">
            <div className="font-medium">Shift: 9:00 AM - 5:00 PM</div>
            <div className="text-xs text-blue-200">Status: Active</div>
          </div>
          
          {/* Logout button */}
          <button 
            className="
              w-full flex items-center space-x-3 px-4 py-3 rounded-lg
              text-red-400 hover:bg-red-700/50 hover:text-white hover:cursor-pointer
              transition-all duration-200
            "
            onClick={() => {
              // Add cashier-specific logout logic here
              console.log('Cashier logout clicked');
              // Example: End shift and logout
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">End Shift & Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default CashierSidebar;