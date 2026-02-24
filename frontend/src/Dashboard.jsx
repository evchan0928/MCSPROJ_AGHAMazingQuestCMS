// Dashboard component for the CMS
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Card, Statistic, Table, Row, Col, DatePicker, Select, Space, Progress, Tag } from 'antd';
import { 
    UserOutlined, 
    FileTextOutlined, 
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { getDashboardStats, getRecentContent, signOut, getCurrentUser, getAnalyticsSummary } from './api/django-api';
import statusLabel, { getStatusColor } from './utils/statusLabels.jsx';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isIndexRoute = location.pathname === '/dashboard';

    const [dashboardStats, setDashboardStats] = useState({
        total_users: 0,
        total_content: 0,
        published_content: 0
    });
    
    const [recentContent, setRecentContent] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingContent, setLoadingContent] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Fetch current user data from backend
        getCurrentUser().then(userData => {
            setCurrentUser(userData);
        }).catch(error => {
            console.error('Error fetching current user:', error);
            // Redirect to login if user data cannot be fetched
            navigate('/signin');
        });

        if (isIndexRoute) {
            fetchDashboardData();
        }
    }, [isIndexRoute]);

    const fetchDashboardData = async () => {
        setLoadingStats(true);
        setLoadingContent(true);
        
        try {
            // Fetch analytics data from the new endpoint
            const analyticsData = await getAnalyticsSummary();
            
            // Extract summary and content from the response
            if (analyticsData.summary) {
                setDashboardStats(analyticsData.summary);
            }
            
            // Use the content list from analytics endpoint
            if (analyticsData.content) {
                setRecentContent(analyticsData.content);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set default values in case of error
            setDashboardStats({
                total_users: 0,
                total_content: 0,
                published_content: 0
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
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="table-title">{text}</span>,
        },
        {
            title: 'Author',
            dataIndex: 'author',
            key: 'author',
            render: (author) => <span>{author || 'Unknown'}</span>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>{statusLabel(status)}</Tag>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => date ? new Date(date).toLocaleString() : 'N/A',
        },
    ];

    // Calculate content distribution for progress visualization
    const totalContent = dashboardStats.total_content || 1; // Avoid division by zero
    const publishedPercentage = dashboardStats.published_content 
      ? Math.round((dashboardStats.published_content / totalContent) * 100) 
      : 0;

    return ( 
        <div className="dashboard-content-wrapper" role="main">
            {/* Back to top button - accessibility improvement */}
            { /* back-to-top button removed per design request */ }

            {/* Main Content - Scrollable area */}
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
                            : 'Content Management'}
                    </h1> 
                    <div className="header-controls">
                        {/* Controls removed */}
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
                            <Col xs={24} sm={12} md={8}>
                                <Card className="card">
                                    <Statistic
                                        title="Total Users"
                                        value={dashboardStats.total_users || 0}
                                        prefix={<UserOutlined />}
                                        valueStyle={{ color: '#2196F3' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card className="card">
                                    <Statistic
                                        title="Total Content"
                                        value={dashboardStats.total_content || 0}
                                        prefix={<FileTextOutlined />}
                                        valueStyle={{ color: '#1C244D' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card className="card">
                                    <Statistic
                                        title="Published Content"
                                        value={dashboardStats.published_content || 0}
                                        prefix={<CheckCircleOutlined />}
                                        valueStyle={{ color: '#4CAF50' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Content Distribution and Progress */}
                        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                            <Col xs={24} lg={24}>
                                <Card className="card">
                                    <h3 className="card-title">Content Overview</h3>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span>Published Content: {dashboardStats.published_content || 0} ({publishedPercentage}%)</span>
                                            <Tag color="green">Published</Tag>
                                        </div>
                                        <Progress 
                                            percent={publishedPercentage} 
                                            strokeColor="#52c41a" 
                                            showInfo={false} 
                                        />
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
    );
};

export default Dashboard;