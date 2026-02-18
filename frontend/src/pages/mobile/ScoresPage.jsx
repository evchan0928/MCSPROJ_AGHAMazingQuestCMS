import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, message } from 'antd';
import { getScores } from '../../api/django-api';

const ScoresPage = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define columns for the table
  const columns = [
    {
      title: 'User',
      dataIndex: ['user', 'username'],
      key: 'user',
    },
    {
      title: 'Content Title',
      dataIndex: ['content_item', 'title'],
      key: 'content_title',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: 'Max Score',
      dataIndex: 'max_score',
      key: 'max_score',
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => (
        <Tag color={percentage >= 75 ? 'green' : percentage >= 50 ? 'orange' : 'red'}>
          {percentage}%
        </Tag>
      ),
    },
    {
      title: 'Attempts',
      dataIndex: 'attempts',
      key: 'attempts',
    },
    {
      title: 'Completed At',
      dataIndex: 'completed_at',
      key: 'completed_at',
    },
  ];

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const data = await getScores();
      setScores(data.results || data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching scores:", error);
      setLoading(false);
      message.error("Failed to load scores");
    }
  };

  return (
    <div className="content-list-page">
      <Card className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 className="card-title">Mobile Management</h2>
            <h3 className="section-title">Scores</h3>
            <p>Track and manage scores for the mobile application.</p>
          </div>
          <Button type="primary">Export Scores</Button>
        </div>
        <Table 
          dataSource={scores} 
          columns={columns} 
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default ScoresPage;