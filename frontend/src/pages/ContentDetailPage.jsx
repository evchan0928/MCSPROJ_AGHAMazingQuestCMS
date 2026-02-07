import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Tag, Spin } from 'antd';
import { AudioOutlined, VideoCameraOutlined, PictureOutlined, FileTextOutlined } from '@ant-design/icons';
import { getContentItems } from '../api/django-api';
import NavigationHeader from '../components/NavigationHeader.jsx';

const { Title, Paragraph } = Typography;

const ContentDetailPage = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch content details from API
    const fetchContent = async () => {
      try {
        // Get all content items and find the one with the matching ID
        const allContent = await getContentItems();
        const contentItem = allContent.find(item => item.id === parseInt(id));
        
        if (contentItem) {
          setContent(contentItem);
        } else {
          console.error('Content not found');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const renderContentTypeIcon = (type) => {
    switch (type) {
      case 'audio':
        return <AudioOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
      case 'video':
        return <VideoCameraOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
      case 'image':
        return <PictureOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
      default:
        return <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
    }
  };

  const renderContentPreview = (content) => {
    if (!content) return null;

    switch (content.content_type) {
      case 'audio':
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {renderContentTypeIcon(content.content_type)}
            <h3>Audio Content Preview</h3>
            {content.file_url && (
              <audio controls style={{ width: '100%', marginTop: '16px' }}>
                <source src={content.file_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        );
      case 'video':
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {renderContentTypeIcon(content.content_type)}
            <h3>Video Content Preview</h3>
            {content.file_url && (
              <video controls style={{ width: '100%', marginTop: '16px' }}>
                <source src={content.file_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        );
      case 'image':
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {renderContentTypeIcon(content.content_type)}
            <h3>Image Content Preview</h3>
            {content.file_url && (
              <img 
                src={content.file_url} 
                alt={content.title} 
                style={{ maxWidth: '100%', height: 'auto', marginTop: '16px' }} 
              />
            )}
          </div>
        );
      default:
        return (
          <div style={{ padding: '20px' }}>
            {renderContentTypeIcon(content.content_type)}
            <h3>Text Content Preview</h3>
            <div 
              style={{ marginTop: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}
              dangerouslySetInnerHTML={{ __html: content.body || 'No content body provided' }}
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!content) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div>
          <h2>Content not found</h2>
          <p>The requested content could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavigationHeader title="Content Detail" />
      <div style={{ padding: '24px' }}>
        <Card title="Content Detail" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Title level={2}>{content.title}</Title>
          
          <div style={{ marginBottom: '16px' }}>
            <Tag color={content.content_type === 'audio' ? 'purple' : 
                       content.content_type === 'video' ? 'blue' : 
                       content.content_type === 'image' ? 'gold' : 'green'}>
              {content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1)}
            </Tag>
            <Tag color={
              content.status === 'published' ? 'green' : 
              content.status === 'for_approval' ? 'orange' : 
              content.status === 'for_publishing' ? 'blue' : 
              content.status === 'for_editing' ? 'default' : 'red'
            }>
              {content.status.replace(/_/g, ' ').toUpperCase()}
            </Tag>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <strong>Author:</strong> {content.created_by?.username || 'Unknown'} | 
            <strong> Created:</strong> {new Date(content.created_at).toLocaleDateString()}
          </div>

          {renderContentPreview(content)}

          <div style={{ marginTop: '24px' }}>
            <Title level={4}>Additional Information</Title>
            
            {content.meta_description && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Meta Description:</strong>
                <Paragraph>{content.meta_description}</Paragraph>
              </div>
            )}

            {content.meta_keywords && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Meta Keywords:</strong>
                <Paragraph>{content.meta_keywords}</Paragraph>
              </div>
            )}

            {content.photo_caption && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Photo Caption:</strong>
                <Paragraph>{content.photo_caption}</Paragraph>
              </div>
            )}

            {content.highlights && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Highlights:</strong>
                <div 
                  style={{ padding: '16px', background: '#f9f9f9', borderRadius: '4px' }}
                  dangerouslySetInnerHTML={{ __html: content.highlights }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
              <Tag color={content.ar_marker ? 'green' : 'default'}>
                AR Marker: {content.ar_marker ? 'Yes' : 'No'}
              </Tag>
              <Tag color={content.quiz ? 'green' : 'default'}>
                Quiz: {content.quiz ? 'Yes' : 'No'}
              </Tag>
              <Tag color={content.enable_badges ? 'green' : 'default'}>
                Enable Badges: {content.enable_badges ? 'Yes' : 'No'}
              </Tag>
              <Tag color={content.chat_bot_allow ? 'green' : 'default'}>
                Chat Bot: {content.chat_bot_allow ? 'Allow' : 'Disallow'}
              </Tag>
              <Tag color={content.exclude_audio ? 'green' : 'default'}>
                Exclude Audio: {content.exclude_audio ? 'Yes' : 'No'}
              </Tag>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContentDetailPage;