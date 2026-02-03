import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, message, Tag, Space, Spin } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { getContentItems, deleteContentItem, updateContentItem } from '../api/django-api';

const DeleteContentPage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchContentForDeletion();
  }, [refreshTrigger]);

  const fetchContentForDeletion = async () => {
    try {
      setLoading(true);
      const data = await getContentItems();
      // Filter content based on status to show for deletion options
      setContents(data.map(item => ({
        id: item.id,
        title: item.title,
        author: item.author?.first_name ? `${item.author.first_name} ${item.author.last_name || ''}` : 'Unknown Author',
        status: item.status,
        type: item.content_type || 'document',
        createdAt: item.created_at || item.created_date,
        lastModified: item.updated_at || item.last_modified,
        description: item.description || 'No description available',
        body: item.body || item.content || ''
      })));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      message.error('Failed to load content for deletion');
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    Modal.confirm({
      title: 'Confirm deletion',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      okText: 'Yes, delete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteContentItem(id);
          message.success('Content deleted successfully');
          setRefreshTrigger(prev => prev + 1); // Trigger refresh
        } catch (error) {
          console.error('Error deleting content:', error);
          message.error(`Failed to delete content: ${error.message}`);
        }
      }
    });
  };

  const handleArchive = async (id, title) => {
    Modal.confirm({
      title: 'Confirm archiving',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to archive "${title}"? It will no longer be publicly visible but kept for records.`,
      okText: 'Yes, archive',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Update the status to archived
          await updateContentItem(id, { status: 'archived' });
          message.success('Content archived successfully');
          setRefreshTrigger(prev => prev + 1); // Trigger refresh
        } catch (error) {
          console.error('Error archiving content:', error);
          message.error(`Failed to archive content: ${error.message}`);
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
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colorMap = {
          article: 'blue',
          video: 'green',
          image: 'orange',
          document: 'purple'
        };
        return <Tag color={colorMap[type] || 'default'}>{type.charAt(0).toUpperCase() + type.slice(1)}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
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
          rejected: 'red'
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
            type="default" 
            icon={<EyeOutlined />}
            onClick={() => showModal(record)}
          >
            Preview
          </Button>
          {record.status === 'published' ? (
            <Button 
              type="primary" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleArchive(record.id, record.title)}
            >
              Archive
            </Button>
          ) : (
            <Button 
              type="primary" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id, record.title)}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Content Management - Delete/Archive" 
        style={{ marginBottom: '24px' }}
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
          >
            Refresh
          </Button>
        }
      >
        <p>Select content to delete or archive. Draft content can be permanently deleted, published content should be archived.</p>
      </Card>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <p>Loading content...</p>
          </div>
        ) : (
          <Table
            dataSource={contents}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
            rowKey="id"
          />
        )}
      </Card>

      <Modal
        title={selectedContent?.title}
        open={modalVisible}
        onCancel={hideModal}
        footer={[
          <Button key="back" onClick={hideModal}>Close</Button>,
        ]}
      >
        {selectedContent && (
          <div>
            <p><strong>Author:</strong> {selectedContent.author}</p>
            <p><strong>Type:</strong> {selectedContent.type}</p>
            <p><strong>Status:</strong> {selectedContent.status}</p>
            <p><strong>Created:</strong> {selectedContent.createdAt}</p>
            <p><strong>Last Modified:</strong> {selectedContent.lastModified}</p>
            <p><strong>Description:</strong> {selectedContent.description}</p>
            {selectedContent.body && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
                <h4>Content Preview</h4>
                <div dangerouslySetInnerHTML={{ __html: selectedContent.body }} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeleteContentPage;