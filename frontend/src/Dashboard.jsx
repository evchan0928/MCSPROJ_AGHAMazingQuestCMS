// src/Dashboard.jsx (The complete and correct file structure)

import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { Card, Statistic, Table, Row, Col, Button, DatePicker, Select } from 'antd';
import { UserOutlined, FileTextOutlined, ClockCircleOutlined, NotificationOutlined } from '@ant-design/icons';
import { getDashboardStats, getRecentContent } from './api/django-api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => { // <-- Opening brace for the function body
    const location = useLocation();
    const isIndexRoute = location.pathname === '/dashboard';

    const [dashboardStats, setDashboardStats] = useState({
        published: 0,
        pendingApproval: 0,
        activeUsers: 0,
        notifications: 0
    });
    
    const [recentContent, setRecentContent] = useState([]);
    const [loadingContent, setLoadingContent] = useState(true);

    const currentUser = {
        name: "Super Boss",
        initials: "SB",
        roles: ['Super Admin'],
        is_superuser: true 
    };

    useEffect(() => {
        if (isIndexRoute) {
            fetchDashboardData();
        }
    }, [isIndexRoute]);

    const fetchDashboardData = async () => {
        setLoadingContent(true);
        
        try {
            // Fetch dashboard statistics
            const statsData = await getDashboardStats();
            setDashboardStats(statsData);
            
            // Fetch recent content
            const contentData = await getRecentContent();
            setRecentContent(contentData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoadingContent(false);
        }
    };

    // Define table columns for recent content
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <span className="table-title">{text}</span>,
        },
        {
            title: 'Time Stamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
        },
        {
            title: 'Encoded By',
            dataIndex: 'encoded_by',
            key: 'encoded_by',
        },
        {
            title: 'To be Reviewed By',
            dataIndex: 'reviewed_by',
            key: 'reviewed_by',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`status-cell status-${status.toLowerCase().replace(' ', '-')}`}>
                    <span className="status-dot"></span>
                    {status}
                </span>
            ),
        },
    ];

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

                {/* Dynamic Dashboard Content only rendered on the index route */}
                {isIndexRoute && (
                    <React.Fragment>
                        {/* Date and Product Filters (EDITED BLOCK START) */}
                        <div className="filter-row">
                            {/* START DATE FILTER GROUP */}
                            <div className="filter-group">
                                <label htmlFor="startDate">Start Date</label>
                                <div className="date-filter">
                                    <RangePicker />
                                </div>
                            </div>
                            
                            {/* PRODUCT TYPE FILTER GROUP */}
                            <div className="filter-group">
                                <label htmlFor="productType">Product Type</label>
                                <Select defaultValue="AR Marker" style={{ width: '100%' }} allowClear>
                                    <Option value="AR Marker">AR Marker</Option>
                                    <Option value="Video Content">Video Content</Option>
                                    <Option value="Image Content">Image Content</Option>
                                    <Option value="Document">Document</Option>
                                </Select>
                            </div>
                            
                            <Button type="primary" className="get-data-btn">Get Data</Button>
                        </div>
                        {/* Date and Product Filters (EDITED BLOCK END) */}

                        {/* Stat Cards */}
                        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Published"
                                        value={dashboardStats.published || 0}
                                        prefix={<FileTextOutlined />}
                                        valueStyle={{ color: '#4CAF50' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Pending Approval"
                                        value={dashboardStats.pendingApproval || 0}
                                        prefix={<ClockCircleOutlined />}
                                        valueStyle={{ color: '#FFC107' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Active Users"
                                        value={dashboardStats.activeUsers || 0}
                                        prefix={<UserOutlined />}
                                        valueStyle={{ color: '#2196F3' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Notifications"
                                        value={dashboardStats.notifications || 0}
                                        prefix={<NotificationOutlined />}
                                        valueStyle={{ color: '#FF9800' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Recent Content Table */}
                        <div className="data-table-container">
                            <Table
                                dataSource={recentContent}
                                columns={columns}
                                rowKey="id"
                                loading={loadingContent}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                                }}
                            />
                        </div>
                    </React.Fragment>
                )}
            </div>
        </div>
    ); // <-- Closing parenthesis for the return statement
}; // <-- Closing brace for the Dashboard function body

export default Dashboard;