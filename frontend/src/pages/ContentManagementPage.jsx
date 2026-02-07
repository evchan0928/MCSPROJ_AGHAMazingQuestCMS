import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getContentItems, 
  sendContentForApproval, 
  approveContentItem, 
  publishContentItem, 
  deleteContentItem,
  getCurrentUser
} from '../api/django-api';
import { notification } from 'antd';
import ContentForm from '../ContentForm.jsx';
import statusLabel from '../utils/statusLabels.jsx';
import ContentPreview from '../components/ContentPreview.jsx';

export default function ContentManagementPage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    
    fetchUser();
  }, []);

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getContentItems();
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
      api.error({
        message: 'Error',
        description: 'Failed to load content items'
      });
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const doAction = async (id, action) => {
    try {
      switch(action) {
        case 'send_for_approval':
          await sendContentForApproval(id);
          break;
        case 'approve':
          await approveContentItem(id, '');  // Pass empty string for approval notes
          break;
        case 'publish':
          await publishContentItem(id);
          break;
        default:
          throw new Error('Unknown action');
      }
      api.success({
        message: 'Success',
        description: `Content ${action.replace('_', ' ')} successful`
      });
      await fetchItems();
    } catch (err) {
      console.error(err);
      api.error({
        message: 'Error',
        description: String(err)
      });
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Delete this item (soft-delete)?')) return;
    try {
      await deleteContentItem(id);
      api.success({
        message: 'Success',
        description: 'Content deleted successfully'
      });
      await fetchItems();
    } catch (err) {
      console.error(err);
      api.error({
        message: 'Error',
        description: String(err)
      });
    }
  };

  // Extract role names for easier comparison
  const userRoleNames = (user?.roles || []).map(role => role.name);
  
  const canEdit = user && (user.is_superuser || userRoleNames.some(roleName => roleName === 'Editor' || roleName === 'Super Admin'));
  const canApprove = user && (user.is_superuser || userRoleNames.includes('Approver'));
  const canDelete = user && (user.is_superuser || userRoleNames.includes('Admin'));

  return (
    <>
      {contextHolder}
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
    </>
  );
}