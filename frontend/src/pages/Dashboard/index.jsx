import { Menu, Layout, Card, Statistic, Row, Col, Tabs, Input, DatePicker, Select, Button, Table, Tag } from 'antd';
import { UserOutlined, DashboardOutlined, BarChartOutlined, TrendUpOutlined, TrophyOutlined, ClockCircleOutlined, PieChartOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;

class Dashboard extends Component {

  render() {
    return (
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <div className="logo" />
          <Menu mode="inline" defaultSelectedKeys={['1']} style={{ height: '100%', borderRight: 0 }}>
            <Menu.Item key="1" icon={<DashboardOutlined />}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="2" icon={<BarChartOutlined />}>
              Analytics Management
            </Menu.Item>
            <Menu.Item key="3" icon={<TrophyOutlined />}>
              Leaderboards
            </Menu.Item>
            <Menu.Item key="4" icon={<ClockCircleOutlined />}>
              Time Analytics
            </Menu.Item>
            <Menu.Item key="5" icon={<PieChartOutlined />}>
              Trivia Analytics
            </Menu.Item>
            <Menu.Item key="6" icon={<TrendUpOutlined />}>
              Performance Trends
            </Menu.Item>
          </Menu>
        </Sider>
        
        <Layout>
          <Header style={{ padding: 0, background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
              <h1 style={{ margin: 0, color: '#000' }}>Dashboard</h1>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Select defaultValue="DOST-STII" style={{ width: 180 }}>
                  <Select.Option value="DOST-STII">DOST-STII</Select.Option>
                  <Select.Option value="DOST-III">DOST-III</Select.Option>
                  <Select.Option value="DOST-IV">DOST-IV</Select.Option>
                </Select>
                <Button type="primary">Export</Button>
              </div>
            </div>
          </Header>
          
          <Content style={{ padding: '24px', background: '#fff' }}>
            {/* ... existing content ... */}
          </Content>
        </Layout>
      </Layout>
    );
  }
}