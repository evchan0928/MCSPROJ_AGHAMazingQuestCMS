import React, { useState, useEffect } from 'react';
export default function UserForm({ user: initial, roles = [], onCancel, onSaved, onDone }) {
  const [user, setUser] = useState(initial || { username: '', email: '', first_name: '', last_name: '', is_active: true, is_staff: false, is_superuser: false, roles: [], password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // normalize roles to an array of role names (backend may return objects or strings)
    const base = initial || { username: '', email: '', first_name: '', last_name: '', is_active: true, is_staff: false, is_superuser: false, roles: [], password: '' };
    const normRoles = Array.isArray(base.roles) ? base.roles.map(r => (typeof r === 'string' ? r : (r && r.name) || '')).filter(Boolean) : [];
    setUser({ ...base, roles: normRoles });
  }, [initial]);

  const token = localStorage.getItem('access');
  const API_BASE = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && window.location.port === '3000') ? 'http://localhost:8000' : '');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...user };
      if (!payload.password) delete payload.password;
      const method = user.id ? 'PUT' : 'POST';
      const url = user.id ? `${API_BASE}/api/users/${user.id}/` : `${API_BASE}/api/users/`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (!ct.includes('application/json')) {
        const txt = await res.text();
        throw new Error(`Expected JSON response from save but received: ${txt.substring(0,200)}`);
      }
      const data = await res.json();
  // Call saved/done callbacks (support older prop name onDone)
  if (onSaved) onSaved(data);
  else if (onDone) onDone(data);
    } catch (err) {
      alert(String(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = (name) => {
    const cur = new Set(user.roles || []);
    if (cur.has(name)) cur.delete(name); else cur.add(name);
    setUser({ ...user, roles: Array.from(cur) });
  };

  return (
    <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={submit} style={{ background: '#fff', padding: 16, borderRadius: 6, width: '90%', maxWidth: 600 }}>
        <h3>{user.id ? 'Edit user' : 'Create user'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <label>Username<input value={user.username} onChange={e => setUser({ ...user, username: e.target.value })} required /></label>
          <label>Email<input value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} /></label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <label>First name<input value={user.first_name} onChange={e => setUser({ ...user, first_name: e.target.value })} /></label>
          <label>Last name<input value={user.last_name} onChange={e => setUser({ ...user, last_name: e.target.value })} /></label>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Password (leave blank to keep current)<input value={user.password} onChange={e => setUser({ ...user, password: e.target.value })} type="password" /></label>
        </div>

        <div style={{ marginTop: 8 }}>
          <label><input type="checkbox" checked={!!user.is_active} onChange={e => setUser({ ...user, is_active: e.target.checked })} /> Active</label>{' '}
          <label style={{ marginLeft: 12 }}><input type="checkbox" checked={!!user.is_staff} onChange={e => setUser({ ...user, is_staff: e.target.checked })} /> Staff</label>{' '}
          <label style={{ marginLeft: 12 }}><input type="checkbox" checked={!!user.is_superuser} onChange={e => setUser({ ...user, is_superuser: e.target.checked })} /> Superuser</label>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 'bold' }}>Roles</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {roles.map(g => (
              <label key={g.name} style={{ border: '1px solid #ddd', padding: '4px 6px', borderRadius: 4 }}>
                <input type="checkbox" checked={(user.roles || []).includes(g.name)} onChange={() => toggleGroup(g.name)} /> {g.name}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={() => { if (onCancel) onCancel(); else if (onDone) onDone(); }} disabled={saving}>Cancel</button>
          <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
