import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Typography, Statistic, Table, DatePicker, Select, Button, Tag } from 'antd';
import { UserOutlined, FileTextOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAnalyticsSummary, getContentAnalytics, getViewsOverTime, getContentEngagementMetrics } from '../api/django-api';
import statusLabel, { getStatusColor } from '../utils/statusLabels.jsx';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const AnalyticsManagementPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContent: 0,
    publishedContent: 0,
    contentViews: 0
  });
  const [contentData, setContentData] = useState([]);
  const [contentDistribution, setContentDistribution] = useState([]);
  const [viewsOverTime, setViewsOverTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsData, contentAnalytics, viewsTimeData, engagementData] = await Promise.all([
        getAnalyticsSummary(),
        getContentAnalytics(),
        getViewsOverTime(),
        getContentEngagementMetrics()
      ]);

      const summary = analyticsData?.summary || {};
      const content = Array.isArray(analyticsData?.content) ? analyticsData.content : [];

      setStats({
        totalUsers: summary.total_users || 0,
        totalContent: summary.total_content_items || 0,
        publishedContent: summary.published_content || 0,
        contentViews: engagementData?.total_views || 0
      });

      setContentData(
        content.map((item, index) => ({
          key: item.id || `${index + 1}`,
          name: item.name || item.title || 'Untitled',
          author: item.author || 'Unknown',
          status: item.status || 'N/A',
          date: item.date || item.created_at || item.created_date || null
        }))
      );

      // Prepare content distribution data for pie chart
      const contentByStatus = contentAnalytics?.content_by_status || {};
      const distributionData = Object.entries(contentByStatus).map(([status, data]) => ({
        name: statusLabel(status),
        value: data.count || 0,
      })).filter(item => item.value > 0);

      setContentDistribution(distributionData);
      
      // Prepare views over time data for bar chart
      setViewsOverTime(viewsTimeData?.views_over_time || []);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const handleExport = () => {
    // In a real implementation, this would export analytics data
    alert('Exporting analytics report...');
  };

  const statColumns = [
    {
      title: 'Content Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span>
          <Tag color={getStatusColor(status)}>{statusLabel(status)}</Tag>
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (date ? new Date(date).toLocaleString() : 'N/A'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0, color: '#002a6c' }}>Analytics Dashboard</Title>
        <div>
          <RangePicker onChange={handleDateChange} style={{ marginRight: '16px' }} />
          <Select 
            placeholder="Filter by status" 
            style={{ width: 150, marginRight: '16px' }}
            allowClear
          >
            <Option value="published">Published</Option>
            <Option value="draft">Draft</Option>
            <Option value="review">In Review</Option>
          </Select>
          <Button type="primary" onClick={handleExport}>
            Export Report
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Content"
              value={stats.totalContent}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Published Content"
              value={stats.publishedContent}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Views"
              value={stats.contentViews}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="Content Distribution by Status">
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {contentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Views Over Time">
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={viewsOverTime}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" name="Views" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Content Performance" loading={loading}>
        <Table 
          columns={statColumns} 
          dataSource={contentData} 
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default AnalyticsManagementPage;