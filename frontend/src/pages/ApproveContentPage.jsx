import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, notification, Tag, Space, Pagination, Descriptions, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { 
  getContentItems, 
  approveContentItem, 
  denyContentItem,
  getCurrentUser
} from '../api/django-api';
import statusLabel, { getStatusColor } from '../utils/statusLabels.jsx';

const { Title, Paragraph, Text } = Typography;

export default function ApproveContentPage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [api, contextHolder] = notification.useNotification();
  const [currentUser, setCurrentUser] = useState(null);

  // Role-based access control
  const allowedRoles = ['Approver', 'Admin', 'Super Admin'];

  // Check user permissions
  const allowed = (currentUser && (currentUser.is_superuser || 
    (currentUser.roles || []).some(role => allowedRoles.includes(role)))) || false;

  const fetchPendingContent = async () => {
    if (!allowed) return;
    
    setLoading(true);
    try {
      // Fetch content items with status 'for_approval' (also accept legacy variants)
      const allContent = await getContentItems();
      const pendingApprovalContent = allContent.filter(item => ['for_approval', 'pending_approval', 'edited'].includes(String(item.status)));
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
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        api.error({
          message: 'Error',
          description: 'Failed to fetch user data'
        });
      }
    };
    
    fetchUserData();
    fetchPendingContent();
  }, []);

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
      title: 'Type',
      dataIndex: 'content_type',
      key: 'content_type',
      render: (type) => type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Text'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{statusLabel(status)}</Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => { setPreviewContent(record); setPreviewVisible(true); }}
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
            <Button key="back" onClick={closeModal}>Close</Button>,
            <Button key="deny" type="primary" danger onClick={() => handleReject(selectedContent?.id)}>Deny</Button>,
            <Button key="approve" type="primary" onClick={() => handleApprove(selectedContent?.id)}>Approve</Button>
          ]}
          width={800}
        >
          {selectedContent ? (
            <div>
              <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
                <Descriptions.Item label="Title">{selectedContent.title}</Descriptions.Item>
                <Descriptions.Item label="Status"><Tag color={getStatusColor(selectedContent.status)}>{statusLabel(selectedContent.status)}</Tag></Descriptions.Item>
                <Descriptions.Item label="Type">{selectedContent.content_type || 'Text'}</Descriptions.Item>
                <Descriptions.Item label="Created At">{selectedContent.created_at}</Descriptions.Item>
                <Descriptions.Item label="Author" span={2}>{selectedContent.created_by?.username || 'Unknown'}</Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: 16 }}>
                <Paragraph strong>Attached File:</Paragraph>
                <Text>{((selectedContent.file || selectedContent.file_url) || '').split('/').pop() || 'None'}</Text>
              </div>
            </div>
          ) : null}
        </Modal>

        {/* Preview modal (separate) */}
        <Modal
          title={previewContent?.title}
          open={previewVisible}
          onCancel={() => { setPreviewVisible(false); setPreviewContent(null); }}
          footer={[<Button key="close" onClick={() => { setPreviewVisible(false); setPreviewContent(null); }}>Close</Button>]}
          width={800}
        >
          {previewContent && (
            <div>
              {(() => {
                const fileUrl = previewContent.file_url || previewContent.file || previewContent.fileUrl || null;
                let trivia = previewContent.trivia_questions || previewContent.triviaQuestions || null;
                if (trivia && typeof trivia === 'string') {
                  try { trivia = JSON.parse(trivia); } catch (e) { trivia = null; }
                }

                return (
                  <div>
                    <p><strong>Type:</strong> {previewContent.content_type}</p>
                    <p><strong>Created:</strong> {previewContent.created_at ? (() => { const d = new Date(previewContent.created_at); return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}` })() : 'N/A'}</p>

                    {previewContent.content_type === 'image' && fileUrl && (
                      <img src={fileUrl} alt={previewContent.title} style={{ maxWidth: '100%' }} />
                    )}

                    {previewContent.content_type === 'trivia' && trivia && (
                      <div>
                        <h4>Trivia Questions</h4>
                        {(trivia || []).map((q, idx) => (
                          <div key={idx} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                            <p style={{ margin: 0 }}><strong>Q{idx+1}:</strong> {q.question}</p>
                            <ul>
                              {(q.choices || []).map((choice, cidx) => (
                                <li key={cidx} style={{ fontWeight: q.correctIndex === cidx ? 600 : 400 }}>{String.fromCharCode(65+cidx)}. {choice}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {previewContent.content_type === 'text' && previewContent.body && (
                      <div dangerouslySetInnerHTML={{ __html: previewContent.body }} style={{ padding: 8, background: '#f5f5f5' }} />
                    )}

                    {previewContent.content_type === 'video' && fileUrl && (
                      <video controls style={{ width: '100%' }} src={fileUrl} />
                    )}

                    {previewContent.content_type === 'document' && fileUrl && (
                      <div>
                        <p><strong>Document:</strong> {fileUrl.split('/').pop()}</p>
                        <Button onClick={() => window.open(fileUrl, '_blank')}>Open Document</Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}