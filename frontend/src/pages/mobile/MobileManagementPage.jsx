import React from 'react';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import { UserOutlined, TrophyOutlined, StarOutlined, TeamOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const MobileManagementPage = () => {
  return (
    <div className="content-list-page">
      <Card className="card">
        <div style={{ marginBottom: 24 }}>
          <h2 className="card-title">Mobile Management Dashboard</h2>
          <p>Manage all aspects of the mobile application and its users.</p>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Link to="/dashboard/mobile/profiles">
              <Card>
                <Statistic
                  title="User Profiles"
                  value={128}
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
                  value={24}
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
                  value={1247}
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
                  value={56}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Link>
          </Col>
        </Row>

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