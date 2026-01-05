import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import statusLabel from '../utils/statusLabels';
import ContentPreview from '../components/ContentPreview';

export default function ApproveContentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access');

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
  const res = await fetch('/api/content/items/?status=for_approval', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const outlet = useOutletContext();
  const outletUser = outlet?.user || null;
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const doApprove = async (id) => {
    try {
      const res = await fetch(`/api/content/items/${id}/approve/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Approve failed');
      fetchItems();
    } catch (err) { console.error(err); alert(String(err)); }
  };

  const doDeny = async (id) => {
    try {
      const res = await fetch(`/api/content/items/${id}/deny/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Deny failed');
      fetchItems();
    } catch (err) { console.error(err); alert(String(err)); }
  };

  // Preview state (declare hooks before any conditional returns)
  const [previewId, setPreviewId] = useState(null);

  // Only Approver role and superuser can access the approve screen.
  const allowed = (outletUser && (outletUser.is_superuser || (outletUser.roles || []).includes('Approver') || (outletUser.roles || []).includes('Super Admin'))) || false;
  if (!allowed) return <div><h2>Access denied</h2><p>You don't have permission to approve or publish content.</p></div>;

  return (
    <div>
      <h2>Approve content</h2>
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={{ textAlign: 'left', padding: 8 }}>Title</th><th style={{ padding: 8 }}>Status</th><th style={{ padding: 8 }}>Actions</th></tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} style={{ borderTop: '1px solid #ddd' }}>
                <td style={{ padding: 8 }}>{it.title}</td>
                <td style={{ padding: 8 }}>{statusLabel(it.status)}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => setPreviewId(it.id)}>Preview</button>{' '}
                  <button onClick={() => doApprove(it.id)}>Approve</button>{' '}
                  <button onClick={() => doDeny(it.id)}>Deny</button>{' '}
                  <button onClick={() => { fetch(`/api/content/items/${it.id}/publish/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).then(() => fetchItems()).catch(e => alert(String(e))); }}>Publish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {previewId && <ContentPreview id={previewId} onClose={() => setPreviewId(null)} />}
    </div>
  );
}