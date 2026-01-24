import { Button, Card, Col, Row, Statistic, Tabs } from 'antd';
import { PieChartOutlined, BarChartOutlined, BellOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';

const DashboardPage = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [contentStats, setContentStats] = useState({});

  useEffect(() => {
    // Fetch analytics data
    axios.get('/api/analytics')
      .then(response => setAnalyticsData(response.data));
    
    // Fetch notifications
    axios.get('/api/notifications')
      .then(response => setNotifications(response.data.slice(0, 5)));
    
    // Fetch content statistics
    axios.get('/api/content/stats')
      .then(response => setContentStats(response.data));
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      {/* Analytics Section */}
      <Card title="Analytics" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Total Content"
              value={contentStats.total || 0}
              prefix={<PieChartOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Pending Approval"
              value={contentStats.pendingApproval || 0}
              prefix={<BellOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Published"
              value={contentStats.published || 0}
              prefix={<BarChartOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* Notifications Section */}
      <Card title="Recent Notifications" style={{ marginBottom: 24 }}>
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((notification, index) => (
              <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                {notification.message}
              </li>
            ))}
          </ul>
        ) : (
          <p>No new notifications</p>
        )}
      </Card>

      {/* Content Management Stats */}
      <Card title="Content Management">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Content Statistics" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Card>
                  <h3>Content by Type</h3>
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/placeholder-chart.png" alt="Content by Type" style={{ width: '100%', height: '100%' }} />
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <h3>Content Status</h3>
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/placeholder-chart.png" alt="Content Status" style={{ width: '100%', height: '100%' }} />
                  </div>
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Recent Activity" key="2">
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {/* Recent activity logs */}
              <ul>
                {Array.from({ length: 10 }).map((_, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    User updated content: {i + 1} minutes ago
                  </li>
                ))}
              </ul>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DashboardPage;