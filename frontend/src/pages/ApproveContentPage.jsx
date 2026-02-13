import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, notification, Tag, Space, Pagination, Descriptions, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { 
  getContentItems, 
  approveContentItem, 
  denyContentItem 
} from '../api/django-api';
import statusLabel from '../utils/statusLabels.jsx';

const { Title, Paragraph, Text } = Typography;

export default function ApproveContentPage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [api, contextHolder] = notification.useNotification();
  const outlet = useOutletContext();
  const outletUser = outlet?.user || null;

  // Check user permissions - allowing Admins as well
  const allowed = (outletUser && (outletUser.is_superuser || 
    (outletUser.roles || []).includes('Approver') || 
    (outletUser.roles || []).includes('Admin') || 
    (outletUser.roles || []).includes('Super Admin'))) || false;

  const fetchPendingContent = async () => {
    if (!allowed) return;
    
    setLoading(true);
    try {
      // Fetch content items with status 'for_approval'
      const allContent = await getContentItems();
      const pendingApprovalContent = allContent.filter(item => item.status === 'for_approval');
      setContents(pendingApprovalContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      api.error({
        message: 'Error',
        description: 'Failed to load content for approval'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingContent();
  }, [allowed]);

  const handleApprove = async (id) => {
    try {
      await approveContentItem(id);
      api.success({
        message: 'Success',
        description: 'Content approved successfully'
      });
      fetchPendingContent();
    } catch (error) {
      console.error('Error approving content:', error);
      api.error({
        message: 'Error',
        description: 'Failed to approve content'
      });
    }
  };

  const handleReject = async (id) => {
    try {
      await denyContentItem(id);
      api.success({
        message: 'Success',
        description: 'Content rejected successfully'
      });
      fetchPendingContent();
    } catch (error) {
      console.error('Error rejecting content:', error);
      api.error({
        message: 'Error',
        description: 'Failed to reject content'
      });
    }
  };

  const showModal = (content) => {
    setSelectedContent(content);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedContent(null);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
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
      published: 'green',
      deleted: 'gray'
    };
    return colorMap[status] || 'default';
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text) => (
        <div style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </div>
      ),
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
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
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
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record.id)}
          >
            Approve
          </Button>
          <Button 
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleReject(record.id)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  if (!allowed) {
    return (
      <Card>
        <h2>Access denied</h2>
        <p>You don't have permission to approve or publish content.</p>
      </Card>
    );
  }

  return (
    <>
      {contextHolder}
      <div style={{ padding: '24px' }}>
        <Card title="Content Approval Queue" style={{ marginBottom: '24px' }}>
          <p>Review and approve/reject content submitted by encoders</p>
        </Card>

        <Card>
          <Table
            dataSource={contents}
            columns={columns}
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: contents.length,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
            rowKey="id"
          />
        </Card>

        <Modal
          title="Content Details"
          visible={modalVisible}
          onCancel={closeModal}
          footer={[
            <Button key="back" onClick={closeModal}>Cancel</Button>,
            <Button 
              key="deny" 
              type="primary" 
              danger
              onClick={() => {
                handleReject(selectedContent?.id);
              }}
            >
              Deny
            </Button>,
            <Button 
              key="approve" 
              type="primary"
              onClick={() => {
                handleApprove(selectedContent?.id);
              }}
            >
              Approve
            </Button>,
          ]}
          width={800}
        >
          {selectedContent && (
            <div>
              <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
                <Descriptions.Item label="Title">{selectedContent.title}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedContent.status)}>{statusLabel(selectedContent.status)}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Type">{selectedContent.content_type || 'Text'}</Descriptions.Item>
                <Descriptions.Item label="Created At">{selectedContent.created_at}</Descriptions.Item>
                <Descriptions.Item label="Author" span={2}>
                  {selectedContent.created_by?.username || 'Unknown'}
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: '16px' }}>
                <Title level={4}>Content Preview</Title>
                <Paragraph strong>Body:</Paragraph>
                <div 
                  style={{ 
                    padding: '16px', 
                    background: '#f5f5f5', 
                    borderRadius: '4px', 
                    maxHeight: '200px', 
                    overflow: 'auto' 
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedContent.body || 'No content provided' }}
                />

                {selectedContent.meta_description && (
                  <>
                    <Paragraph strong style={{ marginTop: '16px' }}>Meta Description:</Paragraph>
                    <Text>{selectedContent.meta_description}</Text>
                  </>
                )}

                {selectedContent.meta_keywords && (
                  <>
                    <Paragraph strong style={{ marginTop: '16px' }}>Meta Keywords:</Paragraph>
                    <Text>{selectedContent.meta_keywords}</Text>
                  </>
                )}

                {selectedContent.photo_caption && (
                  <>
                    <Paragraph strong style={{ marginTop: '16px' }}>Photo Caption:</Paragraph>
                    <Text>{selectedContent.photo_caption}</Text>
                  </>
                )}

                {selectedContent.highlights && (
                  <>
                    <Paragraph strong style={{ marginTop: '16px' }}>Highlights:</Paragraph>
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

                {selectedContent.file && (
                  <>
                    <Paragraph strong style={{ marginTop: '16px' }}>Attached File:</Paragraph>
                    <Text>{selectedContent.file.split('/').pop()}</Text>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}