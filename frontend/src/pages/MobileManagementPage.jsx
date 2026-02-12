import React, { useEffect, useState } from 'react';
import { Tabs, Card, Table, Row, Col, Button, Statistic, notification } from 'antd';
import { getMobileProfiles, getMobileScores, postMobileScore, getMobileLeaderboard, getMobileBadges, getMobileSessions, getMobileOtps } from '../api/django-api';
import './ContentManagementPage.css';

const { TabPane } = Tabs;

export default function MobileManagementPage() {
  const [profiles, setProfiles] = useState([]);
  const [scores, setScores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [otps, setOtps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Leaderboard is public — fetch it first so the page shows useful data
      // even when the admin isn't authenticated in the frontend.
      try {
        const l = await getMobileLeaderboard();
        // API may return { leaderboard: [...] } with fields like { user_id, username, total }
        const raw = Array.isArray(l) ? l : (l && l.leaderboard ? l.leaderboard : []);
        const mapped = raw.map((item, idx) => ({
          rank: item.rank || (idx + 1),
          username: item.username || item.user || item.name,
          score: item.score || item.total || item.points || 0,
        }));
        setLeaderboard(mapped);
      } catch (e) {
        // Non-fatal: show notification but continue
        api.error({ message: 'Leaderboard load failed', description: e.message || String(e) });
        setLeaderboard([]);
      }

      // Fetch protected endpoints individually so a single 401/500 doesn't
      // prevent other data from displaying. Normalize responses to arrays
      // because some backend endpoints return objects like { results: [...] }
      // or { profiles: [...] }.
      const toArray = (v) => Array.isArray(v) ? v : (v && (v.results || v.profiles || v.leaderboard || v.items || [])) || [];

      try { const p = await getMobileProfiles(); setProfiles(toArray(p)); } catch (e) { setProfiles([]); }
      try { const s = await getMobileScores(); setScores(toArray(s)); } catch (e) { setScores([]); }
      try { const b = await getMobileBadges(); setBadges(toArray(b)); } catch (e) { setBadges([]); }
      try { const se = await getMobileSessions(); setSessions(toArray(se)); } catch (e) { setSessions([]); }
      try { const o = await getMobileOtps(); setOtps(toArray(o)); } catch (e) { setOtps([]); }
    } catch (err) {
      console.error(err);
      api.error({ message: 'Error', description: err.message || String(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const columnsProfiles = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Display Name', dataIndex: 'display_name', key: 'display_name' },
  ];

  const columnsScores = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'User', dataIndex: 'user', key: 'user', render: u => u?.username || u },
    { title: 'Score', dataIndex: 'score', key: 'score' },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at' },
  ];

  const columnsLeader = [
    { title: 'Rank', dataIndex: 'rank', key: 'rank' },
    { title: 'User', dataIndex: 'username', key: 'username' },
    { title: 'Score', dataIndex: 'score', key: 'score' },
  ];

  const columnsBadges = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
  ];

  const columnsSessions = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'User', dataIndex: 'user', key: 'user', render: u => u?.username || u },
    { title: 'Started', dataIndex: 'started_at', key: 'started_at' },
  ];

  const columnsOtps = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Used', dataIndex: 'used', key: 'used', render: v => v ? 'Yes' : 'No' },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at' },
  ];

  return (
    <div style={{ padding: 20 }}>
      {contextHolder}
      <div className="page-header">
        <h1 className="page-title">Mobile Management</h1>
        <p className="page-description">View and manage mobile app data (profiles, scores, badges, sessions, OTPs)</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="Profiles" value={profiles.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="Scores" value={scores.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="Leaderboard" value={leaderboard.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="Badges" value={badges.length} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="profiles">
        <TabPane tab="Profiles" key="profiles">
          <Card>
            <Table rowKey="id" dataSource={profiles} columns={columnsProfiles} loading={loading} pagination={{ pageSize: 10 }} />
          </Card>
        </TabPane>

        <TabPane tab="Scores" key="scores">
          <Card>
            <Table rowKey="id" dataSource={scores} columns={columnsScores} loading={loading} pagination={{ pageSize: 10 }} />
          </Card>
        </TabPane>

        <TabPane tab="Leaderboard" key="leaderboard">
          <Card>
            <Table rowKey={record => record.username} dataSource={leaderboard} columns={columnsLeader} loading={loading} pagination={false} />
          </Card>
        </TabPane>

        <TabPane tab="Badges" key="badges">
          <Card>
            <Table rowKey="id" dataSource={badges} columns={columnsBadges} loading={loading} pagination={{ pageSize: 10 }} />
          </Card>
        </TabPane>

        <TabPane tab="Sessions" key="sessions">
          <Card>
            <Table rowKey="id" dataSource={sessions} columns={columnsSessions} loading={loading} pagination={{ pageSize: 10 }} />
          </Card>
        </TabPane>

        <TabPane tab="OTPs" key="otps">
          <Card>
            <Table rowKey="id" dataSource={otps} columns={columnsOtps} loading={loading} pagination={{ pageSize: 10 }} />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}
