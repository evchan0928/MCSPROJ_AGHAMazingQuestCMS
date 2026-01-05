import React, { useEffect, useState } from 'react';

function fileTypeFromUrl(url) {
  if (!url) return 'none';
  const u = url.split('?')[0].toLowerCase();
  if (u.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) return 'image';
  if (u.match(/\.(mp4|webm|ogg|mov)$/)) return 'video';
  if (u.match(/\.(mp3|wav|m4a|aac)$/)) return 'audio';
  if (u.match(/\.(pdf)$/)) return 'pdf';
  return 'other';
}

export default function ContentPreview({ item: initialItem, id, onClose }) {
  const [item, setItem] = useState(initialItem || null);
  const [loading, setLoading] = useState(!initialItem && !!id);
  const token = localStorage.getItem('access');

  useEffect(() => {
    let mounted = true;
    if (!initialItem && id) {
      setLoading(true);
      fetch(`/api/content/items/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (!res.ok) throw new Error('Failed to load item');
          return res.json();
        })
        .then(data => { if (mounted) setItem(data); })
        .catch(err => { console.error(err); if (mounted) setItem(null); })
        .finally(() => { if (mounted) setLoading(false); });
    }
    return () => { mounted = false; };
  }, [id, initialItem, token]);

  if (!initialItem && !id) return null;

  return (
    <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '90%', maxWidth: 900, maxHeight: '90%', overflow: 'auto', background: '#fff', borderRadius: 6, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>{item ? item.title : 'Preview'}</h3>
          <button onClick={onClose} style={{ marginLeft: 12 }}>Close</button>
        </div>
        {loading ? <div>Loading preview...</div> : (
          item ? (
            <div>
              {item.body && <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>{item.body}</div>}
              {item.file ? (
                (() => {
                  // file can be a string (URL) or an object with a `url` property
                  let src = (typeof item.file === 'string') ? item.file : (item.file && (item.file.url || item.file.name));
                  // normalize src to absolute URL when possible
                  if (src && !src.startsWith('http') && !src.startsWith('/')) {
                    src = `${window.location.origin}/${src}`;
                  }
                  const t = fileTypeFromUrl(src || '');
                  if (t === 'image') return <img src={src} alt={item.title} style={{ maxWidth: '100%', height: 'auto', borderRadius: 4 }} />;
                  if (t === 'video') return <video controls src={src} style={{ width: '100%', maxHeight: 500 }} />;
                  if (t === 'audio') return <audio controls src={src} style={{ width: '100%' }} />;
                  if (t === 'pdf') return <iframe src={src} title={item.title} style={{ width: '100%', height: 600, border: 'none' }} />;
                  return (
                    <div>
                      <p>Download file: <a href={src} target="_blank" rel="noreferrer">{src ? src.split('/').pop() : 'file'}</a></p>
                    </div>
                  );
                })()
              ) : (<div style={{ fontStyle: 'italic', color: '#666' }}>No file attached.</div>)}
            </div>
          ) : <div>Preview unavailable</div>
        )}
      </div>
    </div>
  );
}