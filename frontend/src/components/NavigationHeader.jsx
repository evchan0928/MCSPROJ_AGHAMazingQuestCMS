import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Breadcrumb, Space, Avatar } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { getCurrentUser } from '../api/django-api';

const NavigationHeader = ({ title }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Define breadcrumb mapping
  const breadcrumbMap = {
    '/dashboard': [{ title: 'Dashboard' }],
    '/dashboard/content/upload': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Upload Content' }],
    '/dashboard/content/list': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Content List' }],
    '/dashboard/content/edit': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Content List', href: '/dashboard/content/list' }, { title: 'Edit Content' }],
    '/dashboard/content/detail': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Content List', href: '/dashboard/content/list' }, { title: 'Content Detail' }],
    '/dashboard/content/approve': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Approve Content' }],
    '/dashboard/content/publish': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Publish Content' }],
    '/dashboard/content/published': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Published Content' }],
    '/dashboard/content/delete': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Delete Content' }],
    '/dashboard/analytics/generate': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Generate Analytics' }],
    '/dashboard/analytics/view': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'View Analytics' }],
    '/dashboard/analytics/download': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Download Analytics' }],
    '/dashboard/users': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'User Management' }],
    '/dashboard/users/roles': [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Role Management' }],
  };

  // Extract the base path for breadcrumb matching
  const getLocationBreadcrumb = () => {
    const path = location.pathname;
    
    // Handle dynamic routes (like /dashboard/content/edit/:id)
    if (path.startsWith('/dashboard/content/edit/')) {
      return [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Content List', href: '/dashboard/content/list' },
        { title: 'Edit Content' }
      ];
    }
    
    if (path.startsWith('/dashboard/content/detail/')) {
      return [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Content List', href: '/dashboard/content/list' },
        { title: 'Content Detail' }
      ];
    }

    return breadcrumbMap[path] || [{ title: 'Dashboard' }];
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const breadcrumbs = getLocationBreadcrumb();

  return (
    <div className="navigation-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <Button 
          type="text" 
          shape="circle"
          icon={<HomeOutlined />} 
          onClick={handleGoHome}
          title="Go to Dashboard"
          style={{ 
            fontSize: '16px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
        />
        <Button 
          type="text" 
          shape="circle"
          icon={<ArrowLeftOutlined />} 
          onClick={handleGoBack}
          title="Go Back"
          style={{ 
            fontSize: '16px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
        />
        <Breadcrumb 
          separator=">" 
          items={breadcrumbs.map((item, index) => ({
            title: item.href ? (
              <a 
                href={item.href} 
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href);
                }}
                style={{ color: '#64748b', textDecoration: 'none' }}
              >
                {item.title}
              </a>
            ) : (
              <span style={{ color: '#334155', fontWeight: 500 }}>{item.title}</span>
            )
          }))} 
        />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ 
          margin: 0, 
          color: '#1e293b', 
          fontSize: '1.5rem',
          fontWeight: 600
        }}>
          {title || 'Content Management'}
        </h2>
        
        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar 
            size="large" 
            style={{ 
              backgroundColor: '#3b82f6', 
              verticalAlign: 'middle',
              fontWeight: 'bold'
            }}
            icon={<UserOutlined />}
          >
            {localStorage.getItem('currentUserInitials') || 'U'}
          </Avatar>
          <span className="user-name" style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>
            {localStorage.getItem('currentUserName') || 'User'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;