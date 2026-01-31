import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  User, 
  LogOut,
  Settings,
  ChevronDown,
  X,
  Menu,
  Sun,
  Moon,
  Store,
  User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CashierTopNav = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [pictureLoaded, setPictureLoaded] = useState(false);
  const [pictureError, setPictureError] = useState(false);
  
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);

  // Load user data from localStorage and fetch profile picture
  useEffect(() => {
    const loadUserData = () => {
      // Try to get user data from storage
      const userDataString = localStorage.getItem('userData');
      const token = localStorage.getItem('token');
      
      if (userDataString) {
        try {
          const parsedUser = JSON.parse(userDataString);
          setUser(parsedUser);
          
          // Extract and load profile picture
          if (parsedUser.picture) {
            loadProfilePicture(parsedUser.picture);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      // Load dark mode preference
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      setDarkMode(savedDarkMode);
      if (savedDarkMode) {
        document.documentElement.classList.add('dark');
      }
    };

    loadUserData();
  }, []);

  // Function to load profile picture from backend
  const loadProfilePicture = (pictureString) => {
    if (!pictureString) {
      setPictureError(true);
      return;
    }

    // Check if pictureString is already a URL
    if (pictureString.startsWith('http')) {
      setProfilePicture(pictureString);
      return;
    }

    // If it's a base64 string, handle it
    if (pictureString.startsWith('data:image')) {
      setProfilePicture(pictureString);
      return;
    }

    // If it's a filename/path from backend
    const baseUrl = 'https://sales-book.onrender.com';
    let pictureUrl = pictureString;
    
    // If it's just a filename, prepend uploads path
    if (!pictureString.includes('/') && !pictureString.startsWith('http')) {
      pictureUrl = `${baseUrl}/uploads/${pictureString}`;
    }
    
    // If it starts with uploads/, prepend base URL
    if (pictureString.startsWith('uploads/')) {
      pictureUrl = `${baseUrl}/${pictureString}`;
    }

    setProfilePicture(pictureUrl);
    setPictureError(false);
  };

  // Fetch user details from API to ensure picture is up to date
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('https://sales-book.onrender.com/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            // Update user data
            setUser(data.user);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            // Update profile picture
            if (data.user.picture) {
              loadProfilePicture(data.user.picture);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    // Fetch user data on component mount
    fetchUserData();
  }, []);

  // Mock notifications and messages data
  useEffect(() => {
    // Simulated notifications
    const mockNotifications = [
      {
        id: 1,
        title: 'New Sale Recorded',
        message: 'Sale #TXN-00123 completed successfully',
        time: '5 min ago',
        read: false,
        type: 'sale'
      },
      {
        id: 2,
        title: 'Low Stock Alert',
        message: 'iPhone 15 Pro is running low (3 units left)',
        time: '1 hour ago',
        read: false,
        type: 'inventory'
      },
      {
        id: 3,
        title: 'System Update',
        message: 'System maintenance scheduled for tonight',
        time: '2 hours ago',
        read: true,
        type: 'system'
      },
      {
        id: 4,
        title: 'Monthly Target',
        message: 'You\'ve achieved 85% of your monthly sales target',
        time: '1 day ago',
        read: true,
        type: 'achievement'
      }
    ];

    // Simulated messages
    const mockMessages = [
      {
        id: 1,
        sender: 'Manager',
        message: 'Great work on yesterday\'s sales!',
        time: '2 hours ago',
        read: false
      },
      {
        id: 2,
        sender: 'Admin',
        message: 'Please update inventory counts',
        time: '5 hours ago',
        read: true
      },
      {
        id: 3,
        sender: 'Team Lead',
        message: 'Team meeting at 3 PM today',
        time: '1 day ago',
        read: true
      }
    ];

    setNotifications(mockNotifications);
    setMessages(mockMessages);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setShowMessages(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Mark notification as read
  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };

  // Mark message as read
  const markMessageAsRead = (id) => {
    setMessages(messages.map(message =>
      message.id === id ? { ...message, read: true } : message
    ));
  };

  // Get unread counts
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => !m.read).length;

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('Searching for:', searchTerm);
      // You can add search functionality here
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return 'C';
    
    const firstName = user.firstName || user.name || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'C';
  };

  // Get user full name
  const getUserFullName = () => {
    if (!user) return 'Cashier';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.name) {
      return user.name;
    } else if (user.username) {
      return user.username;
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Cashier';
  };

  // Get user display name for navbar
  const getUserDisplayName = () => {
    if (!user) return 'Cashier';
    
    if (user.firstName) {
      return user.firstName;
    } else if (user.username) {
      return user.username;
    } else if (user.name) {
      return user.name;
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Cashier';
  };

  // Get user role
  const getUserRole = () => {
    if (!user) return 'Cashier';
    return user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Cashier';
  };

  // Get store/business name
  const getStoreName = () => {
    return localStorage.getItem('storeName') || 'Sales System';
  };

  // Handle image load error
  const handleImageError = () => {
    setPictureError(true);
    setPictureLoaded(false);
  };

  // Handle image load success
  const handleImageLoad = () => {
    setPictureLoaded(true);
    setPictureError(false);
  };

  // Refresh profile picture
  const refreshProfilePicture = () => {
    if (user?.picture) {
      loadProfilePicture(user.picture);
    }
  };

  return (
    <nav className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between w-full">
        {/* Left side - User/Store Name and Mobile Menu */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* User/Store Info */}
          <div className="flex items-center">
            <div>
              <div className="text-sm font-semibold text-gray-800 dark:text-white">
                {getUserFullName()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getUserRole()} • {getStoreName()}
              </div>
            </div>
          </div>
        </div>

        {/* Center - Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions, products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right side - Icons and Profile */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Mobile Search Button */}
          <button
            onClick={() => navigate('/search')}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Search"
          >
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Messages Dropdown */}
          <div className="relative" ref={messagesRef}>
            <button
              onClick={() => {
                setShowMessages(!showMessages);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Messages"
            >
              <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>

            {/* Messages Dropdown Content */}
            {showMessages && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Messages</h3>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {unreadMessages} unread
                    </span>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => markMessageAsRead(message.id)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !message.read ? 'bg-blue-50 dark:bg-gray-900' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <span className="font-medium text-gray-800 dark:text-white">
                                {message.sender}
                              </span>
                              {!message.read && (
                                <span className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {message.message}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {message.time}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No messages</p>
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => navigate('/messages')}
                    className="w-full py-2 text-center text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                  >
                    View All Messages
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowMessages(false);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Content */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {unreadNotifications} new
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !notification.read ? 'bg-blue-50 dark:bg-gray-900' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                            notification.type === 'sale' ? 'bg-green-100 text-green-600' :
                            notification.type === 'inventory' ? 'bg-yellow-100 text-yellow-600' :
                            notification.type === 'system' ? 'bg-blue-100 text-blue-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-800 dark:text-white">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {notification.message}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => navigate('/notifications')}
                    className="w-full py-2 text-center text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
                setShowMessages(false);
              }}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {/* User Avatar with Profile Picture */}
              <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-blue-500 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                {profilePicture && !pictureError ? (
                  <img 
                    src={profilePicture} 
                    alt={getUserFullName()}
                    className="h-full w-full object-cover"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {getUserInitials()}
                  </span>
                )}
              </div>
              
              {/* User Info (Desktop only) */}
              <div className="hidden md:block text-left">
                <div className="font-medium text-gray-800 dark:text-white">
                  {getUserDisplayName()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getUserRole()}
                </div>
              </div>
              
              <ChevronDown className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${
                showProfileMenu ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                {/* User Info Section with Larger Profile Picture */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="h-14 w-14 rounded-full overflow-hidden border-3 border-blue-500 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      {profilePicture && !pictureError ? (
                        <img 
                          src={profilePicture} 
                          alt={getUserFullName()}
                          className="h-full w-full object-cover"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-white font-semibold text-lg">
                          {getUserInitials()}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {getUserFullName()}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getUserRole()} • {getStoreName()}
                      </p>
                      {user?.email && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => navigate('/cashier-profile')}
                    className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <UserIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                    My Profile
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isMobileMenuOpen && (
        <div className="mt-4 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </nav>
  );
};

export default CashierTopNav;