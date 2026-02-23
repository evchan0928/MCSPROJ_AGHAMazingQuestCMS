import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Spin } from 'antd';
import { UserOutlined, TrophyOutlined, StarOutlined, TeamOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getMobileStatistics } from '../../api/django-api';

const MobileManagementPage = () => {
  const [stats, setStats] = useState({
    total_user_profiles: 0,
    active_sessions: 0,
    total_score_records: 0,
    total_badges_earned: 0,
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
              <Link to="/dashboard/mobile/profiles">
                <Card>
                  <Statistic
                    title="User Profiles"
                    value={stats.total_user_profiles || 0}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Link to="/dashboard/mobile/sessions">
                <Card>
                  <Statistic
                    title="Active Sessions"
                    value={stats.active_sessions || 0}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Link to="/dashboard/mobile/scores">
                <Card>
                  <Statistic
                    title="Total Scores"
                    value={stats.total_score_records || 0}
                    prefix={<StarOutlined />}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Link to="/dashboard/mobile/badges">
                <Card>
                  <Statistic
                    title="Badges Earned"
                    value={stats.total_badges_earned || 0}
                    prefix={<TrophyOutlined />}
                  />
                </Card>
              </Link>
            </Col>
          </Row>
        )}

        <div style={{ marginTop: 24 }}>
          <h3 className="section-title">Quick Actions</h3>
          <Space wrap>
            <Link to="/dashboard/mobile/profiles">
              <Button type="primary">Manage User Profiles</Button>
            </Link>
            <Link to="/dashboard/mobile/leaderboards">
              <Button type="default">View Leaderboards</Button>
            </Link>
            <Link to="/dashboard/mobile/sessions">
              <Button type="default">Active Sessions</Button>
            </Link>
            <Link to="/dashboard/mobile/scores">
              <Button type="default">View Scores</Button>
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default MobileManagementPage;