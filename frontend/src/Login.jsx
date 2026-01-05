import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const API_BASE = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && window.location.port === '3000') ? 'http://localhost:8000' : '');
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          const message = data.detail || data.message || JSON.stringify(data);
          console.error('Login failed:', res.status, data);
          setError(message);
        } else {
          try { localStorage.setItem('access', data.access); localStorage.setItem('refresh', data.refresh); } catch (e) { }
          if (onLogin) {
            try { onLogin({ access: data.access, refresh: data.refresh }); } catch (e) { console.error('onLogin callback threw', e); }
          } else {
            try { window.location.href = '/dashboard'; } catch (e) { console.error(e); }
          }
        }
      } else {
        const text = await res.text();
        setError(`Expected JSON response but received HTML/text from server:\n${text.substring(0, 1000)}`);
      }
    } catch (err) {
      console.error('Login request error', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420 }}>
      <h3>Sign in</h3>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <label>Username</label>
          <br />
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </div>
      </form>
      {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 12, color: '#666' }}>
        Tip: use an existing Django superuser or register via API at <code>/api/auth/register/</code>.
      </div>
    </div>
  );
}
