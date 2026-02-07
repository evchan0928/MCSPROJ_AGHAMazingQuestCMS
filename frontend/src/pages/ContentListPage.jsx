import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, notification, Card } from 'antd';
import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, PushpinOutlined, PlayCircleOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';  // Adding useNavigate import
import { 
  getContentItems, 
  getCurrentUser, 
  sendContentForApproval, 
  approveContentItem, 
  denyContentItem, 
  publishContentItem, 
  deleteContentItem,
  updateContentItem
} from '../api/django-api';

const ContentList = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();  // Initialize navigate hook

  // Wrap functions in useCallback to satisfy ESLint requirements
  const fetchUserData = React.useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Show error notification
      api.error({
        message: 'Error',
        description: 'Failed to fetch user data',
      });
    }
  }, [api]);

  const fetchContentList = React.useCallback(async () => {
    setLoading(true);
    try {
      // Using the correct endpoint through our API service
      const response = await getContentItems();
      
      // Transform the data to match table structure
      const transformedData = response.map(item => ({
        key: item.id,
        id: item.id,
        title: item.title,
        status: item.status,
        type: item.content_type ? item.content_type : 
             item.file ? (item.file.endsWith('.mp4') || item.file.endsWith('.mov') ? 'video' : 
                         item.file.endsWith('.jpg') || item.file.endsWith('.png') || item.file.endsWith('.jpeg') ? 'image' :
                         item.file.endsWith('.mp3') || item.file.endsWith('.wav') || item.file.endsWith('.flac') ? 'audio' : 'text') : 'text',
        author: item.created_by?.username || 'Unknown',
        createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
        item: item // Keep the original item for reference
      }));
      
      setContents(transformedData);
    } catch (error) {
      console.error('Error fetching content:', error);
      api.error({
        message: 'Error',
        description: 'Failed to load content list',
      });
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchUserData();
    fetchContentList();
  }, [fetchUserData, fetchContentList]);

  // Determine available actions based on user role and content status
  const determineAvailableActions = (contentItem, currentUser) => {
    const actions = [];
    const item = contentItem.item; // Get the original item
    
    // Check if current user is the creator of the content
    const isCreator = item.created_by && item.created_by.id === currentUser?.id;
    
    // Extract role names for easier comparison
    const userRoleNames = (currentUser?.roles || []).map(role => role.name);
    
    // Encoder can edit their own content if it's in 'for_editing' status
    if ((userRoleNames.includes('Encoder') || currentUser?.is_superuser) && isCreator && item.status === 'for_editing') {
      actions.push('Edit');
    }
    
    // Encoder can submit for approval if content is in 'for_editing' status
    if ((userRoleNames.includes('Encoder') || currentUser?.is_superuser) && isCreator && item.status === 'for_editing') {
      actions.push('SubmitForApproval');
    }
    
    // Reviewer can approve/reject content in 'for_approval' status
    if ((userRoleNames.includes('Approver') || currentUser?.is_superuser) && item.status === 'for_approval') {
      actions.push('Approve', 'Reject');
    }
    
    // Approver can publish content in 'for_publishing' status
    if ((userRoleNames.includes('Approver') || currentUser?.is_superuser) && item.status === 'for_publishing') {
      actions.push('Publish');
    }
    
    // Encoder can delete draft content (for_editing) if they are the creator
    if ((userRoleNames.includes('Encoder') || currentUser?.is_superuser) && isCreator && item.status === 'for_editing') {
      actions.push('Delete');
    }
    
    // Approver can archive published content
    if ((userRoleNames.includes('Approver') || currentUser?.is_superuser) && item.status === 'published') {
      actions.push('Archive');
    }
    
    return actions;
  };

  // Handler functions for different actions
  const handleAction = async (action, record) => {
    try {
      const item = record.item; // Get the original item
      
      switch(action) {
        case 'Edit':
          // Navigate to edit page
          window.location.href = `/dashboard/content/edit/${record.id}`;
          break;
        case 'SubmitForApproval':
          await sendContentForApproval(record.id);
          api.success({
            message: 'Success',
            description: 'Content submitted for approval successfully',
          });
          await fetchContentList(); // Refresh the list
          break;
        case 'Approve':
          await approveContentItem(record.id);
          api.success({
            message: 'Success',
            description: 'Content approved successfully',
          });
          await fetchContentList(); // Refresh the list
          break;
        case 'Reject':
          await denyContentItem(record.id);
          api.success({
            message: 'Success',
            description: 'Content rejected',
          });
          await fetchContentList(); // Refresh the list
          break;
        case 'Publish':
          await publishContentItem(record.id);
          api.success({
            message: 'Success',
            description: 'Content published successfully',
          });
          await fetchContentList(); // Refresh the list
          break;
        case 'Delete':
          Modal.confirm({
            title: 'Confirm deletion',
            content: 'Are you sure you want to delete this content?',
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
              await deleteContentItem(record.id);
              api.success({
                message: 'Success',
                description: 'Content deleted successfully',
              });
              await fetchContentList(); // Refresh the list
            }
          });
          break;
        case 'Archive':
          // For archiving, we update the status to 'deleted'
          await updateContentItem(record.id, { status: 'deleted' });
          api.success({
            message: 'Success',
            description: 'Content archived successfully',
          });
          await fetchContentList(); // Refresh the list
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      api.error({
        message: 'Error',
        description: `Failed to perform ${action}. Please try again.`,
      });
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
      render: (text, record) => (
        <a href="#" onClick={(e) => {
          e.preventDefault();
          navigate(`/dashboard/content/detail/${record.id}`);
        }} className="title-truncated" title={text}>
          {text}
        </a>
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
      title: 'Approval Notes',
      dataIndex: 'approval_notes',
      key: 'approval_notes',
      render: (notes) => {
        if (!notes) return 'N/A';
        return (
          <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {notes}
          </div>
        );
      },
      width: 200,
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
      render: (text, record) => (
        <a href="#" onClick={(e) => {
          e.preventDefault();
          navigate(`/dashboard/content/detail/${record.id}`);
        }} className="title-truncated" title={text}>
          {text}
        </a>
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
          ) : type === 'audio' ? (
            <PlayCircleOutlined className="preview-icon audio-icon" />
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
      title: 'Approval Notes',
      dataIndex: 'approval_notes',
      key: 'approval_notes',
      render: (notes) => {
        if (!notes) return 'N/A';
        return (
          <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {notes}
          </div>
        );
      },
      width: 200,
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
            {/* Add view button for published content */}
            {record.item && record.item.status === 'published' && (
              <Button 
                size="middle" 
                icon={<EyeOutlined />}
                onClick={() => navigate(`/dashboard/content/detail/${record.id}`)}
              >
                View
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
  const mediaContents = contents.filter(item => ['image', 'video', 'audio'].includes(item.type));  // Including audio in media

  return (
    <>
      {contextHolder}
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
    </>
  );
};

export default ContentList;