import React from 'react';
import { Table, Button, Space } from 'antd';
import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined, PlayCircleOutlined } from '@ant-design/icons';

const ContentList = () => {
  const textsData = [
    {
      id: 1998498,
      title: 'Image Marker to align with the building heritage of the DOST...',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete']
    },
    {
      id: 1998499,
      title: 'A marker that signifies the historical event and bravery of...',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete']
    },
    {
      id: 19984100,
      title: 'There\'s A Message in The Suspension Spree...',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete']
    },
    {
      id: 1998495,
      title: 'This is a very long title that should be truncated properly to demonstrate the ellipsis effect in the UI.',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete']
    },
    {
      id: 1998494,
      title: 'Another example of a lengthy title that needs to be handled gracefully by the truncation logic.',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete']
    }
  ];

  const mediaData = [
    {
      id: 1998496,
      title: 'AR Marker Image',
      previewType: 'image',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete']
    },
    {
      id: 1998497,
      title: 'AR Marker Video',
      previewType: 'video',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete']
    },
    {
      id: 1998498,
      title: 'New AR Marker Image',
      previewType: 'image',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete']
    },
    {
      id: 1998499,
      title: 'New AR Marker Video',
      previewType: 'video',
      actions: ['Edit', 'Approve', 'Reject', 'Publish', 'Delete']
    }
  ];

  const columnsTexts = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {record.actions.map((action) => (
            <Button key={action} type="primary" size="small">
              {action}
            </Button>
          ))}
        </Space>
      ),
    },
  ];

  const columnsMedia = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Preview',
      key: 'preview',
      render: (_, record) => (
        <div style={{ width: 120, height: 80, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {record.previewType === 'image' ? (
            <UploadOutlined style={{ fontSize: 24, color: '#333' }} />
          ) : (
            <PlayCircleOutlined style={{ fontSize: 24, color: '#333' }} />
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {record.actions.map((action) => (
            <Button key={action} type="primary" size="small">
              {action}
            </Button>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Content List</h1>
      
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ color: '#1890ff', margin: '20px 0' }}>Texts</h2>
        <Table dataSource={textsData} columns={columnsTexts} pagination={false} />
      </div>

      <div>
        <h2 style={{ color: '#1890ff', margin: '20px 0' }}>Videos and Images</h2>
        <Table dataSource={mediaData} columns={columnsMedia} pagination={false} />
      </div>
    </div>
  );
};

export default ContentList;