import React, { useState } from 'react';
import { Card, DatePicker, Select, Button, Form, Row, Col, Input, Radio, notification } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { generateAnalyticsReport } from '../api/django-api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const GenerateAnalyticsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [api, contextHolder] = notification.useNotification();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Format the form values for the API
      const formattedValues = {
        report_type: values.reportType,
        date_from: values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : null,
        date_to: values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : null,
        content_type: values.contentType,
        metrics: values.metrics ? values.metrics.join(',') : null
      };

      // Call the API to generate the analytics report
      const response = await generateAnalyticsReport(formattedValues);
      setReportData(response);
      
      api.success({
        message: 'Success',
        description: 'Analytics report generated successfully!',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      api.error({
        message: 'Error',
        description: 'Failed to generate analytics report',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData) {
      api.warning({
        message: 'Warning',
        description: 'Please generate a report first',
      });
      return;
    }
    
    // Create a downloadable CSV file
    try {
      // Prepare CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add views over time data
      csvContent += "\nViews Over Time:\n";
      csvContent += "Date,Views\n";
      reportData.viewsOverTime.forEach(item => {
        csvContent += `${item.date},${item.views}\n`;
      });
      
      // Add content distribution
      csvContent += "\nContent Distribution:\n";
      csvContent += "Content Type,Value\n";
      reportData.contentDistribution.forEach(item => {
        csvContent += `${item.name},${item.value}\n`;
      });
      
      // Add top content
      csvContent += "\nTop Performing Content:\n";
      csvContent += "Title,Views\n";
      reportData.topContent.forEach(item => {
        csvContent += `${item.title},${item.views}\n`;
      });
      
      // Create and trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `analytics-report-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      api.success({
        message: 'Success',
        description: 'Analytics report exported successfully!',
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      api.error({
        message: 'Error',
        description: 'Failed to export analytics report',
      });
    }
  };

  return (
    <>
      {contextHolder}
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
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {reportData.summary?.total_views || 0}
                    </div>
                    <div>Total Views</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      {reportData.summary?.new_users || 0}
                    </div>
                    <div>New Users</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                      {reportData.summary?.active_content || 0}
                    </div>
                    <div>Active Content</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                      {reportData.summary?.engagement_rate || '0%'}
                    </div>
                    <div>Engagement Rate</div>
                  </div>
                </Col>
              </Row>
            </Card>

            <Card title="Views Over Time" style={{ marginBottom: '24px' }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={reportData.views_over_time || []}
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
                        data={reportData.content_distribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.content_distribution?.map((entry, index) => (
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
                    {(reportData.top_content || []).map((item, index) => (
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
    </>
  );
};

export default GenerateAnalyticsPage;