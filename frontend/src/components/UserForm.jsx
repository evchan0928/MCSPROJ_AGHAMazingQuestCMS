import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Divider, Select, notification } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { createUser, updateUser } from '../api/django-api'; // Import the API functions
import '../pages/ContentManagementPage.css'; // Import the CSS file from pages directory

const { Option } = Select;

export default function UserForm({ user, roles = [], onDone, onCancel }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (message, description, type) => {
    api[type]({
      message: message,
      description: description,
      placement: 'topRight',
    });
  };

  // Set initial values when user prop changes
  useEffect(() => {
    if (user && user.id) {
      // Transform roles to match expected format
      const formattedRoles = user.roles?.map(role => 
        typeof role === 'string' ? role : (role?.name || role?.role_name || '')
      ) || [];
      
      form.setFieldsValue({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        roles: formattedRoles,
        password: '' // Don't populate existing passwords for security
      });
    } else {
      form.setFieldsValue({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        roles: [],
        password: ''
      });
    }
  }, [user, form]);

  const submit = async (values) => {
    setSaving(true);
    
    try {
      // Transform roles to the expected format for the API
      const transformedValues = {
        ...values,
        roles: values.roles?.map(roleName => ({ name: roleName })) || []
      };
      
      if (user && user.id) {
        // Update existing user
        await updateUser(user.id, transformedValues);
        openNotification('Success', `User "${values.username}" updated successfully`, 'success');
      } else {
        // Create new user
        await createUser(transformedValues);
        openNotification('Success', `User "${values.username}" created successfully`, 'success');
      }
      
      onDone();
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || 'An error occurred';
      openNotification('Error', `Failed to ${user && user.id ? 'update' : 'create'} user: ${errorMessage}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Card 
        title={user && user.id ? `Edit User: ${user.username || user.email}` : 'Add New User'} 
        className="user-form-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          initialValues={{
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            roles: [],
            password: ''
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please enter a username' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Username" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter an email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="First Name"
              >
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Last Name"
              >
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={!user?.id ? [{ required: true, message: 'Please enter a password' }] : []}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder={user?.id ? "New Password (leave blank to keep current)" : "Password"} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roles"
                label="Roles"
                tooltip="Assign roles to the user for permission management"
                rules={[{ required: true, message: 'Please assign at least one role' }]}
              >
                <Select 
                  mode="multiple"
                  placeholder="Select roles"
                  // Use the roles passed from props
                  options={roles.map((role, index) => ({
                    label: typeof role === 'string' ? role : (role?.name || role?.role_name || ''),
                    value: typeof role === 'string' ? role : (role?.name || role?.role_name || '')
                  }))}
                >
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              {user?.id ? 'Update User' : 'Create User'}
            </Button>
            {onCancel && (
              <Button style={{ marginLeft: 8 }} onClick={onCancel}>
                Cancel
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}