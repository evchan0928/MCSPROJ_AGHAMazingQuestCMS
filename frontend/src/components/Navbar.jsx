import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';
import { Layout, Button, Dropdown, Space, Avatar, Badge, message } from 'antd';
import { getCurrentUser, getNotifications } from '../api/django-api';
import NotificationPanel from './notifications/NotificationPanel';

const { Header } = Layout;

const Navbar = ({ collapsed, onToggle }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch actual user data
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        // If unable to fetch user, redirect to sign in
        message.error('Session expired. Please sign in again.');
        navigate('/signin');
      }
    };

    // Fetch notification count
    const fetchNotificationCount = async () => {
      try {
        const notifications = await getNotifications();
        const unreadCount = notifications.filter(n => !n.is_read).length;
        setUnreadNotifications(unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchCurrentUser();
    fetchNotificationCount();
    
    // Set up interval to periodically update notification count (every 30 seconds)
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    // Remove tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Navigate to login page
    navigate('/signin');
    message.success('Logged out successfully');
  };

  // Dropdown menu for user profile
  const profileMenuItems = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/dashboard/profile')
    },
    {
      key: 'settings',
      label: 'Account Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/dashboard/account-settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Log Out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout
    }
  ];

  // Notification dropdown overlay - wrapped in a div to ensure single element
  const notificationOverlay = (
    <div key="notification-overlay" style={{ width: '320px' }}>
      <NotificationPanel />
    </div>
  );

  return (
    <Header className="site-layout-background navbar" style={{ padding: '0 16px', background: '#fff' }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
          padding: 0,
        }}
      />
      
      <div className="navbar-right" style={{ float: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notifications dropdown */}
        <Dropdown
          overlay={notificationOverlay}
          trigger={['click']}
          placement="bottomRight"
        >
          <Badge count={unreadNotifications} overflowCount={99}>
            <Button 
              type="text" 
              shape="circle" 
              size="large"
              style={{ marginRight: 16 }}
            >
              <BellOutlined style={{ fontSize: '18px' }} />
            </Button>
          </Badge>
        </Dropdown>
        
        {/* User profile dropdown */}
        {currentUser && (
          <Dropdown
            menu={{ items: profileMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Space 
              className="user-profile-trigger" 
              style={{ 
                cursor: 'pointer', 
                padding: '4px 12px', 
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                background: '#f5f5f5'
              }}
            >
              <Avatar 
                size="small" 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }} 
              />
              <span style={{ marginLeft: 8, fontWeight: 500 }}>
                {currentUser.first_name || currentUser.username || currentUser.email?.split('@')[0] || 'User'}
              </span>
            </Space>
          </Dropdown>
        )}
      </div>
    </Header>
  );
};

export default Navbar;