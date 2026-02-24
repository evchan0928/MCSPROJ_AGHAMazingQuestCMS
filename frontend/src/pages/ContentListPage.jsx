// src/pages/ContentListPage.jsx

import React, { useState, useEffect } from 'react';
import { Table, Card, Modal, message, Tag, Button, Space, Divider } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getContentItems, deleteContentItem, sendContentForApproval, approveContentItem, denyContentItem, publishContentItem, getCurrentUser } from '../api/django-api';

const { confirm } = Modal;

const ContentListPage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Role-based access control
  const allowedRoles = ['Encoder', 'Editor', 'Approver', 'Admin', 'Super Admin'];

  // Fetch content items from the API
  useEffect(() => {
    fetchUserData();
    fetchContents();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchContents = async () => {
    try {
      setLoading(true);
      const data = await getContentItems();
      setContents(data);
    } catch (error) {
      console.error('Error fetching content items:', error);
      message.error('Failed to load content items');
    } finally {
      setLoading(false);
    }
  };

  // Determine if user can perform actions based on role
  const canEdit = (content) => {
    // Edit: Editor, Admin, Super Admin (and superuser)
    return currentUser && (
      currentUser.is_superuser ||
      (currentUser.roles || []).includes('Editor') ||
      (currentUser.roles || []).includes('Admin') ||
      (currentUser.roles || []).includes('Super Admin')
    );
  };

  const canDelete = (content) => {
    // Delete: Admin, Super Admin (and superuser)
    return currentUser && (
      currentUser.is_superuser ||
      (currentUser.roles || []).includes('Admin') ||
      (currentUser.roles || []).includes('Super Admin')
    );
  };

  const canSendForApproval = (content) => {
    // Can send for approval if user is encoder/editor and status is for_editing
    return currentUser && ((currentUser.roles || []).includes('Encoder') || (currentUser.roles || []).includes('Editor')) &&
           content.status === 'for_editing';
  };

  const canApprove = (content) => {
    // Approve/Reject: Approver, Admin, Super Admin (and superuser)
    return currentUser && (
      currentUser.is_superuser ||
      (currentUser.roles || []).includes('Approver') ||
      (currentUser.roles || []).includes('Admin') ||
      (currentUser.roles || []).includes('Super Admin')
    );
  };

  const canPublish = (content) => {
    // Publish: Approver, Admin, Super Admin (and superuser)
    return currentUser && (
      currentUser.is_superuser ||
      (currentUser.roles || []).includes('Approver') ||
      (currentUser.roles || []).includes('Admin') ||
      (currentUser.roles || []).includes('Super Admin')
    );
  };

  // Action handlers
  const handleEdit = (id) => {
    navigate(`/dashboard/content/edit/${id}`);
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Confirm Deletion',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this content?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteContentItem(id);
          message.success('Content deleted successfully');
          fetchContents(); // Refresh the list
        } catch (error) {
          console.error('Error deleting content:', error);
          message.error('Failed to delete content');
        }
      },
    });
  };

  const handleSendForApproval = async (id) => {
    try {
      await sendContentForApproval(id);
      message.success('Content sent for approval');
      fetchContents(); // Refresh the list
    } catch (error) {
      console.error('Error sending content for approval:', error);
      message.error('Failed to send content for approval');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveContentItem(id);
      message.success('Content approved');
      fetchContents(); // Refresh the list
    } catch (error) {
      console.error('Error approving content:', error);
      message.error('Failed to approve content');
    }
  };

  const handleDeny = (id) => {
    confirm({
      title: 'Confirm Denial',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to deny this content? It will be sent back for editing.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await denyContentItem(id);
          message.success('Content denied and sent back for editing');
          fetchContents(); // Refresh the list
        } catch (error) {
          console.error('Error denying content:', error);
          message.error('Failed to deny content');
        }
      },
    });
  };

  const handlePublish = async (id) => {
    try {
      await publishContentItem(id);
      message.success('Content published');
      fetchContents(); // Refresh the list
    } catch (error) {
      console.error('Error publishing content:', error);
      message.error('Failed to publish content');
    }
  };

  // Status badge component
  const getStatusTag = (status) => {
    const statusConfig = {
      for_editing: { color: 'processing', text: 'For Editing' },
      for_approval: { color: 'orange', text: 'For Approval' },
      approved: { color: 'success', text: 'Approved' },
      published: { color: 'purple', text: 'Published' },
      rejected: { color: 'error', text: 'Rejected' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Define columns for the table
  const getTextColumns = [
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
      render: (text) => <span className="table-title">{text}</span>,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Type',
      dataIndex: 'content_type',
      key: 'content_type',
      render: (type) => <span>{type || 'text'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'For Editing', value: 'for_editing' },
        { text: 'For Approval', value: 'for_approval' },
        { text: 'Approved', value: 'approved' },
        { text: 'Published', value: 'published' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status.indexOf(value) === 0,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {canEdit(record) && (
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record.id)}
              title="Edit Content"
              className="btn-primary btn-sm"
            >
              Edit
            </Button>
          )}
          
          {canDelete(record) && (
            <Button 
              icon={<DeleteOutlined />} 
              danger
              onClick={() => handleDelete(record.id)}
              title="Delete Content"
              className="btn-danger btn-sm"
            >
              Delete
            </Button>
          )}
          
          {canSendForApproval(record) && (
            <Button 
              type="primary" 
              onClick={() => handleSendForApproval(record.id)}
              title="Send for Approval"
              className="btn-success btn-sm"
            >
              Send for Approval
            </Button>
          )}
          
          {canApprove(record) && (
            <Space>
              <Button 
                type="primary" 
                onClick={() => handleApprove(record.id)}
                title="Approve Content"
                className="btn-success btn-sm"
              >
                Approve
              </Button>
              <Button 
                danger 
                onClick={() => handleDeny(record.id)}
                title="Deny Content"
                className="btn-danger btn-sm"
              >
                Deny
              </Button>
            </Space>
          )}
          
          {canPublish(record) && (
            <Button 
              type="primary" 
              onClick={() => handlePublish(record.id)}
              title="Publish Content"
              className="btn-primary btn-sm"
            >
              Publish
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (!currentUser) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const hasPermission = currentUser.is_superuser || 
    (currentUser.roles || []).some(role => allowedRoles.includes(role));

  if (!hasPermission) {
    return (
      <Card style={{ margin: '20px' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to view content. Required roles: Encoder, Editor, Approver, Admin, or Super Admin.</p>
      </Card>
    );
  }

  return (
    <div className="content-list-page">
      <Card className="card">
        <h2 className="card-title">Content Management</h2>
        <h3 className="section-title">All Content</h3>
        <Table
          dataSource={contents}
          columns={getTextColumns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          rowKey="id"
          className="content-table"
        />
      </Card>
    </div>
  );
};

export default ContentListPage;