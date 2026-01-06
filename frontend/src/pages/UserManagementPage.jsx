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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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

  return (
    <div className="django-admin-container">
      <div className="module">
        <div className="module-header">
          <h1>Users</h1>
        </div>
        
        <div className="toolbar">
          <div className="action-bar">
            <select 
              value={action} 
              onChange={(e) => setAction(e.target.value)}
              className="action-select"
            >
              <option value="delete_selected">Delete selected</option>
            </select>
            <button 
              onClick={handleAction} 
              disabled={selectedUsers.length === 0}
              className="action-button"
            >
              Go
            </button>
          </div>
          
          <div className="add-button-container">
            <button 
              onClick={() => setEditing({})} 
              className="add-button"
            >
              <span className="material-icons">add</span> Add user
            </button>
          </div>
        </div>
        
        {editing ? (
          <div className="form-container">
            <UserForm 
              user={editing} 
              roles={roles} 
              onDone={() => { 
                setEditing(null); 
                fetchUsers(); 
              }} 
            />
            <div className="form-buttons">
              <button onClick={() => setEditing(null)} className="cancel-button">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="results">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <table className="django-table">
                <thead>
                  <tr>
                    <th className="action-checkbox">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedUsers.length === users.length && users.length > 0}
                      />
                    </th>
                    <th>
                      <a href="#" className="text">Username</a>
                    </th>
                    <th>
                      <a href="#" className="text">Email</a>
                    </th>
                    <th>
                      <a href="#" className="text">First Name</a>
                    </th>
                    <th>
                      <a href="#" className="text">Last Name</a>
                    </th>
                    <th>
                      <a href="#" className="text">Staff Status</a>
                    </th>
                    <th>
                      <a href="#" className="text">Superuser Status</a>
                    </th>
                    <th>
                      <a href="#" className="text">Active</a>
                    </th>
                    <th>
                      <a href="#" className="text">Date Joined</a>
                    </th>
                    <th>
                      <a href="#" className="text">Last Login</a>
                    </th>
                    <th>
                      <a href="#" className="text">Roles</a>
                    </th>
                    <th className="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected' : ''}>
                      <td className="action-checkbox">
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td>
                        <a href="#" className="text">{user.username}</a>
                      </td>
                      <td className="text">{user.email || ''}</td>
                      <td className="text">{user.first_name || ''}</td>
                      <td className="text">{user.last_name || ''}</td>
                      <td className="text">{user.is_staff ? 'Yes' : 'No'}</td>
                      <td className="text">{user.is_superuser ? 'Yes' : 'No'}</td>
                      <td className="text">{user.is_active ? 'Yes' : 'No'}</td>
                      <td className="text">{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : ''}</td>
                      <td className="text">{user.last_login ? new Date(user.last_login).toLocaleDateString() : ''}</td>
                      <td className="text">
                        {Array.isArray(user.roles) ? user.roles.map(r => (typeof r === 'string' ? r : (r && r.name) || '')).filter(Boolean).join(', ') : ''}
                      </td>
                      <td className="actions">
                        <button 
                          onClick={() => setEditing(user)} 
                          className="edit-button"
                        >
                          Change
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}