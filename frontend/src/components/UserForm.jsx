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
        ? initial.roles.map(r => typeof r === 'string' ? r : (r && r.name) || (r && r.role_name) || '')
        : [];
      
      form.setFieldsValue({
        ...initial,
        roles: normalizedRoles.filter(r => r !== ''), // Only include non-empty role names
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
      
      // Process roles to ensure they're in the correct format
      if (Array.isArray(payload.roles)) {
        // Ensure roles are sent as an array of role names (strings)
        payload.roles = payload.roles.map(role => 
          typeof role === 'object' && role !== null ? 
            (role.name || role.role_name || role.id) : 
          typeof role === 'string' ? 
            role : 
          String(role)
        ).filter(role => role !== ''); // Remove any empty role values
      }
      
      // Don't send password if it's empty (unless we're creating a user)
      if (!payload.password) {
        if (isUpdate) {
          delete payload.password; // Don't send empty password when updating
        }
      }
      
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
                rules={!initial?.id ? [{ required: true, message: 'Please enter a password' }] : []}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder={initial?.id ? "New Password (leave blank to keep current)" : "Password"} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roles"
                label="Roles"
                tooltip="Assign roles to the user for permission management"
              >
                <Select 
                  mode="multiple"
                  placeholder="Select roles"
                  prefix={<SafetyCertificateOutlined />}
                >
                  {roles.map((role, index) => (
                    <Option key={index} value={typeof role === 'string' ? role : (role?.name || role?.role_name || role)}>
                      {typeof role === 'string' ? role : (role?.name || role?.role_name || role)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="is_active"
                label="Status"
                valuePropName="checked"
              >
                <Checkbox>Active</Checkbox>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="is_staff"
                label="Staff"
                valuePropName="checked"
              >
                <Checkbox>Staff User</Checkbox>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="is_superuser"
                label="Superuser"
                valuePropName="checked"
              >
                <Checkbox>Superuser</Checkbox>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              {initial?.id ? 'Update User' : 'Create User'}
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