// src/Dashboard.jsx (The complete and correct file structure)

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const Dashboard = () => { // <-- Opening brace for the function body
    const location = useLocation();
    const isIndexRoute = location.pathname === '/dashboard';

    const currentUser = {
        name: "Super Boss",
        initials: "SB",
        roles: ['Super Admin'],
        is_superuser: true 
    };

    // Helper component for the dashboard statistic cards
    const StatCard = ({ iconClass, value, label, color }) => ( 
        <div className="stat-card">
            <div className="stat-icon-circle" style={{ backgroundColor: color }}>
                <span className="material-icons">{iconClass}</span>
            </div>
            <div className="stat-details">
                <p className="stat-value">{value}</p>
                <p className="stat-label">{label}</p>
            </div>
        </div>
    );
    
    // Helper component for the table rows
    const TableRow = ({ id, title, timeStamp, encodedBy, toBeReviewedBy, status }) => (
        <tr className="table-row">
            <td>{id}</td>
            <td className="table-title">{title}</td>
            <td>{timeStamp}</td>
            <td>{encodedBy}</td>
            <td>{toBeReviewedBy}</td>
            <td className={`status-cell status-${status.toLowerCase().replace(' ', '-')}`}>
                <span className="status-dot"></span>
                {status}
            </td>
        </tr>
    );

    // 🔑 START OF EXPLICIT RETURN STATEMENT
    return ( 
        <div className="dashboard-layout">
            {/* 1. Sidebar */}
            <Sidebar user={currentUser} /> 

            {/* 2. Main Content */}
            <div className="main-content">
                <div className="main-header">
                    <h1>{isIndexRoute ? 'Dashboard' : 'Content Management'}</h1> 
                    <div className="header-controls">
                        {/* The search, content, and status controls have been removed from here. */}
                    </div>
                </div>

                {/* The Outlet renders the nested route component */}
                <Outlet /> 

                {/* Static Dashboard Content only rendered on the index route */}
                {isIndexRoute && (
                    <React.Fragment>
                        {/* Date and Product Filters (EDITED BLOCK START) */}
                        <div className="filter-row">
                            {/* START DATE FILTER GROUP */}
                            <div className="filter-group">
                                <label htmlFor="startDate">Start Date</label>
                                <div className="date-filter">
                                    <input type="date" id="startDate"/>
                                    <span className="material-icons calendar-icon">calendar_today</span>
                                </div>
                            </div>
                            
                            {/* END DATE FILTER GROUP */}
                            <div className="filter-group">
                                <label htmlFor="endDate">End Date</label>
                                <div className="date-filter">
                                    <input type="date" id="endDate"/>
                                    <span className="material-icons calendar-icon">calendar_today</span>
                                </div>
                            </div>
                            
                            {/* PRODUCT TYPE FILTER GROUP */}
                            <div className="filter-group">
                                <label htmlFor="productType">Product Type</label>
                                <div className="product-type-filter">
                                    <input type="text" id="productType" value="AR Marker" readOnly />
                                    <span className="material-icons">arrow_drop_down</span>
                                </div>
                            </div>
                            
                            <button className="get-data-btn">Get Data</button>
                        </div>
                        {/* Date and Product Filters (EDITED BLOCK END) */}

                        {/* Stat Cards */}
                        <div className="stat-cards-container">
                            <StatCard iconClass="article" value="240" label="Published" color="#4CAF50" />
                            <StatCard iconClass="schedule" value="16" label="Pending Approval" color="#FFC107" />
                            <StatCard iconClass="group" value="12" label="Active Users" color="#2196F3" />
                            <StatCard iconClass="notifications" value="1" label="Notifications" color="#FF9800" />
                        </div>

                        {/* Data Table */}
                        <div className="data-table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Time Stamp</th>
                                        <th>Encoded By</th>
                                        <th>To be Reviewed By</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <TableRow 
                                        id="1998498" 
                                        title="Image Marker to align with the building heritage of the DOST..." 
                                        timeStamp="12-June-2025 | 08:53 am" 
                                        encodedBy="Juan Dela Cruz" 
                                        toBeReviewedBy="Carlo Makatangay" 
                                        status="Pending Approval" 
                                    />
                                    <TableRow 
                                        id="1998499" 
                                        title="A marker that signifies the historical event and bravery of..." 
                                        timeStamp="13-June-2025 | 09:33 am" 
                                        encodedBy="John Ignacio" 
                                        toBeReviewedBy="Carlo Makatangay" 
                                        status="Pending Approval" 
                                    />
                                    <TableRow 
                                        id="19984100" 
                                        title="There's A Message in The Suspension Spree..." 
                                        timeStamp="14-June-2025 | 08:30 am" 
                                        encodedBy="Chrisitan De vera" 
                                        toBeReviewedBy="Carlo Makatangay" 
                                        status="Pending Approval" 
                                    />
                                </tbody>
                            </table>
                        </div>
                    </React.Fragment>
                )}
            </div>
        </div>
    ); // <-- Closing parenthesis for the return statement
}; // <-- Closing brace for the Dashboard function body

export default Dashboard;