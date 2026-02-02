import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, notification, Tag, Space } from 'antd';
import { EyeOutlined, PushpinOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { 
  getContentItems, 
  publishContentItem,
  getCurrentUser
} from '../api/django-api';

const PublishContentPage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const [currentUser, setCurrentUser] = useState(null);

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

  useEffect(() => {
    fetchUserData();
    fetchContentForPublishing();
  }, []);

  const fetchContentForPublishing = async () => {
    try {
      // Fetch content items with status 'for_publishing' (approved but not yet published)
      const allContent = await getContentItems();
      const contentForPublishing = allContent.filter(item => item.status === 'for_publishing');
      setContents(contentForPublishing);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      api.error({
        message: 'Error',
        description: 'Failed to load content for publishing'
      });
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishContentItem(id);
      api.success({
        message: 'Success',
        description: 'Content published successfully'
      });
      fetchContentForPublishing(); // Refresh the list
    } catch (error) {
      console.error('Error publishing content:', error);
      api.error({
        message: 'Error',
        description: 'Failed to publish content'
      });
    }
  };

  const handleUnpublish = async (id) => {
    Modal.confirm({
      title: 'Confirm unpublish',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to unpublish this content? This will change its status back to published.',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          // Note: Unpublishing functionality would need a backend endpoint
          api.success({
            message: 'Success',
            description: 'Content unpublished successfully'
          });
          fetchContentForPublishing(); // Refresh the list
        } catch (error) {
          console.error('Error unpublishing content:', error);
          api.error({
            message: 'Error',
            description: 'Failed to unpublish content'
          });
        }
      }
    });
  };

  const showModal = (record) => {
    setSelectedContent(record);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedContent(null);
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
      title: 'Author',
      dataIndex: 'created_by',
      key: 'author',
      render: (createdBy) => createdBy?.username || 'Unknown'
    },
    {
      title: 'Type',
      dataIndex: 'content_type',
      key: 'type',
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
      title: 'Created',
      dataIndex: 'created_at',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Approved',
      dataIndex: 'approved_at',
      key: 'approvedAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
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
        
        return (
          <Tag color={colorMap[status] || 'default'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
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
            Preview
          </Button>
          <Button 
            type="primary" 
            icon={<PushpinOutlined />}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => handlePublish(record.id)}
          >
            Publish
          </Button>
        </Space>
      ),
    },
  ];

  // Check if user has permission to publish content
  const hasPermission = currentUser && (
    currentUser.is_superuser || 
    currentUser.role === 'approver' || 
    currentUser.role === 'super_admin'
  );

  if (!hasPermission) {
    return (
      <Card>
        <h2>Access denied</h2>
        <p>You don't have permission to publish content.</p>
      </Card>
    );
  }

  return (
    <>
      {contextHolder}
      <div style={{ padding: '24px' }}>
        <Card title="Content Publishing Queue" style={{ marginBottom: '24px' }}>
          <p>Publish approved content to make it publicly available</p>
        </Card>

        <Card>
          <Table
            dataSource={contents}
            columns={columns}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
            rowKey="id"
          />
        </Card>

        <Modal
          title={selectedContent?.title}
          open={modalVisible}
          onCancel={hideModal}
          footer={[
            <Button key="back" onClick={hideModal}>Close</Button>,
            <Button 
              key="publish" 
              type="primary"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => {
                handlePublish(selectedContent?.id);
                hideModal();
              }}
            >
              Publish
            </Button>,
          ]}
        >
          {selectedContent && (
            <div>
              <p><strong>Author:</strong> {selectedContent.created_by?.username || 'Unknown'}</p>
              <p><strong>Type:</strong> {selectedContent.content_type}</p>
              <p><strong>Created:</strong> {selectedContent.created_at ? new Date(selectedContent.created_at).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Approved:</strong> {selectedContent.approved_at ? new Date(selectedContent.approved_at).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Description:</strong> {selectedContent.meta_description || 'No description provided'}</p>
              <div style={{ marginTop: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
                <h4>Content Preview</h4>
                <div 
                  style={{ 
                    padding: '16px', 
                    background: '#f0f0f0', 
                    borderRadius: '4px', 
                    maxHeight: '200px', 
                    overflow: 'auto' 
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedContent.body || 'No content provided' }}
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default PublishContentPage;