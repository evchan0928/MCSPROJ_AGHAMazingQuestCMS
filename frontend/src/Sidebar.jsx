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
      backgroundColor: '#3498db', // Active blue accent
      color: '#fff', 
      borderLeft: '5px solid #fff',
      paddingLeft: '15px'
  };

  const defaultStyle = {
      display: 'flex', 
      alignItems: 'center', 
      padding: '12px 20px', 
      textDecoration: 'none', 
      color: '#ecf0f1',
      fontSize: '0.95rem',
      fontWeight: '500',
      transition: 'background-color 0.3s'
  };

  // Helper for sub-NavLink styling
  const subDefaultStyle = {
      display: 'block', 
      padding: '6px 0', 
      textDecoration: 'none', 
      color: '#ecf0f1',
      fontSize: '0.9rem',
  };


  return (
    <aside className="sidebar">
        <div className="sidebar-header">
            <img src={LOGO_URL} alt="DOST-STII Logo" className="sidebar-logo" />
            <span>DOST-STII</span>
        </div>

        <nav>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {/* Dashboard (always visible and static) */}
                <li>
                    <NavLink 
                        to="/dashboard" 
                        end
                        style={({ isActive }) => ({ ...defaultStyle, ...(isActive ? activeStyle : {}) })}
                        className="nav-item"
                    >
                        <span className="material-icons">dashboard</span>
                        <span>Dashboard</span>
                    </NavLink>
                </li>
                
                {/* Content Management Dropdown */}
                <li className="sidebar-section-li">
                    <div className="sidebar-separator-small"></div>
                    <button 
                        onClick={() => setContentOpen(v => !v)} 
                        className="dropdown-toggle-btn"
                    >
                        <span className="material-icons">folder_open</span>
                        Content Management {contentOpen ? '▾' : '▸'}
                    </button>
                    {contentOpen && (
                        <ul className="sub-menu">
                            {/* Upload: Encoder, Editor, Super Admin */}
                            {(user?.is_superuser || roles.includes('Encoder') || roles.includes('Editor') || roles.includes('Super Admin')) && (
                                <li><NavLink to="/dashboard/content/upload" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3498db', fontWeight: 'bold' } : {}) })}>Upload content</NavLink></li>
                            )}

                            {/* 🔑 CHANGED: Renamed from "Edit content" to "Content list" and updated path */}
                            {(user?.is_superuser || roles.includes('Editor') || roles.includes('Super Admin')) && (
                                <li>
                                    <NavLink 
                                        to="/dashboard/content/list" 
                                        style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3498db', fontWeight: 'bold' } : {}) })}
                                    >
                                        Content list
                                    </NavLink>
                                </li>
                            )}

                            {/* Approve & Publish: Approver, Super Admin */}
                            {(user?.is_superuser || roles.includes('Approver') || roles.includes('Super Admin')) && (
                                <>
                                    <li><NavLink to="/dashboard/content/approve" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3498db', fontWeight: 'bold' } : {}) })}>Approve content</NavLink></li>
                                    <li><NavLink to="/dashboard/content/publish" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3498db', fontWeight: 'bold' } : {}) })}>Publish content</NavLink></li>
                                </>
                            )}

                            {/* Delete: Admin, Super Admin */}
                            {(user?.is_superuser || roles.includes('Admin') || roles.includes('Super Admin')) && (
                                <li><NavLink to="/dashboard/content/delete" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3498db', fontWeight: 'bold' } : {}) })}>Delete content</NavLink></li>
                            )}
                        </ul>
                    )}
                </li>
 
                {/* Analytics Management Dropdown */}
                {(user?.is_superuser || roles.includes('Admin') || roles.includes('Super Admin')) && (
                    <li className="sidebar-section-li">
                         <div className="sidebar-separator-small"></div>
                        <button 
                            onClick={() => setAnalyticsOpen(v => !v)} 
                            className="dropdown-toggle-btn"
                        >
                            <span className="material-icons">analytics</span>
                            Analytics Management {analyticsOpen ? '▾' : '▸'}
                        </button>
                        {analyticsOpen && (
                            <ul className="sub-menu">
                                <li><NavLink to="/dashboard/analytics/generate" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3498db', fontWeight: 'bold' } : {}) })}>Generate Report</NavLink></li>
                                <li><NavLink to="/dashboard/analytics/view" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3498db', fontWeight: 'bold' } : {}) })}>View Reports</NavLink></li>
                                <li><NavLink to="/dashboard/analytics/download" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3498db', fontWeight: 'bold' } : {}) })}>Download Reports</NavLink></li>
                            </ul>
                        )}
                    </li>
                )}

                {/* User Management Dropdown */}
                {isAdmin && (
                    <li className="sidebar-section-li">
                        <div className="sidebar-separator-small"></div>
                        <button 
                            onClick={() => setUserMgmtOpen(v => !v)} 
                            className="dropdown-toggle-btn"
                        >
                            <span className="material-icons">manage_accounts</span>
                            User Management {userMgmtOpen ? '▾' : '▸'}
                        </button>
                        {userMgmtOpen && (
                            <ul className="sub-menu">
                                <li><NavLink to="/dashboard/users" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3498db', fontWeight: 'bold' } : {}) })}>Users</NavLink></li>
                                <li><NavLink to="/dashboard/users/roles" style={({ isActive }) => ({ ...subDefaultStyle, ...(isActive ? { color: '#3498db', fontWeight: 'bold' } : {}) })}>Roles</NavLink></li>
                            </ul>
                        )}
                    </li>
                )}
            </ul>
        </nav>
        
        <div className="sidebar-footer">
            <div className="user-initials-circle">SB</div>
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