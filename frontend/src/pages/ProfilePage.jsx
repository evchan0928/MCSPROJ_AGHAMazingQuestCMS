import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Divider, Avatar } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined } from '@ant-design/icons';
import { getUserProfile, updateUserProfile } from '../api/django-api';

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the backend
      // For now, we'll simulate with data from localStorage or default values
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      setUserData(storedUser);
      form.setFieldsValue({
        username: storedUser.username || '',
        email: storedUser.email || '',
        firstName: storedUser.firstName || '',
        lastName: storedUser.lastName || '',
        phone: storedUser.phone || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      message.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      
      // Update the user profile in the backend
      const updatedData = {
        ...userData,
        ...values
      };
      
      // In a real app, this would send data to the backend
      // updateUserProfile(updatedData);
      
      // Update local storage
      localStorage.setItem('currentUser', JSON.stringify(updatedData));
      setUserData(updatedData);
      
      message.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-container">
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#409EFF', marginRight: '16px' }} />
            <div>
              <h2>User Profile</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>Manage your personal information</p>
            </div>
          </div>
        }
        style={{ marginBottom: '20px' }}
      >
        <Divider orientation="left">Personal Information</Divider>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          initialValues={{
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter username" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Enter email" />
            </Form.Item>

            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: 'Please enter your first name' }]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Please enter your last name' }]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { pattern: /^\+?[0-9\s\-().]+$/, message: 'Please enter a valid phone number' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
            </Form.Item>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<EditOutlined />}
              style={{ marginTop: '10px' }}
            >
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Account Security">
        <Divider orientation="left">Change Password</Divider>
        <Form layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[{ required: true, message: 'Please enter your current password' }]}
            >
              <Input.Password placeholder="Enter current password" />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmNewPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              icon={<EditOutlined />}
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;