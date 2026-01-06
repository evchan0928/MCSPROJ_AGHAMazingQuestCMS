import React, { useEffect, useState } from 'react';
import { fetchAuth } from '../api';

export default function RolesPage() {
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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [rRes, uRes] = await Promise.all([
          fetchAuth('/api/users/roles/'),
          fetchAuth('/api/users/'),
        ]);
        if (!rRes.ok) throw new Error('Failed to load roles');
        if (!uRes.ok) throw new Error('Failed to load users');
        const rData = await rRes.json();
        const uData = await uRes.json();
        if (!mounted) return;
        setRoles(rData || []);
        setUsers(uData || []);
      } catch (err) {
        console.error(err);
        if (mounted) setError(String(err));
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
      if (!rRes.ok) throw new Error('Failed to load roles');
      const rData = await rRes.json();
      setRoles(rData || []);
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
    <div className="django-admin-container">
      <div className="module">
        <div className="module-header">
          <h1>Roles</h1>
        </div>
        
        <div className="toolbar">
          <div className="add-button-container">
            <button 
              onClick={() => setShowCreate(true)} 
              className="add-button"
            >
              <span className="material-icons">add</span> Add role
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table className="django-table">
            <thead>
              <tr>
                <th>
                  <a href="#" className="text">Role Name</a>
                </th>
                <th>
                  <a href="#" className="text">Users in Role</a>
                </th>
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
                        <a 
                          href="#" 
                          className="text"
                          onClick={(e) => {
                            e.preventDefault();
                            setExpandedRoleId(expandedRoleId === roleObj.id ? null : roleObj.id);
                          }}
                        >
                          {roleObj.name}
                        </a>
                      </td>
                      <td className="text">{roleUsers.length}</td>
                      <td className="actions">
                        <button 
                          onClick={() => handleEdit(r)} 
                          className="edit-button"
                        >
                          Change
                        </button>
                        <button 
                          onClick={() => handleDelete(r)} 
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {expandedRoleId === roleObj.id && (
                      <tr>
                        <td colSpan={3} className="expanded-content">
                          <div className="users-in-role">
                            <strong>Users in {roleObj.name}:</strong>
                            <ul>
                              {roleUsers.length > 0 ? roleUsers.map(u => (
                                <li key={u.id}>{u.username} ({u.email})</li>
                              )) : <li className="no-users">No users in this role.</li>}
                            </ul>
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
                className="form-input"
              />
            </div>
            <div className="modal-footer">
              <button onClick={handleCreate} className="modal-button primary">Create</button>
              <button 
                onClick={() => { 
                  setShowCreate(false); 
                  setNewRoleName(''); 
                }} 
                className="modal-button secondary"
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
                className="form-input"
              />
            </div>
            <div className="modal-footer">
              <button onClick={submitEdit} className="modal-button primary">Save</button>
              <button 
                onClick={() => { 
                  setEditingRole(null); 
                  setEditRoleName(''); 
                }} 
                className="modal-button secondary"
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