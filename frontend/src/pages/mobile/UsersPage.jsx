import React, { useEffect, useState } from 'react';
import { Card, Table, Spin } from 'antd';
import { getUsersPlaceholder } from '../../api/firebase-placeholder';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Display Name', dataIndex: 'displayName', key: 'displayName' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Coins', dataIndex: 'coins', key: 'coins' },
  { title: 'Energy', dataIndex: 'energy', key: 'energy' },
  { title: 'Total Score', dataIndex: 'totalScore', key: 'totalScore' },
  { title: 'Games Played', dataIndex: 'gamesPlayed', key: 'gamesPlayed' }
];

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUsersPlaceholder();
        setUsers(Array.isArray(data) ? data : (data.results || []));
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="content-list-page">
      <Card>
        <h2>Users</h2>
        <p>Placeholder users synced from Firebase schema.</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : (
          <Table rowKey="id" dataSource={users} columns={columns} />
        )}
      </Card>
    </div>
  );
};

export default UsersPage;
