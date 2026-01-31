import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Checkbox, Button, Row, Col, Card, Divider, notification } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { createUser, updateUser } from '../api/django-api'; // Import the API functions

const { Option } = Select;

export default function UserForm({ user: initial, roles = [], onCancel, onSaved, onDone }) {
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

  useEffect(() => {
    // Set initial values for the form
    if (initial) {
      // Normalize roles to an array of role names
      const normalizedRoles = Array.isArray(initial.roles) 
        ? initial.roles.map(r => typeof r === 'string' ? r : (r && r.name) || '')
        : [];
      
      form.setFieldsValue({
        ...initial,
        roles: normalizedRoles,
      });
    } else {
      // Set default values for new user
      form.setFieldsValue({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        is_active: true,
        is_staff: false,
        is_superuser: false,
        roles: [],
        password: ''
      });
    }
  }, [initial, form]);

  const submit = async (values) => {
    setSaving(true);
    try {
      // Determine if we're creating or updating
      const isUpdate = initial && initial.id;
      
      // Prepare the payload
      const payload = { ...values };
      if (!payload.password) delete payload.password;
      
      let result;
      if (isUpdate) {
        // Update existing user
        result = await updateUser(initial.id, payload);
      } else {
        // Create new user
        result = await createUser(payload);
      }
      
      // Call saved/done callbacks
      if (onSaved) onSaved(result);
      else if (onDone) onDone(result);
      
      openNotification(
        'Success', 
        `User ${isUpdate ? 'updated' : 'created'} successfully`, 
        'success'
      );
    } catch (err) {
      console.error(`Failed to ${initial && initial.id ? 'update' : 'create'} user:`, err);
      openNotification(
        'Error', 
        `Failed to ${initial && initial.id ? 'update' : 'create'} user: ${err.message}`, 
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Card 
        title={initial && initial.id ? "Edit User" : "Add New User"} 
        style={{ marginBottom: '20px' }}
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
            is_active: true,
            is_staff: false,
            is_superuser: false,
            roles: [],
            password: initial && initial.id ? '' : '' // Only require password for new users
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please input the username!' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Enter username" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input the email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Enter email" 
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
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Last Name"
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label={initial && initial.id ? "New Password (optional)" : "Password"}
                rules={!initial || !initial.id ? [{ required: true, message: 'Please input the password!' }] : []}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder={initial && initial.id ? "Leave blank to keep current password" : "Enter password"} 
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">User Status & Permissions</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="is_active" 
                valuePropName="checked"
                label="Active"
              >
                <Checkbox>Account Active</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="is_staff" 
                valuePropName="checked"
                label="Staff"
              >
                <Checkbox>Staff Status</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="is_superuser" 
                valuePropName="checked"
                label="Superuser"
              >
                <Checkbox>Superuser Status</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">User Roles</Divider>
          
          <Form.Item
            name="roles"
            label="Assign Roles"
          >
            <Select
              mode="multiple"
              placeholder="Select roles for this user"
              style={{ width: '100%' }}
              prefix={<SafetyCertificateOutlined />}
            >
              {roles.map(role => (
                <Option key={role.name} value={role.name}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <Button 
                type="default" 
                onClick={() => { 
                  if (onCancel) onCancel(); 
                  else if (onDone) onDone(); 
                }} 
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving}
              >
                {saving ? 'Saving...' : (initial && initial.id ? 'Update User' : 'Create User')}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}