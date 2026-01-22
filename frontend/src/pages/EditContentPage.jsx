import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Select, Upload, InputNumber } from 'antd';
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const EditContentPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContentDetails();
  }, [id]);

  const fetchContentDetails = async () => {
    try {
      // In a real implementation, this would fetch from the API
      // const token = localStorage.getItem('token');
      // const response = await axios.get(`/api/content/${id}/`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      // Mock data for demonstration
      const mockContent = {
        id: parseInt(id),
        title: `Content Title ${id}`,
        body: '<p>This is the content body for editing. It contains <strong>rich text formatting</strong> and can include <em>emphasis</em>, lists, and other HTML elements.</p>',
        status: 'draft',
        type: 'article',
        author: 'Current User',
        featuredImage: null,
        documents: [],
        videoUrl: '',
        tags: ['science', 'technology']
      };
      
      setContent(mockContent);
      form.setFieldsValue({
        title: mockContent.title,
        body: mockContent.body,
        status: mockContent.status,
        type: mockContent.type,
        videoUrl: mockContent.videoUrl,
        tags: mockContent.tags
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      message.error('Failed to load content details');
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      // In a real implementation, this would make an API call
      // const token = localStorage.getItem('token');
      // await axios.put(`/api/content/${id}/`, values, {
      //   headers: { 
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      
      message.success('Content updated successfully!');
      navigate('/dashboard/content/list'); // Redirect to content list after saving
    } catch (error) {
      console.error('Error updating content:', error);
      message.error('Failed to update content');
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/content/list');
  };

  if (loading && !content) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          style={{ marginRight: '16px', fontSize: '16px' }}
        />
        <h2 style={{ margin: 0, color: '#002a6c' }}>Edit Content</h2>
      </div>

      <Card title="Edit Content Details" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            title: content?.title || '',
            body: content?.body || '',
            status: content?.status || 'draft',
            type: content?.type || 'article',
            videoUrl: content?.videoUrl || '',
            tags: content?.tags || []
          }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input the content title!' }]}
          >
            <Input placeholder="Enter content title" />
          </Form.Item>

          <Form.Item
            label="Content Body"
            name="body"
          >
            <Editor
              apiKey="your-api-key" // In a real implementation, you'd use a proper TinyMCE API key
              init={{
                height: 400,
                menubar: false,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount'
                ],
                toolbar:
                  'undo redo | formatselect | bold italic backcolor | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help'
              }}
            />
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
          >
            <Select placeholder="Select content type">
              <Option value="article">Article</Option>
              <Option value="video">Video</Option>
              <Option value="image">Image Gallery</Option>
              <Option value="document">Document</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Featured Image"
            name="featuredImage"
          >
            <Upload maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Video URL"
            name="videoUrl"
          >
            <Input placeholder="Enter video URL (optional)" />
          </Form.Item>

          <Form.Item
            label="Documents"
            name="documents"
          >
            <Upload multiple beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Click to upload documents</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Tags"
            name="tags"
          >
            <Select
              mode="tags"
              placeholder="Add tags for categorization"
              style={{ width: '100%' }}
            >
              {/* Options are dynamically added as tags */}
            </Select>
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
          >
            <Select placeholder="Select status">
              <Option value="draft">Draft</Option>
              <Option value="review">For Review</Option>
              <Option value="approved">Approved</Option>
              <Option value="published">Published</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={saving}
                style={{ flex: 1 }}
              >
                Save Changes
              </Button>
              <Button 
                onClick={handleBack}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditContentPage;