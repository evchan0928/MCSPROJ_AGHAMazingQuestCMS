import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, message, Tag, Space, Pagination } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import statusLabel from '../utils/statusLabels.jsx';

export default function ApproveContentPage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const token = localStorage.getItem('access');
  const outlet = useOutletContext();
  const outletUser = outlet?.user || null;

  // Check user permissions
  const allowed = (outletUser && (outletUser.is_superuser || 
    (outletUser.roles || []).includes('Approver') || 
    (outletUser.roles || []).includes('Super Admin'))) || false;

  const fetchPendingContent = async () => {
    if (!allowed) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/content/items/?status=for_approval`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!res.ok) throw new Error('Failed to load content');
      const data = await res.json();
      setContents(data);
    } catch (error) {
      console.error('Error fetching content:', error);
      message.error('Failed to load content for approval');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingContent();
  }, [allowed, token]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/content/items/${id}/approve/`, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!res.ok) throw new Error('Approve failed');
      message.success('Content approved successfully');
      fetchPendingContent();
    } catch (error) {
      console.error('Error approving content:', error);
      message.error('Failed to approve content');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`/api/content/items/${id}/deny/`, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!res.ok) throw new Error('Reject failed');
      message.success('Content rejected successfully');
      fetchPendingContent();
    } catch (error) {
      console.error('Error rejecting content:', error);
      message.error('Failed to reject content');
    }
  };

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

  const getStatusColor = (status) => {
    const colorMap = {
      draft: 'default',
      review: 'orange',
      approved: 'blue',
      published: 'green',
      archived: 'gray',
      rejected: 'red'
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
    <div style={{ padding: '24px' }}>
      <Card title="Content Approval Queue" style={{ marginBottom: '24px' }}>
        <p>Review and approve/reject content submitted by encoders</p>
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
          <Button 
            key="reject" 
            danger
            onClick={() => {
              handleReject(selectedContent?.id);
              hideModal();
            }}
          >
            Reject
          </Button>,
          <Button 
            key="approve" 
            type="primary"
            onClick={() => {
              handleApprove(selectedContent?.id);
              hideModal();
            }}
          >
            Approve
          </Button>,
        ]}
      >
        {selectedContent && (
          <div>
            <p><strong>Status:</strong> <Tag color={getStatusColor(selectedContent.status)}>{statusLabel(selectedContent.status)}</Tag></p>
            <p><strong>Created:</strong> {selectedContent.created_at}</p>
            <div style={{ marginTop: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
              <h4>Content Preview</h4>
              <p>This would show a detailed preview of the content in a real implementation.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}