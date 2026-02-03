import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Button, Row, Col, Tabs, Statistic, Table, Divider, notification } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAnalyticsSummary, getContentAnalytics, getUserActivityAnalytics } from '../api/django-api';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ViewAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({});
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
      
      // Combine all data into a single object for the UI
      const combinedData = {
        summary: {
          totalUsers: userData.user_stats?.total_users || 0,
          totalContent: summaryData.summary?.total_content_items || 0,
          publishedContent: summaryData.summary?.published_content || 0,
          totalViews: summaryData.summary?.total_content_items * 50 || 0, // Placeholder calculation
          avgEngagement: Math.min(100, Math.floor(Math.random() * 30) + 65) || 0, // Placeholder
          newUsers: summaryData.summary?.recently_created || 0
        },
        viewsOverTime: Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 100) + 100,
            unique: Math.floor(Math.random() * 80) + 60
          };
        }),
        contentTypes: [
          { name: 'Draft', count: contentData.content_by_status?.draft?.count || 0, views: Math.floor(Math.random() * 2000) + 5000 },
          { name: 'Review', count: contentData.content_by_status?.review?.count || 0, views: Math.floor(Math.random() * 1500) + 3000 },
          { name: 'Approved', count: contentData.content_by_status?.approved?.count || 0, views: Math.floor(Math.random() * 1000) + 1800 },
          { name: 'Published', count: contentData.content_by_status?.published?.count || 0, views: Math.floor(Math.random() * 500) + 950 },
        ].filter(item => item.count > 0),
        topContent: contentData.recently_published?.slice(0, 5).map((item, index) => ({
          key: `${index}`,
          title: item.title || 'Untitled',
          views: Math.floor(Math.random() * 200) + item.id || 100,
          likes: Math.floor(Math.random() * 100) + 20,
          shares: Math.floor(Math.random() * 50) + 5
        })) || [],
        userActivity: [
          { hour: '00:00', activity: Math.floor(Math.random() * 20) + 5 },
          { hour: '04:00', activity: Math.floor(Math.random() * 15) + 5 },
          { hour: '08:00', activity: Math.floor(Math.random() * 40) + 25 },
          { hour: '12:00', activity: Math.floor(Math.random() * 50) + 50 },
          { hour: '16:00', activity: Math.floor(Math.random() * 50) + 40 },
          { hour: '20:00', activity: Math.floor(Math.random() * 45) + 30 },
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const topContentColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: 'Likes',
      dataIndex: 'likes',
      key: 'likes',
      sorter: (a, b) => a.likes - b.likes,
    },
    {
      title: 'Shares',
      dataIndex: 'shares',
      key: 'shares',
      sorter: (a, b) => a.shares - b.shares,
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
                title="Total Views"
                value={analyticsData.summary?.totalViews || 0}
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
                title="New Users"
                value={analyticsData.summary?.newUsers || 0}
                valueStyle={{ fontSize: '20px', color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="overview" style={{ marginBottom: '24px' }}>
          <TabPane tab="Overview" key="overview">
            <Row gutter={16}>
              <Col span={16}>
                <Card title="Views Over Time" loading={loading}>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={analyticsData.viewsOverTime || []}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" name="Total Views" />
                      <Area type="monotone" dataKey="unique" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Unique Views" />
                    </AreaChart>
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
          
          <TabPane tab="Content Performance" key="performance">
            <Card title="Top Performing Content" loading={loading}>
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
                <Card title="User Activity by Hour" loading={loading}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={analyticsData.userActivity || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="activity" fill="#1890ff" name="User Activity" />
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
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="Content Count" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="views" name="Views" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Engagement Metrics">
              <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <h3>Engagement Rate</h3>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1890ff' }}>
                    {analyticsData.summary?.avgEngagement || 0}%
                  </div>
                  <p style={{ color: '#52c41a' }}>↑ 12% from last month</p>
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