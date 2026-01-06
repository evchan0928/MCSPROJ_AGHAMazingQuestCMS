import React, { useState, useEffect } from 'react';

export default function UserForm({ user: initial, roles = [], onCancel, onSaved, onDone }) {
  const [user, setUser] = useState(initial || { 
    username: '', 
    email: '', 
    first_name: '', 
    last_name: '', 
    is_active: true, 
    is_staff: false, 
    is_superuser: false, 
    roles: [], 
    password: '' 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // normalize roles to an array of role names (backend may return objects or strings)
    const base = initial || { 
      username: '', 
      email: '', 
      first_name: '', 
      last_name: '', 
      is_active: true, 
      is_staff: false, 
      is_superuser: false, 
      roles: [], 
      password: '' 
    };
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
    <div className="django-form-container">
      <form onSubmit={submit} className="django-form">
        <div className="form-row">
          <div>
            <label className="required">Username</label>
            <input 
              value={user.username} 
              onChange={e => setUser({ ...user, username: e.target.value })} 
              required 
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div>
            <label>Email</label>
            <input 
              value={user.email} 
              onChange={e => setUser({ ...user, email: e.target.value })} 
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div>
            <label>First name</label>
            <input 
              value={user.first_name} 
              onChange={e => setUser({ ...user, first_name: e.target.value })} 
              className="form-input"
            />
          </div>
          <div>
            <label>Last name</label>
            <input 
              value={user.last_name} 
              onChange={e => setUser({ ...user, last_name: e.target.value })} 
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Password {user.id ? '(leave blank to keep current)' : '(required)'}</label>
            <input 
              value={user.password} 
              onChange={e => setUser({ ...user, password: e.target.value })} 
              type="password" 
              className="form-input"
              required={!user.id}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="checkbox-row">
            <label>
              <input 
                type="checkbox" 
                checked={!!user.is_active} 
                onChange={e => setUser({ ...user, is_active: e.target.checked })} 
              /> 
              Active
            </label>
          </div>
          
          <div className="checkbox-row">
            <label>
              <input 
                type="checkbox" 
                checked={!!user.is_staff} 
                onChange={e => setUser({ ...user, is_staff: e.target.checked })} 
              /> 
              Staff status
            </label>
          </div>
          
          <div className="checkbox-row">
            <label>
              <input 
                type="checkbox" 
                checked={!!user.is_superuser} 
                onChange={e => setUser({ ...user, is_superuser: e.target.checked })} 
              /> 
              Superuser status
            </label>
          </div>
        </div>

        <div className="form-row">
          <div>
            <h3 className="form-section-title">Permissions</h3>
            <div className="permissions-container">
              <div className="permissions-box">
                <div className="permissions-header">Roles</div>
                <div className="permissions-content">
                  {roles.map(g => (
                    <label key={g.name} className="permission-checkbox">
                      <input 
                        type="checkbox" 
                        checked={(user.roles || []).includes(g.name)} 
                        onChange={() => toggleGroup(g.name)} 
                      /> 
                      {g.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="submit-row">
          <button 
            type="button" 
            onClick={() => { 
              if (onCancel) onCancel(); 
              else if (onDone) onDone(); 
            }} 
            disabled={saving}
            className="cancel-button"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : (user.id ? 'Save' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
}