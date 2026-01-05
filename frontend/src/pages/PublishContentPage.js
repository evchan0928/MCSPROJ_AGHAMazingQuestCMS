import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import statusLabel from '../utils/statusLabels';
import ContentPreview from '../components/ContentPreview';

export default function PublishContentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState(null);
  const token = localStorage.getItem('access');

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
  const res = await fetch('/api/content/items/?status=for_publishing', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const doPublish = async (id) => {
    try {
      const res = await fetch(`/api/content/items/${id}/publish/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Publish failed');
      fetchItems();
    } catch (err) { console.error(err); alert(String(err)); }
  };
  const { user } = useOutletContext();
  // Only Approver group (and superuser) may publish
  const allowed = user && (user.is_superuser || (user.roles || []).includes('Approver') || (user.roles || []).includes('Super Admin'));
  if (!allowed) return <div><h2>Access denied</h2><p>You don't have permission to publish content.</p></div>;

  return (
    <div>
      <h2>Publish content</h2>
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
                  <button className="btn" onClick={() => doPublish(it.id)}>Publish</button>
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