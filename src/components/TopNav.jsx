import React, { useState, useEffect, useRef } from 'react';
import './TopNav.css';

const TopNav = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);
  const [messageCount, setMessageCount] = useState(2);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const [pictureError, setPictureError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsLoadingUser(false);
          return;
        }

        const response = await fetch(
          "https://sales-system-production.up.railway.app/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch user");

        const data = await response.json();
        console.log("ME RESPONSE:", data);

        const userData = data.user || data;
        setUser(userData);
        
        // Load profile picture from user data
        if (userData.picture) {
          loadProfilePicture(userData.picture);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
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
    const baseUrl = 'https://sales-system-production.up.railway.app';
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

  // Refresh profile picture
  const refreshProfilePicture = () => {
    if (user?.picture) {
      loadProfilePicture(user.picture);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return 'U';
    
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
    
    return 'U';
  };

  // Get user full name
  const getUserFullName = () => {
    if (!user) return 'User';
    
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
    
    return 'User';
  };

  // Get user display name for navbar
  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    if (user.firstName) {
      return user.firstName;
    } else if (user.username) {
      return user.username;
    } else if (user.name) {
      return user.name;
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  // Get user role
  const getUserRole = () => {
    if (!user) return 'User';
    return user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  };

  // Handle image load error
  const handleImageError = () => {
    setPictureError(true);
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
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  return (
    <nav className="topnav" onClick={() => {
      setIsNotificationsOpen(false);
      setIsProfileOpen(false);
    }}>
      <div className="topnav-left">
        <div className="logo flex" onClick={handleLogoClick}>
          <span className="logo-text">
            {isLoadingUser ? "Loading..." : getUserFullName()}
          </span>
          {user && (
            <span className="user-role-badge">
              {getUserRole()}
            </span>
          )}
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
              {profilePicture && !pictureError ? (
                <img
                  src={profilePicture}
                  alt={getUserFullName()}
                  className="profile-image"
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <div className="profile-fallback">
                  {getUserInitials()}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div 
                className="dropdown profile-dropdown" 
                ref={profileRef}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="profile-info">
                  {profilePicture && !pictureError ? (
                    <img
                      src={profilePicture}
                      alt={getUserFullName()}
                      className="dropdown-avatar"
                      onError={handleImageError}
                      loading="lazy"
                    />
                  ) : (
                    <div className="dropdown-avatar-fallback">
                      {getUserInitials()}
                    </div>
                  )}
                  <div className="user-info">
                    <div className="user-name">{getUserFullName()}</div>
                    <div className="user-email">{user?.email || 'No email'}</div>
                    <div className="user-role">{getUserRole()}</div>
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