import React, { useEffect, useState } from 'react';
import { fetchAuth } from '../api';
import { Card, Row, Col, Statistic, Table, Button, Space, Input, Tag, Popconfirm, notification, Typography } from 'antd';
import { PlusOutlined, TeamOutlined, UserOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ContentManagementPage.css';  // Import the CSS file

const { Title, Text } = Typography;
const { Search } = Input;

export default function RolesPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [showCreate, setShowCreate] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [expandedRoleId, setExpandedRoleId] = useState(null); // for inline preview
  const [editingRole, setEditingRole] = useState(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [api, contextHolder] = notification.useNotification();

  const openNotification = (message, description, type) => {
    api[type]({
      message: message,
      description: description,
      placement: 'topRight',
    });
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [rRes, uRes] = await Promise.all([
          fetchAuth('/api/users/roles/'),
          fetchAuth('/api/users/'),
        ]);
        
        if (rRes.status === 401 || rRes.status === 403) {
          throw new Error('Authentication required. Please log in to access roles.');
        }
        
        if (uRes.status === 401 || uRes.status === 403) {
          throw new Error('Authentication required. Please log in to access users.');
        }
        
        if (!rRes.ok) throw new Error('Failed to load roles');
        if (!uRes.ok) throw new Error('Failed to load users');
        
        const rData = await rRes.json();
        const uData = await uRes.json();
        if (!mounted) return;
        setRoles(rData || []);
        setUsers(uData || []);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(String(err));
          openNotification('Error', err.message, 'error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const rRes = await fetchAuth('/api/users/roles/');
      
      if (rRes.status === 401 || rRes.status === 403) {
        throw new Error('Authentication required. Please log in to access roles.');
      }
      
      if (!rRes.ok) throw new Error('Failed to load roles');
      const rData = await rRes.json();
      setRoles(rData || []);
    } catch (err) {
      console.error(err);
      setError(String(err));
      openNotification('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const usersInRole = (role) => {
    if (!role) return [];
    // users may have roles as strings or objects
    return users.filter(u => {
      if (!u.roles) return false;
      return u.roles.some(r => (typeof r === 'string' ? r === role.name || r === role : (r && (r.name === role.name || r.id === role.id))));
    });
  };

  const handleCreate = async () => {
    if (!newRoleName.trim()) {
      openNotification('Error', 'Role name is required', 'error');
      return;
    }
    
    try {
      const res = await fetchAuth('/api/users/roles/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoleName.trim() }),
      });
      
      if (res.status === 401 || res.status === 403) {
        throw new Error('Authentication required. Please log in to create roles.');
      }
      
      if (res.status === 405 || res.status === 404) {
        // API not supported on backend
        setError('Role creation via API is not enabled on the backend. Use Django admin or contact the server admin.');
        openNotification('Error', 'Role creation via API is not enabled on the backend. Use Django admin or contact the server admin.', 'error');
        return;
      }
      if (!res.ok) throw new Error(`Failed to create role: ${res.status}`);
      
      await refresh();
      setShowCreate(false);
      setNewRoleName('');
      openNotification('Success', `Role "${newRoleName}" created successfully`, 'success');
    } catch (err) {
      console.error(err);
      setError(String(err));
      openNotification('Error', err.message, 'error');
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setEditRoleName(typeof role === 'string' ? role : (role && role.name) || '');
  };

  const submitEdit = async () => {
    if (!editingRole) return;
    const id = typeof editingRole === 'object' ? editingRole.id : null;
    if (!id) {
      const errorMsg = 'Editing roles by name-only is not supported';
      setError(errorMsg);
      openNotification('Error', errorMsg, 'error');
      return;
    }
    
    if (!editRoleName.trim()) {
      openNotification('Error', 'Role name is required', 'error');
      return;
    }
    
    try {
      const res = await fetchAuth(`/api/users/roles/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editRoleName.trim() }),
      });
      
      if (res.status === 401 || res.status === 403) {
        throw new Error('Authentication required. Please log in to edit roles.');
      }
      
      if (res.status === 405 || res.status === 404) {
        setError('Role editing via API is not enabled on the backend. Use Django admin.');
        openNotification('Error', 'Role editing via API is not enabled on the backend. Use Django admin.', 'error');
        return;
      }
      if (!res.ok) throw new Error(`Failed to edit role: ${res.status}`);
      
      await refresh();
      setEditingRole(null);
      setEditRoleName('');
      openNotification('Success', `Role updated successfully`, 'success');
    } catch (err) {
      console.error(err);
      setError(String(err));
      openNotification('Error', err.message, 'error');
    }
  };

  const handleDelete = async (role) => {
    const id = typeof role === 'object' ? role.id : null;
    if (!id) {
      const errorMsg = 'Role delete requires role id';
      setError(errorMsg);
      openNotification('Error', errorMsg, 'error');
      return;
    }
    
    try {
      const res = await fetchAuth(`/api/users/roles/${id}/`, { method: 'DELETE' });
      
      if (res.status === 401 || res.status === 403) {
        throw new Error('Authentication required. Please log in to delete roles.');
      }
      
      if (res.status === 405 || res.status === 404) {
        setError('Role deletion via API is not enabled on the backend. Use Django admin.');
        openNotification('Error', 'Role deletion via API is not enabled on the backend. Use Django admin.', 'error');
        return;
      }
      if (!res.ok) throw new Error(`Failed to delete role: ${res.status}`);
      
      await refresh();
      openNotification('Success', `Role "${role.name}" deleted successfully`, 'success');
    } catch (err) {
      console.error(err);
      setError(String(err));
      openNotification('Error', err.message, 'error');
    }
  };

  // Filter roles based on search term
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>{name}</Tag>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Users in Role',
      key: 'userCount',
      render: (_, record) => {
        const roleUsers = usersInRole(record);
        return (
          <span>
            <UserOutlined /> {roleUsers.length} user(s)
          </span>
        );
      },
      sorter: (a, b) => usersInRole(a).length - usersInRole(b).length,
    },
    {
      title: 'Description',
      key: 'description',
      render: () => 'Manage permissions and access rights',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit role"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete role"
            description={`Are you sure you want to delete role "${record.name}"?`}
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record)}
          >
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
              title="Delete role"
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
      <div className="roles-management-page">
        <div className="page-header">
          <Title level={2} className="page-title">Role Management</Title>
          <Text type="secondary" className="page-description">Manage user roles and permissions in the system</Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Roles"
                    value={roles.length}
                    valueStyle={{ fontSize: '24px', color: '#1890ff' }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Assigned Permissions"
                    value={users.reduce((acc, user) => acc + (user.roles ? user.roles.length : 0), 0)}
                    valueStyle={{ fontSize: '24px', color: '#52c41a' }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Users with Roles"
                    value={users.filter(u => u.roles && u.roles.length > 0).length}
                    valueStyle={{ fontSize: '24px', color: '#722ed1' }}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Users without Roles"
                    value={users.filter(u => !u.roles || u.roles.length === 0).length}
                    valueStyle={{ fontSize: '24px', color: '#faad14' }}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Card
              title="Role List"
              extra={
                <div className="controls-row">
                  <div className="search-container">
                    <Search
                      placeholder="Search roles..."
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
                      icon={<PlusOutlined />}
                      size="middle"
                      onClick={() => setShowCreate(true)}
                    >
                      Add Role
                    </Button>
                    <Button 
                      icon={<TeamOutlined />}
                      size="middle"
                      onClick={() => navigate('/dashboard/users')}
                    >
                      Manage Users
                    </Button>
                  </Space>
                </div>
              }
            >
              <Table 
                rowKey="id"
                dataSource={filteredRoles}
                columns={columns}
                loading={loading}
                expandable={{
                  expandedRowRender: (record) => {
                    const roleUsers = usersInRole(record);
                    return (
                      <div style={{ padding: '12px 0' }}>
                        <h4 style={{ marginBottom: '12px' }}>Users in {record.name}:</h4>
                        {roleUsers.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {roleUsers.map(u => (
                              <li key={u.id}>{u.username} ({u.email})</li>
                            ))}
                          </ul>
                        ) : (
                          <Text type="secondary">No users in this role.</Text>
                        )}
                      </div>
                    );
                  },
                  rowExpandable: (record) => usersInRole(record).length > 0,
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
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

        {/* Create Modal */}
        {showCreate && (
          <div 
            className="modal-overlay" 
            onClick={() => { 
              setShowCreate(false); 
              setNewRoleName(''); 
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
              className="modal-content" 
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '500px',
                padding: '0',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
            >
              <div className="modal-header" style={{
                padding: '20px 24px',
                borderBottom: '1px solid #eee',
              }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Create New Role</h3>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <Input 
                  placeholder="Enter role name" 
                  value={newRoleName} 
                  onChange={e => setNewRoleName(e.target.value)} 
                  size="large"
                  onPressEnter={handleCreate}
                />
              </div>
              <div className="modal-footer" style={{
                padding: '16px 24px',
                borderTop: '1px solid #eee',
                textAlign: 'right',
              }}>
                <Space>
                  <Button 
                    size="large"
                    onClick={() => { 
                      setShowCreate(false); 
                      setNewRoleName(''); 
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={handleCreate}
                  >
                    Create Role
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingRole && (
          <div 
            className="modal-overlay" 
            onClick={() => { 
              setEditingRole(null); 
              setEditRoleName(''); 
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
              className="modal-content" 
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '500px',
                padding: '0',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
            >
              <div className="modal-header" style={{
                padding: '20px 24px',
                borderBottom: '1px solid #eee',
              }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Edit Role</h3>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <Input 
                  value={editRoleName} 
                  onChange={e => setEditRoleName(e.target.value)} 
                  size="large"
                  onPressEnter={submitEdit}
                />
              </div>
              <div className="modal-footer" style={{
                padding: '16px 24px',
                borderTop: '1px solid #eee',
                textAlign: 'right',
              }}>
                <Space>
                  <Button 
                    size="large"
                    onClick={() => { 
                      setEditingRole(null); 
                      setEditRoleName(''); 
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={submitEdit}
                  >
                    Save Changes
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}