// src/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MenuOutlined, CloseOutlined, DashboardOutlined, FolderOpenOutlined, BarChartOutlined, 
         UserOutlined, LogoutOutlined, FileTextOutlined, CheckCircleOutlined, 
         CloudUploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

// Use a placeholder logo URL for the sidebar logo
const LOGO_URL = "https://raw.githubusercontent.com/Marianne-101/pictures/main/dost-stii-logo.png";

export default function Sidebar({ user }) {
  // Use user prop for roles and superuser status
  const roles = (user && user.roles) || [];
  // Admin determination: superuser or Admin role
  const isAdmin = user?.is_superuser || roles.includes('Admin') || roles.includes('Super Admin');
  
  // State for dropdowns
  const [contentOpen, setContentOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [userMgmtOpen, setUserMgmtOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // For mobile menu toggle

  // Helper for NavLink styling (combines NavItem logic)
  const activeStyle = { 
      backgroundColor: '#334155', // Darker blue accent
      color: '#fff', 
  };

  const defaultStyle = {
      display: 'flex', 
      alignItems: 'center', 
      padding: '10px 12px', 
      textDecoration: 'none', 
      color: '#cbd5e1',
      fontSize: '0.95rem',
      fontWeight: '500',
      transition: 'all 0.2s',
      borderRadius: '6px',
      margin: '2px 0'
  };

  // Helper for sub-NavLink styling
  const subDefaultStyle = {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px 8px 36px', 
      textDecoration: 'none', 
      color: '#94a3b8',
      fontSize: '0.9rem',
      borderRadius: '6px',
      margin: '2px 0',
      transition: 'all 0.2s'
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Enhanced logout function
  const handleLogout = async () => {
    try {
      // First try to notify the backend about logout
      await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
    } catch (error) {
      console.warn('Logout notification to backend failed:', error);
      // Continue with client-side logout even if backend notification fails
    } finally {
      // Clear tokens from localStorage
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      
      // Redirect to sign-in page
      window.location.href = '/signin';
    }
  };

  return (
    <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
            <img src={LOGO_URL} alt="DOST-STII Logo" className="sidebar-logo" />
            <span className="sidebar-title">DOST-STII CMS</span>
            <button 
              className="mobile-menu-toggle" 
              onClick={toggleMobileMenu}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'none' // Will be shown on mobile via CSS
              }}
            >
              {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
        </div>

        <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {/* Dashboard (always visible and static) */}
                <li>
                    <NavLink 
                        to="/dashboard" 
                        end
                        style={({ isActive }) => ({ ...defaultStyle, ...(isActive ? activeStyle : {}) })}
                        className="nav-item"
                    >
                        <DashboardOutlined style={{ marginRight: '10px' }} />
                        <span>Dashboard</span>
                    </NavLink>
                </li>
                
                {/* Content Management Dropdown */}
                <li className="sidebar-section-li" style={{ marginTop: '12px' }}>
                    <div className="sidebar-separator-small"></div>
                    <button 
                        onClick={() => setContentOpen(v => !v)} 
                        className="dropdown-toggle-btn"
                    >
                        <FolderOpenOutlined style={{ marginRight: '10px' }} />
                        Content Management {contentOpen ? '▲' : '▼'}
                    </button>
                    {contentOpen && (
                        <ul className="sub-menu">
                            {/* Upload: Encoder, Editor, Super Admin */}
                            {(user?.is_superuser || roles.includes('Encoder') || roles.includes('Editor') || roles.includes('Super Admin')) && (
                                <li>
                                  <NavLink 
                                    to="/dashboard/content/upload" 
                                    style={({ isActive }) => ({ 
                                      ...subDefaultStyle, 
                                      ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) 
                                    })}
                                  >
                                    <CloudUploadOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                                    Upload Content
                                  </NavLink>
                                </li>
                            )}

                            {/* 🔑 CHANGED: Renamed from "Edit content" to "Content list" and updated path */}
                            {(user?.is_superuser || roles.includes('Editor') || roles.includes('Super Admin')) && (
                                <li>
                                    <NavLink 
                                        to="/dashboard/content/list" 
                                        style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}
                                    >
                                      <FileTextOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                                      Content List
                                    </NavLink>
                                </li>
                            )}

                            {/* Approve & Publish: Approver, Super Admin */}
                            {(user?.is_superuser || roles.includes('Approver') || roles.includes('Super Admin')) && (
                                <>
                                    <li>
                                      <NavLink 
                                        to="/dashboard/content/approve" 
                                        style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}
                                      >
                                        <CheckCircleOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                                        Approve Content
                                      </NavLink>
                                    </li>
                                    <li>
                                      <NavLink 
                                        to="/dashboard/content/publish" 
                                        style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}
                                      >
                                        <EyeOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                                        Publish Content
                                      </NavLink>
                                    </li>
                                    <li>
                                      <NavLink 
                                        to="/dashboard/content/published" 
                                        style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}
                                      >
                                        <EyeOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                                        Published Content
                                      </NavLink>
                                    </li>
                                </>
                            )}

                            {/* Delete: Admin, Super Admin */}
                            {(user?.is_superuser || roles.includes('Admin') || roles.includes('Super Admin')) && (
                                <li>
                                  <NavLink 
                                    to="/dashboard/content/delete" 
                                    style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}
                                  >
                                    <DeleteOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                                    Delete Content
                                  </NavLink>
                                </li>
                            )}
                        </ul>
                    )}
                </li>
 
                {/* Analytics Management Dropdown */}
                {(user?.is_superuser || roles.includes('Admin') || roles.includes('Super Admin')) && (
                    <li className="sidebar-section-li" style={{ marginTop: '12px' }}>
                         <div className="sidebar-separator-small"></div>
                        <button 
                            onClick={() => setAnalyticsOpen(v => !v)} 
                            className="dropdown-toggle-btn"
                        >
                            <BarChartOutlined style={{ marginRight: '10px' }} />
                            Analytics Management {analyticsOpen ? '▲' : '▼'}
                        </button>
                        {analyticsOpen && (
                            <ul className="sub-menu">
                                <li>
                                  <NavLink 
                                    to="/dashboard/analytics/generate" 
                                    style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}
                                  >
                                    <BarChartOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                                    Generate Report
                                  </NavLink>
                                </li>
                                <li>
                                  <NavLink 
                                    to="/dashboard/analytics/view" 
                                    style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}
                                  >
                                    <EyeOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                                    View Reports
                                  </NavLink>
                                </li>
                                <li>
                                  <NavLink 
                                    to="/dashboard/analytics/download" 
                                    style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}
                                  >
                                    <CloudUploadOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                                    Download Reports
                                  </NavLink>
                                </li>
                            </ul>
                        )}
                    </li>
                )}

                {/* User & Role Management Dropdown */}
                {isAdmin && (
                    <li className="sidebar-section-li" style={{ marginTop: '12px' }}>
                        <div className="sidebar-separator-small"></div>
                        <button 
                            onClick={() => setUserMgmtOpen(v => !v)} 
                            className="dropdown-toggle-btn"
                        >
                            <UserOutlined style={{ marginRight: '10px' }} />
                            User & Role Management {userMgmtOpen ? '▲' : '▼'}
                        </button>
                        {userMgmtOpen && (
                            <ul className="sub-menu">
                                <li>
                                  <NavLink 
                                    to="/dashboard/users" 
                                    style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}
                                  >
                                    <UserOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                                    Users
                                  </NavLink>
                                </li>
                                <li>
                                  <NavLink 
                                    to="/dashboard/users/roles" 
                                    style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}
                                  >
                                    <UserOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                                    Roles
                                  </NavLink>
                                </li>
                            </ul>
                        )}
                    </li>
                )}
            </ul>
        </nav>
        
        <div className="sidebar-footer">
            <UserOutlined className="user-initials-circle" />
            <div 
                className="logout-text"
                onClick={handleLogout}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  cursor: 'pointer'
                }}
            >
              <LogoutOutlined style={{ fontSize: '14px' }} />
              Logout
            </div>
        </div>
    </aside>
  );
}