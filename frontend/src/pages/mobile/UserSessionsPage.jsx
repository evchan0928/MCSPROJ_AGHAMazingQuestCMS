import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, message } from 'antd';
import { getUserSessions } from '../../api/django-api';

const UserSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define columns for the table
  const columns = [
    {
      title: 'User',
      dataIndex: ['user', 'username'],
      key: 'user',
    },
    {
      title: 'Session Token',
      dataIndex: 'session_token',
      key: 'session_token',
      ellipsis: true,
    },
    {
      title: 'Device Info',
      dataIndex: 'device_info',
      key: 'device_info',
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    {
      title: 'Login Time',
      dataIndex: 'login_time',
      key: 'login_time',
    },
    {
      title: 'Last Activity',
      dataIndex: 'last_activity',
      key: 'last_activity',
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
          <Button type="link" size="small">View Details</Button>
          <Button type="link" size="small" danger>Terminate</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchUserSessions();
  }, []);

  const fetchUserSessions = async () => {
    try {
      const data = await getUserSessions();
      setSessions(data.results || data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      setLoading(false);
      message.error("Failed to load user sessions");
    }
  };

  return (
    <div className="content-list-page">
      <Card className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 className="card-title">Mobile Management</h2>
            <h3 className="section-title">User Sessions</h3>
            <p>Manage user sessions for the mobile application.</p>
          </div>
          <Button type="primary">Refresh</Button>
        </div>
        <Table 
          dataSource={sessions} 
          columns={columns} 
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default UserSessionsPage;