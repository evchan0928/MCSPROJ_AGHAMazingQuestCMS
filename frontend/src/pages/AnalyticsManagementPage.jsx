import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Typography, Statistic, Table, DatePicker, Select, Button } from 'antd';
import { UserOutlined, FileTextOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

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
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration - would connect to actual API in production
      setStats({
        totalUsers: 124,
        totalContent: 320,
        publishedContent: 280,
        contentViews: 12450
      });
      
      setContentData([
        {
          key: '1',
          title: 'Historical Landmarks of DOST',
          author: 'John Smith',
          views: 1240,
          likes: 98,
          status: 'Published',
          date: '2023-11-15'
        },
        {
          key: '2',
          title: 'Research Breakthroughs in 2023',
          author: 'Maria Garcia',
          views: 987,
          likes: 76,
          status: 'Published',
          date: '2023-11-10'
        },
        {
          key: '3',
          title: 'Innovation Labs Overview',
          author: 'Robert Johnson',
          views: 756,
          likes: 54,
          status: 'Published',
          date: '2023-11-05'
        },
        {
          key: '4',
          title: 'Future Tech Predictions',
          author: 'Emily Chen',
          views: 632,
          likes: 42,
          status: 'Published',
          date: '2023-10-28'
        },
        {
          key: '5',
          title: 'Sustainability Initiatives',
          author: 'David Wilson',
          views: 543,
          likes: 38,
          status: 'Published',
          date: '2023-10-22'
        }
      ]);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const handleExport = () => {
    // In a real implementation, this would export analytics data
    alert('Exporting analytics report...');
  };

  const statColumns = [
    {
      title: 'Content Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: status === 'Published' ? '#52c41a' : '#faad14' }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
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

      <Card title="Content Performance" loading={loading}>
        <Table 
          columns={statColumns} 
          dataSource={contentData} 
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <div style={{ marginTop: '24px' }}>
        <Card title="Content Distribution">
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text type="secondary">Chart visualization would appear here in a full implementation</Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsManagementPage;