import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Badge } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  AppstoreOutlined,
  BellOutlined
} from '@ant-design/icons';
import { getNotifications } from '../api/django-api';

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
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

    fetchNotificationCount();
    
    // Set up interval to periodically update notification count (every 30 seconds)
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Define menu items
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>
    },
    {
      key: '/dashboard/content',
      icon: <FileTextOutlined />,
      label: 'Content Management',
      children: [
        {
          key: '/dashboard/content/upload',
          label: <Link to="/dashboard/content/upload">Upload Content</Link>
        },
        {
          key: '/dashboard/content/list',
          label: <Link to="/dashboard/content/list">Content List</Link>
        },
        {
          key: '/dashboard/content/approval',
          label: <Link to="/dashboard/content/approval">For Approval</Link>
        }
      ]
    },
    {
      key: '/dashboard/users',
      icon: <TeamOutlined />,
      label: 'User Management',
      children: [
        {
          key: '/dashboard/users/list',
          label: <Link to="/dashboard/users/list">Users</Link>
        },
        {
          key: '/dashboard/users/roles',
          label: <Link to="/dashboard/users/roles">Roles</Link>
        }
      ]
    },
    {
      key: '/dashboard/analytics',
      icon: <BarChartOutlined />,
      label: <Link to="/dashboard/analytics">Analytics</Link>
    },
    {
      key: '/dashboard/mobile',
      icon: <AppstoreOutlined />,
      label: 'Mobile Management',
      children: [
        {
          key: '/dashboard/mobile/profiles',
          label: <Link to="/dashboard/mobile/profiles">User Profiles</Link>
        },
        {
          key: '/dashboard/mobile/sessions',
          label: <Link to="/dashboard/mobile/sessions">User Sessions</Link>
        },
        {
          key: '/dashboard/mobile/scores',
          label: <Link to="/dashboard/mobile/scores">Scores</Link>
        },
        {
          key: '/dashboard/mobile/badges',
          label: <Link to="/dashboard/mobile/badges">Badges</Link>
        },
        {
          key: '/dashboard/mobile/leaderboards',
          label: <Link to="/dashboard/mobile/leaderboards">Leaderboards</Link>
        }
      ]
    },
    {
      key: '/dashboard/notifications',
      icon: <Badge count={unreadNotifications} overflowCount={99}><BellOutlined /></Badge>,
      label: <Link to="/dashboard/notifications">Notifications</Link>
    },
    {
      key: '/dashboard/account-settings',
      icon: <SettingOutlined />,
      label: <Link to="/dashboard/account-settings">Account Settings</Link>
    }
  ];

  return (
    <div style={{ height: '100vh', overflow: 'auto' }}>
      <div className="logo" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!collapsed && (
          <h2 style={{ color: 'white', margin: 0, fontSize: '16px' }}>AGHAMazing Quest CMS</h2>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
    </div>
  );
};

export default Sidebar;