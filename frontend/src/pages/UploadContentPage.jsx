import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Select, Upload, Switch, Divider, Radio } from 'antd';
import { UploadOutlined, SaveOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { createContentItem } from '../api/django-api';
import NavigationHeader from '../components/NavigationHeader.jsx';

const { Option } = Select;
const { TextArea } = Input;

const UploadContentPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [contentData, setContentData] = useState(new FormData());
  const [contentType, setContentType] = useState('text');
  const [fileList, setFileList] = useState([]);
  const [saving, setSaving] = useState(false);

  // Handle form submission
  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      // Create form data to send to the API
      const formData = new FormData();
      
      // Add all form values
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      
      // Add file if it exists
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('file', fileList[0].originFileObj);
      }
      
      // Set status to for_approval by default
      formData.set('status', 'for_approval');
      
      // Create the content item
      await createContentItem(formData);
      
      message.success('Content uploaded successfully!');
      navigate('/dashboard/content/list'); // Redirect to content list after upload
    } catch (error) {
      console.error('Error uploading content:', error);
      message.error('Failed to upload content: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // Handle file upload changes
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Handle content type change
  const handleContentTypeChange = (value) => {
    setContentType(value);
  };

  return (
    <div>
      <NavigationHeader title="Upload Content" />
      <div style={{ padding: '24px' }}>
        <Card title="Upload New Content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              title: '',
              content_type: 'text',
              ar_marker: false,
              quiz: false,
              enable_badges: false,
              chat_bot_allow: true,
              exclude_audio: false,
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
              rules={[{ required: true, message: 'Please select content type!' }]}
            >
              <Select placeholder="Select content type" onChange={handleContentTypeChange}>
                <Option value="text">Text</Option>
                <Option value="image">Image</Option>
                <Option value="video">Video</Option>
                <Option value="document">Document</Option>
                <Option value="audio">Audio</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Content Body"
              name="body"
            >
              <Editor
                apiKey={null} // Disable API key requirement
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
                    'bullist numlist outdent indent | removeformat | help',
                  license_key: 'gpl' // Use GPL license for open source configuration
                }}
              />
            </Form.Item>

            {/* File upload based on content type */}
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
                <Button icon={<UploadOutlined />}>
                  Click to upload {contentType === 'image' ? 'image' : 
                                  contentType === 'video' ? 'video' : 
                                  contentType === 'audio' ? 'audio file' : 
                                  contentType === 'document' ? 'document' : 'file'}
                </Button>
              </Upload>
            </Form.Item>

            <Divider orientation="left">Additional Information</Divider>

            <Form.Item
              label="Meta Keywords"
              name="meta_keywords"
            >
              <TextArea placeholder="Enter meta keywords (comma separated)" />
            </Form.Item>

            <Form.Item
              label="Meta Description"
              name="meta_description"
            >
              <TextArea placeholder="Enter meta description" />
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
                apiKey={null} // Disable API key requirement
                init={{
                  height: 200,
                  width: '100%',
                  menubar: false,
                  plugins: [
                    'advlist autolink lists link charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime table paste code help wordcount'
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic | ' +
                    'alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist outdent indent | removeformat | help',
                  mobile: { // Better mobile experience
                    menubar: false,
                    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist'
                  },
                  license_key: 'gpl' // Use GPL license for open source configuration
                }}
              />
            </Form.Item>

            <Divider orientation="left">Options</Divider>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <Form.Item 
                name="ar_marker" 
                label="AR Marker" 
                valuePropName="checked"
                tooltip={{ title: 'Enable AR marker for this content', icon: <InfoCircleOutlined /> }}
              >
                <Switch />
              </Form.Item>
              
              <Form.Item 
                name="quiz" 
                label="Quiz" 
                valuePropName="checked"
                tooltip={{ title: 'Include quiz with this content', icon: <InfoCircleOutlined /> }}
              >
                <Switch />
              </Form.Item>
              
              <Form.Item 
                name="enable_badges" 
                label="Enable Badges" 
                valuePropName="checked"
                tooltip={{ title: 'Enable badge system for this content', icon: <InfoCircleOutlined /> }}
              >
                <Switch />
              </Form.Item>
              
              <Form.Item 
                name="exclude_audio" 
                label="Exclude Audio" 
                valuePropName="checked"
                tooltip={{ title: 'Exclude audio from this content', icon: <InfoCircleOutlined /> }}
              >
                <Switch />
              </Form.Item>
            </div>

            <Form.Item
              name="chat_bot_allow" 
              label="Chat Bot Allow" 
              valuePropName="checked"
              style={{ marginBottom: 24 }}
              tooltip={{ title: 'Allow chat bot interaction with this content', icon: <InfoCircleOutlined /> }}
            >
              <Radio.Group>
                <Radio value={true}>Allow</Radio>
                <Radio value={false}>Disallow</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  loading={saving}
                  style={{ flex: 1, minWidth: '120px' }}
                  block // Make buttons take full width on small screens
                >
                  Submit for Approval
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard/content/list')}
                  icon={<CloseCircleOutlined />}
                  style={{ flex: 1, minWidth: '120px' }}
                  block // Make buttons take full width on small screens
                >
                  Cancel
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default UploadContentPage;