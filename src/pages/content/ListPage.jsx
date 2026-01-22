import React from 'react';
import { Table, Button } from 'antd';
import './ListPage.css';

const ContentList = () => {
  const textsData = [
    {
      id: 1998498,
      title: 'Image Marker to align with the building heritage of the DOST...',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete'],
    },
    {
      id: 1998499,
      title: 'A marker that signifies the historical event and bravery of...',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete'],
    },
    {
      id: 19984100,
      title: 'There\'s A Message in The Suspension Spree...',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete'],
    },
    {
      id: 1998495,
      title: 'This is a very long title that should be truncated properly to demonstrate the ellipsis effect in the UI.',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete'],
    },
    {
      id: 1998494,
      title: 'Another example of a lengthy title that needs to be handled gracefully by the truncation logic.',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete'],
    },
  ];

  const mediaData = [
    {
      id: 1998496,
      title: 'AR Marker Image',
      preview: <div className="preview-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 7L12 10.5L8.5 7H15.5Z" fill="currentColor"/><path d="M12 10.5V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>,
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete'],
    },
    {
      id: 1998497,
      title: 'AR Marker Video',
      preview: <div className="preview-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg></div>,
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete'],
    },
    {
      id: 1998498,
      title: 'New AR Marker Image',
      preview: <div className="preview-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 7L12 10.5L8.5 7H15.5Z" fill="currentColor"/><path d="M12 10.5V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>,
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete'],
    },
    {
      id: 1998499,
      title: 'New AR Marker Video',
      preview: <div className="preview-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg></div>,
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete'],
    },
  ];

  const columnsTexts = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <div className="title-truncated" title={text}>
          {text}
        </div>
      ),
      width: 300,
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <div className="action-buttons">
          {record.actions.map((action) => (
            <Button
              key={action}
              size="small"
              type="primary"
              style={{
                backgroundColor: '#002a6c',
                borderColor: '#002a6c',
                color: 'white',
                marginRight: 8,
                padding: '4px 12px',
                fontSize: 12,
                borderRadius: 4,
              }}
            >
              {action}
            </Button>
          ))}
        </div>
      ),
      width: 300,
    },
  ];

  const columnsMedia = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <div className="title-truncated" title={text}>
          {text}
        </div>
      ),
      width: 200,
    },
    {
      title: 'Preview',
      dataIndex: 'preview',
      key: 'preview',
      render: (preview) => (
        <div className="preview-container">{preview}</div>
      ),
      width: 120,
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <div className="action-buttons">
          {record.actions.map((action) => (
            <Button
              key={action}
              size="small"
              type="primary"
              style={{
                backgroundColor: '#002a6c',
                borderColor: '#002a6c',
                color: 'white',
                marginRight: 8,
                padding: '4px 12px',
                fontSize: 12,
                borderRadius: 4,
              }}
            >
              {action}
            </Button>
          ))}
        </div>
      ),
      width: 300,
    },
  ];

  return (
    <div className="content-list-page">
      <h1 className="page-title">Content List</h1>

      <section className="section">
        <h2 className="section-title">Texts</h2>
        <Table
          dataSource={textsData}
          columns={columnsTexts}
          pagination={false}
          rowKey="id"
          className="content-table"
        />
      </section>

      <section className="section">
        <h2 className="section-title">Videos and Images</h2>
        <Table
          dataSource={mediaData}
          columns={columnsMedia}
          pagination={false}
          rowKey="id"
          className="content-table"
        />
      </section>
    </div>
  );
};

export default ContentList;