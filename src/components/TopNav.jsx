import React, { useState, useEffect, useRef } from 'react';
import './TopNav.css';

const TopNav = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);
  const [messageCount, setMessageCount] = useState(2);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sample user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  };

  // Sample notifications
  const notifications = [
    { id: 1, text: 'New user registered', time: '5 min ago' },
    { id: 2, text: 'Payment received', time: '1 hour ago' },
    { id: 3, text: 'System update scheduled', time: '2 hours ago' },
  ];

  // Create refs for dropdowns
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close notifications if click is outside
      if (isNotificationsOpen && 
          notificationRef.current && 
          !notificationRef.current.contains(event.target) &&
          notificationButtonRef.current &&
          !notificationButtonRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }

      // Close profile if click is outside
      if (isProfileOpen && 
          profileRef.current && 
          !profileRef.current.contains(event.target) &&
          profileButtonRef.current &&
          !profileButtonRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen, isProfileOpen]);

  // Close other dropdown when one opens
  const handleNotificationClick = (e) => {
    e.stopPropagation();
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false); // Close profile if open
    if (!isNotificationsOpen) {
      setNotificationCount(0); // Clear notifications when opened
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false); // Close notifications if open
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Close dropdowns when searching
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  };

  // Handle search input click (to prevent unwanted closes)
  const handleSearchClick = (e) => {
    e.stopPropagation();
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  };

  // Handle logo click
  const handleLogoClick = () => {
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  };

  // Handle dropdown item click
  const handleDropdownItemClick = () => {
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    setIsProfileOpen(false);
    // Implement logout functionality
  };

  return (
    <nav className="topnav" onClick={() => {
      setIsNotificationsOpen(false);
      setIsProfileOpen(false);
    }}>
      <div className="topnav-left">
        <div className="logo flex" onClick={handleLogoClick}>
          <p className="text-gray-600 mt-2 text-1">Welcome back</p>
          <span className="logo-text"> {user.name}</span>
        </div>
      </div>

      <div className="topnav-center">
        <form className="search-container" onSubmit={handleSearch} onClick={handleSearchClick}>
          <input
            type="text"
            className="search-input"
            placeholder="Search dashboard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={handleSearchClick}
          />
          <button type="submit" className="search-button" onClick={handleSearchClick}>
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      <div className="topnav-right">
        <div className="nav-icons">
          {/* Messages Icon */}
          <div className="icon-container">
            <div className="message-icon" onClick={handleDropdownItemClick}>
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {messageCount > 0 && (
                <span className="badge">{messageCount}</span>
              )}
            </div>
          </div>

          {/* Notifications Icon */}
          <div className="icon-container">
            <div 
              className="notification-icon" 
              onClick={handleNotificationClick}
              ref={notificationButtonRef}
            >
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="badge">{notificationCount}</span>
              )}
            </div>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div 
                className="dropdown notifications-dropdown" 
                ref={notificationRef}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                  <span 
                    className="clear-all" 
                    onClick={() => {
                      console.log('Clearing all notifications');
                      handleDropdownItemClick();
                    }}
                  >
                    Clear all
                  </span>
                </div>
                <div className="dropdown-content">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className="notification-item"
                      onClick={handleDropdownItemClick}
                    >
                      <div className="notification-text">{notification.text}</div>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Picture */}
          <div className="profile-container">
            <div 
              className="profile-picture" 
              onClick={handleProfileClick}
              ref={profileButtonRef}
            >
              <img 
                src={user.avatar} 
                alt={user.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                }}
              />
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div 
                className="dropdown profile-dropdown" 
                ref={profileRef}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="profile-info">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="dropdown-avatar"
                  />
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
                <div className="dropdown-content">
                  <a 
                    href="/profile" 
                    className="dropdown-item"
                    onClick={handleDropdownItemClick}
                  >
                    <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </a>
                  <a 
                    href="/settings" 
                    className="dropdown-item"
                    onClick={handleDropdownItemClick}
                  >
                    <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </a>
                  <div className="dropdown-divider"></div>
                  <button 
                    onClick={handleLogout} 
                    className="dropdown-item logout"
                  >
                    <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;