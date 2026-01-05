import React, { useEffect, useState } from 'react';
import { fetchAuth } from '../api';

export default function ApproveContentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetchAuth('/api/content/items/?status=for_approval');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const act = async (id, a) => {
    try {
      const res = await fetchAuth(`/api/content/items/${id}/${a}/`, { method: 'POST' });
      if (!res.ok) throw new Error('Action failed');
      await fetchItems();
    } catch (err) { console.error(err); alert(String(err)); }
  };

  return (
    <div>
      <h2>Items awaiting approval</h2>
      {loading ? <div>Loading...</div> : (
        <ul>
          {items.map(i => (
            <li key={i.id}>
              {i.title} {' '}
              <button onClick={() => act(i.id, 'approve')}>Approve</button>{' '}
              <button onClick={() => act(i.id, 'deny')}>Deny</button>{' '}
              <button onClick={() => act(i.id, 'publish')}>Publish</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
