import React, { useEffect, useState } from 'react';
import { fetchAuth } from '../api';

export default function DeleteContentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
  // backend uses 'for_editing' for newly uploaded items; use that to list deletable uploads
  const res = await fetchAuth('/api/content/items/?status=for_editing');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const doDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const res = await fetchAuth(`/api/content/items/${id}/`, { method: 'DELETE' });
      if (![200,204].includes(res.status)) throw new Error('Delete failed');
      await fetchItems();
    } catch (err) { console.error(err); alert(String(err)); }
  };

  return (
    <div>
      <h2>Delete Content</h2>
      {loading ? <div>Loading...</div> : (
        <ul>
          {items.map(i => (
            <li key={i.id}>{i.title} <button onClick={() => doDelete(i.id)}>Delete</button></li>
          ))}
        </ul>
      )}
    </div>
  );
}
