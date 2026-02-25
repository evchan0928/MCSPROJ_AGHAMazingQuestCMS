import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Select, Upload, InputNumber, Table, Modal, Tag, Space } from 'antd';
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getContentItems, 
  getContentItemById,
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
  const [contents, setContents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [triviaQuestions, setTriviaQuestions] = useState([]);
  const [triviaCorrectAnswers, setTriviaCorrectAnswers] = useState({});
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

  // Role-based access control
  const allowedRoles = ['Editor', 'Admin', 'Super Admin'];

  useEffect(() => {
    fetchUserData();
    if (id) {
      fetchContentDetails();
    } else {
      fetchContentsForEditing();
    }
  }, [id]);

  const fetchContentsForEditing = async () => {
    try {
      setLoading(true);
      const all = await getContentItems();
      const list = (all || []).filter(item => String(item.status) === 'for_editing' || String(item.status) === 'for_editing');
      setContents(list);
    } catch (err) {
      console.error('Error fetching for-editing contents:', err);
      message.error('Failed to load content for editing');
    } finally {
      setLoading(false);
    }
  };

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
      let contentItem = null;
      
      // Primary: Try to fetch content by ID directly from API
      try {
        contentItem = await getContentItemById(id);
        console.log('Successfully fetched content by ID from API:', contentItem);
      } catch (error) {
        console.warn('Failed to fetch content by ID, falling back to list fetch:', error);
        
        // Fallback: Fetch all content items and search for the one we need
        const allContents = await getContentItems();
        console.log('Fetched all contents:', allContents);
        console.log('Looking for ID:', id, 'Type:', typeof id);
        
        // Try to find content by ID - handle both string and number types
        contentItem = allContents.find(item => {
          // Compare both as strings and as numbers to handle type mismatches
          return String(item.id) === String(id) || item.id === parseInt(id);
        });
        
        console.log('Found content from list:', contentItem);
        
        if (!contentItem) {
          console.error('Content not found. Available IDs:', allContents.map(c => c.id));
        }
      }
      
      if (contentItem) {
        setContent(contentItem);
        // Populate form and trivia editor state
        form.setFieldsValue({
          title: contentItem.title,
          body: contentItem.body || contentItem.description || '',
          status: contentItem.status,
          content_type: contentItem.content_type || 'text',
          photo_caption: contentItem.photo_caption || '',
          trivia_questions: contentItem.trivia_questions || []
        });

        // Transform backend trivia schema (question, choices[], correctIndex, category, difficulty)
        // into editor-friendly shape: { question, options: {a,b,c,d}, category, difficulty }
        try {
          const backendQuestions = contentItem.trivia_questions || [];
          const editorQuestions = backendQuestions.map((q) => {
            const choices = Array.isArray(q.choices) ? q.choices : [];
            return {
              question: q.question || '',
              options: {
                a: choices[0] || '',
                b: choices[1] || '',
                c: choices[2] || '',
                d: choices[3] || ''
              },
              category: q.category || '',
              difficulty: q.difficulty || 'easy'
            };
          });

          const correctMap = {};
          backendQuestions.forEach((q, idx) => {
            const correctIndex = Number.isInteger(q.correctIndex) ? q.correctIndex : null;
            if (correctIndex !== null) {
              const letters = ['a', 'b', 'c', 'd'];
              correctMap[idx + 1] = letters[correctIndex] || 'a';
            }
          });

          setTriviaQuestions(editorQuestions);
          setTriviaCorrectAnswers(correctMap);
        } catch (err) {
          console.warn('Failed to parse trivia questions for editor:', err);
          setTriviaQuestions([]);
          setTriviaCorrectAnswers({});
        }
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
      // If editing trivia, convert editor state into backend schema
      const payload = { ...values };
      if ((values.content_type === 'trivia') || form.getFieldValue('content_type') === 'trivia') {
        // Convert editor questions to backend format: { question, choices[], correctIndex, category, difficulty }
        const letterToIndex = { a: 0, b: 1, c: 2, d: 3 };
        const converted = (triviaQuestions || []).map((q, idx) => {
          const opts = q.options || {};
          const choices = [opts.a || '', opts.b || '', opts.c || '', opts.d || ''];
          const correctLetter = triviaCorrectAnswers[idx + 1];
          const correctIndex = correctLetter ? (letterToIndex[correctLetter] ?? 0) : 0;
          return {
            question: q.question || '',
            choices,
            correctIndex,
            category: q.category || '',
            difficulty: q.difficulty || 'easy'
          };
        });

        payload.trivia_questions = converted;
      }

      const updatedContent = await updateContentItem(id, payload);
      message.success('Content updated successfully!');
      navigate('/dashboard/content/list'); // Redirect to content list after saving
    } catch (error) {
      console.error('Error updating content:', error);
      message.error(`Failed to update content: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Trivia editor handlers
  const handleTriviaAnswerChange = (questionNum, option) => {
    setTriviaCorrectAnswers(prev => ({ ...prev, [questionNum]: option }));
  };

  const handleQuestionTextChange = (index, value) => {
    const updated = [...(triviaQuestions || [])];
    if (!updated[index]) updated[index] = { question: '', options: { a: '', b: '', c: '', d: '' }, category: '', difficulty: 'easy' };
    updated[index].question = value;
    setTriviaQuestions(updated);
  };

  const handleOptionChange = (index, optionKey, value) => {
    const updated = [...(triviaQuestions || [])];
    if (!updated[index]) updated[index] = { question: '', options: { a: '', b: '', c: '', d: '' }, category: '', difficulty: 'easy' };
    if (!updated[index].options) updated[index].options = { a: '', b: '', c: '', d: '' };
    updated[index].options[optionKey] = value;
    setTriviaQuestions(updated);
  };

  const handleCategoryChange = (index, value) => {
    const updated = [...(triviaQuestions || [])];
    if (!updated[index]) updated[index] = { question: '', options: { a: '', b: '', c: '', d: '' }, category: '', difficulty: 'easy' };
    updated[index].category = value;
    setTriviaQuestions(updated);
  };

  const handleDifficultyChange = (index, value) => {
    const updated = [...(triviaQuestions || [])];
    if (!updated[index]) updated[index] = { question: '', options: { a: '', b: '', c: '', d: '' }, category: '', difficulty: 'easy' };
    updated[index].difficulty = value;
    setTriviaQuestions(updated);
  };

  const addTriviaQuestion = () => {
    setTriviaQuestions(prev => ([...(prev || []), { question: '', options: { a: '', b: '', c: '', d: '' }, category: '', difficulty: 'easy' }]));
  };

  const handleBack = () => {
    navigate('/dashboard/content/list');
  };

  // Table actions for list view
  const handleEditClick = (id) => {
    navigate(`/dashboard/content/edit/${id}`);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Title', dataIndex: 'title', key: 'title', render: (t) => <div style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</div> },
    { title: 'Type', dataIndex: 'content_type', key: 'content_type', render: (type) => <span>{type || 'text'}</span> },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at', render: (d) => d ? new Date(d).toLocaleDateString() : 'N/A' },
    {
      title: 'Actions', key: 'actions', render: (_, record) => (
        <Space>
          <Button onClick={() => { setPreviewContent(record); setPreviewVisible(true); }}>Preview</Button>
          <Button type="primary" onClick={() => handleEditClick(record.id)}>Edit</Button>
        </Space>
      )
    }
  ];

  if (loading && !content && !contents.length) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Check permissions
  const hasPermission = currentUser && (currentUser.is_superuser || 
    (currentUser.roles || []).some(role => allowedRoles.includes(role)));

  if (!hasPermission) {
    return (
      <Card style={{ margin: '20px' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to edit content. Required roles: Editor, Admin, or Super Admin.</p>
      </Card>
    );
  }

  // If no id param, render list of items for editing
  if (!id) {
    return (
      <div style={{ padding: '24px' }}>
        <Card title="Content For Editing" style={{ marginBottom: 24 }}>
          <p>Items with status "For Editing" are listed below. Click Edit to open the editor.</p>
        </Card>

        <Card>
          <Table dataSource={contents} columns={columns} loading={loading} rowKey="id" />
        </Card>

        <Modal
          title={previewContent?.title}
          open={previewVisible}
          onCancel={() => { setPreviewVisible(false); setPreviewContent(null); }}
          footer={[<Button key="close" onClick={() => { setPreviewVisible(false); setPreviewContent(null); }}>Close</Button>]}
          width={800}
        >
          {previewContent && (
            <div>
              {(() => {
                const fileUrl = previewContent.file_url || previewContent.file || previewContent.fileUrl || null;
                let trivia = previewContent.trivia_questions || previewContent.triviaQuestions || null;
                if (trivia && typeof trivia === 'string') {
                  try { trivia = JSON.parse(trivia); } catch (e) { trivia = null; }
                }

                return (
                  <div>
                    <p><strong>Type:</strong> {previewContent.content_type}</p>
                    <p><strong>Created:</strong> {previewContent.created_at ? (() => { const d = new Date(previewContent.created_at); return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}` })() : 'N/A'}</p>

                    {previewContent.content_type === 'image' && fileUrl && (
                      <img src={fileUrl} alt={previewContent.title} style={{ maxWidth: '100%' }} />
                    )}

                    {previewContent.content_type === 'trivia' && trivia && (
                      <div>
                        <h4>Trivia Questions</h4>
                        {(trivia || []).map((q, idx) => (
                          <div key={idx} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                            <p style={{ margin: 0 }}><strong>Q{idx+1}:</strong> {q.question}</p>
                            <ul>
                              {(q.choices || []).map((choice, cidx) => (
                                <li key={cidx} style={{ fontWeight: q.correctIndex === cidx ? 600 : 400 }}>{String.fromCharCode(65+cidx)}. {choice}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {previewContent.content_type === 'text' && previewContent.body && (
                      <div dangerouslySetInnerHTML={{ __html: previewContent.body }} style={{ padding: 8, background: '#f5f5f5' }} />
                    )}

                    {previewContent.content_type === 'video' && fileUrl && (
                      <video controls style={{ width: '100%' }} src={fileUrl} />
                    )}

                    {previewContent.content_type === 'document' && fileUrl && (
                      <div>
                        <p><strong>Document:</strong> {fileUrl.split('/').pop()}</p>
                        <Button onClick={() => window.open(fileUrl, '_blank')}>Open Document</Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </Modal>
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
                  <Option value="trivia">Trivia Questions</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Content Body"
                name="body"
              >
                <TextArea rows={12} placeholder="Enter content body" />
              </Form.Item>

              <Form.Item
                label="Photo Caption"
                name="photo_caption"
              >
                <Input placeholder="Enter photo caption (if applicable)" />
              </Form.Item>

              {/* Trivia editor — show when content_type is trivia */}
              {(form.getFieldValue('content_type') === 'trivia' || content?.content_type === 'trivia') && (
                <div style={{ marginBottom: 16, padding: 12, border: '1px solid #e8e8e8', borderRadius: 6, background: '#fafafa' }}>
                  <h3 style={{ marginTop: 0 }}>Trivia Questions</h3>
                  <div style={{ marginBottom: 12 }}>
                    <Button type="default" onClick={addTriviaQuestion}>Add Question</Button>
                  </div>

                  {triviaQuestions && triviaQuestions.length > 0 ? (
                    triviaQuestions.map((q, idx) => {
                      const questionNum = idx + 1;
                      const question = q || { question: '', options: { a: '', b: '', c: '', d: '' }, category: '', difficulty: 'easy' };
                      return (
                        <div key={questionNum} style={{ padding: 12, border: '1px solid #ececec', borderRadius: 6, marginBottom: 12, background: 'white' }}>
                          <Form.Item label={`Question ${questionNum}`}>
                            <Input value={question.question || ''} onChange={(e) => handleQuestionTextChange(idx, e.target.value)} />
                          </Form.Item>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            {['a','b','c','d'].map(optKey => (
                              <div key={optKey}>
                                <label style={{ display: 'block', marginBottom: 6 }}>Option {optKey.toUpperCase()}</label>
                                <Input value={(question.options && question.options[optKey]) || ''} onChange={(e) => handleOptionChange(idx, optKey, e.target.value)} />
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', marginBottom: 6 }}>Category</label>
                              <Input value={question.category || ''} onChange={(e) => handleCategoryChange(idx, e.target.value)} />
                            </div>
                            <div style={{ width: 160 }}>
                              <label style={{ display: 'block', marginBottom: 6 }}>Difficulty</label>
                              <Select value={question.difficulty || 'easy'} onChange={(val) => handleDifficultyChange(idx, val)}>
                                <Option value="easy">Easy</Option>
                                <Option value="medium">Medium</Option>
                                <Option value="hard">Hard</Option>
                              </Select>
                            </div>
                          </div>

                          <div style={{ marginTop: 12 }}>
                            <label style={{ display: 'block', marginBottom: 6 }}>Correct Answer</label>
                            <div style={{ display: 'flex', gap: 12 }}>
                              {['a','b','c','d'].map(option => (
                                <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <input type="radio" name={`question_${questionNum}`} value={option} checked={triviaCorrectAnswers[questionNum] === option} onChange={() => handleTriviaAnswerChange(questionNum, option)} />
                                  <span>{option.toUpperCase()}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: '#666' }}>No trivia questions yet. Click "Add Question" to create one.</div>
                  )}
                </div>
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