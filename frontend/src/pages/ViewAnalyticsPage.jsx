import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Button, Row, Col, Tabs, Statistic, Table, Divider, notification } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAnalyticsSummary, getContentAnalytics, getUserActivityAnalytics, getContentEngagementMetrics, getViewsOverTime } from '../api/django-api';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ViewAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({});
  const [userActivityData, setUserActivityData] = useState([]);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch different types of analytics data
      const [summaryData, contentData, userData] = await Promise.all([
        getAnalyticsSummary(),
        getContentAnalytics(),
        getUserActivityAnalytics()
      ]);
      
      // Fetch engagement metrics
      const engagementData = await getContentEngagementMetrics();
      
      // Fetch views over time data
      const viewsTimeData = await getViewsOverTime();
      
      // Prepare views over time data
      const viewsOverTime = viewsTimeData.views_over_time || [];
      
      // Combine all data into a single object for the UI
      const combinedData = {
        summary: {
          totalUsers: userData.user_stats?.total_users || 0,
          totalContent: summaryData.summary?.total_content_items || 0,
          publishedContent: summaryData.summary?.published_content || 0,
          contentInReview: summaryData.summary?.content_in_review || 0,
          totalViews: engagementData.total_views || 0,
          avgEngagement: engagementData.average_views_per_content || 0,
          newUsers: summaryData.summary?.recently_created || 0
        },
        viewsOverTime: viewsOverTime,
        contentTypes: [
          { name: 'For Editing', count: contentData.content_by_status?.for_editing?.count || 0 },
          { name: 'For Approval', count: contentData.content_by_status?.for_approval?.count || 0 },
          { name: 'For Publishing', count: contentData.content_by_status?.for_publishing?.count || 0 },
          { name: 'Published', count: contentData.content_by_status?.published?.count || 0 },
          { name: 'Deleted', count: contentData.content_by_status?.deleted?.count || 0 },
        ].filter(item => item.count > 0),
        topContent: contentData.recently_published?.slice(0, 5).map((item, index) => ({
          key: `${index}`,
          id: item.id || index,
          title: item.title || 'Untitled',
          published_at: item.published_at || 'N/A',
          published_by: item.published_by || 'Unknown'
        })) || [],
        userActivity: [
          { hour: '00:00', activity: 0 }, // Backend doesn't provide hourly activity data yet
          { hour: '04:00', activity: 0 },
          { hour: '08:00', activity: 0 },
          { hour: '12:00', activity: 0 },
          { hour: '16:00', activity: 0 },
          { hour: '20:00', activity: 0 },
        ]
      };
      
      setAnalyticsData(combinedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      api.error({
        message: 'Error',
        description: 'Failed to load analytics data'
      });
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExport = () => {
    api.success({
      message: 'Success',
      description: 'Exporting analytics report...'
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const topContentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Published At',
      dataIndex: 'published_at',
      key: 'published_at',
    },
    {
      title: 'Published By',
      dataIndex: 'published_by',
      key: 'published_by',
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#002a6c' }}>Analytics Dashboard</h2>
          <div>
            <RangePicker 
              onChange={(dates) => setDateRange(dates)} 
              style={{ marginRight: '16px' }} 
              disabled // Disable for now since backend doesn't support date filtering yet
            />
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} style={{ marginRight: '8px' }} />
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
              Export Report
            </Button>
          </div>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="Total Users"
                value={analyticsData.summary?.totalUsers || 0}
                valueStyle={{ fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Total Content"
                value={analyticsData.summary?.totalContent || 0}
                valueStyle={{ fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Published"
                value={analyticsData.summary?.publishedContent || 0}
                valueStyle={{ fontSize: '20px', color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Content in Review"
                value={analyticsData.summary?.contentInReview || 0}
                valueStyle={{ fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Engagement"
                value={analyticsData.summary?.avgEngagement || 0}
                suffix="%"
                valueStyle={{ fontSize: '20px', color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="New Content"
                value={analyticsData.summary?.newUsers || 0}
                valueStyle={{ fontSize: '20px', color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="overview" style={{ marginBottom: '24px' }}>
          <>
            <TabPane tab="Overview" key="overview">
              <Row gutter={16}>
                <Col span={16}>
                  <Card title="Content Status Overview" loading={loading}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={analyticsData.contentTypes || []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Content Count" fill="#1890ff" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="Content Distribution" loading={loading}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsData.contentTypes || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {analyticsData.contentTypes?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Views Over Time" key="viewsOverTime">
              <Card title="Content Views" loading={loading}>
                {analyticsData.viewsOverTime && analyticsData.viewsOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={analyticsData.viewsOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>No data available</p>
                  </div>
                )}
              </Card>
            </TabPane>
          </>
          
          <TabPane tab="Content Performance" key="performance">
            <Card title="Recently Published Content" loading={loading}>
              <Table 
                columns={topContentColumns} 
                dataSource={analyticsData.topContent} 
                pagination={{ pageSize: 5 }}
                scroll={{ x: 600 }}
              />
            </Card>
          </TabPane>
          
          <TabPane tab="User Activity" key="activity">
            <Row gutter={16}>
              <Col span={24}>
                <Card title="Top Content Creators" loading={loading}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={userActivityData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="contentCount" name="Content Count" fill="#1890ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        <Divider />

        <Row gutter={16}>
          <Col span={12}>
            <Card title="Content Metrics">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={analyticsData.contentTypes || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Content Count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="System Summary">
              <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <h3>Total Content Items</h3>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1890ff' }}>
                    {analyticsData.summary?.totalContent || 0}
                  </div>
                  <p>No data trend available yet</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ViewAnalyticsPage;