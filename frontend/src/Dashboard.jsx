// src/Dashboard.jsx (The complete and correct file structure)

import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { Card, Statistic, Table, Row, Col, Button, DatePicker, Select, Tabs, Badge, Progress, Skeleton, Alert, notification } from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  ClockCircleOutlined, 
  NotificationOutlined, 
  TeamOutlined, 
  BarChartOutlined, 
  CheckCircleOutlined, 
  SyncOutlined,
  EyeOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { 
  getDashboardStats, 
  getRecentContent, 
  getCurrentUser,
  getUsers,
  getRoles,
  getContentAnalytics,
  getUserActivityAnalytics,
  getAnalyticsSummary,
  getFilteredContent
} from './api/django-api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const Dashboard = () => { // <-- Opening brace for the function body
    const location = useLocation();
    const isIndexRoute = location.pathname === '/dashboard';

    // State for dashboard data
    const [dashboardStats, setDashboardStats] = useState({
        published: 0,
        pendingApproval: 0,
        activeUsers: 0,
        notifications: 0
    });
    
    const [recentContent, setRecentContent] = useState([]);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [contentAnalytics, setContentAnalytics] = useState({});
    const [userActivity, setUserActivity] = useState({});
    const [analyticsSummary, setAnalyticsSummary] = useState({});
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingContent, setLoadingContent] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [api, contextHolder] = notification.useNotification();
    
    // Filter states
    const [dateRange, setDateRange] = useState(null);
    const [productType, setProductType] = useState('All Content');

    // Combined loading state
    const isLoading = loadingStats || loadingContent || loadingUsers || loadingRoles || loadingAnalytics;

    // Fetch current user data
    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const userData = await getCurrentUser();
            setCurrentUser(userData);
        } catch (err) {
            console.error('Error fetching current user:', err);
            setError('Failed to fetch user information');
        }
    };

    // Fetch all dashboard data
    useEffect(() => {
        if (isIndexRoute) {
            fetchDashboardData();
        }
    }, [isIndexRoute]);

    const fetchDashboardData = async () => {
        setError(null);
        setLoadingStats(true);
        setLoadingContent(true);
        setLoadingUsers(true);
        setLoadingRoles(true);
        setLoadingAnalytics(true);
        
        try {
            // Fetch all data in parallel
            const [statsData, contentData, usersData, rolesData, contentAnalyticsData, userActivityData, analyticsSummaryData] = await Promise.all([
                getDashboardStats(),
                getRecentContent(),
                getUsers(),
                getRoles(),
                getContentAnalytics(),
                getUserActivityAnalytics(),
                getAnalyticsSummary()
            ]);
            
            setDashboardStats(statsData);
            setRecentContent(contentData);
            setUsers(usersData);
            setRoles(rolesData);
            setContentAnalytics(contentAnalyticsData);
            setUserActivity(userActivityData);
            setAnalyticsSummary(analyticsSummaryData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data. Please try again later.');
            api.error({
                message: 'Data Loading Error',
                description: 'Could not fetch dashboard data. Please refresh the page.',
            });
        } finally {
            setLoadingStats(false);
            setLoadingContent(false);
            setLoadingUsers(false);
            setLoadingRoles(false);
            setLoadingAnalytics(false);
        }
    };

    // Handler for the filter section
    const handleGetData = async () => {
        setLoadingContent(true);
        setError(null);
        
        try {
            // Prepare filter parameters
            let params = {};
            
            // Add date range filter if selected
            if (dateRange) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }
            
            // Add product type filter if not "All Content"
            if (productType !== 'All Content') {
                params.contentType = productType;
            }
            
            // Call the API with filters
            const contentData = await getFilteredContent(params);
            
            setRecentContent(contentData);
        } catch (error) {
            console.error('Error applying filters:', error);
            setError('Failed to apply filters. Showing all content.');
            // Fetch all content again in case of error
            const contentData = await getRecentContent();
            setRecentContent(contentData);
        } finally {
            setLoadingContent(false);
        }
    };

    // Handle date range change
    const handleDateChange = (dates, dateStrings) => {
        setDateRange(dates);
    };

    // Handle product type change
    const handleProductTypeChange = (value) => {
        setProductType(value);
    };

    // Define table columns for recent content
    const contentColumns = [
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
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (date) => date, // The date is already formatted by the backend
        },
        {
            title: 'Author',
            dataIndex: 'encoded_by',
            key: 'encoded_by',
        },
        {
            title: 'Reviewer',
            dataIndex: 'reviewed_by',
            key: 'reviewed_by',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusColors = {
                    'For editing': '#9e9e9e',
                    'For approval': '#ff9800',
                    'For publishing': '#2196f3',
                    'Published': '#4caf50',
                    'Deleted': '#607d8b'
                };
                
                return (
                    <span className={`status-cell status-${status.toLowerCase().replace(/\s+/g, '-')}`} 
                          style={{ color: statusColors[status] || '#9e9e9e' }}>
                        <span 
                            className="status-dot" 
                            style={{ 
                                backgroundColor: statusColors[status] || '#9e9e9e',
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                marginRight: '6px'
                            }}
                        ></span>
                        {status}
                    </span>
                );
            },
        },
    ];

    // Define table columns for users
    const userColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles) => (
                <div>
                    {roles && roles.map(role => (
                        <Badge key={role.id} color="#1890ff" text={role.name} style={{ display: 'block', marginBottom: '4px' }} />
                    ))}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active) => (
                <span style={{ color: active ? '#52c41a' : '#ff4d4f' }}>
                    {active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
    ];

    // Define table columns for roles
    const roleColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
    ];

    // Activity chart component
    const ActivityChart = () => {
        const activityData = userActivity.daily_activity || [];
        
        if (!activityData || !activityData.length) {
            return <div>No activity data available</div>;
        }
        
        const totalActivities = activityData.reduce((sum, day) => sum + day.count, 0);
        
        return (
            <div style={{ padding: '16px' }}>
                <h4>Weekly Activity Overview</h4>
                <div style={{ marginTop: '12px' }}>
                    {activityData.slice(0, 7).map((day, index) => (
                        <div key={index} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '80px', fontSize: '12px', color: '#666' }}>
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <Progress 
                                percent={Math.min(100, Math.round((day.count / (totalActivities / 7)) * 100))} 
                                size="small" 
                                status="active"
                                style={{ flex: 1, margin: '0 12px' }}
                            />
                            <span style={{ width: '40px', textAlign: 'right', fontSize: '12px' }}>
                                {day.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render skeleton loaders when data is loading
    const renderLoadingSkeleton = () => (
        <div style={{ padding: '24px' }}>
            <Skeleton active paragraph={{ rows: 4 }} />
            <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: '24px' }} />
            <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: '24px' }} />
        </div>
    );

    // Return early if not on dashboard index
    if (!isIndexRoute) {
        return (
            <div className="dashboard-layout">
                <Sidebar user={currentUser} /> 
                <div className="main-content">
                    <div className="main-header">
                        <h1>Content Management</h1> 
                        <div className="header-controls"></div>
                    </div>
                    <Outlet /> 
                </div>
            </div>
        );
    }

    return ( 
        <div className="dashboard-layout">
            {contextHolder}
            {/* 1. Sidebar */}
            <Sidebar user={currentUser} /> 

            {/* 2. Main Content */}
            <div className="main-content">
                <div className="main-header">
                    <h1>Dashboard</h1> 
                    <div className="header-controls">
                        <Button 
                            type="primary" 
                            icon={<SyncOutlined spin={isLoading} />} 
                            onClick={fetchDashboardData}
                            disabled={isLoading}
                        >
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* The Outlet renders the nested route component */}
                <Outlet /> 

                {/* Dynamic Dashboard Content only rendered on the index route */}
                {isIndexRoute && (
                    <React.Fragment>
                        {/* Error message if any */}
                        {error && (
                            <Alert 
                                message="Error" 
                                description={error} 
                                type="error" 
                                closable 
                                style={{ marginBottom: '16px' }}
                            />
                        )}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <SyncOutlined spin style={{ fontSize: '24px' }} />
                                <p>Loading dashboard data...</p>
                            </div>
                        )}

                        {!isLoading && (
                            <React.Fragment>
                                {/* Date and Product Filters (EDITED BLOCK START) */}
                                <div className="filter-row">
                                    {/* START DATE FILTER GROUP */}
                                    <div className="filter-group">
                                        <label htmlFor="startDate">Start Date</label>
                                        <div className="date-filter">
                                            <RangePicker 
                                                onChange={handleDateChange}
                                                value={dateRange}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* PRODUCT TYPE FILTER GROUP */}
                                    <div className="filter-group">
                                        <label htmlFor="productType">Product Type</label>
                                        <Select 
                                            defaultValue="All Content" 
                                            style={{ width: '100%' }} 
                                            allowClear
                                            value={productType}
                                            onChange={handleProductTypeChange}
                                        >
                                            <Option value="All Content">All Content</Option>
                                            <Option value="AR Marker">AR Marker</Option>
                                            <Option value="Video Content">Video Content</Option>
                                            <Option value="Image Content">Image Content</Option>
                                            <Option value="Document">Document</Option>
                                        </Select>
                                    </div>
                                    
                                    <Button 
                                        type="primary" 
                                        className="get-data-btn" 
                                        onClick={handleGetData}
                                        loading={loadingContent && dateRange !== null}
                                    >
                                        Get Data
                                    </Button>
                                </div>
                                {/* Date and Product Filters (EDITED BLOCK END) */}

                                {/* Stat Cards */}
                                <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                                    <Col xs={24} sm={12} md={6}>
                                        <Card>
                                            <Statistic
                                                title="Published Content"
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

                                {/* Tabs for different data views */}
                                <Tabs defaultActiveKey="overview" style={{ marginBottom: '24px' }}>
                                    <TabPane tab={<span><BarChartOutlined /> Overview</span>} key="overview">
                                        <Row gutter={[24, 24]}>
                                            <Col xs={24} md={16}>
                                                {/* Recent Content Table */}
                                                <Card title="Recent Content" extra={<EyeOutlined />}>
                                                    <Table
                                                        dataSource={recentContent}
                                                        columns={contentColumns}
                                                        rowKey="id"
                                                        loading={loadingContent}
                                                        pagination={{
                                                            pageSize: 10,
                                                            showSizeChanger: true,
                                                            showQuickJumper: true,
                                                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                                                        }}
                                                    />
                                                </Card>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                {/* Activity Chart */}
                                                <Card title="User Activity" extra={<MessageOutlined />}>
                                                    <ActivityChart />
                                                </Card>
                                            </Col>
                                        </Row>
                                    </TabPane>
                                    
                                    <TabPane tab={<span><TeamOutlined /> Users</span>} key="users">
                                        <Card title="User Management">
                                            <Table
                                                dataSource={users}
                                                columns={userColumns}
                                                rowKey="id"
                                                loading={loadingUsers}
                                                pagination={{
                                                    pageSize: 10,
                                                    showSizeChanger: true,
                                                    showQuickJumper: true,
                                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                                                }}
                                            />
                                        </Card>
                                    </TabPane>
                                    
                                    <TabPane tab={<span><CheckCircleOutlined /> Roles</span>} key="roles">
                                        <Card title="Role Management">
                                            <Table
                                                dataSource={roles}
                                                columns={roleColumns}
                                                rowKey="id"
                                                loading={loadingRoles}
                                                pagination={{
                                                    pageSize: 10,
                                                    showSizeChanger: true,
                                                    showQuickJumper: true,
                                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                                                }}
                                            />
                                        </Card>
                                    </TabPane>
                                </Tabs>
                            </React.Fragment>
                        )}
                    </React.Fragment>
                )}
            </div>
        </div>
    ); // <-- Closing parenthesis for the return statement
}; // <-- Closing brace for the Dashboard function body

export default Dashboard;