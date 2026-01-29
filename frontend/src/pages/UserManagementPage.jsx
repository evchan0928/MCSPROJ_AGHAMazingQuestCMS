import React, { useEffect, useState } from 'react';
import { fetchAuth } from '../api';
import UserForm from '../components/UserForm';
import { Row, Col, Card, Statistic, Table, Button, Space, Input, Tag, Popconfirm, notification } from 'antd';
import { UserAddOutlined, TeamOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ContentManagementPage.css';  // Import the CSS file

const { Search } = Input;

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [action, setAction] = useState('delete_selected');
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [sidePanelContent, setSidePanelContent] = useState(null);
  const [sidePanelTitle, setSidePanelTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const [api, contextHolder] = notification.useNotification();

  const openNotification = (message, description, type) => {
    api[type]({
      message: message,
      description: description,
      placement: 'topRight',
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuth('/api/users/');
      if (res.status === 401 || res.status === 403) {
        throw new Error('Authentication required. Please log in to access users.');
      }
      
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data);
      
      // attempt to load roles for the create/edit form
      try {
        const r = await fetchAuth('/api/users/roles/');
        if (r.status === 401 || r.status === 403) {
          throw new Error('Authentication required. Please log in to access roles.');
        }
        
        if (r.ok) {
          const rd = await r.json();
          setRoles(rd || []);
        }
      } catch (e) {
        console.error('Failed to load roles', e);
      }
    } catch (err) { 
      console.error(err); 
      setError(err.message);
      openNotification('Error', err.message, 'error');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleAction = () => {
    if (selectedUsers.length === 0) return;
    
    if (action === 'delete_selected') {
      if (window.confirm(`Are you sure you want to delete the selected ${selectedUsers.length} user(s)?`)) {
        // In a real implementation, this would call the API to delete users
        console.log('Deleting users:', selectedUsers);
        fetchUsers(); // Refresh the list
        openNotification('Success', `${selectedUsers.length} user(s) deleted successfully`, 'success');
      }
    }
  };

  const openUserForm = (user = null) => {
    setSidePanelContent(
      <UserForm 
        user={user || {}} 
        roles={roles} 
        onDone={() => { 
          setShowSidePanel(false);
          setSidePanelContent(null);
          fetchUsers(); 
        }} 
      />
    );
    setSidePanelTitle(user ? 'Edit User' : 'Add User');
    setShowSidePanel(true);
  };

  const openRolesPage = () => {
    navigate('/dashboard/users/roles'); // Navigate to the roles page using the correct route
  };

  const handleEditUser = (user) => {
    openUserForm(user);
  };

  const handleDeleteUser = async (userId, username) => {
    try {
      const response = await fetchAuth(`/api/users/${userId}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        openNotification('Success', `User ${username} deleted successfully`, 'success');
        fetchUsers(); // Refresh the list
      } else {
        openNotification('Error', `Failed to delete user ${username}`, 'error');
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      openNotification('Error', `Error deleting user ${username}: ${error.message}`, 'error');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Define table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <span>{text || '-'}</span>,
    },
    {
      title: 'Full Name',
      key: 'fullName',
      render: (_, record) => `${record.first_name || ''} ${record.last_name || ''}`.trim() || '-',
      sorter: (a, b) => {
        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => role ? <Tag color="blue">{role}</Tag> : <Tag color="default">N/A</Tag>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.is_active ? 'green' : 'red'}>
          {record.is_active ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            title="Edit user"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete user"
            description={`Are you sure you want to delete user ${record.username}?`}
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDeleteUser(record.id, record.username)}
          >
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
              title="Delete user"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="user-management-page">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <p className="page-description">Manage users and their permissions in the system</p>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Total Users"
                    value={users.length}
                    valueStyle={{ fontSize: '24px', color: '#1f2d3d' }}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Active Users"
                    value={users.filter(u => u.is_active).length}
                    valueStyle={{ fontSize: '24px', color: '#52c41a' }}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Total Roles"
                    value={roles.length}
                    valueStyle={{ fontSize: '24px', color: '#1890ff' }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Inactive Users"
                    value={users.filter(u => !u.is_active).length}
                    valueStyle={{ fontSize: '24px', color: '#ff4d4f' }}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Card
              title="User List"
              extra={
                <div className="controls-row">
                  <div className="search-container">
                    <Search
                      placeholder="Search users..."
                      allowClear
                      enterButton={<SearchOutlined />}
                      size="middle"
                      onSearch={(value) => setSearchTerm(value)}
                      className="search-bar"
                    />
                  </div>
                  <Space wrap className="action-buttons">
                    <Button 
                      type="primary" 
                      icon={<UserAddOutlined />}
                      size="middle"
                      onClick={() => openUserForm()}
                    >
                      Add User
                    </Button>
                    <Button 
                      icon={<TeamOutlined />}
                      size="middle"
                      onClick={openRolesPage}
                    >
                      Manage Roles
                    </Button>
                  </Space>
                </div>
              }
            >
              <Table 
                rowKey="id"
                dataSource={filteredUsers}
                columns={columns}
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                rowSelection={{
                  selectedRowKeys: selectedUsers,
                  onChange: (selectedRowKeys) => setSelectedUsers(selectedRowKeys),
                }}
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>

          {/* Role Management Overview */}
          <Col span={24}>
            <Card title="Role Management Overview">
              <Table
                rowKey="id"
                dataSource={roles}
                pagination={false}
                columns={[
                  {
                    title: 'Role Name',
                    dataIndex: 'name',
                    key: 'name',
                    render: (name) => <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>{name}</Tag>,
                  },
                  {
                    title: 'Users in Role',
                    key: 'userCount',
                    render: (_, role) => {
                      const count = users.filter(u => 
                        u.roles && u.roles.some(r => 
                          typeof r === 'string' ? r === role.name : (r && r.name === role.name)
                        )
                      ).length;
                      return count;
                    },
                  },
                  {
                    title: 'Description',
                    key: 'description',
                    render: () => 'Manage permissions and access rights',
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, role) => (
                      <Space>
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={openRolesPage}
                        >
                          Manage
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        {error && (
          <div className="error-section">
            <Card type="inner" style={{ borderColor: '#ff4d4f' }}>
              <p className="error-text"><strong>Error:</strong> {error}</p>
              {error.includes('Authentication required') && (
                <div style={{ marginTop: '10px' }}>
                  <Button 
                    type="primary" 
                    onClick={() => navigate('/signin')}
                  >
                    Go to Login Page
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Side Panel */}
        {showSidePanel && (
          <div 
            className="side-panel-overlay" 
            onClick={() => {
              setShowSidePanel(false);
              setSidePanelContent(null);
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div 
              className="side-panel" 
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
            >
              <div className="side-panel-header" style={{
                padding: '20px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h2 style={{ margin: 0 }}>{sidePanelTitle}</h2>
                <Button 
                  type="text" 
                  size="large"
                  onClick={() => {
                    setShowSidePanel(false);
                    setSidePanelContent(null);
                  }}
                  style={{ fontSize: '24px' }}
                >
                  ×
                </Button>
              </div>
              <div className="side-panel-content" style={{ padding: '20px' }}>
                {sidePanelContent}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}