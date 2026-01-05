import React, { useEffect, useState } from 'react';
import { fetchAuth } from './api';

export default function Profile({ onLogout }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAuth('/api/auth/me/', { headers: { 'Content-Type': 'application/json' } });
        if (!res.ok) {
          if (res.status === 401) {
            setError('Unauthorized — token may be expired.');
          } else {
            const ct = (res.headers.get('content-type') || '').toLowerCase();
            if (ct.includes('application/json')) {
              const err = await res.json();
              setError(err.detail || JSON.stringify(err));
            } else {
              const text = await res.text();
              setError(`Failed to fetch profile: ${text.substring(0, 500)}`);
            }
          }
          return;
        }
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('application/json')) {
          const data = await res.json();
          setUser(data);
        } else {
          const text = await res.text();
          setError(`Expected JSON response but got: ${text.substring(0,500)}`);
        }
      } catch (err) {
        setError(String(err));
      }
    };
    load();
  }, []);

  return (
    <div style={{ maxWidth: 640 }}>
      <h3>Profile</h3>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {!user && !error && <div>Loading...</div>}
      {user && (
        <div>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>First name:</strong> {user.first_name}</p>
          <p><strong>Last name:</strong> {user.last_name}</p>
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <button onClick={onLogout}>Log out</button>
      </div>
    </div>
  );
}
