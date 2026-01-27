import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  Trash2,
  MoreVertical,
  Upload,
  User,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import TopNav from '../TopNav';

// Add User Modal Component
const AddUserModal = ({ isVisible, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const CLOUDINARY_CLOUD_NAME = 'dwqxxunes';
  const CLOUDINARY_UPLOAD_PRESET = 'sales_book';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const uploadToCloudinary = async (file) => {
    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
      formData.append('folder', 'user_profiles');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    try {
      const imageUrl = await uploadToCloudinary(file);
      setProfilePictureUrl(imageUrl);
      setUploadError('');
    } catch (error) {
      setUploadError(`Failed to upload image: ${error.message}`);
    }
  };

  const removeImage = () => {
    setProfilePictureUrl('');
    setUploadError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phoneNumber) {
      setUploadError('Please fill in all required fields (*)');
      return;
    }
    
    const userData = {
      ...formData,
      picture: profilePictureUrl || ''
    };
    
    await onSave(userData);
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={() => !isUploading && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
          Add New User
        </h2>
        
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <label
              htmlFor="profilePicture"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: profilePictureUrl ? 'transparent' : '#f1f5f9',
                border: profilePictureUrl ? 'none' : '2px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                overflow: 'hidden',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                opacity: isUploading ? 0.6 : 1
              }}
            >
              {isUploading ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 8px'
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Uploading...</span>
                </div>
              ) : profilePictureUrl ? (
                <img 
                  src={profilePictureUrl} 
                  alt="Profile preview" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Upload size={24} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Upload Photo</span>
                </div>
              )}
            </label>
            
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              style={{ display: 'none' }}
            />
            
            {profilePictureUrl && !isUploading && (
              <button
                type="button"
                onClick={removeImage}
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
          
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            Recommended: Square image, max 5MB
          </p>
          
          {uploadError && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
              {uploadError}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
              required
              disabled={isUploading || isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                opacity: (isUploading || isLoading) ? 0.6 : 1,
                cursor: (isUploading || isLoading) ? 'not-allowed' : 'text'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter last name"
              required
              disabled={isUploading || isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                opacity: (isUploading || isLoading) ? 0.6 : 1,
                cursor: (isUploading || isLoading) ? 'not-allowed' : 'text'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              required
              disabled={isUploading || isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                opacity: (isUploading || isLoading) ? 0.6 : 1,
                cursor: (isUploading || isLoading) ? 'not-allowed' : 'text'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
              disabled={isUploading || isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                opacity: (isUploading || isLoading) ? 0.6 : 1,
                cursor: (isUploading || isLoading) ? 'not-allowed' : 'text'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              required
              disabled={isUploading || isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                opacity: (isUploading || isLoading) ? 0.6 : 1,
                cursor: (isUploading || isLoading) ? 'not-allowed' : 'text'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number (e.g. +1234567891)"
              required
              disabled={isUploading || isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                opacity: (isUploading || isLoading) ? 0.6 : 1,
                cursor: (isUploading || isLoading) ? 'not-allowed' : 'text'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                setProfilePictureUrl('');
                setUploadError('');
                setFormData({
                  firstName: '',
                  lastName: '',
                  username: '',
                  email: '',
                  password: '',
                  phoneNumber: '',
                  role: 'cashier'
                });
              }}
              disabled={isUploading || isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: (isUploading || isLoading) ? 'not-allowed' : 'pointer',
                opacity: (isUploading || isLoading) ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: (isUploading || isLoading) ? 'not-allowed' : 'pointer',
                opacity: (isUploading || isLoading) ? 0.6 : 1
              }}
            >
              {isLoading ? 'Adding User...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({ isVisible, message, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '40px', maxWidth: '400px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          margin: '0 auto 20px',
          backgroundColor: '#dcfce7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Check size={32} style={{ color: '#16a34a' }} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
          Success!
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '10px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Error Modal Component
const ErrorModal = ({ isVisible, message, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '40px', maxWidth: '400px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          margin: '0 auto 20px',
          backgroundColor: '#fee2e2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <X size={32} style={{ color: '#dc2626' }} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
          Error
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '10px 24px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ 
  isVisible, 
  onClose, 
  onConfirm, 
  isLoading, 
  selectedCount,
  selectedUserNames 
}) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={() => !isLoading && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 20px',
            backgroundColor: '#fef3c7',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={32} style={{ color: '#d97706' }} />
          </div>
          
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>
            Delete {selectedCount} User{selectedCount > 1 ? 's' : ''}
          </h2>
          
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
            Are you sure you want to delete the selected user{selectedCount > 1 ? 's' : ''}? 
            This action cannot be undone.
          </p>
          
          {selectedUserNames.length > 0 && (
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>
                Selected users:
              </p>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {selectedUserNames.map((name, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    • {name}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '10px 24px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                padding: '10px 24px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Deleting...' : `Delete ${selectedCount} User${selectedCount > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const getOptimizedImageUrl = (originalUrl) => {
  if (!originalUrl) return null;
  
  if (originalUrl.includes('cloudinary.com')) {
    return originalUrl.replace('/upload/', '/upload/w_100,h_100,c_fill,q_auto:good/');
  }
  
  return originalUrl;
};

const Users = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [users, setUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsFetchingUsers(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const endpoint = 'https://sales-system-production.up.railway.app/api/auth/get-all-cashiers';
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let transformedUsers = [];
      
      if (data.success && Array.isArray(data.cashiers)) {
        transformedUsers = data.cashiers.map((cashier, index) => ({
          id: cashier._id || `user-${index + 1}`,
          name: `${cashier.firstName || ''} ${cashier.lastName || ''}`.trim(),
          email: cashier.email || '',
          phone: cashier.phoneNumber || 'N/A',
          username: cashier.username || '',
          role: cashier.role || 'Cashier',
          profilePicture: cashier.picture || null
        }));
      } else if (data.data && Array.isArray(data.data)) {
        transformedUsers = data.data.map((cashier, index) => ({
          id: cashier._id || `user-${index + 1}`,
          name: `${cashier.firstName || ''} ${cashier.lastName || ''}`.trim(),
          email: cashier.email || '',
          phone: cashier.phoneNumber || 'N/A',
          username: cashier.username || '',
          role: cashier.role || 'Cashier',
          profilePicture: cashier.picture || null
        }));
      } else if (Array.isArray(data)) {
        transformedUsers = data.map((cashier, index) => ({
          id: cashier._id || `user-${index + 1}`,
          name: `${cashier.firstName || ''} ${cashier.lastName || ''}`.trim(),
          email: cashier.email || '',
          phone: cashier.phoneNumber || 'N/A',
          username: cashier.username || '',
          role: cashier.role || 'Cashier',
          profilePicture: cashier.picture || null
        }));
      } else {
        throw new Error('Invalid response format from server');
      }
      
      setUsers(transformedUsers);
      setFetchError('');
      
    } catch (error) {
      console.error('Error fetching cashiers:', error);
      setFetchError(error.message || 'Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Add User
  const handleAddUser = async (userData) => {
    setIsLoadingUser(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: 'cashier',
        phoneNumber: userData.phoneNumber,
        picture: userData.picture || ''
      };

      const response = await fetch(
        'https://sales-system-production.up.railway.app/api/auth/register-cashier',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(`User ${userData.firstName} ${userData.lastName} has been added successfully!`);
        setShowSuccessModal(true);
        setShowAddUserModal(false);
        
        await fetchUsers();
        
      } else {
        setErrorMessage(data.message || 'Failed to add user. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setErrorMessage('An error occurred while adding the user. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Handle Delete Selected Users
  const handleDeleteSelected = () => {
    if (selectedUsers.length === 0) return;
    setShowDeleteModal(true);
  };

  const confirmDeleteUsers = async () => {
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const deletePromises = selectedUsers.map(async (userId) => {
        const response = await fetch(
          `https://sales-system-production.up.railway.app/api/auth/${userId}/delete-cashier`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to delete user ${userId}`);
        }

        return response.json();
      });

      await Promise.all(deletePromises);
      
      setUsers(prevUsers => prevUsers.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      
      setSuccessMessage(`Successfully deleted ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`);
      setShowSuccessModal(true);
      
      setShowDeleteModal(false);
      
    } catch (error) {
      console.error('Error deleting users:', error);
      setErrorMessage(`Failed to delete users: ${error.message}`);
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Helper functions
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery) ||
    (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const selectedUserNames = users
    .filter(user => selectedUsers.includes(user.id))
    .map(user => user.name);

  return (
    <div className="p-6">
      <TopNav />
      
      <AddUserModal 
        isVisible={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSave={handleAddUser}
        isLoading={isLoadingUser}
      />
      
      <DeleteConfirmationModal 
        isVisible={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDeleteUsers}
        isLoading={isDeleting}
        selectedCount={selectedUsers.length}
        selectedUserNames={selectedUserNames}
      />
      
      <SuccessModal 
        isVisible={showSuccessModal} 
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
      
      <ErrorModal 
        isVisible={showErrorModal} 
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />

      <div className="mb-8">
        
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Users & Roles</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isFetchingUsers ? 'Loading...' : `${users.length} Users`}
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            {selectedUsers.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={18} className="mr-2" />
                Delete ({selectedUsers.length})
              </button>
            )}
            
            <button className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Filter size={18} className="mr-2" />
              Filters
            </button>
            
            <button className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Download size={18} className="mr-2" />
              Export
            </button>
            
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={18} className="mr-2" />
              Add User
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {fetchError && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{fetchError}</p>
          </div>
        )}

        {isFetchingUsers ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="w-12 px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const imageUrl = getOptimizedImageUrl(user.profilePicture);
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelection(user.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-blue-100">
                              {imageUrl ? (
                                <img 
                                  src={imageUrl} 
                                  alt={user.name}
                                  className="h-full w-full object-cover"
                                  crossOrigin="anonymous"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `
                                      <div class="h-full w-full flex items-center justify-center bg-blue-100">
                                        <span class="text-blue-600 font-semibold">${user.name.charAt(0)}</span>
                                      </div>
                                    `;
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-blue-100">
                                  <span className="text-blue-600 font-semibold">
                                    {user.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              {user.username && (
                                <div className="text-xs text-gray-500">@{user.username}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && !isFetchingUsers && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'Try adjusting your search query' : 'Get started by adding your first user'}
                </p>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus size={18} className="mr-2" />
                  Add User
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Users;