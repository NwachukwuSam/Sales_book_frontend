import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Package,
  History,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  ShoppingBag
} from 'lucide-react';
import logo from '../../assets/singleLogo.png';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      id: 'admin-dashboard', 
      label: 'Dashboard', 
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/admin-dashboard'
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: <Package className="w-5 h-5" />,
      path: '/inventory'
    },
    { 
      id: 'history', 
      label: 'Sales History', 
      icon: <History className="w-5 h-5" />,
      path: '/sales-history'
    },
    { 
      id: 'posHistory', 
      label: 'POS History', 
      icon: <FileText className="w-5 h-5" />,
      path: '/pos-history'
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: <FileText className="w-5 h-5" />,
      path: '/report'
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: <Users className="w-5 h-5" />,
      path: '/users'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings className="w-5 h-5" />,
      path: '/user-roles'
    },
  ];

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
        w-64 bg-gradient-to-b from-green-700 to-green-800
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-green-400">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
             <img src={logo} alt="logo" />
            </div>
            <h1 className="text-white text-2xl font-bold">PASORIDO</h1>
          </div>
          <p className="text-blue-200 text-sm mt-2">Admin Panel</p>
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
                  ? 'bg-white text-green-600 shadow-lg'
                  : 'text-white hover:bg-green-400 hover:text-white hover:cursor-pointer'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-green-300">
          <button 
            className="
              w-full flex items-center space-x-3 px-4 py-3 rounded-lg
              text-red-400 hover:bg-red-700/50 hover:text-white hover:cursor-pointer
              transition-all duration-200
            "
            onClick={() => {
              // Add logout logic here
              console.log('Logout clicked');
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
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

export default Sidebar;