import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Image, Spin, Alert, Typography, Tabs, Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios'; // Using axios directly for public endpoint without auth

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const PublicContentPage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublishedContent();
  }, []);

  const fetchPublishedContent = async () => {
    try {
      setLoading(true);
      // Using the public content endpoint that doesn't require authentication
      const response = await axios.get('/api/content/game/public-content/');
      setContents(response.data);
    } catch (err) {
      console.error('Error fetching published content:', err);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} size="large" />
        <p>Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  // Group content by type
  const textContent = contents.filter(item => item.content_type === 'text');
  const imageContent = contents.filter(item => item.content_type === 'image');
  const videoContent = contents.filter(item => item.content_type === 'video');
  const documentContent = contents.filter(item => item.content_type === 'document');
  const triviaContent = contents.filter(item => item.content_type === 'trivia');

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Title level={1} style={{ color: '#1890ff' }}>AGHAMazing Quest Content Portal</Title>
        <Paragraph style={{ fontSize: '18px' }}>
          Explore the latest educational content published through our CMS platform
        </Paragraph>
      </header>
      
      {contents.length === 0 ? (
        <Alert
          message="No Content Available"
          description="There are currently no published items to display. Please check back later."
          type="info"
          showIcon
          style={{ margin: '20px 0' }}
        />
      ) : (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Title level={3}>
              {contents.length} Published {contents.length === 1 ? 'Item' : 'Items'} Available
            </Title>
          </div>
          
          <Tabs defaultActiveKey="all" tabPosition="top" style={{ textAlign: 'left' }}>
            <TabPane tab={`All (${contents.length})`} key="all">
              <Row gutter={[24, 24]}>
                {contents.map((item) => (
                  <Col xs={24} sm={12} md={12} lg={8} xl={6} key={item.id}>
                    <ContentCard content={item} />
                  </Col>
                ))}
              </Row>
            </TabPane>
            
            {textContent.length > 0 && (
              <TabPane tab={`Text (${textContent.length})`} key="text">
                <Row gutter={[24, 24]}>
                  {textContent.map((item) => (
                    <Col xs={24} sm={12} md={12} lg={8} xl={6} key={item.id}>
                      <ContentCard content={item} />
                    </Col>
                  ))}
                </Row>
              </TabPane>
            )}
            
            {imageContent.length > 0 && (
              <TabPane tab={`Images (${imageContent.length})`} key="image">
                <Row gutter={[24, 24]}>
                  {imageContent.map((item) => (
                    <Col xs={24} sm={12} md={12} lg={8} xl={6} key={item.id}>
                      <ContentCard content={item} />
                    </Col>
                  ))}
                </Row>
              </TabPane>
            )}
            
            {videoContent.length > 0 && (
              <TabPane tab={`Videos (${videoContent.length})` } key="video">
                <Row gutter={[24, 24]}>
                  {videoContent.map((item) => (
                    <Col xs={24} sm={12} md={12} lg={8} xl={6} key={item.id}>
                      <ContentCard content={item} />
                    </Col>
                  ))}
                </Row>
              </TabPane>
            )}
            
            {documentContent.length > 0 && (
              <TabPane tab={`Documents (${documentContent.length})`} key="document">
                <Row gutter={[24, 24]}>
                  {documentContent.map((item) => (
                    <Col xs={24} sm={12} md={12} lg={8} xl={6} key={item.id}>
                      <ContentCard content={item} />
                    </Col>
                  ))}
                </Row>
              </TabPane>
            )}
            
            {triviaContent.length > 0 && (
              <TabPane tab={`Trivia (${triviaContent.length})`} key="trivia">
                <Row gutter={[24, 24]}>
                  {triviaContent.map((item) => (
                    <Col xs={24} sm={12} md={12} lg={8} xl={6} key={item.id}>
                      <ContentCard content={item} />
                    </Col>
                  ))}
                </Row>
              </TabPane>
            )}
          </Tabs>
        </div>
      )}
      
      <Divider style={{ marginTop: '40px' }} />
      <footer style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
        <p>Powered by AGHAMazing Quest CMS • Content published via role-based access control system</p>
        <p>All content displayed here has been approved and published by authorized personnel</p>
      </footer>
    </div>
  );
};

// Component to display individual content items
const ContentCard = ({ content }) => {
  const renderContent = () => {
    switch (content.content_type) {
      case 'text':
        return (
          <div>
            {content.image_url && (
              <Image 
                src={content.image_url} 
                alt={content.title}
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
            )}
            <div style={{ padding: '10px 0' }}>
              <Paragraph 
                ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
                style={{ minHeight: '72px' }}
              >
                {content.body ? content.body.replace(/<[^>]*>/g, '') : 'No description available.'}
              </Paragraph>
            </div>
          </div>
        );
        
      case 'image':
        return content.file_url ? (
          <Image 
            src={content.file_url} 
            alt={content.title}
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
            <span>No image available</span>
          </div>
        );
        
      case 'video':
        return content.file_url ? (
          <video 
            src={content.file_url} 
            controls 
            style={{ width: '100%', height: '200px' }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
            <span>No video available</span>
          </div>
        );
        
      case 'document':
        return (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
            <p>Document: {content.file_url ? content.file_url.split('/').pop() : 'N/A'}</p>
            {content.file_url && (
              <a href={content.file_url} target="_blank" rel="noopener noreferrer">
                <button style={{ 
                  backgroundColor: '#1890ff', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  View Document
                </button>
              </a>
            )}
          </div>
        );
        
      case 'trivia':
        return (
          <div>
            <div style={{ padding: '10px 0' }}>
              <p>Trivia Questions: {content.trivia_questions ? content.trivia_questions.length : 0}</p>
              {content.trivia_questions && content.trivia_questions.length > 0 && (
                <div>
                  <p>First Question: {content.trivia_questions[0]?.question || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Content Type: {content.content_type}</p>
          </div>
        );
    }
  };

  return (
    <Card
      hoverable
      style={{ height: '100%', minHeight: '300px' }}
      cover={renderContent()}
      title={
        <div style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          fontSize: '16px'
        }}>
          {content.title}
        </div>
      }
    >
      <Card.Meta
        description={
          <div>
            <div><strong>Type:</strong> {content.content_type}</div>
            <div><strong>Status:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>Published</span></div>
            {content.created_at && (
              <div><strong>Published:</strong> {new Date(content.created_at).toLocaleDateString()}</div>
            )}
            {content.description && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                {content.description.substring(0, 60)}...
              </div>
            )}
          </div>
        }
      />
    </Card>
  );
};

export default PublicContentPage;