import React, { useEffect, useState } from 'react';
import { Card, Table, Spin } from 'antd';
import { getPlayerStats } from '../../api/firebase-placeholder';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'User ID', dataIndex: 'userId', key: 'userId' },
  { title: 'Game Type', dataIndex: 'gameType', key: 'gameType' },
  { title: 'Score', dataIndex: 'scoreEarned', key: 'scoreEarned' },
  { title: 'Correct', dataIndex: 'correctAnswers', key: 'correctAnswers' },
  { title: 'Wrong', dataIndex: 'wrongAnswers', key: 'wrongAnswers' },
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' }
];

const PlayerStatsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPlayerStats();
        setData(res);
      } catch (err) {
        console.error('Error loading player stats:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="content-list-page">
      <Card>
        <h2>Player Stats</h2>
        <p>This page will sync with the Firebase mobile DB. Currently showing placeholder data.</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : (
          <Table rowKey="id" dataSource={data} columns={columns} />
        )}
      </Card>
    </div>
  );
};

export default PlayerStatsPage;
