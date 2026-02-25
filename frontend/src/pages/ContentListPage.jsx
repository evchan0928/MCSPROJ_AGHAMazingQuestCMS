// src/pages/ContentListPage.jsx

import React, { useState, useEffect } from 'react';
import { Table, Card, Modal, message, Tag, Button, Space, Divider, Dropdown, Menu } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined, MoreOutlined, DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getContentItems, deleteContentItem, sendContentForApproval, approveContentItem, denyContentItem, publishContentItem, getCurrentUser } from '../api/django-api';
import statusLabel, { getStatusColor } from '../utils/statusLabels.jsx';

const { confirm } = Modal;

const ContentListPage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

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
      // Can send for approval if user is encoder/editor and status is editable
      const editableStatuses = ['for_editing', 'edited', 'pending_approval'];
      return currentUser && ((currentUser.roles || []).includes('Encoder') || (currentUser.roles || []).includes('Editor')) &&
        editableStatuses.includes(String(content.status));
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
    return <Tag color={getStatusColor(status)}>{statusLabel(status)}</Tag>;
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
        { text: 'For Publishing', value: 'for_publishing' },
        { text: 'Published', value: 'published' },
        { text: 'Deleted', value: 'deleted' },
      ],
      onFilter: (value, record) => String(record.status) === String(value),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
      },
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const menuItems = [];

        // Always allow preview from actions
        menuItems.push({ key: 'preview', label: 'Preview' });

        if (canEdit(record)) {
          menuItems.push({ key: 'edit', label: 'Edit' });
        }

        if (canSendForApproval(record)) {
          menuItems.push({ key: 'send_for_approval', label: 'Send for Approval' });
        }

        if (canApprove(record)) {
          menuItems.push({ key: 'approve', label: 'Approve' });
          menuItems.push({ key: 'deny', label: 'Reject' });
        }

        if (canPublish(record)) {
          menuItems.push({ key: 'publish', label: 'Publish' });
        }

        if (canDelete(record)) {
          menuItems.push({ key: 'delete', label: 'Delete' });
        }

        const onMenuClick = ({ key, domEvent }) => {
          // prevent default link/navigation and stop propagation to table row
          if (domEvent && domEvent.preventDefault) domEvent.preventDefault();
          if (domEvent && domEvent.stopPropagation) domEvent.stopPropagation();

          try {
            switch (key) {
              case 'edit':
                handleEdit(record.id);
                break;
              case 'send_for_approval':
                handleSendForApproval(record.id);
                break;
              case 'approve':
                handleApprove(record.id);
                break;
              case 'preview':
                setPreviewContent(record);
                setPreviewVisible(true);
                break;
              case 'deny':
                handleDeny(record.id);
                break;
              case 'publish':
                handlePublish(record.id);
                break;
              case 'delete':
                handleDelete(record.id);
                break;
              default:
                break;
            }
          } catch (err) {
            console.error('Action handler error:', err);
            message.error('Action failed');
          }
        };

        // If no actions available, show a disabled placeholder
        if (menuItems.length === 0) {
          return <span style={{ color: '#999' }}>No actions</span>;
        }

        // Use Ant Design `menu` prop with items to avoid overlay child issues
        const dropdownMenu = {
          items: menuItems,
          onClick: onMenuClick,
        };

        return (
          <Dropdown menu={dropdownMenu} trigger={["click"]}>
            <span>
              <Button>
                Actions <DownOutlined />
              </Button>
            </span>
          </Dropdown>
        );
      },
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
      <Modal
        title={previewContent?.title}
        open={previewVisible}
        onCancel={() => { setPreviewVisible(false); setPreviewContent(null); }}
        footer={[
          <Button key="close" onClick={() => { setPreviewVisible(false); setPreviewContent(null); }}>Close</Button>
        ]}
        width={800}
      >
        {previewContent && (
          <div>
            <p><strong>Type:</strong> {previewContent.content_type}</p>
            <p><strong>Created:</strong> {previewContent.created_at ? (() => { const d = new Date(previewContent.created_at); return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}` })() : 'N/A'}</p>
            {previewContent.content_type === 'image' && previewContent.file_url && (
              <img src={previewContent.file_url} alt={previewContent.title} style={{ maxWidth: '100%' }} />
            )}
            {previewContent.content_type === 'trivia' && previewContent.trivia_questions && (
              <div>
                <h4>Trivia Questions</h4>
                {(previewContent.trivia_questions || []).map((q, idx) => (
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
            {previewContent.content_type === 'video' && previewContent.file_url && (
              <video controls style={{ width: '100%' }} src={previewContent.file_url} />
            )}
            {previewContent.content_type === 'document' && previewContent.file_url && (
              <div>
                <p><strong>Document:</strong> {previewContent.file_url.split('/').pop()}</p>
                <Button onClick={() => window.open(previewContent.file_url, '_blank')}>Open Document</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContentListPage;