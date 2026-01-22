import React, { useState } from 'react';
import { Card, DatePicker, Select, Button, Form, Row, Col, Radio, Alert, Space } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined, FileTextOutlined, MailOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DownloadAnalyticsPage = () => {
  const [form] = Form.useForm();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const onFinish = async (values) => {
    setDownloading(true);
    try {
      // In a real implementation, this would call the API to generate and download the report
      // const token = localStorage.getItem('token');
      // const response = await axios.post('/api/analytics/download/', values, {
      //   headers: { 'Authorization': `Bearer ${token}` },
      //   responseType: 'blob' // Important for file downloads
      // });
      
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `analytics-report.${values.format}`);
      // document.body.appendChild(link);
      // link.click();
      
      // For demo purposes
      setTimeout(() => {
        setDownloading(false);
        setDownloadSuccess(true);
        // Reset success message after 5 seconds
        setTimeout(() => setDownloadSuccess(false), 5000);
      }, 1500);
    } catch (error) {
      console.error('Error downloading report:', error);
      setDownloading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Download Analytics Reports" style={{ marginBottom: '24px' }}>
        <p>Generate and download comprehensive analytics reports in various formats</p>
      </Card>

      {downloadSuccess && (
        <Alert
          message="Download Successful"
          description="Your analytics report has been downloaded successfully."
          type="success"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Card title="Report Configuration" style={{ marginBottom: '24px' }}>
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
                rules={[{ required: true, message: 'Please select a report type' }]}
              >
                <Select>
                  <Option value="comprehensive">Comprehensive Report</Option>
                  <Option value="content-performance">Content Performance</Option>
                  <Option value="user-engagement">User Engagement</Option>
                  <Option value="content-type-analysis">Content Type Analysis</Option>
                  <Option value="monthly-summary">Monthly Summary</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Date Range"
                name="dateRange"
                rules={[{ required: true, message: 'Please select a date range' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Format"
                name="format"
                initialValue="pdf"
                rules={[{ required: true, message: 'Please select a format' }]}
              >
                <Radio.Group>
                  <Radio.Button value="pdf">
                    <FilePdfOutlined /> PDF
                  </Radio.Button>
                  <Radio.Button value="excel">
                    <FileExcelOutlined /> Excel
                  </Radio.Button>
                  <Radio.Button value="csv">
                    <FileTextOutlined /> CSV
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Include Data"
                name="includedData"
                initialValue={['summary', 'visualizations', 'detailed-data']}
              >
                <Select
                  mode="multiple"
                  placeholder="Select data to include"
                >
                  <Option value="summary">Executive Summary</Option>
                  <Option value="visualizations">Visualizations</Option>
                  <Option value="detailed-data">Detailed Data Tables</Option>
                  <Option value="comparisons">Comparative Analysis</Option>
                  <Option value="recommendations">Recommendations</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Content Type Filter"
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
                label="Additional Options"
                name="options"
              >
                <Select
                  mode="multiple"
                  placeholder="Select options"
                >
                  <Option value="trend-analysis">Trend Analysis</Option>
                  <Option value="forecast">Forecast</Option>
                  <Option value="benchmark">Benchmark Comparison</Option>
                  <Option value="custom-cover">Custom Cover Page</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={downloading} icon={<DownloadOutlined />}>
                Generate & Download Report
              </Button>
              <Button icon={<MailOutlined />}>
                Email Report
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Report Templates">
        <Row gutter={16}>
          <Col span={8}>
            <Card 
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              cover={
                <div style={{ 
                  height: '150px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f0f2f5'
                }}>
                  <FilePdfOutlined style={{ fontSize: '48px', color: '#FF0000' }} />
                </div>
              }
            >
              <Card.Meta title="Standard Report" description="Basic analytics with charts" />
            </Card>
          </Col>
          <Col span={8}>
            <Card 
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              cover={
                <div style={{ 
                  height: '150px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f0f2f5'
                }}>
                  <FileExcelOutlined style={{ fontSize: '48px', color: '#2DB763' }} />
                </div>
              }
            >
              <Card.Meta title="Data Export" description="Raw data in spreadsheet format" />
            </Card>
          </Col>
          <Col span={8}>
            <Card 
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              cover={
                <div style={{ 
                  height: '150px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f0f2f5'
                }}>
                  <FileTextOutlined style={{ fontSize: '48px', color: '#1890FF' }} />
                </div>
              }
            >
              <Card.Meta title="Executive Summary" description="High-level insights" />
            </Card>
          </Col>
        </Row>
      </Card>

      <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h3>Report Generation Tips</h3>
        <ul>
          <li>Reports can take 1-3 minutes to generate depending on the date range selected</li>
          <li>For best results, limit date ranges to 12 months or less</li>
          <li>PDF reports include charts and visualizations, while CSV contains raw data</li>
          <li>Email delivery option is recommended for large reports</li>
          <li>Reports are automatically archived for 90 days after generation</li>
        </ul>
      </div>
    </div>
  );
};

export default DownloadAnalyticsPage;