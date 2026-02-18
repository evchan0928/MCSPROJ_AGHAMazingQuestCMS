import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Select, message } from 'antd';
import { getLeaderboards } from '../../api/django-api';

const { Option } = Select;

const LeaderboardPage = () => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  // Define columns for the table
  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      sorter: (a, b) => a.rank - b.rank,
    },
    {
      title: 'User',
      dataIndex: ['user', 'username'],
      key: 'user',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Period Start',
      dataIndex: 'period_start',
      key: 'period_start',
    },
    {
      title: 'Period End',
      dataIndex: 'period_end',
      key: 'period_end',
    },
  ];

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const data = await getLeaderboards();
      setLeaderboards(data.results || data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
      setLoading(false);
      message.error("Failed to load leaderboards");
    }
  };

  const handleCategoryChange = (value) => {
    setFilterCategory(value);
  };

  // Filter leaderboards based on selected category
  const filteredLeaderboards = filterCategory === 'all' 
    ? leaderboards 
    : leaderboards.filter(item => item.category === filterCategory);

  // Get unique categories for the filter dropdown
  const categories = [...new Set(leaderboards.map(item => item.category).filter(Boolean))];

  return (
    <div className="content-list-page">
      <Card className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 className="card-title">Mobile Management</h2>
            <h3 className="section-title">Leaderboard</h3>
            <p>Manage and view leaderboards for the mobile application.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Select 
              defaultValue="all" 
              style={{ width: 150 }} 
              onChange={handleCategoryChange}
              placeholder="Filter by category"
            >
              <Option value="all">All Categories</Option>
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
            <Button type="primary">Refresh Leaderboard</Button>
          </div>
        </div>
        <Table 
          dataSource={filteredLeaderboards} 
          columns={columns} 
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default LeaderboardPage;