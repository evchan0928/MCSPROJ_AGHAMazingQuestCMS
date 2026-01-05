import React, { useEffect, useState } from 'react';
import { fetchAuth } from '../api';
import UserForm from '../components/UserForm';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

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

  return (
    <div>
      <h2>User Management</h2>
      {editing ? <UserForm user={editing} roles={roles} onDone={() => { setEditing(null); fetchUsers(); }} /> : (
        <div>
          <button onClick={() => setEditing({})}>Create user</button>
          {loading ? <div>Loading...</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Username</th>
                    <th style={{ padding: 8 }}>Email</th>
                    <th style={{ padding: 8 }}>Roles</th>
                    <th style={{ padding: 8 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderTop: '1px solid #ddd' }}>
                      <td style={{ padding: 8 }}>{u.id}</td>
                      <td style={{ padding: 8 }}>{u.username}</td>
                      <td style={{ padding: 8 }}>{u.email}</td>
                      <td style={{ padding: 8 }}>
                        {Array.isArray(u.roles) ? u.roles.map(r => (typeof r === 'string' ? r : (r && r.name) || '')).filter(Boolean).join(', ') : ''}
                      </td>
                      <td style={{ padding: 8 }}><button onClick={() => setEditing(u)}>Edit</button></td>
                    </tr>
                  ))}
                </tbody>
                </table>
          )}
        </div>
      )}
      
    </div>
  );
}
