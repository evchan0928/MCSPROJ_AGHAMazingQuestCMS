import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Modal } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  CalendarOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import { 
  getCurrentUser, 
  updateUser 
} from '../api/django-api';
import './AccountSettingsPage.css';

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  
  // State for user data
  const [userData, setUserData] = useState({
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    bio: '',
    location: '',
    birth_date: ''
  });
  
  // State for loading and saving
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Get current user data
      const user = await getCurrentUser();
      setUserData({
        id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        bio: user.bio || '',
        location: user.location || '',
        birth_date: user.birth_date || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      message.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update user data using the API function
      // Since we're updating the current user, use 'current' as the ID
      await updateUser('current', {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone_number: userData.phone_number,
        bio: userData.bio,
        location: userData.location,
        birth_date: userData.birth_date
      });
      
      message.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(`Failed to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    // Confirm logout with user
    Modal.confirm({
      title: 'Confirm Log Out',
      content: 'Are you sure you want to log out?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        // Remove tokens from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Navigate to login page
        navigate('/signin');
        message.success('Logged out successfully');
      }
    });
  };

  const handleCancelChanges = () => {
    // Reload user data to revert changes
    loadUserData();
  };

  return (
    <div className="account-settings-container">
      <div className="account-settings-card">
        <div className="settings-header">
          <h1 className="settings-title">Account Settings</h1>
          <p className="settings-subtitle">Manage your personal information and preferences</p>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="settings-content">
            <div className="profile-section">
              <h2 className="section-title">Profile Information</h2>
              
              <div className="form-grid">
                <div className="form-group half-width">
                  <label htmlFor="first_name">
                    <UserOutlined /> First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={userData.first_name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div className="form-group half-width">
                  <label htmlFor="last_name">
                    <UserOutlined /> Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={userData.last_name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your last name"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="email">
                    <MailOutlined /> Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div className="form-group half-width">
                  <label htmlFor="phone_number">
                    <PhoneOutlined /> Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={userData.phone_number}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="form-group half-width">
                  <label htmlFor="birth_date">
                    <CalendarOutlined /> Birth Date
                  </label>
                  <input
                    type="date"
                    id="birth_date"
                    name="birth_date"
                    value={userData.birth_date}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="location">
                    <HomeOutlined /> Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={userData.location}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your location"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={userData.bio}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>
              </div>
            </div>
            
            <div className="security-section">
              <h2 className="section-title">Security Settings</h2>
              
              <div className="security-options">
                <div className="security-item">
                  <div className="security-info">
                    <LockOutlined className="security-icon" />
                    <div>
                      <h3>Change Password</h3>
                      <p>Update your account password regularly for security</p>
                    </div>
                  </div>
                  <button 
                    className="btn-secondary"
                    onClick={() => navigate('/change-password')}
                  >
                    Change Password
                  </button>
                </div>
                
                <div className="security-item">
                  <div className="security-info">
                    <SafetyCertificateOutlined className="security-icon" />
                    <div>
                      <h3>Two-Factor Authentication</h3>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <button className="btn-secondary">
                    Configure
                  </button>
                </div>
              </div>
            </div>
            
            <div className="account-actions">
              <button 
                className="btn-secondary"
                onClick={handleCancelChanges}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSave}
                disabled={saving || loading}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
        
        <div className="logout-section">
          <div className="logout-action">
            <LogoutOutlined className="logout-icon" />
            <div>
              <h3>Log Out</h3>
              <p>End your current session</p>
            </div>
            <button 
              className="btn-danger"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}