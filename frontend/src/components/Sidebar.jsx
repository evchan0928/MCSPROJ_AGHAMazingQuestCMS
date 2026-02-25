import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { getCurrentUser } from '../api/django-api';

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user for sidebar:', error);
      }
    };

    fetchUser();
  }, []);

  const roles = currentUser?.roles || [];
  const isSuperUser = Boolean(currentUser?.is_superuser);
  const isAdmin = isSuperUser || roles.includes('Admin') || roles.includes('Super Admin');
  const canEditContent = isSuperUser || roles.includes('Editor') || roles.includes('Admin') || roles.includes('Super Admin');
  const canApproveContent = isSuperUser || roles.includes('Approver') || roles.includes('Admin') || roles.includes('Super Admin');

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
          key: '/dashboard/content/edit',
          label: <Link to="/dashboard/content/edit">Edit Content</Link>,
          hidden: !canEditContent
        },
        {
          key: '/dashboard/content/approval',
          label: <Link to="/dashboard/content/approval">Approve Content</Link>,
          hidden: !canApproveContent
        },
        {
          key: '/dashboard/content/publish',
          label: <Link to="/dashboard/content/publish">Publish Content</Link>,
          hidden: !canApproveContent
        }
      ]
    },
    {
      key: '/dashboard/users',
      icon: <TeamOutlined />,
      label: 'User Management',
      hidden: !isAdmin,
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
      label: <Link to="/dashboard/analytics">Analytics</Link>,
      hidden: !isAdmin
    },
    {
      key: '/dashboard/mobile',
      icon: <AppstoreOutlined />,
      label: 'Mobile Management',
      hidden: !isAdmin,
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
      key: '/dashboard/account-settings',
      icon: <SettingOutlined />,
      label: <Link to="/dashboard/account-settings">Account Settings</Link>
    }
  ];

  const filteredMenuItems = menuItems
    .filter(item => !item.hidden)
    .map(item => {
      if (!item.children) {
        return item;
      }

      const children = item.children.filter(child => !child.hidden);
      return { ...item, children };
    });

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
        items={filteredMenuItems}
        style={{ borderRight: 0 }}
      />
    </div>
  );
};

export default Sidebar;