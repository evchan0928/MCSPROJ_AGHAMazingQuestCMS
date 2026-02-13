// src/Dashboard.jsx (The complete and correct file structure)

import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import NavigationBar from './components/NavigationBar.jsx'; // Import the new NavigationBar
import { Card, Statistic, Table, Row, Col, Button, DatePicker, Select, Space, Progress, Tag } from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  ClockCircleOutlined, 
  NotificationOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { getDashboardStats, getRecentContent, signOut } from './api/django-api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => { // <-- Opening brace for the function body
    const location = useLocation();
    const navigate = useNavigate();
    const isIndexRoute = location.pathname === '/dashboard';

    const [dashboardStats, setDashboardStats] = useState({
        published: 0,
        pendingApproval: 0,
        activeUsers: 0,
        notifications: 0,
        totalContent: 0,
        contentInEditing: 0,
        recentlyPublished: 0
    });
    
    const [recentContent, setRecentContent] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
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
        setLoadingStats(true);
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
            // Set default values in case of error
            setDashboardStats({
                published: 0,
                pendingApproval: 0,
                activeUsers: 0,
                notifications: 0,
                totalContent: 0,
                contentInEditing: 0,
                recentlyPublished: 0
            });
            setRecentContent([]);
        } finally {
            setLoadingStats(false);
            setLoadingContent(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/signin');
        } catch (error) {
            console.error('Error during logout:', error);
            // Even if the API logout fails, clear local tokens and redirect
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/signin');
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
            title: 'Type',
            dataIndex: 'content_type',
            key: 'content_type',
            render: (type) => <span>{type || 'text'}</span>,
        },
        {
            title: 'Time Stamp',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => date ? new Date(date).toLocaleString() : 'N/A',
        },
        {
            title: 'Encoded By',
            dataIndex: 'created_by',
            key: 'created_by',
            render: (user) => user?.username || 'Unknown',
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

    // Calculate content distribution for progress visualization
    const totalContent = dashboardStats.totalContent || 1; // Avoid division by zero
    const publishedPercentage = dashboardStats.published 
      ? Math.round((dashboardStats.published / totalContent) * 100) 
      : 0;
    const pendingPercentage = dashboardStats.pendingApproval 
      ? Math.round((dashboardStats.pendingApproval / totalContent) * 100) 
      : 0;
    const editingPercentage = dashboardStats.contentInEditing 
      ? Math.round((dashboardStats.contentInEditing / totalContent) * 100) 
      : 0;
    const publishedProgressPercentage = dashboardStats.published && dashboardStats.recentlyPublished 
      ? Math.round(((dashboardStats.published + dashboardStats.recentlyPublished) / totalContent) * 100)
      : 0;

    // 🔑 START OF EXPLICIT RETURN STATEMENT
    return ( 
        <div className="dashboard-layout">
            {/* 1. Navigation Bar at the top */}
            <NavigationBar user={currentUser} onLogout={handleLogout} />

            <div className="dashboard-content-wrapper" role="main">
                {/* 2. Sidebar */}
                <Sidebar user={currentUser} /> 
                
                {/* Back to top button - accessibility improvement */}
                {isIndexRoute && (
                    <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<ClockCircleOutlined />} 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="back-to-top"
                    />
                )}

                {/* 3. Main Content - Scrollable area */}
                <div className="main-content">
                    <div className="main-header">
                        <h1>
                            {isIndexRoute 
                                ? 'Dashboard' 
                                : location.pathname.includes('/content/upload') ? 'Upload Content' 
                                : location.pathname.includes('/content/list') ? 'Content List'
                                : location.pathname.includes('/content/edit') ? 'Edit Content'
                                : location.pathname.includes('/content/approve') ? 'Approve Content'
                                : location.pathname.includes('/content/publish') ? 'Publish Content'
                                : location.pathname.includes('/content/published') ? 'Published Content'
                                : location.pathname.includes('/content/delete') ? 'Delete Content'
                                : location.pathname.includes('/analytics/') ? 'Analytics'
                                : location.pathname.includes('/users') ? 'User Management'
                                : 'Content Management'} {/* Fallback for any other cases */}
                        </h1> 
                        <div className="header-controls">
                            {/* The search, content, and status controls have been removed from here. */}
                        </div>
                    </div>

                    {/* The Outlet renders the nested route component - this is the main scrollable area */}
                    <div className="page-content">
                        <Outlet /> 
                    </div>

                    {/* Dynamic Dashboard Content only rendered on the index route */}
                    {isIndexRoute && (
                        <React.Fragment>
                            {/* Summary Statistics */}
                            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className="card">
                                        <Statistic
                                            title="Total Content"
                                            value={dashboardStats.totalContent || 0}
                                            prefix={<FileTextOutlined />}
                                            valueStyle={{ color: '#1C244D' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className="card">
                                        <Statistic
                                            title="Published"
                                            value={dashboardStats.published || 0}
                                            prefix={<CheckCircleOutlined />}
                                            valueStyle={{ color: '#4CAF50' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className="card">
                                        <Statistic
                                            title="Pending Approval"
                                            value={dashboardStats.pendingApproval || 0}
                                            prefix={<ExclamationCircleOutlined />}
                                            valueStyle={{ color: '#FFC107' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className="card">
                                        <Statistic
                                            title="Active Users"
                                            value={dashboardStats.activeUsers || 0}
                                            prefix={<UserOutlined />}
                                            valueStyle={{ color: '#2196F3' }}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            {/* Content Distribution and Progress */}
                            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                                <Col xs={24} lg={16}>
                                    <Card className="card">
                                        <h3 className="card-title">Content Distribution</h3>
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span>Published: {dashboardStats.published || 0} ({publishedPercentage}%)</span>
                                                <Tag color="green">Published</Tag>
                                            </div>
                                            <Progress 
                                                percent={publishedPercentage} 
                                                strokeColor="#52c41a" 
                                                showInfo={false} 
                                            />
                                        </div>
                                        
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span>Pending Approval: {dashboardStats.pendingApproval || 0} ({pendingPercentage}%)</span>
                                                <Tag color="orange">Pending</Tag>
                                            </div>
                                            <Progress 
                                                percent={pendingPercentage} 
                                                strokeColor="#faad14" 
                                                showInfo={false} 
                                            />
                                        </div>
                                        
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span>In Editing: {dashboardStats.contentInEditing || 0} ({editingPercentage}%)</span>
                                                <Tag color="blue">Editing</Tag>
                                            </div>
                                            <Progress 
                                                percent={editingPercentage} 
                                                strokeColor="#1890ff" 
                                                showInfo={false} 
                                            />
                                        </div>
                                    </Card>
                                </Col>
                                
                                <Col xs={24} lg={8}>
                                    <Card className="card">
                                        <h3 className="card-title">Content Progress</h3>
                                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1C244D', marginBottom: '10px' }}>
                                                {publishedProgressPercentage}%
                                            </div>
                                            <div style={{ marginBottom: '20px' }}>
                                                <Progress 
                                                    type="dashboard" 
                                                    percent={publishedProgressPercentage} 
                                                    strokeWidth={12}
                                                    strokeColor="#52c41a"
                                                />
                                            </div>
                                            <p>Overall Publishing Progress</p>
                                        </div>
                                        
                                        <div style={{ marginTop: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <span><EyeOutlined style={{ color: '#1890ff' }} /> Recently Active</span>
                                                <span>{dashboardStats.recentlyPublished || 0}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span><CalendarOutlined style={{ color: '#52c41a' }} /> Notifications</span>
                                                <span>{dashboardStats.notifications || 0}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Recent Content Table */}
                            <div className="data-table-container">
                                <h3 className="section-title">Recent Activity</h3>
                                <Table
                                    dataSource={recentContent}
                                    columns={columns}
                                    rowKey="id"
                                    loading={loadingContent}
                                    pagination={{
                                        pageSize: 5,
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
        </div>
    ); // <-- Closing parenthesis for the return statement
}; // <-- Closing brace for the Dashboard function body

export default Dashboard;