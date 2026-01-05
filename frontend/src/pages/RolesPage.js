import React, { useEffect, useState } from 'react';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('access');

  useEffect(() => {
    let mounted = true;
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
  const res = await fetch('/api/users/roles/', { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) {
          // not authenticated
          setError('Not authenticated. Please log in again.');
          localStorage.removeItem('access'); localStorage.removeItem('refresh');
          window.location.href = '/';
          return;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load roles: ${res.status} ${text}`);
        }
  const data = await res.json();
  if (mounted) setRoles(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRoles();
    return () => { mounted = false; };
  }, [token]);

  return (
    <div>
      <h2>Roles</h2>
      {loading ? <div>Loading roles...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={{ textAlign: 'left', padding: 8 }}>Role Name</th><th style={{ padding: 8 }}>ID</th></tr>
          </thead>
          <tbody>
            {roles.map(g => (
              <tr key={g.id} style={{ borderTop: '1px solid #ddd' }}>
                <td style={{ padding: 8 }}>{g.name}</td>
                <td style={{ padding: 8 }}>{g.id}</td>
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
    </div>
  );
}