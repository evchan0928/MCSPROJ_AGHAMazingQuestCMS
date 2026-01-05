import React, { useEffect, useState } from 'react';
import { fetchAuth } from '../api';

export default function PublishContentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
  // backend uses 'for_publishing' as the state after approval and before publishing
  const res = await fetchAuth('/api/content/items/?status=for_publishing');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const publish = async (id) => {
    try {
      const res = await fetchAuth(`/api/content/items/${id}/publish/`, { method: 'POST' });
      if (!res.ok) throw new Error('Publish failed');
      await fetchItems();
    } catch (err) { console.error(err); alert(String(err)); }
  };

  return (
    <div>
      <h2>Approved items (ready to publish)</h2>
      {loading ? <div>Loading...</div> : (
        <ul>
          {items.map(i => (
            <li key={i.id}>{i.title} <button onClick={() => publish(i.id)}>Publish</button></li>
          ))}
        </ul>
      )}
    </div>
  );
}
