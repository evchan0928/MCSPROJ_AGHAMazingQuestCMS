// src/pages/UploadContentPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, notification, Card } from 'antd';
import { createContentItem, getCurrentUser } from '../api/django-api';

export default function UploadContentPage() {
  const navigate = useNavigate();
  
  // Add form state to manage form visibility
  const [activeForm, setActiveForm] = useState({
    contentInfo: true,
    description: true,
    media: true,
    trivia: true
  });
  
  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    content_type: 'text',
    meta_keywords: '',
    meta_description: '',
    photo_caption: '',
    highlights: '',
    ar_marker: false,  // Changed from empty string to boolean
    chat_bot_allow: true,
    exclude_audio: false,
    trivia_questions: []  // Initialize trivia questions
  });

  // State to manage trivia correct answers mapping: { 1: 'a', 2: 'b', ... }
  const [triviaCorrectAnswers, setTriviaCorrectAnswers] = useState({});
  
  // State for files
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // State for file upload status
  const [imageUploadStatus, setImageUploadStatus] = useState('');
  const [pdfUploadStatus, setPdfUploadStatus] = useState('');

  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Role-based access control
  const allowedRoles = ['Encoder', 'Editor', 'Approver', 'Admin', 'Super Admin'];

  // Initialize current user on component mount
  React.useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Failed to fetch user data');
    }
  };

  // Toggle form sections
  const toggleFormSection = (section) => {
    setActiveForm(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ar_marker' ? checked :
               type === 'checkbox' ? checked :
               name === 'chat_bot_allow' || name === 'exclude_audio' ? value === 'true' :
               value
    }));
  };

  // Handle quiz answer changes
  const handleTriviaAnswerChange = (questionNum, option) => {
    setTriviaCorrectAnswers(prev => ({
      ...prev,
      [questionNum]: option
    }));
  };

  // Handle question text changes
  const handleQuestionTextChange = (index, value) => {
    const updatedQuestions = [...(formData.trivia_questions || [])];
    if (!updatedQuestions[index]) updatedQuestions[index] = { question: '', options: { a: '', b: '', c: '', d: '' }, category: '', difficulty: 'easy' };
    updatedQuestions[index].question = value;
    
    setFormData(prev => ({
      ...prev,
      trivia_questions: updatedQuestions
    }));
  };

  const handleCategoryChange = (index, value) => {
    const updatedQuestions = [...(formData.trivia_questions || [])];
    if (!updatedQuestions[index]) updatedQuestions[index] = { question: '', options: { a: '', b: '', c: '', d: '' }, category: '', difficulty: 'easy' };
    updatedQuestions[index].category = value;
    setFormData(prev => ({
      ...prev,
      trivia_questions: updatedQuestions
    }));
  };

  const handleDifficultyChange = (index, value) => {
    const updatedQuestions = [...(formData.trivia_questions || [])];
    if (!updatedQuestions[index]) updatedQuestions[index] = { question: '', options: { a: '', b: '', c: '', d: '' }, category: '', difficulty: 'easy' };
    updatedQuestions[index].difficulty = value;
    setFormData(prev => ({
      ...prev,
      trivia_questions: updatedQuestions
    }));
  };

  // Handle option changes
  const handleOptionChange = (index, optionKey, value) => {
    const updatedQuestions = [...(formData.trivia_questions || [])];
    if (!updatedQuestions[index]) updatedQuestions[index] = { question: '', options: { a: '', b: '', c: '', d: '' } };
    
    if (!updatedQuestions[index].options) {
      updatedQuestions[index].options = { a: '', b: '', c: '', d: '' };
    }
    
    updatedQuestions[index].options[optionKey] = value;
    
    setFormData(prev => ({
      ...prev,
      trivia_questions: updatedQuestions
    }));
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    setLoading(true);

    try {
      const contentData = {
        ...formData,
        status: 'for_editing', // Draft status
        file: imageFile || pdfFile || null
      };

      // Add trivia payload when content_type is 'trivia'
      if (formData.content_type === 'trivia') {
        // Build new `trivia_questions` schema expected by mobile: question, choices[], correctIndex, category, difficulty
        const letterToIndex = { a: 0, b: 1, c: 2, d: 3 };
        const triviaQuestions = (formData.trivia_questions || []).map((q, idx) => {
          const optsObj = q.options || {};
          const choices = [optsObj.a || '', optsObj.b || '', optsObj.c || '', optsObj.d || ''];
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

        contentData.trivia_questions = JSON.stringify(triviaQuestions);
      }

      // Use the centralized API function
      const result = await createContentItem(contentData);
      
      message.success('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      message.error(`Failed to save draft: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle image file selection
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUploadStatus(`Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`);
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = function(event) {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImageUploadStatus('');
      setPreviewImage(null);
    }
  };

  // Handle PDF file selection
  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setPdfUploadStatus(`Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    } else {
      setPdfFile(null);
      setPdfUploadStatus('');
    }
  };

  // Reset image file
  const resetImageFile = () => {
    setImageFile(null);
    setImageUploadStatus('');
    setPreviewImage(null);
    const imageInput = document.getElementById('imageFile');
    if (imageInput) {
      imageInput.value = '';
    }
  };

  // Reset PDF file
  const resetPdfFile = () => {
    setPdfFile(null);
    setPdfUploadStatus('');
    const pdfInput = document.getElementById('pdfFile');
    if (pdfInput) {
      pdfInput.value = '';
    }
  };

  const [api, contextHolder] = notification.useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create form data to handle both files and other fields
      const contentData = new FormData();
      
      // Append all form fields except the questions array which we append separately as JSON
      Object.keys(formData).forEach(key => {
        if (key !== 'trivia_questions') {
          // Handle boolean values properly
          if (key === 'chat_bot_allow' || key === 'exclude_audio' || key === 'ar_marker') {
            contentData.append(key, Boolean(formData[key]).toString());
          } else {
            contentData.append(key, formData[key]);
          }
        }
      });

      // Add file if available
      if (imageFile) {
        contentData.append('file', imageFile);
      } else if (pdfFile) {
        contentData.append('file', pdfFile);
      }

      // Add quiz/trivia payload if this is a quiz (compatibility + new format)
      if (formData.content_type === 'trivia') {
        // Build new `trivia_questions` schema expected by mobile: question, choices[], correctIndex, category, difficulty
        const letterToIndex = { a: 0, b: 1, c: 2, d: 3 };
        const triviaQuestions = (formData.trivia_questions || []).map((q, idx) => {
          const optsObj = q.options || {};
          const choices = [optsObj.a || '', optsObj.b || '', optsObj.c || '', optsObj.d || ''];
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

        contentData.append('trivia_questions', JSON.stringify(triviaQuestions));
      }

      // Don't append status here since backend handles it in perform_create
      // contentData.append('status', 'for_approval');

      // Use the centralized API function
      const result = await createContentItem(contentData);
      
      message.success('Content submitted successfully!');
      
      // Reset form and file states
      setFormData({
        title: '',
        body: '',
        content_type: 'text',
        meta_keywords: '',
        meta_description: '',
        photo_caption: '',
        highlights: '',
        ar_marker: false,  // Reset to false
        chat_bot_allow: true,
        exclude_audio: false,
        trivia_questions: []
      });
      setImageFile(null);
      setPdfFile(null);
      setPreviewImage(null);
      setImageUploadStatus('');
      setPdfUploadStatus('');
      setTriviaCorrectAnswers({});
      
      // Reset file input elements
      if (document.getElementById('imageFile')) {
        document.getElementById('imageFile').value = '';
      }
      if (document.getElementById('pdfFile')) {
        document.getElementById('pdfFile').value = '';
      }
      
      navigate('/dashboard/content/list'); // Redirect to content list instead of approve page
    } catch (error) {
      console.error('Error submitting content:', error);
      message.error(`Failed to submit content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  if (!currentUser) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const hasPermission = currentUser.is_superuser || 
    (currentUser.roles || []).some(role => allowedRoles.includes(role));

  if (!hasPermission) {
    return (
      <Card style={{ margin: '20px' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to upload content. Required roles: Encoder, Editor, Approver, Admin, or Super Admin.</p>
      </Card>
    );
  }

  return (
    <div className="upload-page-container">
      <div className="upload-card">
        <div className="upload-header">
          <h1 className="upload-title">Upload New Content</h1>
          <p className="upload-description">Fill out the form below to create and upload new content to the system.</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleSaveDraft} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Saving...
                </>
              ) : 'Save Draft'}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Submitting...
                </>
              ) : 'Submit for Review'}
            </button>
          </div>

          <div className="form-section">
            <h2 className="section-title">Content Information</h2>
            
            {/* Title Field */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="title" className="required">Content Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a descriptive title for your content"
                  className="form-input"
                  required
                  maxLength="255"
                />
                <span className="field-hint">Enter a meaningful title that describes your content</span>
              </div>
            </div>

            {/* Content Type and Settings */}
            <div className="form-row double-column">
              <div className="form-group">
                <label htmlFor="content_type" className="required">Content Type</label>
                <select
                  id="content_type"
                  name="content_type"
                  value={formData.content_type}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a content type</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="trivia">Trivia Questions</option>
                </select>
                <span className="field-hint">Choose the type of content you are uploading</span>
              </div>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="ar_marker"
                    checked={formData.ar_marker}
                    onChange={handleChange}
                    className="form-checkbox"
                  />{' '}
                  AR Marker
                </label>
                <span className="field-hint">Check if this content is tied to an AR marker</span>
              </div>
            </div>

            <div className="form-row double-column">
              <div className="form-group">
                <label htmlFor="chat_bot_allow">Enable Chat Bot</label>
                <select
                  id="chat_bot_allow"
                  name="chat_bot_allow"
                  value={formData.chat_bot_allow.toString()}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                <span className="field-hint">Allow chat bot interaction with this content</span>
              </div>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="exclude_audio"
                    checked={formData.exclude_audio}
                    onChange={handleChange}
                    className="form-checkbox"
                  />{' '}
                  Exclude Audio
                </label>
                <span className="field-hint">Check if this content should exclude audio</span>
              </div>
            </div>
          </div>

          {/* Trivia Questions Section */}
          {formData.content_type === 'trivia' && (
            <div className="form-section">
              <h2 className="section-title">Trivia Questions</h2>

              <div style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    // append an empty question
                    setFormData(prev => ({
                      ...prev,
                      trivia_questions: [...(prev.trivia_questions || []), { question: '', options: { a: '', b: '', c: '', d: '' }, category: '', difficulty: 'easy' }]
                    }));
                  }}
                >
                  Add Question
                </button>
              </div>

              {formData.trivia_questions && formData.trivia_questions.length > 0 && (
                <div className="quiz-section">
                  <h3 className="quiz-section-title">Questions & Options</h3>
                  <div className="quiz-questions-container">
                      {formData.trivia_questions.map((question, index) => {
                        const questionNum = index + 1;
                        const q = question || { question: '', options: { a: '', b: '', c: '', d: '' }, category: '', difficulty: 'easy' };
                      return (
                        <div key={questionNum} className="question-card">
                          {/* Question Text Input */}
                          <div className="form-group full-width">
                            <label className="required">Question {questionNum}</label>
                            <input
                              type="text"
                              value={q.question || ''}
                              onChange={(e) => handleQuestionTextChange(index, e.target.value)}
                              placeholder={`Enter question ${questionNum}`}
                              className="form-input"
                              required
                            />
                          </div>

                          {/* Options Grid */}
                          <div className="options-grid">
                            {Object.entries(q.options || {}).map(([optKey, optValue]) => (
                              <div key={optKey} className="form-group">
                                <label>Option {optKey.toUpperCase()}</label>
                                <input
                                  type="text"
                                  value={optValue || ''}
                                  onChange={(e) => handleOptionChange(index, optKey, e.target.value)}
                                  placeholder={`Option ${optKey.toUpperCase()}`}
                                  className="form-input"
                                  required
                                />
                              </div>
                            ))}
                          </div>

                          {/* Category & Difficulty */}
                          <div className="form-row">
                            <div className="form-group">
                              <label>Category</label>
                              <input
                                type="text"
                                value={q.category || ''}
                                onChange={(e) => handleCategoryChange(index, e.target.value)}
                                placeholder="e.g., technology"
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label>Difficulty</label>
                              <select
                                value={q.difficulty || 'easy'}
                                onChange={(e) => handleDifficultyChange(index, e.target.value)}
                                className="form-select"
                              >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                            </div>
                          </div>

                          {/* Correct Answer Selection */}
                          <div className="form-group">
                            <label>Correct Answer</label>
                            <div className="answer-options">
                              {['a', 'b', 'c', 'd'].map((option) => (
                                <label key={option} className="radio-option">
                                  <input
                                    type="radio"
                                    name={`question_${questionNum}`}
                                    value={option}
                                    checked={triviaCorrectAnswers[questionNum] === option}
                                    onChange={() => handleTriviaAnswerChange(questionNum, option)}
                                  />
                                  <span className="radio-text">{option.toUpperCase()}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description Field */}
          <div className="form-section">
            <h2 className="section-title">Content Description</h2>
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="body">Description</label>
                <textarea
                  id="body"
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the content"
                  rows={6}
                  className="form-textarea"
                />
                <span className="field-hint">Describe the content in detail. This will appear in the content preview.</span>
              </div>
            </div>
          </div>

          {/* File Upload Section - Hidden for Trivia */}
          {formData.content_type !== 'trivia' && (
            <div className="form-section">
              <h2 className="section-title">Media Files</h2>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Upload Image</label>
                  <div className="file-upload-box">
                    <input
                      type="file"
                      id="imageFile"
                      name="imageFile"
                      className="file-upload-input"
                      onChange={handleImageFileChange}
                      accept="image/*"
                    />
                    <label htmlFor="imageFile" className="file-upload-label">
                      <span className="upload-icon">📁</span>
                      <p>Drag and drop an image, or <span className="browse-text">Browse</span></p>
                      <p className="upload-hint">Supports JPG, PNG, GIF. Minimum 800px width recommended. Max 10MB</p>
                    </label>
                    
                    {/* Show upload status and preview if available */}
                    {imageUploadStatus && (
                      <div className="upload-status success">
                        <div className="status-info">
                          <span className="status-icon">✓</span>
                          <span>{imageUploadStatus}</span>
                        </div>
                        <button type="button" className="remove-btn" onClick={resetImageFile}>Remove</button>
                      </div>
                    )}
                  </div>
                  
                  {/* Image preview */}
                  {previewImage && (
                    <div className="image-preview-container">
                      <h4>Image Preview:</h4>
                      <img src={previewImage} alt="Preview" className="image-preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="photo_caption">Photo Caption</label>
                  <input
                    type="text"
                    id="photo_caption"
                    name="photo_caption"
                    value={formData.photo_caption}
                    onChange={handleChange}
                    placeholder="Enter a caption for the image"
                    className="form-input"
                  />
                  <span className="field-hint">Brief description of the image content</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Upload Document</label>
                  <div className="file-upload-box pdf-upload-box">
                    <input
                      type="file"
                      id="pdfFile"
                      name="pdfFile"
                      className="file-upload-input"
                      onChange={handlePdfFileChange}
                      accept="application/pdf"
                    />
                    <label htmlFor="pdfFile" className="file-upload-label">
                      <span className="upload-icon">📄</span>
                      <p>Drag and drop PDF file here, or <span className="browse-text">Browse</span></p>
                      <p className="upload-hint">Supports PDF format. Max file size is 10MB</p>
                    </label>
                    
                    {/* Show upload status if available */}
                    {pdfUploadStatus && (
                      <div className="upload-status success">
                        <div className="status-info">
                          <span className="status-icon">✓</span>
                          <span>{pdfUploadStatus}</span>
                        </div>
                        <button type="button" className="remove-btn" onClick={resetPdfFile}>Remove</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Action Buttons */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleSaveDraft} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Saving...
                </>
              ) : 'Save Draft'}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Submitting...
                </>
              ) : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add CSS styles to the document
if (!document.querySelector('#upload-content-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'upload-content-styles';
  styleSheet.textContent = `
    .upload-page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
      min-height: 100vh;
    }

    .upload-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      padding: 30px;
      margin-bottom: 20px;
    }

    .upload-header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .upload-title {
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .upload-description {
      color: #64748b;
      margin: 0;
      font-size: 14px;
    }

    .upload-form {
      display: flex;
      flex-direction: column;
    }

    .form-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background-color: #f8fafc;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 1px solid #cbd5e1;
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .double-column {
      flex-direction: row;
    }

    .double-column .form-group {
      flex: 1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      flex: 1 1 0;
      min-width: 200px;
    }

    .full-width {
      flex: 1 1 100%;
    }

    label {
      font-weight: 500;
      color: #334155;
      margin-bottom: 6px;
      font-size: 14px;
    }

    .required:after {
      content: " *";
      color: #ef4444;
    }

    .form-input, .form-select, .form-textarea {
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 120px;
    }

    .field-hint {
      color: #64748b;
      font-size: 12px;
      margin-top: 6px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin: 20px 0 30px 0;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }

    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .btn-secondary {
      background-color: #f1f5f9;
      color: #475569;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #e2e8f0;
    }

    .btn-primary:disabled, .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .file-upload-box {
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      transition: border-color 0.2s;
      position: relative;
    }

    .file-upload-box:hover {
      border-color: #94a3b8;
    }

    .file-upload-input {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      opacity: 0;
      cursor: pointer;
    }

    .file-upload-label {
      display: block;
      cursor: pointer;
    }

    .upload-icon {
      font-size: 32px;
      margin-bottom: 12px;
      display: block;
    }

    .browse-text {
      color: #3b82f6;
      font-weight: 600;
    }

    .upload-hint {
      color: #64748b;
      font-size: 12px;
      margin: 8px 0 0 0;
    }

    .pdf-upload-box {
      border-color: #cbd5e1;
    }

    .quiz-section {
      margin-top: 20px;
    }

    .quiz-section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 15px 0;
    }

    .quiz-questions-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .question-card {
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background-color: white;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin: 15px 0;
    }

    .answer-options {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }

    .radio-text {
      font-size: 14px;
    }

    /* New styles for upload status indicators */
    .upload-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
    }

    .upload-status.success {
      background-color: #dcfce7;
      border: 1px solid #bbf7d0;
      color: #166534;
    }

    .status-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-icon {
      font-weight: bold;
      font-size: 16px;
    }

    .remove-btn {
      background: #f87171;
      color: white;
      border: none;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .remove-btn:hover {
      background: #ef4444;
    }

    /* Image preview styles */
    .image-preview-container {
      margin-top: 15px;
      text-align: center;
    }

    .image-preview-container h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #334155;
    }

    .image-preview {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    @media (max-width: 768px) {
      .upload-card {
        padding: 20px;
      }
      
      .form-row {
        flex-direction: column;
        gap: 15px;
      }
      
      .double-column .form-group {
        flex: 1;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .btn-primary, .btn-secondary {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
