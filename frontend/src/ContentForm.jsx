import React, { useState, useEffect, useRef } from 'react';
import { fetchAuth } from './api';

export default function ContentForm({ item = null, onDone }) {
  const [title, setTitle] = useState(item?.title || '');
  const [body, setBody] = useState(item?.body || '');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTitle(item?.title || '');
    setBody(item?.body || '');
  }, [item]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('body', body);
      if (file) fd.append('file', file);

      const url = item ? `/api/content/items/${item.id}/` : '/api/content/items/';
      const method = item ? 'PATCH' : 'POST';

      const res = await fetchAuth(url, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        const msg = ct.includes('application/json') ? JSON.stringify(await res.json()) : await res.text();
        console.error('Upload failed:', msg);
        let userMessage = 'Content Failed to Upload';
        try {
          if (ct.includes('application/json')) {
            const data = JSON.parse(msg);
            if (typeof data === 'object') {
              const parts = [];
              for (const k of Object.keys(data)) {
                parts.push(`${k}: ${Array.isArray(data[k]) ? data[k].join(', ') : String(data[k])}`);
              }
              userMessage += '\n' + parts.join('\n');
            } else if (data.message) {
              userMessage += `\n${data.message}`;
            }
          } else if (msg) {
            userMessage += `\n${msg}`;
          }
        } catch (e) {
          console.error('Error parsing server error payload', e);
        }
        setErrorMsg(userMessage);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('application/json')) {
        const payload = await res.json();
        if (payload && payload.message) {
          alert(`${payload.message}\nContent ID: ${payload.id}`);
        } else {
          alert('Content Uploaded');
        }
      } else {
        alert('Content Uploaded');
      }
      onDone();
    } catch (err) {
      console.error(err);
      setErrorMsg('Content Failed to Upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 16, padding: 12, border: '1px solid #ddd' }}>
  <h3>{item ? 'Edit content' : 'Upload content'}</h3>
      <div style={{ marginBottom: 8 }}>
        <label>Title<br />
          <input value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Body<br />
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>File (optional)<br />
          <input ref={fileInputRef} type="file" onChange={e => setFile(e.target.files[0])} />
        </label>
      </div>
      {errorMsg && (
        <div style={{ marginBottom: 8, color: 'red', whiteSpace: 'pre-wrap' }}>
          {errorMsg}
        </div>
      )}
      <div>
        <button type="submit" disabled={loading}>{loading ? (item ? 'Saving…' : 'Uploading…') : (item ? 'Save' : 'Upload')}</button> {' '}
        <button type="button" onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}
