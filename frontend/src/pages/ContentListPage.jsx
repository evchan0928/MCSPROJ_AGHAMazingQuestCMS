import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, message, Card } from 'antd';
import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, DeleteOutlined, PushpinOutlined, PlayCircleOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './ContentListPage.css';

const ContentList = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchContentList();
  }, []);

  const fetchUserData = async () => {
    try {
      // In a real implementation, this would fetch user data from the API
      // For now, we'll simulate getting user role from localStorage or a mock
      const storedRole = localStorage.getItem('userRole') || 'encoder';
      const mockUser = {
        id: 1,
        username: 'current_user',
        role: storedRole,
        isSuperuser: storedRole === 'admin'
      };
      setCurrentUser(mockUser);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchContentList = async () => {
    try {
      const token = localStorage.getItem('token');
      // Using the correct endpoint: /api/content/items/
      const response = await axios.get('/api/content/items/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Transform the data to match table structure
      const transformedData = response.data.map(item => ({
        key: item.id,
        id: item.id,
        title: item.title,
        status: item.status,
        type: item.file ? (item.file.endsWith('.mp4') || item.file.endsWith('.mov') ? 'video' : 
                          item.file.endsWith('.jpg') || item.file.endsWith('.png') || item.file.endsWith('.jpeg') ? 'image' : 'text') : 'text',
        author: item.created_by?.username || 'Unknown',
        createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
        item: item // Keep the original item for reference
      }));
      
      setContents(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      message.error('Failed to load content list');
      setLoading(false);
    }
  };

  // Determine available actions based on user role and content status
  const determineAvailableActions = (contentItem, currentUser) => {
    const actions = [];
    const item = contentItem.item; // Get the original item
    
    // Check if current user is the creator of the content
    const isCreator = item.created_by && item.created_by.id === currentUser?.id;
    
    // Encoder can edit their own content if it's in 'for_editing' status
    if (currentUser?.role === 'encoder' && isCreator && item.status === 'for_editing') {
      actions.push('Edit');
    }
    
    // Encoder can submit for approval if content is in 'for_editing' status
    if (currentUser?.role === 'encoder' && isCreator && item.status === 'for_editing') {
      actions.push('SubmitForApproval');
    }
    
    // Reviewer can approve/reject content in 'for_approval' status
    if ((currentUser?.role === 'reviewer' || currentUser?.isSuperuser) && item.status === 'for_approval') {
      actions.push('Approve', 'Reject');
    }
    
    // Approver can publish content in 'for_publishing' status
    if ((currentUser?.role === 'approver' || currentUser?.isSuperuser) && item.status === 'for_publishing') {
      actions.push('Publish');
    }
    
    // Encoder can delete draft content (for_editing) if they are the creator
    if (currentUser?.role === 'encoder' && isCreator && item.status === 'for_editing') {
      actions.push('Delete');
    }
    
    // Approver can archive published content
    if ((currentUser?.role === 'approver' || currentUser?.isSuperuser) && item.status === 'published') {
      actions.push('Archive');
    }
    
    return actions;
  };

  // Handler functions for different actions
  const handleAction = async (action, record) => {
    try {
      const token = localStorage.getItem('token');
      const item = record.item; // Get the original item
      
      switch(action) {
        case 'Edit':
          // Navigate to edit page
          window.location.href = `/dashboard/content/edit/${record.id}`;
          break;
        case 'SubmitForApproval':
          await axios.post(`/api/content/items/${record.id}/send_for_approval/`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          message.success('Content submitted for approval successfully');
          fetchContentList(); // Refresh the list
          break;
        case 'Approve':
          await axios.post(`/api/content/items/${record.id}/approve/`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          message.success('Content approved successfully');
          fetchContentList(); // Refresh the list
          break;
        case 'Reject':
          await axios.post(`/api/content/items/${record.id}/deny/`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          message.success('Content rejected');
          fetchContentList(); // Refresh the list
          break;
        case 'Publish':
          await axios.post(`/api/content/items/${record.id}/publish/`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          message.success('Content published successfully');
          fetchContentList(); // Refresh the list
          break;
        case 'Delete':
          Modal.confirm({
            title: 'Confirm deletion',
            content: 'Are you sure you want to delete this content?',
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
              await axios.delete(`/api/content/items/${record.id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              message.success('Content deleted successfully');
              fetchContentList(); // Refresh the list
            }
          });
          break;
        case 'Archive':
          await axios.patch(`/api/content/items/${record.id}/`, { status: 'deleted' }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          message.success('Content archived successfully');
          fetchContentList(); // Refresh the list
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      message.error(`Failed to perform ${action}. Please try again.`);
    }
  };

  const getStatusTag = (status) => {
    // Map backend status values to readable labels
    const statusLabels = {
      'for_editing': 'For Editing',
      'for_approval': 'For Approval', 
      'for_publishing': 'For Publishing',
      'published': 'Published',
      'deleted': 'Archived'
    };
    
    const colorMap = {
      'for_editing': 'default',
      'for_approval': 'orange',
      'for_publishing': 'blue',
      'published': 'green',
      'deleted': 'gray'
    };
    
    const displayStatus = statusLabels[status] || status;
    
    return (
      <Tag color={colorMap[status] || 'default'}>
        {displayStatus}
      </Tag>
    );
  };

  const getTextColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <div className="title-truncated" title={text}>
          {text}
        </div>
      ),
      width: 250,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      width: 120,
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (!currentUser) return null;
        
        const availableActions = determineAvailableActions(record, currentUser);
        
        return (
          <Space size="middle">
            {availableActions.includes('Edit') && (
              <Button 
                size="middle" 
                icon={<EditOutlined />}
                onClick={() => handleAction('Edit', record)}
              >
                Edit
              </Button>
            )}
            {availableActions.includes('SubmitForApproval') && (
              <Button 
                size="middle" 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAction('SubmitForApproval', record)}
              >
                Submit for Approval
              </Button>
            )}
            {availableActions.includes('Approve') && (
              <Button 
                size="middle" 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAction('Approve', record)}
              >
                Approve
              </Button>
            )}
            {availableActions.includes('Reject') && (
              <Button 
                size="middle" 
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleAction('Reject', record)}
              >
                Reject
              </Button>
            )}
            {availableActions.includes('Publish') && (
              <Button 
                size="middle" 
                type="primary"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                icon={<PushpinOutlined />}
                onClick={() => handleAction('Publish', record)}
              >
                Publish
              </Button>
            )}
            {availableActions.includes('Delete') && (
              <Button 
                size="middle" 
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleAction('Delete', record)}
              >
                Delete
              </Button>
            )}
            {availableActions.includes('Archive') && (
              <Button 
                size="middle" 
                ghost
                onClick={() => handleAction('Archive', record)}
              >
                Archive
              </Button>
            )}
          </Space>
        );
      },
      width: 400,
    },
  ];

  const getMediaColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <div className="title-truncated" title={text}>
          {text}
        </div>
      ),
      width: 200,
    },
    {
      title: 'Preview',
      dataIndex: 'type',
      key: 'preview',
      render: (type) => (
        <div className="preview-container">
          {type === 'video' ? (
            <PlayCircleOutlined className="preview-icon video-icon" />
          ) : type === 'image' ? (
            <UploadOutlined className="preview-icon image-icon" />
          ) : (
            <span>No Preview</span>
          )}
        </div>
      ),
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      width: 120,
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (!currentUser) return null;
        
        const availableActions = determineAvailableActions(record, currentUser);
        
        return (
          <Space size="middle">
            {availableActions.includes('Edit') && (
              <Button 
                size="middle" 
                icon={<EditOutlined />}
                onClick={() => handleAction('Edit', record)}
              >
                Edit
              </Button>
            )}
            {availableActions.includes('SubmitForApproval') && (
              <Button 
                size="middle" 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAction('SubmitForApproval', record)}
              >
                Submit for Approval
              </Button>
            )}
            {availableActions.includes('Approve') && (
              <Button 
                size="middle" 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAction('Approve', record)}
              >
                Approve
              </Button>
            )}
            {availableActions.includes('Reject') && (
              <Button 
                size="middle" 
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleAction('Reject', record)}
              >
                Reject
              </Button>
            )}
            {availableActions.includes('Publish') && (
              <Button 
                size="middle" 
                type="primary"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                icon={<PushpinOutlined />}
                onClick={() => handleAction('Publish', record)}
              >
                Publish
              </Button>
            )}
            {availableActions.includes('Delete') && (
              <Button 
                size="middle" 
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleAction('Delete', record)}
              >
                Delete
              </Button>
            )}
            {availableActions.includes('Archive') && (
              <Button 
                size="middle" 
                ghost
                onClick={() => handleAction('Archive', record)}
              >
                Archive
              </Button>
            )}
          </Space>
        );
      },
      width: 400,
    },
  ];

  // Separate text and media content
  const textContents = contents.filter(item => item.type === 'text');
  const mediaContents = contents.filter(item => ['image', 'video'].includes(item.type));

  return (
    <div className="content-list-page">
      <Card title="Content Management" className="page-card">
        <h2 className="section-title">All Content</h2>
        <Table
          dataSource={contents}
          columns={getTextColumns} // Using the same columns for all content
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

      {textContents.length > 0 && (
        <Card title="Text Contents" className="section-card">
          <Table
            dataSource={textContents}
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
      )}

      {mediaContents.length > 0 && (
        <Card title="Media Contents (Images & Videos)" className="section-card">
          <Table
            dataSource={mediaContents}
            columns={getMediaColumns}
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
      )}
    </div>
  );
};

export default ContentList;