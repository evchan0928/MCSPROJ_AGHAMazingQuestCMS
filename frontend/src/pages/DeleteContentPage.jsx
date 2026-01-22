import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, message, Tag, Space } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const DeleteContentPage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    fetchContentForDeletion();
  }, []);

  const fetchContentForDeletion = async () => {
    try {
      // In a real implementation, this would fetch from the API
      // const token = localStorage.getItem('token');
      // const response = await axios.get('/api/content/', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      // Mock data for demonstration - showing content that can be deleted
      const mockData = [
        {
          id: 1,
          title: 'Outdated Research Data',
          author: 'John Smith',
          status: 'draft',
          type: 'article',
          createdAt: '2023-01-15',
          lastModified: '2023-05-20',
          description: 'Research data that is no longer relevant to current studies.'
        },
        {
          id: 2,
          title: 'Old Event Coverage',
          author: 'Maria Garcia',
          status: 'published',
          type: 'article',
          createdAt: '2023-02-10',
          lastModified: '2023-06-15',
          description: 'Coverage of an event that happened over a year ago.'
        },
        {
          id: 3,
          title: 'Deprecated Guidelines',
          author: 'Robert Johnson',
          status: 'published',
          type: 'document',
          createdAt: '2022-11-05',
          lastModified: '2023-01-12',
          description: 'Guidelines that have been superseded by newer versions.'
        },
        {
          id: 4,
          title: 'Test Content',
          author: 'David Wilson',
          status: 'draft',
          type: 'image',
          createdAt: '2023-10-22',
          lastModified: '2023-10-22',
          description: 'Test content created during development.'
        }
      ];
      
      setContents(mockData);
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
          // In a real implementation, this would make an API call
          // const token = localStorage.getItem('token');
          // await axios.delete(`/api/content/${id}/`, {
          //   headers: { 'Authorization': `Bearer ${token}` }
          // });
          
          message.success('Content deleted successfully');
          fetchContentForDeletion(); // Refresh the list
        } catch (error) {
          console.error('Error deleting content:', error);
          message.error('Failed to delete content');
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
          // In a real implementation, this would make an API call
          // const token = localStorage.getItem('token');
          // await axios.patch(`/api/content/${id}/`, { status: 'archived' }, {
          //   headers: { 'Authorization': `Bearer ${token}` }
          // });
          
          message.success('Content archived successfully');
          fetchContentForDeletion(); // Refresh the list
        } catch (error) {
          console.error('Error archiving content:', error);
          message.error('Failed to archive content');
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
      <Card title="Content Management - Delete/Archive" style={{ marginBottom: '24px' }}>
        <p>Select content to delete or archive. Draft content can be permanently deleted, published content should be archived.</p>
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
            <div style={{ marginTop: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
              <h4>Content Preview</h4>
              <p>This would show a detailed preview of the content in a real implementation.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeleteContentPage;