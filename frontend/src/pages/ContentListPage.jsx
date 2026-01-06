import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContentListPage() {
  const navigate = useNavigate();
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'text', 'media'
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

  // Filter content based on selected filter
  const filteredContent = filter === 'all' 
    ? contentList 
    : contentList.filter(item => 
        filter === 'text' ? item.type === 'text' : 
        item.type === 'video' || item.type === 'image'
      );

  return (
    <div className="card content-list-container"> 
      <div className="card-header">
        <h1 className="card-title">Content Library</h1>
        <p>Manage and review your content items</p>
      </div>
      
      {/* Filter controls */}
      <div className="filter-controls" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button 
          className={`btn ${filter === 'all' ? 'primary' : 'secondary'}`}
          onClick={() => setFilter('all')}
        >
          All Content
        </button>
        <button 
          className={`btn ${filter === 'text' ? 'primary' : 'secondary'}`}
          onClick={() => setFilter('text')}
        >
          Texts
        </button>
        <button 
          className={`btn ${filter === 'media' ? 'primary' : 'secondary'}`}
          onClick={() => setFilter('media')}
        >
          Media
        </button>
      </div>

      {/* Content table */}
      <div className="table-wrapper">
        <table className="content-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContent.length > 0 ? (
              filteredContent.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td className="title-cell">{item.title}</td>
                  <td>
                    <span className="content-type-badge">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-action" 
                      onClick={() => navigate(`edit/${item.id}`)}
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button className="btn-action" title="Approve">Approve</button>
                    <button className="btn-action" title="Reject">Reject</button>
                    <button className="btn-action primary" title="Publish">Publish</button>
                    <button className="btn-action danger" title="Delete">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No content items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}