import React, { useState } from 'react';
import { Layout, Breadcrumb, Button, Dropdown, Space, Typography, Menu } from 'antd';
import { 
  HomeOutlined, 
  UserOutlined, 
  SettingOutlined, 
  MenuOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import './NavigationBar.css';

const { Header } = Layout;
const { Text } = Typography;

const NavigationBar = ({ user, onLogout }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Toggle menu collapse on smaller screens
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Function to generate breadcrumbs based on the current path
  const generateBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const breadcrumbItems = [{ 
      title: <Link to="/dashboard"><HomeOutlined /> Home</Link> 
    }];

    // Build breadcrumb items based on the path
    let currentPath = '';
    for (let i = 0; i < pathSnippets.length; i++) {
      currentPath += `/${pathSnippets[i]}`;
      
      // Skip adding dashboard since it's already added as home
      if (pathSnippets[i] === 'dashboard') continue;
      
      let title = pathSnippets[i];
      // Format the path segment to be more readable
      if (pathSnippets[i] === 'content') {
        title = 'Content Management';
      } else if (pathSnippets[i] === 'upload') {
        title = 'Upload Content';
      } else if (pathSnippets[i] === 'list') {
        title = 'Content List';
      } else if (pathSnippets[i] === 'edit') {
        title = 'Edit Content';
      } else if (pathSnippets[i] === 'approve') {
        title = 'Approve Content';
      } else if (pathSnippets[i] === 'publish') {
        title = 'Publish Content';
      } else if (pathSnippets[i] === 'published') {
        title = 'Published Content';
      } else if (pathSnippets[i] === 'delete') {
        title = 'Delete Content';
      } else if (pathSnippets[i] === 'analytics') {
        title = 'Analytics';
      } else if (pathSnippets[i] === 'generate') {
        title = 'Generate Report';
      } else if (pathSnippets[i] === 'view') {
        title = 'View Reports';
      } else if (pathSnippets[i] === 'download') {
        title = 'Download Reports';
      } else if (pathSnippets[i] === 'users') {
        title = 'User Management';
      } else if (pathSnippets[i] === 'roles') {
        title = 'Roles';
      }
      
      breadcrumbItems.push({
        title: i === pathSnippets.length - 1 ? (
          <Text strong>{title}</Text> // Make current page bold - this is the current page, not a link
        ) : (
          <Link to={currentPath}>{title}</Link>
        )
      });
    }

    return breadcrumbItems;
  };

  // User menu for profile and logout
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/settings">Settings</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/dashboard">
            <img 
              src="https://raw.githubusercontent.com/Marianne-101/pictures/main/dost-stii-logo.png" 
              alt="Logo" 
              className="logo-img" 
            />
            <span className="logo-text">DOST-STII CMS</span>
          </Link>
        </div>
        
        <div className="navbar-breadcrumb">
          <Breadcrumb 
            separator=">" 
            items={generateBreadcrumbItems()} 
            className="location-breadcrumb"
          />
        </div>
        
        <div className="navbar-user-actions">
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <Button className="user-profile-btn">
              <Space>
                <UserOutlined />
                <span>{user?.name || 'User'}</span>
              </Space>
            </Button>
          </Dropdown>
        </div>
        
        <div className="navbar-mobile-toggle">
          <Button 
            type="text" 
            icon={<MenuOutlined />} 
            onClick={toggleCollapsed}
            className="mobile-menu-btn"
          />
        </div>
      </div>
    </Header>
  );
};

export default NavigationBar;