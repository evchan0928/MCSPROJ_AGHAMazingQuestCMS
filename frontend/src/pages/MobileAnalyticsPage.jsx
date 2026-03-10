import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Typography, Statistic, Tabs, DatePicker, Select, Button, Spin, Alert } from 'antd';
import { UserOutlined, PhoneOutlined, TrophyOutlined, BarChartOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getMobileAnalytics, getMobileUserEngagement } from '../api/django-api';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7e58'];

const MobileAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [engagementData, setEngagementData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, engagementResponse] = await Promise.all([
        getMobileAnalytics(),
        getMobileUserEngagement()
      ]);

      setAnalyticsData(analyticsResponse?.data || {});
      setEngagementData(engagementResponse?.data || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching mobile analytics:', err);
      setError('Failed to load mobile analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Prepare data for user registration trend chart
  const userRegistrationData = analyticsData.user_registration_trend?.slice(-14) || [];

  // Prepare data for score distribution chart
  const scoreDistributionData = analyticsData.score_distribution || [];

  // Prepare data for badge distribution chart
  const badgeDistributionData = analyticsData.badge_distribution || [];

  // Prepare data for weekly engagement chart
  const weeklyEngagementData = engagementData.weekly_engagement || [];

  // Prepare data for popular content chart
  const popularContentData = engagementData.popular_content?.slice(0, 5) || [];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#002a6c' }}>Mobile Analytics Dashboard</Title>
          <Text type="secondary">Comprehensive insights into mobile application usage and user engagement</Text>
        </div>
        <div>
          <RangePicker onChange={handleDateChange} style={{ marginRight: '16px' }} />
          <Button type="primary" onClick={handleRefresh} icon={<BarChartOutlined />}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={engagementData.engagement_metrics?.total_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active (Last 7 Days)"
              value={engagementData.engagement_metrics?.active_users_last_7_days || 0}
              prefix={<PhoneOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sessions (Last 7 Days)"
              value={engagementData.engagement_metrics?.total_sessions_last_7_days || 0}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg. Daily Scores"
              value={engagementData.engagement_metrics?.avg_scores_submitted_daily ? 
                parseFloat(engagementData.engagement_metrics.avg_scores_submitted_daily).toFixed(2) : 0}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Tabs defaultActiveKey="1" style={{ overflow: 'visible' }}>
        <TabPane tab="User Registration Trend" key="1">
          <Card title="Daily User Registrations (Last 14 Days)">
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userRegistrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="registrations" 
                    name="Registrations" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabPane>

        <TabPane tab="Score Distribution" key="2">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Score Ranges Distribution">
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Score Ranges Pie Chart">
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {scoreDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Badge Distribution" key="3">
          <Card title="Badge Types Distribution">
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={badgeDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Count" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabPane>

        <TabPane tab="User Engagement" key="4">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Weekly Engagement by Day">
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyEngagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sessions" name="Sessions" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Popular Content Items">
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={popularContentData}
                      layout="horizontal"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="content_item__title" width={100} />
                      <Tooltip formatter={(value, name) => name === 'attempt_count' ? [`Attempts: ${value}`, ''] : [Math.round(value * 100) / 100, 'Avg %']} />
                      <Legend />
                      <Bar dataKey="attempt_count" name="Attempts" fill="#0088FE" />
                      <Bar dataKey="avg_percentage" name="Avg %" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      <div style={{ marginTop: '24px' }}>
        <Card title="Additional Insights">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card size="small" title="Active Users (30 days)">
                <Statistic 
                  value={engagementData.engagement_metrics?.active_users_last_30_days || 0} 
                  valueStyle={{ color: '#cf1322' }} 
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Daily Badges Earned">
                <Statistic 
                  value={engagementData.engagement_metrics?.badges_earned_daily ? 
                    parseFloat(engagementData.engagement_metrics.badges_earned_daily).toFixed(2) : 0} 
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Top Performing Users">
                <Text>{analyticsData.top_users?.length || 0} users tracked</Text>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default MobileAnalyticsPage;