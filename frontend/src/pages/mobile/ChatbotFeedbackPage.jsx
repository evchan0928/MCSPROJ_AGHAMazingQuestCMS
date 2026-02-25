import React, { useEffect, useState } from 'react';
import { Card, Table, Spin } from 'antd';
import { getChatbotFeedback } from '../../api/firebase-placeholder';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'User ID', dataIndex: 'userId', key: 'userId' },
  { title: 'Username', dataIndex: 'username', key: 'username' },
  { title: 'Feedback', dataIndex: 'feedback', key: 'feedback' },
  { title: 'Rating', dataIndex: 'rating', key: 'rating' },
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' }
];

const ChatbotFeedbackPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getChatbotFeedback();
        setData(res);
      } catch (err) {
        console.error('Error loading chatbot feedback:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="content-list-page">
      <Card>
        <h2>Chatbot Feedback</h2>
        <p>Placeholder view for chatbot feedback stored in Firebase.</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : (
          <Table rowKey="id" dataSource={data} columns={columns} />
        )}
      </Card>
    </div>
  );
};

export default ChatbotFeedbackPage;
