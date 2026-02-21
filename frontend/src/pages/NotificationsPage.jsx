import React, { useState, useEffect } from 'react';
import { 
  BellOutlined, 
  CheckOutlined, 
  CheckCircleOutlined, 
  CloseOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { 
  Card, 
  List, 
  Tabs, 
  Tag, 
  Button, 
  Space, 
  Badge, 
  Divider,
  message 
} from 'antd';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/django-api';

const { TabPane } = Tabs;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeTab, filterPriority]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Filter by read/unread status based on active tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (activeTab === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      message.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      message.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      message.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      message.error('Failed to mark all notifications as read');
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handlePriorityFilterChange = (priority) => {
    setFilterPriority(priority);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'gray';
      default: return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Normal';
    }
  };

  const renderNotificationItem = (item) => (
    <List.Item
      key={item.id}
      actions={[
        !item.is_read ? (
          <Button 
            type="link" 
            icon={<CheckOutlined />}
            onClick={() => handleMarkAsRead(item.id)}
            disabled={item.is_read}
          >
            Mark as Read
          </Button>
        ) : (
          <Tag color="green">Read</Tag>
        )
      ]}
      style={{
        backgroundColor: item.is_read ? '#f9f9f9' : '#fff9db',
        borderLeft: item.priority === 'high' ? '4px solid red' : 
                   item.priority === 'medium' ? '4px solid orange' : 
                   item.priority === 'low' ? '4px solid gray' : '4px solid #1890ff',
      }}
    >
      <List.Item.Meta
        avatar={<Badge dot={!item.is_read} offset={[0, 0]}><BellOutlined style={{ fontSize: '20px', color: '#1890ff' }} /></Badge>}
        title={
          <Space>
            <span style={{ fontWeight: item.is_read ? 'normal' : 'bold' }}>
              {item.title || 'Notification'}
            </span>
            <Tag color={getPriorityColor(item.priority)} style={{ textTransform: 'capitalize' }}>
              {getPriorityText(item.priority)}
            </Tag>
            {item.is_read && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
          </Space>
        }
        description={
          <div>
            <div>{item.message}</div>
            <small style={{ color: '#888' }}>{new Date(item.created_at || item.timestamp).toLocaleString()}</small>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <div className="notifications-page">
      <Card className="notifications-card">
        <div className="notifications-header">
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BellOutlined style={{ color: '#1890ff' }} />
            Notifications Center
          </h2>
          <div className="notifications-actions">
            <Button 
              icon={<CheckOutlined />} 
              onClick={handleMarkAllAsRead}
              disabled={notifications.filter(n => !n.is_read).length === 0}
            >
              Mark All as Read
            </Button>
          </div>
        </div>
        
        <Divider />
        
        <div className="notifications-filters">
          <Space wrap>
            <Button 
              type={filterPriority === 'all' ? 'primary' : 'default'}
              icon={<FilterOutlined />}
              onClick={() => handlePriorityFilterChange('all')}
            >
              All Priorities
            </Button>
            <Button 
              type={filterPriority === 'high' ? 'primary' : 'default'}
              danger
              onClick={() => handlePriorityFilterChange('high')}
            >
              High Priority
            </Button>
            <Button 
              type={filterPriority === 'medium' ? 'primary' : 'default'}
              style={{ borderColor: 'orange', color: 'orange' }}
              onClick={() => handlePriorityFilterChange('medium')}
            >
              Medium Priority
            </Button>
            <Button 
              type={filterPriority === 'low' ? 'primary' : 'default'}
              onClick={() => handlePriorityFilterChange('low')}
            >
              Low Priority
            </Button>
          </Space>
        </div>
        
        <Tabs 
          defaultActiveKey="all" 
          onChange={handleTabChange}
          style={{ marginTop: '16px' }}
        >
          <TabPane tab={`All (${notifications.length})`} key="all" />
          <TabPane tab={`Unread (${notifications.filter(n => !n.is_read).length})`} key="unread" />
          <TabPane tab={`Read (${notifications.filter(n => n.is_read).length})`} key="read" />
        </Tabs>
        
        <List
          dataSource={filteredNotifications}
          renderItem={renderNotificationItem}
          loading={loading}
          locale={{ 
            emptyText: 'No notifications to display' 
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} notifications`,
          }}
        />
      </Card>
    </div>
  );
};

export default NotificationsPage;