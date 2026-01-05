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
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
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
    <div>
      <h2>Roles</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowCreate(true)}>Create Role</button>
      </div>

      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Role ID</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Role Name</th>
              <th style={{ padding: 8 }}>Edit</th>
              <th style={{ padding: 8 }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(r => {
              const roleObj = typeof r === 'string' ? { id: r, name: r } : r;
              return (
                <React.Fragment key={roleObj.id}>
                  <tr style={{ borderTop: '1px solid #ddd' }}>
                    <td style={{ padding: 8 }}>{roleObj.id}</td>
                    <td style={{ padding: 8, cursor: 'pointer' }} onClick={() => setExpandedRoleId(expandedRoleId === roleObj.id ? null : roleObj.id)}>
                      {roleObj.name}
                    </td>
                    <td style={{ padding: 8 }}>
                      <button onClick={() => handleEdit(r)}>Edit</button>
                    </td>
                    <td style={{ padding: 8 }}>
                      <button onClick={() => handleDelete(r)}>Delete</button>
                    </td>
                  </tr>
                  {expandedRoleId === roleObj.id && (
                    <tr>
                      <td colSpan={4} style={{ padding: 8, background: '#fafafa' }}>
                        <strong>Users in {roleObj.name}:</strong>
                        <ul style={{ marginTop: 8 }}>
                          {usersInRole(roleObj).length > 0 ? usersInRole(roleObj).map(u => (
                            <li key={u.id}>{u.username} ({u.email})</li>
                          )) : <li style={{ fontStyle: 'italic', color: '#666' }}>No users in this role.</li>}
                        </ul>
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
        <div style={{ marginTop: 12, color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 6, width: '90%', maxWidth: 500 }}>
            <h3>Create Role</h3>
            <input placeholder="Role name" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} />
            <div style={{ marginTop: 12 }}>
              <button onClick={handleCreate}>Create</button>{' '}
              <button onClick={() => { setShowCreate(false); setNewRoleName(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* inline preview is used instead of a modal */}

      {/* Edit modal */}
      {editingRole && (
        <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 6, width: '90%', maxWidth: 500 }}>
            <h3>Edit Role</h3>
            <input value={editRoleName} onChange={e => setEditRoleName(e.target.value)} />
            <div style={{ marginTop: 12 }}>
              <button onClick={submitEdit}>Save</button>{' '}
              <button onClick={() => { setEditingRole(null); setEditRoleName(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
