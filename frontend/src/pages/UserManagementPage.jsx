import React, { useEffect, useState } from 'react';
import { fetchAuth } from '../api';
import UserForm from '../components/UserForm';
import { Row, Col, Card, Statistic, Table, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAuth('/api/users/');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setUsers(data);
      // attempt to load roles for the create/edit form
      try {
        const r = await fetchAuth('/api/users/roles/');
        if (r.ok) {
          const rd = await r.json();
          setRoles(rd || []);
        }
      } catch (e) {
        console.error('Failed to load roles', e);
      }
    } catch (err) { 
      console.error(err); 
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

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetchAuth(`/api/users/${userId}/`, {
          method: 'DELETE',
        });
        if (response.ok) {
          console.log('User deleted successfully');
          fetchUsers(); // Refresh the list
        } else {
          console.error('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="card">
      <h1 className="card-title">User Management</h1>
      <p>Manage users and their permissions in the system</p>

      <div className="form-header-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="signup-input"
            style={{ width: '300px' }}
          />
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => openUserForm()} 
            className="primary-action-btn"
          >
            <span className="material-icons">person_add</span> Add User
          </button>

          <button 
            onClick={openRolesPage} 
            className="secondary-action-btn"
          >
            <span className="material-icons">people</span> Manage Roles
          </button>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={users.length}
              valueStyle={{ fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={users.filter(u => u.is_active).length}
              valueStyle={{ fontSize: '20px', color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Roles"
              value={roles.length}
              valueStyle={{ fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Users"
              value={users.filter(u => !u.is_active).length}
              valueStyle={{ fontSize: '20px', color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="User Management">
        <div className="form-header-controls">
          <div className="checkbox-group">
            <select 
              value={action} 
              onChange={(e) => setAction(e.target.value)}
              className="action-select signup-input"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="delete_selected">Bulk Actions</option>
              <option value="delete_selected">Delete Selected</option>
            </select>
            <button 
              onClick={handleAction} 
              disabled={selectedUsers.length === 0}
              className={`secondary-action-btn ${selectedUsers.length === 0 ? 'disabled' : ''}`}
            >
              Apply
            </button>
          </div>

          <div className="results-info">
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="no-results">
              {users.length === 0 ? 
                "No users found in the system." : 
                "No users match your search criteria."}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>{user.role || 'N/A'}</td>
                    <td>
                      <span className={`status ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <Space size="middle">
                        <Button type="link" onClick={() => handleEditUser(user)}>Edit</Button>
                        <Button type="link" danger onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                      </Space>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Role Management Overview */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h2 className="card-title">Role Management Overview</h2>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Users in Role</th>
                <th>Description</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => {
                const count = users.filter(u => 
                  u.roles && u.roles.some(r => 
                    typeof r === 'string' ? r === role.name : (r && r.name === role.name)
                  )
                ).length;
                return (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    <td>{count}</td>
                    <td>Manage permissions and access rights</td>
                    <td className="actions-cell">
                      <button 
                        onClick={openRolesPage} 
                        className="secondary-action-btn"
                        style={{ padding: '6px 12px', fontSize: '0.9em' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel */}
      {showSidePanel && (
        <div className="side-panel-overlay" onClick={() => setShowSidePanel(false)}>
          <div className="side-panel" onClick={(e) => e.stopPropagation()}>
            <div className="side-panel-header">
              <h2>{sidePanelTitle}</h2>
              <button 
                className="close-button" 
                onClick={() => {
                  setShowSidePanel(false);
                  setSidePanelContent(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="side-panel-content">
              {sidePanelContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}