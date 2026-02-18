import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message } from 'antd';
import { getUserProfiles, createUserProfile, updateUserProfile, deleteUserProfile } from '../../api/django-api';

const UserProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const columns = [
    {
      title: 'Username',
      dataIndex: ['user', 'username'],
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Bio',
      dataIndex: 'bio',
      key: 'bio',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  const fetchUserProfiles = async () => {
    try {
      const data = await getUserProfiles();
      setProfiles(data.results || data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      setLoading(false);
      message.error("Failed to load user profiles");
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserProfile(id);
      message.success("Profile deleted successfully");
      fetchUserProfiles(); // Refresh the list
    } catch (error) {
      console.error("Error deleting profile:", error);
      message.error("Failed to delete profile");
    }
  };

  const handleSave = async (values) => {
    try {
      if (editingRecord) {
        await updateUserProfile(editingRecord.id, values);
        message.success("Profile updated successfully");
      } else {
        await createUserProfile(values);
        message.success("Profile created successfully");
      }
      setIsModalVisible(false);
      setEditingRecord(null);
      fetchUserProfiles(); // Refresh the list
    } catch (error) {
      console.error("Error saving profile:", error);
      message.error("Failed to save profile");
    }
  };

  const showModal = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
  };

  return (
    <div className="content-list-page">
      <Card className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 className="card-title">Mobile Management</h2>
            <h3 className="section-title">User Profiles</h3>
            <p>Manage user profiles for the mobile application.</p>
          </div>
          <Button type="primary" onClick={showModal}>Add New Profile</Button>
        </div>
        <Table 
          dataSource={profiles} 
          columns={columns} 
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingRecord ? "Edit Profile" : "Add New Profile"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRecord(null);
        }}
        footer={null}
      >
        <Form
          initialValues={editingRecord || {}}
          onFinish={handleSave}
          layout="vertical"
        >
          <Form.Item name={['user', 'username']} label="Username" rules={[{ required: true }]}>
            <Input disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item name={['user', 'email']} label="Email" rules={[{ type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input />
          </Form.Item>
          <Form.Item name="bio" label="Bio">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfilesPage;