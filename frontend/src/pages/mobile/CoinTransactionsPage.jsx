import React, { useEffect, useState } from 'react';
import { Card, Table, Spin } from 'antd';
import { getCoinTransactions } from '../../api/firebase-placeholder';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'User ID', dataIndex: 'userId', key: 'userId' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount' },
  { title: 'Before', dataIndex: 'balanceBefore', key: 'balanceBefore' },
  { title: 'After', dataIndex: 'balanceAfter', key: 'balanceAfter' },
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Reason', dataIndex: 'reason', key: 'reason' },
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' }
];

const CoinTransactionsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCoinTransactions();
        setData(res);
      } catch (err) {
        console.error('Error loading coin transactions:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="content-list-page">
      <Card>
        <h2>Coin Transactions</h2>
        <p>Placeholder view for coin transactions stored in Firebase.</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : (
          <Table rowKey="id" dataSource={data} columns={columns} />
        )}
      </Card>
    </div>
  );
};

export default CoinTransactionsPage;
