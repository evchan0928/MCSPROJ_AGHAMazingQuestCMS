import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Spin } from 'antd';
import { UserOutlined, TrophyOutlined, StarOutlined, TeamOutlined, MessageOutlined, SwapOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getMobileStatistics } from '../../api/django-api';

const MobileManagementPage = () => {
  const [stats, setStats] = useState({
    total_player_stats: 0,
    active_sessions: 0,
    total_users: 0,
    total_feedback: 0,
    total_coin_transactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMobileStats();
  }, []);

  const fetchMobileStats = async () => {
    try {
      const data = await getMobileStatistics();
      setStats(data.statistics || {});
    } catch (error) {
      console.error('Error fetching mobile statistics:', error);
      // Set default values in case of error
      setStats({
        total_user_profiles: 0,
        active_sessions: 0,
        total_score_records: 0,
        total_badges_earned: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-list-page">
      <Card className="card">
        <div style={{ marginBottom: 24 }}>
          <h2 className="card-title">Mobile Management Dashboard</h2>
          <p>Manage all aspects of the mobile application and its users.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Link to="/dashboard/mobile/player-stats">
                <Card>
                  <Statistic
                    title="Player Stats"
                    value={stats.total_player_stats || 0}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Link to="/dashboard/mobile/sessions">
                <Card>
                  <Statistic
                    title="Sessions"
                    value={stats.active_sessions || 0}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Link to="/dashboard/mobile/users">
                <Card>
                  <Statistic
                    title="Users"
                    value={stats.total_users || 0}
                    prefix={<StarOutlined />}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Link to="/dashboard/mobile/chatbot-feedback">
                <Card>
                  <Statistic
                    title="Feedback"
                    value={stats.total_feedback || 0}
                    prefix={<MessageOutlined />}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Link to="/dashboard/mobile/coin-transactions">
                <Card>
                  <Statistic
                    title="Coin Txns"
                    value={stats.total_coin_transactions || 0}
                    prefix={<SwapOutlined />}
                  />
                </Card>
              </Link>
            </Col>
          </Row>
        )}

        <div style={{ marginTop: 24 }}>
          <h3 className="section-title">Quick Actions</h3>
          <Space wrap>
            <Link to="/dashboard/mobile/player-stats">
              <Button type="primary">Player Stats</Button>
            </Link>
            <Link to="/dashboard/mobile/sessions">
              <Button type="default">Sessions</Button>
            </Link>
            <Link to="/dashboard/mobile/users">
              <Button type="default">Users</Button>
            </Link>
            <Link to="/dashboard/mobile/chatbot-feedback">
              <Button type="default">Chatbot Feedback</Button>
            </Link>
            <Link to="/dashboard/mobile/coin-transactions">
              <Button type="default">Coin Transactions</Button>
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default MobileManagementPage;