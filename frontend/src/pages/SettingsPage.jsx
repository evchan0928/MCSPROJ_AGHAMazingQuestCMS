import React, { useState } from 'react';
import { Card, Form, Input, Switch, Select, Button, message, Divider, Alert } from 'antd';
import { 
  SettingOutlined, 
  BellOutlined, 
  LockOutlined, 
  GlobalOutlined, 
  SafetyCertificateOutlined 
} from '@ant-design/icons';

const { Option } = Select;

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveSettings = async (values) => {
    try {
      setLoading(true);
      
      // In a real app, this would save settings to the backend
      // For now, we'll simulate saving to localStorage
      localStorage.setItem('userSettings', JSON.stringify(values));
      
      message.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page-container">
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SettingOutlined style={{ fontSize: '24px', color: '#409EFF', marginRight: '16px' }} />
            <div>
              <h2>Account Settings</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>Configure your account preferences</p>
            </div>
          </div>
        }
        style={{ marginBottom: '20px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveSettings}
          initialValues={{
            language: 'en',
            timezone: 'Asia/Manila',
            notifications: ['email', 'push'],
            privacy: 'private',
          }}
        >
          <Divider orientation="left">General Settings</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <Form.Item
              label="Language"
              name="language"
            >
              <Select placeholder="Select your language">
                <Option value="en">English</Option>
                <Option value="fil">Filipino</Option>
                <Option value="ceb">Cebuano</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Timezone"
              name="timezone"
            >
              <Select placeholder="Select your timezone">
                <Option value="Asia/Manila">Asia/Manila (GMT+8)</Option>
                <Option value="UTC">UTC</Option>
                <Option value="America/New_York">America/New_York (EST)</Option>
              </Select>
            </Form.Item>
          </div>

          <Divider orientation="left">Notification Settings</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <Form.Item
              label="Enable Notifications"
              name="enableNotifications"
              valuePropName="checked"
            >
              <Switch 
                checked={notificationsEnabled} 
                onChange={setNotificationsEnabled} 
                checkedChildren="ON" 
                unCheckedChildren="OFF" 
              />
            </Form.Item>

            <Form.Item
              label="Notification Types"
              name="notifications"
            >
              <Select mode="multiple" placeholder="Select notification types">
                <Option value="email">Email</Option>
                <Option value="push">Push Notification</Option>
                <Option value="sms">SMS</Option>
              </Select>
            </Form.Item>
          </div>

          <Divider orientation="left">Privacy Settings</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <Form.Item
              label="Privacy Level"
              name="privacy"
            >
              <Select placeholder="Select privacy level">
                <Option value="public">Public</Option>
                <Option value="private">Private</Option>
                <Option value="friends">Friends Only</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Two-Factor Authentication"
              name="twoFactorAuth"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>

          <Divider orientation="left">Display Settings</Divider>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <Form.Item
              label="Dark Mode"
              name="darkMode"
              valuePropName="checked"
            >
              <Switch 
                checked={darkMode} 
                onChange={setDarkMode} 
                checkedChildren="ON" 
                unCheckedChildren="OFF" 
              />
            </Form.Item>

            <Form.Item
              label="Compact Mode"
              name="compactMode"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SettingOutlined />}
              style={{ marginTop: '10px' }}
            >
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Security Settings">
        <Alert
          message="Important Security Information"
          description="Review and update your security settings regularly to protect your account."
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4><LockOutlined style={{ marginRight: '8px' }} /> Active Sessions</h4>
            <p>Your account is currently signed in on 1 device.</p>
            <Button size="small">Manage Sessions</Button>
          </div>
          
          <div>
            <h4><SafetyCertificateOutlined style={{ marginRight: '8px' }} /> Two-Factor Authentication</h4>
            <p>Add an extra layer of security to your account.</p>
            <Button size="small">Enable 2FA</Button>
          </div>
          
          <div>
            <h4><GlobalOutlined style={{ marginRight: '8px' }} /> Connected Applications</h4>
            <p>Manage applications that have access to your account.</p>
            <Button size="small">Manage Apps</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;