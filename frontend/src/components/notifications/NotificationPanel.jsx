import React, { useState, useEffect } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Badge, List, Tabs, Button, Space } from 'antd';
import { getNotifications } from '../../api/django-api';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const renderNotificationItem = (item) => (
    <List.Item>
      <div className="notification-item">
        <strong>{item.title}</strong>
        <p>{item.message}</p>
        <small>{new Date(item.created_at || item.timestamp).toLocaleString()}</small>
        {item.priority && (
          <span style={{ color: item.priority === 'high' ? 'red' : 'orange', marginLeft: '8px' }}>
            [{item.priority}]
          </span>
        )}
      </div>
    </List.Item>
  );

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : activeTab === 'high' 
      ? notifications.filter(n => n.priority === 'high') 
      : notifications.filter(n => n.priority === 'medium');

  return (
    <div className="notification-panel" style={{ width: 300, padding: '16px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Badge count={notifications.length} overflowCount={99}>
          <BellOutlined style={{ fontSize: '20px', color: '#409EFF' }} />
        </Badge>
        <span style={{ fontWeight: 'bold' }}>Notifications</span>
        <Button 
          size="small" 
          onClick={() => {
            const fetchNotifications = async () => {
              try {
                const data = await getNotifications();
                setNotifications(data);
              } catch (error) {
                console.error('Error fetching notifications:', error);
              }
            };
            fetchNotifications();
          }}
        >
          Refresh
        </Button>
      </div>
      
      <Tabs 
        defaultActiveKey="all" 
        onChange={handleTabChange}
        size="small"
      >
        <Tabs.TabPane tab={`All (${notifications.length})`} key="all" />
        <Tabs.TabPane tab={`High (${notifications.filter(n => n.priority === 'high').length})`} key="high" />
        <Tabs.TabPane tab={`Medium (${notifications.filter(n => n.priority === 'medium').length})`} key="medium" />
      </Tabs>
      
      <List
        dataSource={filteredNotifications}
        loading={loading}
        renderItem={renderNotificationItem}
        style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '8px' }}
        locale={{ 
          emptyText: 'No notifications' 
        }}
      />
      
      {notifications.length > 0 && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <Button 
            type="primary" 
            block
            onClick={() => window.location.href = '/dashboard/notifications'}
          >
            View All Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;