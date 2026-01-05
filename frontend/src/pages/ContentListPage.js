import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContentListPage() {
  const navigate = useNavigate();
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access');

  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        const res = await fetch('/api/content/items/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setContentList(data);
      } catch (err) {
        console.error("Failed to fetch content:", err);
      } finally {
        setLoading(false); 
      }
    };
    fetchAllContent();
  }, [token]);

  if (loading) {
    return <div className="loading-state">Loading contents...</div>;
  }

  const textContent = contentList.filter(item => item.type === 'text');
  const mediaContent = contentList.filter(item => item.type === 'video' || item.type === 'image');

  return (
    <div className="card content-list-container"> 
      <h1 className="card-title">Content List</h1>
      <p>View and manage your existing library of content items below.</p>

      {/* --- TEXTS SECTION --- */}
      <section className="content-section">
        <h2 className="section-subtitle">Texts</h2>
        <div className="table-wrapper">
          <table className="content-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {textContent.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td className="title-cell">{item.title}</td>
                  <td className="actions-cell">
                    <button className="btn-action" onClick={() => navigate(`edit/${item.id}`)}>Edit</button>
                    <button className="btn-action">Approve</button>
                    <button className="btn-action">Reject</button>
                    <button className="btn-action">Publish</button>
                    <button className="btn-action">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- VIDEOS AND IMAGES SECTION --- */}
      <section className="content-section">
        <h2 className="section-subtitle">Videos and Images</h2>
        <div className="table-wrapper">
          <table className="content-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Preview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mediaContent.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td>
                    <div className="preview-box">
                      <span className="material-icons">
                        {item.type === 'video' ? 'play_arrow' : 'image'}
                      </span>
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-action" onClick={() => navigate(`edit/${item.id}`)}>Edit</button>
                    <button className="btn-action">Approve</button>
                    <button className="btn-action">Reject</button>
                    <button className="btn-action">Publish</button>
                    <button className="btn-action">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}