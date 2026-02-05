import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Card, message, Spin, Select, Upload, Switch } from 'antd';
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { updateContentItem, getContentItems } from '../api/django-api';

const { Option } = Select;

const EditContentPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fileList, setFileList] = useState([]);

  const fetchContentDetails = useCallback(async () => {
    try {
      // Fetch the actual content from the API
      const contentList = await getContentItems();
      const item = contentList.find(c => c.id === parseInt(id));
      
      if (!item) {
        message.error('Content not found');
        navigate('/dashboard/content/list');
        return;
      }
      
      setContent(item);
      
      // Set form values
      form.setFieldsValue({
        title: item.title,
        body: item.body,
        status: item.status,
        content_type: item.content_type, // Changed to match the backend field
        meta_keywords: item.meta_keywords,
        meta_description: item.meta_description,
        photo_caption: item.photo_caption,
        highlights: item.highlights,
        ar_marker: item.ar_marker,
        quiz: item.quiz,
        enable_badges: item.enable_badges,
        chat_bot_allow: item.chat_bot_allow,
        exclude_audio: item.exclude_audio,
      });
      
      // Set file list if there's an attached file
      if (item.file) {
        setFileList([{
          uid: '-1',
          name: item.file.split('/').pop(),
          status: 'done',
          url: item.file_url,
        }]);
      }
    } catch (error) {
      message.error('Failed to load content details');
      console.error('Error fetching content details:', error);
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate]);

  // Handle file upload changes
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  useEffect(() => {
    fetchContentDetails();
  }, [fetchContentDetails]);

  // Rest of the component implementation
  const handleSave = async (values) => {
    setSaving(true);
    try {
      // Create form data to send to the API
      const formData = new FormData();
      
      // Add all form values
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value);
        }
      });
      
      // Add file if it exists
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('file', fileList[0].originFileObj);
      }
      
      // Update the content item
      await updateContentItem(id, formData);
      
      message.success('Content updated successfully!');
      navigate('/dashboard/content/list'); // Redirect to content list after saving
    } catch (error) {
      console.error('Error updating content:', error);
      message.error('Failed to update content: ' + (error.message || 'Unknown error'));
    } finally {
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
                  'undo redo | formatselect | bold italic backcolor | ' +
                  'alignleft aligncenter alignright alignjustify | ' +
                  'bullist numlist outdent indent | removeformat | help'
              }}
            />
          </Form.Item>

          <Form.Item
            label="Content Type"
            name="content_type"
          >
            <Select placeholder="Select content type">
              <Option value="text">Text</Option>
              <Option value="image">Image</Option>
              <Option value="video">Video</Option>
              <Option value="document">Document</Option>
              <Option value="audio">Audio</Option>  {/* Adding audio option */}
            </Select>
          </Form.Item>

          <Form.Item
            label="File Upload"
            name="file"
          >
            <Upload 
              maxCount={1} 
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}  // Disable auto upload
            >
              <Button icon={<UploadOutlined />}>Click to upload file</Button>
            </Upload>
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
            label="Meta Keywords"
            name="meta_keywords"
          >
            <Input.TextArea placeholder="Enter meta keywords (comma separated)" />
          </Form.Item>

          <Form.Item
            label="Meta Description"
            name="meta_description"
          >
            <Input.TextArea placeholder="Enter meta description" />
          </Form.Item>

          <Form.Item
            label="Photo Caption"
            name="photo_caption"
          >
            <Input placeholder="Enter photo caption (if applicable)" />
          </Form.Item>

          <Form.Item
            label="Highlights"
            name="highlights"
          >
            <Editor
              apiKey="your-api-key" // In a real implementation, you'd use a proper TinyMCE API key
              init={{
                height: 200,
                menubar: false,
                plugins: [
                  'advlist autolink lists link charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime table paste code help wordcount'
                ],
                toolbar:
                  'undo redo | formatselect | bold italic | ' +
                  'alignleft aligncenter alignright alignjustify | ' +
                  'bullist numlist outdent indent | removeformat | help'
              }}
            />
          </Form.Item>

          <Form.Item label="Options" style={{ marginBottom: 0 }}>
            <Form.Item 
              name="ar_marker" 
              label="AR Marker" 
              valuePropName="checked"
              style={{ display: 'inline-block', width: 'calc(50%)', paddingRight: '8px' }}
            >
              <Switch />
            </Form.Item>
            <Form.Item 
              name="quiz" 
              label="Quiz" 
              valuePropName="checked"
              style={{ display: 'inline-block', width: 'calc(50%)', paddingLeft: '8px' }}
            >
              <Switch />
            </Form.Item>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Form.Item 
              name="enable_badges" 
              label="Enable Badges" 
              valuePropName="checked"
              style={{ display: 'inline-block', width: 'calc(50%)', paddingRight: '8px' }}
            >
              <Switch />
            </Form.Item>
            <Form.Item 
              name="exclude_audio" 
              label="Exclude Audio" 
              valuePropName="checked"
              style={{ display: 'inline-block', width: 'calc(50%)', paddingLeft: '8px' }}
            >
              <Switch />
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="chat_bot_allow"
            label="Chat Bot Allow"
            valuePropName="checked"
            style={{ marginBottom: 24 }}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
          >
            <Select placeholder="Select status">
              <Option value="for_editing">For Editing</Option>
              <Option value="for_approval">For Approval</Option>
              <Option value="for_publishing">For Publishing</Option>
              <Option value="published">Published</Option>
              <Option value="deleted">Deleted</Option>
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