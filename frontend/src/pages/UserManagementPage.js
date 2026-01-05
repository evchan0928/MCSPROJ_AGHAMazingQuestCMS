import React, { useEffect, useState } from 'react';
import UserForm from '../components/UserForm';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const token = localStorage.getItem('access');

  const [error, setError] = React.useState(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const uRes = await fetch('/api/users/', { headers: { Authorization: `Bearer ${token}` } });
      if (uRes.status === 401) {
        // not authenticated
        setError('Not authenticated. Please log in again.');
        // redirect to login after clearing tokens
        localStorage.removeItem('access'); localStorage.removeItem('refresh');
        window.location.href = '/';
        return;
      }
      if (!uRes.ok) {
        const text = await uRes.text();
        throw new Error(`Failed to load users: ${uRes.status} ${text}`);
      }
      const uData = await uRes.json();
      setUsers(uData);

  const gRes = await fetch('/api/users/roles/', { headers: { Authorization: `Bearer ${token}` } });
      if (!gRes.ok) {
        const text = await gRes.text();
        throw new Error(`Failed to load roles: ${gRes.status} ${text}`);
      }
  const gData = await gRes.json();
  setRoles(gData);
    } catch (err) {
      console.error(err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const doDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (![204,200].includes(res.status)) throw new Error('Delete failed');
      fetchData();
    } catch (err) { console.error(err); alert(String(err)); }
  };

  return (
    <div>
      <h2>User Management</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => { setShowCreate(true); setEditing(null); }}>New user</button>
      </div>

      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={{ textAlign: 'left', padding: 8 }}>Username</th><th style={{ padding: 8 }}>Email</th><th style={{ padding: 8 }}>Roles</th><th style={{ padding: 8 }}>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid #ddd' }}>
                <td style={{ padding: 8 }}>{u.username}</td>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}>{(u.roles || []).join(', ')}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => setEditing(u)}>Edit</button>{' '}
                  <button onClick={() => doDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {error && (
        <div style={{ marginTop: 12, color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

  {showCreate && <UserForm roles={roles} onCancel={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); fetchData(); }} />}
  {editing && <UserForm user={editing} roles={roles} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); fetchData(); }} />}
    </div>
  );
}