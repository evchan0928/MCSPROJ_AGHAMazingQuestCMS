import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Select, Upload, InputNumber } from 'antd';
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { 
  getContentItems, 
  updateContentItem,
  getCurrentUser
} from '../api/django-api';

const { TextArea } = Input;
const { Option } = Select;

const EditContentPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchContentDetails();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Failed to fetch user data');
    }
  };

  const fetchContentDetails = async () => {
    try {
      // Fetch the content item by ID
      const allContents = await getContentItems();
      const contentItem = allContents.find(item => item.id === parseInt(id));
      
      if (contentItem) {
        setContent(contentItem);
        form.setFieldsValue({
          title: contentItem.title,
          body: contentItem.body || contentItem.description || '',
          status: contentItem.status,
          content_type: contentItem.content_type || 'text',
          photo_caption: contentItem.photo_caption || '',
          quiz_length: contentItem.quiz_length || '',
          quiz_badges: contentItem.quiz_badges || 'no',
          quiz_number: contentItem.quiz_number || ''
        });
      } else {
        message.error('Content not found');
        navigate('/dashboard/content/list');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      message.error('Failed to load content details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const updatedContent = await updateContentItem(id, values);
      message.success('Content updated successfully!');
      navigate('/dashboard/content/list'); // Redirect to content list after saving
    } catch (error) {
      console.error('Error updating content:', error);
      message.error(`Failed to update content: ${error.message}`);
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
            body: content?.body || content?.description || '',
            status: content?.status || 'draft',
            content_type: content?.content_type || 'text',
            photo_caption: content?.photo_caption || '',
            quiz_length: content?.quiz_length || '',
            quiz_badges: content?.quiz_badges || 'no',
            quiz_number: content?.quiz_number || ''
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
            label="Content Type"
            name="content_type"
          >
            <Select placeholder="Select content type">
              <Option value="text">Text</Option>
              <Option value="image">Image</Option>
              <Option value="video">Video</Option>
              <Option value="document">Document</Option>
              <Option value="quiz">Quiz</Option>
            </Select>
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
            label="Photo Caption"
            name="photo_caption"
          >
            <Input placeholder="Enter photo caption (if applicable)" />
          </Form.Item>

          {/* Quiz-specific fields */}
          {form.getFieldValue('content_type') === 'quiz' && (
            <>
              <Form.Item
                label="Number of Questions"
                name="quiz_length"
              >
                <InputNumber min={1} max={100} placeholder="Enter number of questions" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="Quiz Badges"
                name="quiz_badges"
              >
                <Select placeholder="Does this quiz have badges?">
                  <Option value="no">No</Option>
                  <Option value="yes">Yes</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Quiz Number"
                name="quiz_number"
              >
                <InputNumber min={1} placeholder="Enter quiz sequence number" style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}

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