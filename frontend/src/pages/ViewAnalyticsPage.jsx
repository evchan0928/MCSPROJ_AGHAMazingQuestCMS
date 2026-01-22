import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Button, Row, Col, Tabs, Statistic, Table, Divider } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ViewAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the API
      // const token = localStorage.getItem('token');
      // const response = await axios.get('/api/analytics/', {
      //   headers: { 'Authorization': `Bearer ${token}` },
      //   params: { date_range: dateRange }
      // });
      
      // Mock data for demonstration
      const mockData = {
        summary: {
          totalUsers: 1240,
          totalContent: 320,
          publishedContent: 280,
          totalViews: 12450,
          avgEngagement: 78,
          newUsers: 45
        },
        viewsOverTime: [
          { date: '2023-10-01', views: 120, unique: 80 },
          { date: '2023-10-02', views: 190, unique: 110 },
          { date: '2023-10-03', views: 150, unique: 95 },
          { date: '2023-10-04', views: 230, unique: 140 },
          { date: '2023-10-05', views: 180, unique: 120 },
          { date: '2023-10-06', views: 250, unique: 160 },
          { date: '2023-10-07', views: 200, unique: 145 },
        ],
        contentTypes: [
          { name: 'Articles', count: 180, views: 6500 },
          { name: 'Videos', count: 80, views: 3200 },
          { name: 'Images', count: 45, views: 1800 },
          { name: 'Documents', count: 15, views: 950 },
        ],
        topContent: [
          { key: '1', title: 'Historical Landmarks of DOST', views: 1240, likes: 98, shares: 45 },
          { key: '2', title: 'Research Breakthroughs in 2023', views: 987, likes: 76, shares: 32 },
          { key: '3', title: 'Innovation Labs Overview', views: 756, likes: 54, shares: 28 },
          { key: '4', title: 'Future Tech Predictions', views: 632, likes: 42, shares: 19 },
          { key: '5', title: 'Sustainability Initiatives', views: 543, likes: 38, shares: 15 },
        ],
        userActivity: [
          { hour: '00:00', activity: 12 },
          { hour: '04:00', activity: 8 },
          { hour: '08:00', activity: 45 },
          { hour: '12:00', activity: 89 },
          { hour: '16:00', activity: 78 },
          { hour: '20:00', activity: 65 },
        ]
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
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
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#002a6c' }}>Analytics Dashboard</h2>
        <div>
          <RangePicker onChange={(dates) => setDateRange(dates)} style={{ marginRight: '16px' }} />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} style={{ marginRight: '8px' }} />
          <Button type="primary" icon={<DownloadOutlined />}>
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
                    data={analyticsData.viewsOverTime}
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
                      data={analyticsData.contentTypes}
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
                    data={analyticsData.userActivity}
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
                data={analyticsData.contentTypes}
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
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1890ff' }}>78%</div>
                <p style={{ color: '#52c41a' }}>↑ 12% from last month</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ViewAnalyticsPage;