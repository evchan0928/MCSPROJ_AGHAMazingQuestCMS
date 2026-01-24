import { BellOutlined } from '@ant-design/icons';
import { Badge, List, Spin, Tabs } from 'antd';
import axios from 'axios';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications/', {
          params: { priority: activeTab === 'all' ? undefined : activeTab }
        });
        setNotifications(response.data);
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
        <small>{new Date(item.timestamp).toLocaleString()}</small>
        {item.priority && (
          <span style={{ color: item.priority === 'high' ? 'red' : 'orange', marginLeft: '8px' }}>
            [{item.priority}]
          </span>
        )}
      </div>
    </List.Item>
  );

  return (
    <div className="notification-panel">
      <Badge count={notifications.length} overflowCount={99}>
        <BellOutlined style={{ fontSize: '24px', color: '#409EFF' }} />
      </Badge>
      <Tabs 
        defaultActiveKey="all" 
        onChange={handleTabChange}
        tabBarStyle={{ marginBottom: '8px' }}
      >
        <Tabs.TabPane tab="All" key="all" />
        <Tabs.TabPane tab="High Priority" key="high" />
        <Tabs.TabPane tab="Medium Priority" key="medium" />
      </Tabs>
      <List
        dataSource={notifications}
        loading={loading}
        renderItem={renderNotificationItem}
      />
    </div>
  );
};

export default NotificationPanel;