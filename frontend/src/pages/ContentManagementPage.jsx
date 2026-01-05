import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import ContentForm from '../ContentForm';
import statusLabel from '../utils/statusLabels';
import ContentPreview from '../components/ContentPreview';
import { fetchAuth } from '../api';

export default function ContentManagementPage() {
  const { user } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAuth('/api/content/items/');
      if (!res.ok) throw new Error('Failed to load items');
      const data = await res.json();
      // Only show items that are still editable (not sent for approval/publishing/published/deleted)
      // Match backend model strings: 'for_editing', 'for_approval', 'for_publishing', 'published', 'deleted'
      const editableStatuses = new Set(['for_editing']);
      const visible = data.filter(i => {
        const s = (i.status || '').toLowerCase();
        if (!s) return false;
        if (s === 'deleted') return false;
        return editableStatuses.has(s);
      });
      setItems(visible);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const doAction = async (id, action) => {
    try {
      const res = await fetchAuth(`/api/content/items/${id}/${action}/`, { method: 'POST' });
      if (!res.ok) throw new Error('Action failed');
      await fetchItems();
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Delete this item (soft-delete)?')) return;
    try {
      const res = await fetchAuth(`/api/content/items/${id}/`, { method: 'DELETE' });
      if (![204,200].includes(res.status)) throw new Error('Delete failed');
      await fetchItems();
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  };

  const canEdit = user && (user.is_superuser || (user.roles || []).includes('Editor') || (user.roles || []).includes('Super Admin'));
  const canApprove = user && (user.is_superuser || (user.roles || []).includes('Approver'));
  const canDelete = user && (user.is_superuser || (user.roles || []).includes('Admin'));

  return (
    <div>
      <h2>Content Management</h2>
      <div style={{ marginBottom: 12 }}>
        {canEdit && <button onClick={() => { setShowCreate(true); }}>New Content</button>}
      </div>

  {showCreate && <ContentForm onDone={() => { setShowCreate(false); fetchItems(); }} />}
  {previewItem && <ContentPreview item={previewItem} onClose={() => setPreviewItem(null)} />}

      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} style={{ borderTop: '1px solid #ddd' }}>
                <td style={{ padding: 8 }}>{it.title}</td>
                <td style={{ padding: 8 }}>{statusLabel(it.status)}</td>
                <td style={{ padding: 8 }}>
                  {canEdit && <button onClick={() => navigate(`/dashboard/content/edit/${it.id}`)}>Edit</button>} {' '}
                  <button onClick={() => setPreviewItem(it)}>Preview</button>{' '}
                  {canEdit && <button onClick={() => doAction(it.id, 'send_for_approval')}>Send for approval</button>} {' '}
                  {canApprove && <button onClick={() => doAction(it.id, 'approve')}>Approve</button>} {' '}
                  {canApprove && <button onClick={() => doAction(it.id, 'publish')}>Publish</button>} {' '}
                  {canDelete && <button onClick={() => doDelete(it.id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
