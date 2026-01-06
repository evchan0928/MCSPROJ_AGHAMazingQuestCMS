import React, { useEffect, useState } from 'react';
import { fetchAuth } from '../api';
import UserForm from '../components/UserForm';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
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
    setSidePanelContent(
      <RolesPanelContent 
        roles={roles} 
        users={users}
        onRefresh={fetchUsers}
        onDone={() => {
          setShowSidePanel(false);
          setSidePanelContent(null);
        }}
      />
    );
    setSidePanelTitle('Manage Roles');
    setShowSidePanel(true);
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
                <th className="checkbox-column">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedUsers.length === users.length && users.length > 0}
                  />
                </th>
                <th>Username</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date Joined</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected' : ''}>
                  <td className="checkbox-column">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                    </div>
                  </td>
                  <td>{user.email || '-'}</td>
                  <td>{user.first_name || ''} {user.last_name || ''}</td>
                  <td>
                    {Array.isArray(user.roles) ? 
                      user.roles.map(r => (typeof r === 'string' ? r : (r && r.name) || '')).filter(Boolean).join(', ') : 
                      '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : '-'}</td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => openUserForm(user)} 
                      className="secondary-action-btn"
                      style={{ padding: '6px 12px', fontSize: '0.9em' }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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

// Create a simplified Roles panel component with enhanced UI
function RolesPanelContent({ roles, users, onRefresh, onDone }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [expandedRoleId, setExpandedRoleId] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [editRoleName, setEditRoleName] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const rRes = await fetchAuth('/api/users/roles/');
      if (!rRes.ok) throw new Error('Failed to load roles');
      const rData = await rRes.json();
      onRefresh(); // This will update the roles in the parent
    } catch (err) {
      console.error(err);
      setError(String(err));
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
    if (!newRoleName) return setError('Role name required');
    try {
      const res = await fetchAuth('/api/users/roles/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoleName }),
      });
      if (res.status === 405 || res.status === 404) {
        // API not supported on backend
        setError('Role creation via API is not enabled on the backend. Use Django admin or contact the server admin.');
        return;
      }
      if (!res.ok) throw new Error(`Failed to create role: ${res.status}`);
      await refresh();
      setShowCreate(false);
      setNewRoleName('');
    } catch (err) {
      console.error(err);
      setError(String(err));
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
      setError('Editing roles by name-only is not supported');
      return;
    }
    try {
      const res = await fetchAuth(`/api/users/roles/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editRoleName }),
      });
      if (res.status === 405 || res.status === 404) {
        setError('Role editing via API is not enabled on the backend. Use Django admin.');
        return;
      }
      if (!res.ok) throw new Error(`Failed to edit role: ${res.status}`);
      await refresh();
      setEditingRole(null);
      setEditRoleName('');
    } catch (err) {
      console.error(err);
      setError(String(err));
    }
  };

  const handleDelete = async (role) => {
    const id = typeof role === 'object' ? role.id : null;
    if (!id) return setError('Role delete requires role id');
    if (!window.confirm(`Are you sure you want to delete role "${role.name}"?`)) return;
    try {
      const res = await fetchAuth(`/api/users/roles/${id}/`, { method: 'DELETE' });
      if (res.status === 405 || res.status === 404) {
        setError('Role deletion via API is not enabled on the backend. Use Django admin.');
        return;
      }
      if (!res.ok) throw new Error(`Failed to delete role: ${res.status}`);
      await refresh();
    } catch (err) {
      console.error(err);
      setError(String(err));
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Role Management</h2>
      <p>Manage roles and permissions in the system</p>

      <div className="form-header-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search roles..."
            className="signup-input"
            style={{ width: '300px' }}
            disabled
          />
        </div>
        
        <div className="action-buttons">
          <button 
            onClick={() => setShowCreate(true)} 
            className="primary-action-btn"
          >
            <span className="material-icons">add</span> Add Role
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading roles...</div>
        ) : roles.length === 0 ? (
          <div className="no-results">No roles found in the system.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Users in Role</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => {
                const roleObj = typeof r === 'string' ? { id: r, name: r } : r;
                const roleUsers = usersInRole(roleObj);
                return (
                  <React.Fragment key={roleObj.id}>
                    <tr>
                      <td>
                        <div className="role-name" onClick={(e) => {
                          e.preventDefault();
                          setExpandedRoleId(expandedRoleId === roleObj.id ? null : roleObj.id);
                        }}>
                          {roleObj.name}
                        </div>
                      </td>
                      <td>{roleUsers.length}</td>
                      <td className="actions-cell">
                        <button 
                          onClick={() => handleEdit(r)} 
                          className="secondary-action-btn"
                          style={{ padding: '6px 12px', fontSize: '0.9em', marginRight: '5px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(r)} 
                          className="secondary-action-btn"
                          style={{ padding: '6px 12px', fontSize: '0.9em' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {expandedRoleId === roleObj.id && (
                      <tr>
                        <td colSpan={3} className="expanded-content">
                          <div className="users-in-role">
                            <h4>Users in {roleObj.name}:</h4>
                            {roleUsers.length > 0 ? (
                              <ul>
                                {roleUsers.map(u => (
                                  <li key={u.id}>{u.username} ({u.email})</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="no-users">No users assigned to this role.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Role</h3>
            </div>
            <div className="modal-body">
              <input 
                placeholder="Role name" 
                value={newRoleName} 
                onChange={e => setNewRoleName(e.target.value)} 
                className="signup-input"
              />
            </div>
            <div className="modal-footer">
              <button onClick={handleCreate} className="primary-action-btn">Create</button>
              <button 
                onClick={() => { 
                  setShowCreate(false); 
                  setNewRoleName(''); 
                }} 
                className="secondary-action-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingRole && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Role</h3>
            </div>
            <div className="modal-body">
              <input 
                value={editRoleName} 
                onChange={e => setEditRoleName(e.target.value)} 
                className="signup-input"
              />
            </div>
            <div className="modal-footer">
              <button onClick={submitEdit} className="primary-action-btn">Save</button>
              <button 
                onClick={() => { 
                  setEditingRole(null); 
                  setEditRoleName(''); 
                }} 
                className="secondary-action-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}