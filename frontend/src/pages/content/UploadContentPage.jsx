import { UploadOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Upload, message } from 'antd';
import axios from 'axios';

const UploadContentPage = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key !== 'file') {
          formData.append(key, values[key]);
        }
      });
      formData.append('file', values.file[0].originFileObj);

      await axios.post('/api/upload-content/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      message.success('Content uploaded successfully!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to upload content.');
    }
  };

  return (
    <div className="upload-content-container">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please input the title!' }]}
        >
          <Input placeholder="Enter content title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <Input.TextArea rows={4} placeholder="Enter content description" />
        </Form.Item>

        <Form.Item
          name="file"
          label="Upload File"
          valuePropName="fileList"
          getValueFromEvent={(e) => e.fileList}
          extra="Supports multiple file types: images, videos, documents."
        >
          <Upload.Dragger
            accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.pdf,.doc,.docx"
            maxCount={1}
            beforeUpload={(file) => {
              // Validate file type and size
              const isImage = file.type.startsWith('image/');
              const isVideo = file.type.startsWith('video/');
              const isDocument = file.type.includes('application/pdf') || 
                                file.type.includes('application/msword') ||
                                file.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
              
              if (!isImage && !isVideo && !isDocument) {
                message.error('Only images, videos, and documents are allowed!');
                return false;
              }

              const isLt2M = file.size / 1024 / 1024 < 2;
              if (!isLt2M) {
                message.error('File must be less than 2MB!');
                return false;
              }

              return true;
            }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">Support for a single or bulk upload.</p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Upload Content
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UploadContentPage;