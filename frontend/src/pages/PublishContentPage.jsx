import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, message, Tag, Space } from 'antd';
import { EyeOutlined, PushpinOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const PublishContentPage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    fetchContentForPublishing();
  }, []);

  const fetchContentForPublishing = async () => {
    try {
      // In a real implementation, this would fetch from the API
      // const token = localStorage.getItem('token');
      // const response = await axios.get('/api/content/?status=approved', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      // Mock data for demonstration
      const mockData = [
        {
          id: 1,
          title: 'Historical Landmarks of DOST',
          author: 'John Smith',
          status: 'approved',
          type: 'article',
          createdAt: '2023-11-15',
          approvedAt: '2023-11-16',
          description: 'An article about the historical landmarks within the Department of Science and Technology.'
        },
        {
          id: 2,
          title: 'Research Breakthroughs in 2023',
          author: 'Maria Garcia',
          status: 'approved',
          type: 'article',
          createdAt: '2023-11-10',
          approvedAt: '2023-11-12',
          description: 'Summary of major research breakthroughs achieved in 2023.'
        },
        {
          id: 3,
          title: 'Innovation Labs Overview',
          author: 'Robert Johnson',
          status: 'approved',
          type: 'video',
          createdAt: '2023-11-05',
          approvedAt: '2023-11-07',
          description: 'Virtual tour of the latest innovation labs at DOST facilities.'
        }
      ];
      
      setContents(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      message.error('Failed to load content for publishing');
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      // In a real implementation, this would make an API call
      // const token = localStorage.getItem('token');
      // await axios.post(`/api/content/${id}/publish/`, {}, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      message.success('Content published successfully');
      fetchContentForPublishing(); // Refresh the list
    } catch (error) {
      console.error('Error publishing content:', error);
      message.error('Failed to publish content');
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
          // In a real implementation, this would make an API call
          message.success('Content unpublished successfully');
          fetchContentForPublishing(); // Refresh the list
        } catch (error) {
          console.error('Error unpublishing content:', error);
          message.error('Failed to unpublish content');
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
      title: 'Approved',
      dataIndex: 'approvedAt',
      key: 'approvedAt',
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

  return (
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
            <p><strong>Author:</strong> {selectedContent.author}</p>
            <p><strong>Type:</strong> {selectedContent.type}</p>
            <p><strong>Created:</strong> {selectedContent.createdAt}</p>
            <p><strong>Approved:</strong> {selectedContent.approvedAt}</p>
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

export default PublishContentPage;