import React from 'react';
import { Table, Button, Space } from 'antd';
import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined, PlayCircleOutlined } from '@ant-design/icons';

const ContentList = () => {
  const textsData = [
    {
      id: 1998498,
      title: 'Image Marker to align with the building heritage of the DOST...',
    },
    {
      id: 1998499,
      title: 'A marker that signifies the historical event and bravery of...',
    },
    {
      id: 19984100,
      title: 'There\'s A Message in The Suspension Spree...',
    },
  ];

  const videosAndImagesData = [
    {
      id: 1998496,
      title: 'AR Marker Image',
      preview: <UploadOutlined />,
    },
    {
      id: 1998497,
      title: 'AR Marker Video',
      preview: <PlayCircleOutlined />,
    },
  ];

  const columnsTexts = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 300,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
          <Button type="default" size="middle" icon={<EditOutlined />}>
            Edit
          </Button>
          <Button type="primary" size="middle" icon={<CheckCircleOutlined />}>
            Approve
          </Button>
          <Button type="default" size="middle" icon={<CloseCircleOutlined />}>
            Reject
          </Button>
          <Button type="primary" size="middle" icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
            Publish
          </Button>
          <Button type="default" size="middle" danger icon={<CloseCircleOutlined />}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const columnsVideosAndImages = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Preview',
      dataIndex: 'preview',
      key: 'preview',
      render: (text) => (
        <div style={{ width: '100px', height: '60px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {text}
        </div>
      ),
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
          <Button type="default" size="middle" icon={<EditOutlined />}>
            Edit
          </Button>
          <Button type="primary" size="middle" icon={<CheckCircleOutlined />}>
            Approve
          </Button>
          <Button type="default" size="middle" icon={<CloseCircleOutlined />}>
            Reject
          </Button>
          <Button type="primary" size="middle" icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
            Publish
          </Button>
          <Button type="default" size="middle" danger icon={<CloseCircleOutlined />}>
            Delete
          </Button>
        </div>
      ),
      width: 300,
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', maxWidth: '100%', overflowX: 'auto' }}>
      <h2 style={{ color: '#002a6c', marginBottom: '24px' }}>Content List</h2>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ color: '#002a6c', fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Texts</h3>
        <Table 
          dataSource={textsData} 
          columns={columnsTexts} 
          pagination={false}
          tableLayout="fixed"
        />
      </div>

      <div>
        <h3 style={{ color: '#002a6c', fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Videos and Images</h3>
        <Table 
          dataSource={videosAndImagesData} 
          columns={columnsVideosAndImages} 
          pagination={false}
          tableLayout="fixed"
        />
      </div>
    </div>
  );
};

export default ContentList;