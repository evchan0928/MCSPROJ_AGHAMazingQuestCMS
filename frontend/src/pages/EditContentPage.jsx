import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { fetchAuth } from '../api';
import ContentForm from '../ContentForm';

export default function EditContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchAuth(`/api/content/items/${id}/`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setItem(data);
      } catch (err) {
        console.error(err);
        alert('Failed to load item');
        navigate('/dashboard/content');
      } finally { setLoading(false); }
    };
    if (id) load();
    else navigate('/dashboard/content');
  }, [id, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!item) return <div>No item</div>;

  return (
    <div>
      <h2>Edit content</h2>
      <ContentForm item={item} onDone={() => navigate('/dashboard/content')} />
    </div>
  );
}
