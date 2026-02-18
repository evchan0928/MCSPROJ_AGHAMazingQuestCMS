import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, message } from 'antd';

const AuthTokensPage = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define columns for the table
  const columns = [
    {
      title: 'User',
      dataIndex: ['user', 'username'],
      key: 'user',
    },
    {
      title: 'Token',
      dataIndex: 'token',
      key: 'token',
      ellipsis: true,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Expires At',
      dataIndex: 'expires_at',
      key: 'expires_at',
    },
    {
      title: 'Status',
      key: 'is_active',
      render: (_, record) => (
        <Tag color={record.is_active ? 'green' : 'red'}>
          {record.is_active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">Revoke</Button>
          <Button type="link" size="small" danger>Remove</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    // In the future, replace this with actual API call
    // const fetchData = async () => {
    //   try {
    //     const data = await getAuthTokens();
    //     setTokens(data.results || data);
    //     setLoading(false);
    //   } catch (error) {
    //     console.error("Error fetching auth tokens:", error);
    //     setLoading(false);
    //     message.error("Failed to load authentication tokens");
    //   }
    // };
    // fetchData();

    // For now, using mock data to demonstrate the UI
    setTimeout(() => {
      const mockTokens = [
        {
          id: 1,
          user: { username: 'mobile_user_1' },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          created_at: '2023-01-15 10:30:00',
          expires_at: '2023-02-15 10:30:00',
          is_active: true,
        },
        {
          id: 2,
          user: { username: 'mobile_user_2' },
          token: 'ZSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          created_at: '2023-01-20 14:45:00',
          expires_at: '2023-02-20 14:45:00',
          is_active: true,
        },
      ];
      setTokens(mockTokens);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="content-list-page">
      <Card className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 className="card-title">Mobile Management</h2>
            <h3 className="section-title">Authentication Tokens</h3>
            <p>Manage authentication tokens for the mobile application.</p>
          </div>
          <Button type="primary">Generate Token</Button>
        </div>
        <Table 
          dataSource={tokens} 
          columns={columns} 
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default AuthTokensPage;