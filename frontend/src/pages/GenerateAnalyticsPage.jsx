import React, { useState } from 'react';
import { Card, DatePicker, Select, Button, Form, Row, Col, Input, Radio, message } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DownloadOutlined, SyncOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const GenerateAnalyticsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Mock data for demonstration
  const mockReportData = {
    viewsOverTime: [
      { date: '2023-10-01', views: 120 },
      { date: '2023-10-02', views: 190 },
      { date: '2023-10-03', views: 150 },
      { date: '2023-10-04', views: 230 },
      { date: '2023-10-05', views: 180 },
      { date: '2023-10-06', views: 250 },
      { date: '2023-10-07', views: 200 },
    ],
    contentDistribution: [
      { name: 'Articles', value: 45 },
      { name: 'Videos', value: 25 },
      { name: 'Images', value: 20 },
      { name: 'Documents', value: 10 },
    ],
    topContent: [
      { title: 'Historical Landmarks', views: 1240 },
      { title: 'Research Breakthroughs', views: 987 },
      { title: 'Innovation Labs', views: 756 },
      { title: 'Future Tech Predictions', views: 632 },
      { title: 'Sustainability', views: 543 },
    ]
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // In a real implementation, this would call the API
      // const response = await axios.post('/api/analytics/generate/', values);
      // setReportData(response.data);
      
      // For demo purposes, use mock data
      setTimeout(() => {
        setReportData(mockReportData);
        message.success('Analytics report generated successfully!');
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate analytics report');
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData) {
      message.warning('Please generate a report first');
      return;
    }
    // In a real implementation, this would export the report
    message.success('Exporting analytics report...');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Generate Analytics Report" style={{ marginBottom: '24px' }}>
        <p>Create custom analytics reports based on content performance and user engagement</p>
      </Card>

      <Card title="Report Parameters" style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Report Type"
                name="reportType"
                initialValue="comprehensive"
              >
                <Radio.Group>
                  <Radio.Button value="comprehensive">Comprehensive</Radio.Button>
                  <Radio.Button value="content-performance">Content Performance</Radio.Button>
                  <Radio.Button value="user-engagement">User Engagement</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Date Range"
                name="dateRange"
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Content Type"
                name="contentType"
                initialValue="all"
              >
                <Select>
                  <Option value="all">All Types</Option>
                  <Option value="articles">Articles</Option>
                  <Option value="videos">Videos</Option>
                  <Option value="images">Images</Option>
                  <Option value="documents">Documents</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Metrics"
                name="metrics"
              >
                <Select
                  mode="multiple"
                  placeholder="Select metrics to include"
                  defaultValue={['views', 'engagement', 'downloads']}
                >
                  <Option value="views">Views</Option>
                  <Option value="engagement">Engagement Rate</Option>
                  <Option value="downloads">Downloads</Option>
                  <Option value="shares">Shares</Option>
                  <Option value="comments">Comments</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              <SyncOutlined /> Generate Report
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {reportData && (
        <>
          <Card title="Report Summary" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>1,245</div>
                  <div>Total Views</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>245</div>
                  <div>New Users</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>89</div>
                  <div>Active Content</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>78%</div>
                  <div>Engagement Rate</div>
                </div>
              </Col>
            </Row>
          </Card>

          <Card title="Views Over Time" style={{ marginBottom: '24px' }}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={reportData.viewsOverTime}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#1890ff" name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={12}>
              <Card title="Content Type Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.contentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.contentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Top Performing Content">
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {reportData.topContent.map((item, index) => (
                    <div key={index} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                      <div style={{ color: '#666', fontSize: '12px' }}>Views: {item.views}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          <div style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
              Export Report
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default GenerateAnalyticsPage;