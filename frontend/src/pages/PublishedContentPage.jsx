import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, notification, Tag, Space, Pagination } from 'antd';
import { EyeOutlined, DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { 
  getContentItems, 
  getCurrentUser
} from '../api/django-api';
import statusLabel from '../utils/statusLabels.jsx';

export default function PublishedContentPage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [api, contextHolder] = notification.useNotification();
  const [currentUser, setCurrentUser] = useState(null);

  // Check user permissions
  const fetchUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      api.error({
        message: 'Error',
        description: 'Failed to fetch user data',
      });
    }
  };

  const fetchPublishedContent = async () => {
    setLoading(true);
    try {
      // Fetch content items with status 'published'
      const allContent = await getContentItems();
      const publishedContent = allContent.filter(item => item.status === 'published');
      setContents(publishedContent);
    } catch (error) {
      console.error('Error fetching published content:', error);
      api.error({
        message: 'Error',
        description: 'Failed to load published content'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchPublishedContent();
  }, []);

  const showModal = (record) => {
    setSelectedContent(record);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedContent(null);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      // Open the file in a new tab for download/viewing
      window.open(fileUrl, '_blank');
    } else {
      api.info({
        message: 'Info',
        description: 'No file available for download'
      });
    }
  };

  const handleShare = (id) => {
    const shareUrl = `${window.location.origin}/content/${id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        api.success({
          message: 'Success',
          description: 'Link copied to clipboard!'
        });
      })
      .catch(() => {
        api.error({
          message: 'Error',
          description: 'Failed to copy link to clipboard'
        });
      });
  };

  const getStatusColor = (status) => {
    const colorMap = {
      draft: 'default',
      review: 'orange',
      approved: 'blue',
      published: 'green',
      archived: 'gray',
      rejected: 'red',
      for_editing: 'default',
      for_approval: 'orange',
      for_publishing: 'blue',
      deleted: 'gray'
    };
    return colorMap[status] || 'default';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <div style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'content_type',
      key: 'content_type',
      render: (type) => {
        const colorMap = {
          article: 'blue',
          text: 'blue',
          video: 'green',
          image: 'orange',
          document: 'purple'
        };
        return <Tag color={colorMap[type] || 'default'}>{type.charAt(0).toUpperCase() + type.slice(1)}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {statusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'created_by',
      key: 'author',
      render: (createdBy) => createdBy?.username || 'Unknown'
    },
    {
      title: 'Published At',
      dataIndex: 'published_at',
      key: 'published_at',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => showModal(record)}
          >
            View
          </Button>
          {record.file_url && (
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record.file_url)}
            >
              Download
            </Button>
          )}
          <Button 
            icon={<ShareAltOutlined />}
            onClick={() => handleShare(record.id)}
          >
            Share
          </Button>
        </Space>
      ),
    },
  ];

  // Check if user has permission to view published content
  const hasPermission = currentUser && (
    currentUser.is_superuser || 
    currentUser.role === 'approver' || 
    currentUser.role === 'reviewer' || 
    currentUser.role === 'encoder'
  );

  if (!hasPermission) {
    return (
      <Card>
        <h2>Access denied</h2>
        <p>You don't have permission to view published content.</p>
      </Card>
    );
  }

  return (
    <>
      {contextHolder}
      <div style={{ padding: '24px' }}>
        <Card title="Published Content" style={{ marginBottom: '24px' }}>
          <p>All content that has been published and is available to the public</p>
        </Card>

        <Card>
          <Table
            dataSource={contents.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            columns={columns}
            loading={loading}
            pagination={false}
            rowKey="id"
          />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={contents.length}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            />
          </div>
        </Card>

        <Modal
          title={selectedContent?.title}
          open={modalVisible}
          onCancel={hideModal}
          footer={[
            <Button key="back" onClick={hideModal}>Close</Button>,
            selectedContent?.file_url && (
              <Button 
                key="download" 
                icon={<DownloadOutlined />}
                onClick={() => {
                  handleDownload(selectedContent.file_url);
                  hideModal();
                }}
              >
                Download File
              </Button>
            ),
            <Button 
              key="share" 
              icon={<ShareAltOutlined />}
              onClick={() => {
                handleShare(selectedContent?.id);
                hideModal();
              }}
            >
              Copy Link
            </Button>,
          ]}
          width={800}
        >
          {selectedContent && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Tag color={getStatusColor(selectedContent.status)}>
                  {statusLabel(selectedContent.status)}
                </Tag>
              </div>
              
              <p><strong>Author:</strong> {selectedContent.created_by?.username || 'Unknown'}</p>
              <p><strong>Content Type:</strong> {selectedContent.content_type}</p>
              <p><strong>Published At:</strong> {selectedContent.published_at ? new Date(selectedContent.published_at).toLocaleDateString() : 'N/A'}</p>
              
              {selectedContent.meta_description && (
                <>
                  <p><strong>Meta Description:</strong></p>
                  <p>{selectedContent.meta_description}</p>
                </>
              )}
              
              {selectedContent.meta_keywords && (
                <>
                  <p><strong>Meta Keywords:</strong></p>
                  <p>{selectedContent.meta_keywords}</p>
                </>
              )}
              
              {selectedContent.body && (
                <>
                  <p><strong>Content Body:</strong></p>
                  <div 
                    style={{ 
                      padding: '16px', 
                      background: '#f5f5f5', 
                      borderRadius: '4px', 
                      maxHeight: '200px', 
                      overflow: 'auto' 
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedContent.body }}
                  />
                </>
              )}
              
              {selectedContent.highlights && (
                <>
                  <p><strong>Highlights:</strong></p>
                  <div 
                    style={{ 
                      padding: '16px', 
                      background: '#f5f5f5', 
                      borderRadius: '4px', 
                      maxHeight: '150px', 
                      overflow: 'auto' 
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedContent.highlights }}
                  />
                </>
              )}
              
              {selectedContent.file_url && (
                <>
                  <p><strong>Attached File:</strong> {selectedContent.file_url.split('/').pop()}</p>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(selectedContent.file_url)}
                    style={{ marginTop: 10 }}
                  >
                    Download File
                  </Button>
                </>
              )}
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}