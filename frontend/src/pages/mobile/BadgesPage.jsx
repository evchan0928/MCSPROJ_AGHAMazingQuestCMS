import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { getBadges, getUserBadges } from '../../api/django-api';

const BadgesPage = () => {
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('badges');

  const badgeColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Type',
      dataIndex: 'badge_type',
      key: 'badge_type',
    },
    {
      title: 'Points Value',
      dataIndex: 'points_value',
      key: 'points_value',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">Edit</Button>
          <Button type="link" size="small" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  const userBadgeColumns = [
    {
      title: 'User',
      dataIndex: ['user', 'username'],
      key: 'user',
    },
    {
      title: 'Badge Name',
      dataIndex: ['badge', 'name'],
      key: 'badge_name',
    },
    {
      title: 'Badge Description',
      dataIndex: ['badge', 'description'],
      key: 'badge_description',
    },
    {
      title: 'Earned At',
      dataIndex: 'earned_at',
      key: 'earned_at',
    },
    {
      title: 'Evidence',
      dataIndex: 'evidence',
      key: 'evidence',
    },
  ];

  useEffect(() => {
    fetchBadges();
    fetchUserBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const data = await getBadges();
      setBadges(data.results || data);
    } catch (error) {
      console.error("Error fetching badges:", error);
      message.error("Failed to load badges");
    }
  };

  const fetchUserBadges = async () => {
    try {
      const data = await getUserBadges();
      setUserBadges(data.results || data);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      message.error("Failed to load user badges");
    }
  };

  // Finalize loading state after both requests complete
  useEffect(() => {
    if (badges.length > 0 || userBadges.length > 0) {
      setLoading(false);
    }
  }, [badges, userBadges]);

  return (
    <div className="content-list-page">
      <Card className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 className="card-title">Mobile Management</h2>
            <h3 className="section-title">Badges</h3>
            <p>Create, assign, and track badges earned by users in the mobile application.</p>
          </div>
          <Button type="primary">Add New Badge</Button>
        </div>
        <Table 
          dataSource={activeTab === 'badges' ? badges : userBadges} 
          columns={activeTab === 'badges' ? badgeColumns : userBadgeColumns} 
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default BadgesPage;