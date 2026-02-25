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

const { SubMenu } = Menu;

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

  return (
    <div style={{ height: '100vh', overflow: 'auto' }}>
      <div className="logo" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!collapsed && (
          <h2 style={{ color: 'white', margin: 0, fontSize: '16px' }}>AGHAMazing Quest CMS</h2>
        )}
      </div>

      <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} style={{ borderRight: 0 }}>
        <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
          <Link to="/dashboard">Dashboard</Link>
        </Menu.Item>

        <SubMenu key="/dashboard/content" icon={<FileTextOutlined />} title="Content Management">
          <Menu.Item key="/dashboard/content/upload"><Link to="/dashboard/content/upload">Upload Content</Link></Menu.Item>
          <Menu.Item key="/dashboard/content/list"><Link to="/dashboard/content/list">Content List</Link></Menu.Item>
          {canEditContent && <Menu.Item key="/dashboard/content/edit"><Link to="/dashboard/content/edit">Edit Content</Link></Menu.Item>}
          {canApproveContent && <Menu.Item key="/dashboard/content/approval"><Link to="/dashboard/content/approval">Approve Content</Link></Menu.Item>}
          {canApproveContent && <Menu.Item key="/dashboard/content/publish"><Link to="/dashboard/content/publish">Publish Content</Link></Menu.Item>}
        </SubMenu>

        {isAdmin && (
          <SubMenu key="/dashboard/users" icon={<TeamOutlined />} title="User Management">
            <Menu.Item key="/dashboard/users/list"><Link to="/dashboard/users/list">Users</Link></Menu.Item>
            <Menu.Item key="/dashboard/users/roles"><Link to="/dashboard/users/roles">Roles</Link></Menu.Item>
          </SubMenu>
        )}

        {isAdmin && <Menu.Item key="/dashboard/analytics" icon={<BarChartOutlined />}><Link to="/dashboard/analytics">Analytics</Link></Menu.Item>}

        {isAdmin && (
          <SubMenu key="/dashboard/mobile" icon={<AppstoreOutlined />} title="Mobile Management">
            <Menu.Item key="/dashboard/mobile/player-stats"><Link to="/dashboard/mobile/player-stats">Player Stats</Link></Menu.Item>
            <Menu.Item key="/dashboard/mobile/sessions"><Link to="/dashboard/mobile/sessions">Sessions</Link></Menu.Item>
            <Menu.Item key="/dashboard/mobile/users"><Link to="/dashboard/mobile/users">Users</Link></Menu.Item>
            <Menu.Item key="/dashboard/mobile/chatbot-feedback"><Link to="/dashboard/mobile/chatbot-feedback">Chatbot Feedback</Link></Menu.Item>
            <Menu.Item key="/dashboard/mobile/coin-transactions"><Link to="/dashboard/mobile/coin-transactions">Coin Transactions</Link></Menu.Item>
          </SubMenu>
        )}

        <Menu.Item key="/dashboard/account-settings" icon={<SettingOutlined />}>
          <Link to="/dashboard/account-settings">Account Settings</Link>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Sidebar;