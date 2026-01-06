// src/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

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
      display: 'block', 
      padding: '8px 12px', 
      textDecoration: 'none', 
      color: '#94a3b8',
      fontSize: '0.9rem',
      borderRadius: '6px',
      margin: '2px 0',
      transition: 'all 0.2s'
  };


  return (
    <aside className="sidebar">
        <div className="sidebar-header">
            <img src={LOGO_URL} alt="DOST-STII Logo" className="sidebar-logo" />
            <span className="sidebar-title">DOST-STII CMS</span>
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
                        <span className="material-icons" style={{ marginRight: '10px' }}>dashboard</span>
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
                        <span className="material-icons" style={{ marginRight: '10px' }}>folder_open</span>
                        Content Management {contentOpen ? '▲' : '▼'}
                    </button>
                    {contentOpen && (
                        <ul className="sub-menu">
                            {/* Upload: Encoder, Editor, Super Admin */}
                            {(user?.is_superuser || roles.includes('Encoder') || roles.includes('Editor') || roles.includes('Super Admin')) && (
                                <li><NavLink to="/dashboard/content/upload" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}>Upload content</NavLink></li>
                            )}

                            {/* 🔑 CHANGED: Renamed from "Edit content" to "Content list" and updated path */}
                            {(user?.is_superuser || roles.includes('Editor') || roles.includes('Super Admin')) && (
                                <li>
                                    <NavLink 
                                        to="/dashboard/content/list" 
                                        style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}
                                    >
                                        Content list
                                    </NavLink>
                                </li>
                            )}

                            {/* Approve & Publish: Approver, Super Admin */}
                            {(user?.is_superuser || roles.includes('Approver') || roles.includes('Super Admin')) && (
                                <>
                                    <li><NavLink to="/dashboard/content/approve" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}>Approve content</NavLink></li>
                                    <li><NavLink to="/dashboard/content/publish" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}>Publish content</NavLink></li>
                                </>
                            )}

                            {/* Delete: Admin, Super Admin */}
                            {(user?.is_superuser || roles.includes('Admin') || roles.includes('Super Admin')) && (
                                <li><NavLink to="/dashboard/content/delete" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}>Delete content</NavLink></li>
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
                            <span className="material-icons" style={{ marginRight: '10px' }}>analytics</span>
                            Analytics Management {analyticsOpen ? '▲' : '▼'}
                        </button>
                        {analyticsOpen && (
                            <ul className="sub-menu">
                                <li><NavLink to="/dashboard/analytics/generate" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}>Generate Report</NavLink></li>
                                <li><NavLink to="/dashboard/analytics/view" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}>View Reports</NavLink></li>
                                <li><NavLink to="/dashboard/analytics/download" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}>Download Reports</NavLink></li>
                            </ul>
                        )}
                    </li>
                )}

                {/* User Management Dropdown */}
                {isAdmin && (
                    <li className="sidebar-section-li" style={{ marginTop: '12px' }}>
                        <div className="sidebar-separator-small"></div>
                        <button 
                            onClick={() => setUserMgmtOpen(v => !v)} 
                            className="dropdown-toggle-btn"
                        >
                            <span className="material-icons" style={{ marginRight: '10px' }}>manage_accounts</span>
                            User Management {userMgmtOpen ? '▲' : '▼'}
                        </button>
                        {userMgmtOpen && (
                            <ul className="sub-menu">
                                <li><NavLink to="/dashboard/users" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}>Users</NavLink></li>
                                <li><NavLink to="/dashboard/users/roles" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3b82f6', fontWeight: '600' } : {}) })}>Roles</NavLink></li>
                            </ul>
                        )}
                    </li>
                )}
            </ul>
        </nav>
        
        <div className="sidebar-footer">
            <div className="user-initials-circle">{user?.initials || 'SB'}</div>
            <div 
                className="logout-text"
                onClick={() => { localStorage.removeItem('access'); localStorage.removeItem('refresh'); window.location.href = '/'; }}
            >
                Logout
            </div>
        </div>
    </aside>
  );
}