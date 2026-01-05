import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ContentForm from '../ContentForm';
import statusLabel from '../utils/statusLabels';
import ContentPreview from '../components/ContentPreview';

export default function ContentManagementPage() {
  const { user } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const token = localStorage.getItem('access');

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/items/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load items');
      const data = await res.json();
      // Only show items that are in an "editable" state on the Edit Content page.
      // Once an item moves to approval/publishing/published it should live in those
      // respective sections and not reappear here unless an approver denies it.
      const editableStatuses = new Set(['for_editing', 'uploaded', 'edited']);
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
  }, [token]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const doAction = async (id, action) => {
    try {
      const res = await fetch(`/api/content/items/${id}/${action}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const res = await fetch(`/api/content/items/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (![204,200].includes(res.status)) throw new Error('Delete failed');
      await fetchItems();
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  };

  // Editor role (and superuser) can edit and send for approval. Encoders can only upload (handled elsewhere).
  const canEdit = user && (user.is_superuser || (user.roles || []).includes('Editor') || (user.roles || []).includes('Super Admin'));
  // Only Approver role (and superuser) can approve/publish/deny
  const canApprove = user && (user.is_superuser || (user.roles || []).includes('Approver'));
  // Only Admin role (and superuser) can delete
  const canDelete = user && (user.is_superuser || (user.roles || []).includes('Admin'));

  return (
    <div>
      <h2>Content Management</h2>
      <div style={{ marginBottom: 12 }}>
        {canEdit && <button onClick={() => { setShowCreate(true); setEditing(null); }}>New Content</button>}
      </div>

  {showCreate && <ContentForm onDone={() => { setShowCreate(false); fetchItems(); }} />}
  {editing && <ContentForm item={editing} onDone={() => { setEditing(null); fetchItems(); }} />}
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
                  {canEdit && <button onClick={() => setEditing(it)}>Edit</button>} {' '}
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
