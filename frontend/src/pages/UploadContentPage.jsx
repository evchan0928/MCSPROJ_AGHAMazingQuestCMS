// src/pages/UploadContentPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, notification } from 'antd';
import { createContentItem } from '../api/django-api';

export default function UploadContentPage() {
  const navigate = useNavigate();
  
  // State to manage all form fields
  const [formData, setFormData] = useState({
    title: '',
    body: '', 
    status: 'for_editing', // Default status matching backend workflow
    content_type: 'text', // Default type
    photo_caption: '', // Changed to snake_case to match backend
    quiz_length: '', // Quiz-specific field: number of questions
    quiz_badges: 'no', // Quiz-specific field: yes or no
    quiz_number: '', // Quiz-specific field
    quiz_questions: [], // array of { question: '', options: {a:'',b:'',c:'',d:''} }
  });

  // State to manage quiz correct answers: { 1: 'a', 2: 'b', ... }
  const [quizCorrectAnswers, setQuizCorrectAnswers] = useState({});

  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generic handler for all input changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' || type === 'radio' ? checked || value : value,
      };

      // If quiz_length changed, ensure quiz_questions array matches new length
      if (name === 'quiz_length') {
        const count = Number(value) || 0;
        const questions = Array.from({ length: count }, (_, i) => {
          return prev.quiz_questions && prev.quiz_questions[i]
            ? prev.quiz_questions[i]
            : { question: '', options: { a: '', b: '', c: '', d: '' } };
        });
        next.quiz_questions = questions;
      }

      return next;
    });
  };

  // Handler for quiz correct answers
  const handleQuizAnswerChange = (questionNumber, answer) => {
    setQuizCorrectAnswers((prev) => ({
      ...prev,
      [questionNumber]: answer,
    }));
  };

  // Handler for question text changes
  const handleQuestionTextChange = (index, text) => {
    setFormData((prev) => {
      const qs = prev.quiz_questions ? [...prev.quiz_questions] : [];
      qs[index] = qs[index] || { question: '', options: { a: '', b: '', c: '', d: '' } };
      qs[index].question = text;
      return { ...prev, quiz_questions: qs };
    });
  };

  // Handler for option changes
  const handleOptionChange = (index, optKey, text) => {
    setFormData((prev) => {
      const qs = prev.quiz_questions ? [...prev.quiz_questions] : [];
      qs[index] = qs[index] || { question: '', options: { a: '', b: '', c: '', d: '' } };
      qs[index].options = { ...(qs[index].options || {}), [optKey]: text };
      return { ...prev, quiz_questions: qs };
    });
  };

  const handleImageFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handlePdfFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  // Handle rich text editor changes
  const handleRichTextChange = (field, content) => {
    setFormData(prev => ({
      ...prev,
      [field]: content
    }));
  };

  const [api, contextHolder] = notification.useNotification();

  const handleSaveDraft = async () => {
    setLoading(true);
    
    try {
      const contentData = {
        ...formData,
        status: 'draft',
        file: imageFile || pdfFile || null
      };
      
      const result = await createContentItem(contentData);
      message.success('Content saved as draft successfully!');
      navigate('/dashboard/content/list'); // Redirect to content list
    } catch (error) {
      console.error('Error saving draft:', error);
      message.error(`Failed to save draft: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contentData = {
        ...formData,
        status: 'for_approval', // Submitting for review changes status to for_approval
        file: imageFile || pdfFile || null
      };

      // Add quiz correct answers if this is a quiz
      if (formData.content_type === 'quiz') {
        contentData.quiz_correct_answers = JSON.stringify(quizCorrectAnswers);
        // include full questions so mobile app can render them
        contentData.quiz_questions = JSON.stringify(formData.quiz_questions || []);
      }

      const result = await createContentItem(contentData);
      
      message.success('Content submitted successfully!');
      navigate('/dashboard/content/approve'); // Redirect to approve content page
    } catch (error) {
      console.error('Error submitting content:', error);
      message.error(`Failed to submit content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle formatting commands
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    // Force a re-render to capture the updated content
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.classList.contains('editor-content')) {
        handleRichTextChange(activeElement.id, activeElement.innerHTML);
      }
    }, 0);
  };
  
  // Function to handle color selection
  const handleColorChange = (command, color) => {
    formatText(command, color);
  };

  return (
    // The 'card' class provides the main container styling matching your design
    // The router renders this component directly into the main content area of the layout.
    <div className="card">
      <h1 className="card-title">Upload Content</h1> {/* Use H2 for the main title */}
      <p>Fill out the form below to create and upload new content.</p>

      <form onSubmit={handleSubmit} className="content-form-layout">
        
        {/* Top Controls: Action Buttons */}
        <div className="form-header-controls">
          <div className="action-buttons">
            <button type="button" className="secondary-action-btn" onClick={handleSaveDraft} disabled={loading}>
              Save as Draft
            </button>
            <button type="submit" className="primary-action-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </div>

        {/* Main Form Grid Layout */}
        <div className="form-grid">
          
          {/* Row 1: Title (Full Width) */}
          <div className="form-group grid-item-1-6">
            <label htmlFor="title">Content Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter content title"
              required
            />
          </div>

          {/* Row 2: Type Selection */}
          <div className="form-group grid-item-1-6">
            <label htmlFor="content_type">Content Type *</label>
            <select
              id="content_type"
              name="content_type"
              value={formData.content_type}
              onChange={handleChange}
              required
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          {/* Conditional: Quiz-Specific Fields (only show when Quiz is selected) */}
          {formData.content_type === 'quiz' && (
            <>
              {/* Quiz Length */}
              <div className="form-group grid-item-1-3">
                <label htmlFor="quiz_length">Number of Questions *</label>
                <input
                  type="number"
                  id="quiz_length"
                  name="quiz_length"
                  value={formData.quiz_length}
                  onChange={handleChange}
                  placeholder="e.g., 10"
                  min="1"
                  max="100"
                  required
                />
              </div>

              {/* Quiz Badges */}
              <div className="form-group grid-item-4-5">
                <label htmlFor="quiz_badges">Quiz Badges *</label>
                <select
                  id="quiz_badges"
                  name="quiz_badges"
                  value={formData.quiz_badges}
                  onChange={handleChange}
                  required
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              {/* Quiz Number */}
              <div className="form-group grid-item-5-6">
                <label htmlFor="quiz_number">Quiz Number (sequence) *</label>
                <input
                  type="number"
                  id="quiz_number"
                  name="quiz_number"
                  value={formData.quiz_number}
                  onChange={handleChange}
                  placeholder="e.g., 1"
                  min="1"
                  required
                />
              </div>

              {/* Dynamic Question Fields */}
              {formData.quiz_length && Number(formData.quiz_length) > 0 && (
                <div className="form-group grid-item-1-6">
                  <label style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'block' }}>Quiz Questions & Options</label>
                  <div className="quiz-questions-container" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {Array.from({ length: Number(formData.quiz_length) }, (_, i) => i).map((index) => {
                      const questionNum = index + 1;
                      const question = formData.quiz_questions[index] || { question: '', options: { a: '', b: '', c: '', d: '' } };
                      return (
                        <div key={questionNum} className="question-card" style={{ 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '8px', 
                          padding: '16px',
                          backgroundColor: '#f9f9f9'
                        }}>
                          {/* Question Text Input */}
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                              Question {questionNum} *
                            </label>
                            <input
                              type="text"
                              value={question.question || ''}
                              onChange={(e) => handleQuestionTextChange(index, e.target.value)}
                              placeholder={`Enter question ${questionNum}`}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontFamily: 'inherit'
                              }}
                              required
                            />
                          </div>

                          {/* Options Grid */}
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '10px', color: '#666' }}>
                              Answer Options
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              {['a', 'b', 'c', 'd'].map((optKey) => (
                                <div key={optKey} style={{ display: 'flex', flexDirection: 'column' }}>
                                  <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#333' }}>
                                    Option {optKey.toUpperCase()}
                                  </label>
                                  <input
                                    type="text"
                                    value={question.options[optKey] || ''}
                                    onChange={(e) => handleOptionChange(index, optKey, e.target.value)}
                                    placeholder={`Option ${optKey.toUpperCase()}`}
                                    style={{
                                      padding: '8px 10px',
                                      border: '1px solid #d9d9d9',
                                      borderRadius: '4px',
                                      fontSize: '13px',
                                      fontFamily: 'inherit'
                                    }}
                                    required
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Correct Answer Selection */}
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '10px', color: '#666' }}>
                              Correct Answer *
                            </label>
                            <div style={{ display: 'flex', gap: '16px' }}>
                              {['a', 'b', 'c', 'd'].map((option) => (
                                <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                                  <input
                                    type="radio"
                                    name={`question_${questionNum}`}
                                    value={option}
                                    checked={quizCorrectAnswers[questionNum] === option}
                                    onChange={() => handleQuizAnswerChange(questionNum, option)}
                                    style={{ cursor: 'pointer' }}
                                  />
                                  <span>{option.toUpperCase()}</span>
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
            </>
          )}

          {/* Row 4: Description (Rich Text Editor with full Word-like functionality, Full Width) */}
          <div className="form-group grid-item-1-6">
            <label htmlFor="body">Description</label>
            <div className="rich-text-editor">
              <div className="editor-toolbar" onMouseDown={(e) => e.preventDefault()}>
                <div className="toolbar-group">
                  <button type="button" title="Bold" onMouseDown={(e) => {e.preventDefault(); formatText('bold')}}>
                    <b>B</b>
                  </button>
                  <button type="button" title="Italic" onMouseDown={(e) => {e.preventDefault(); formatText('italic')}}>
                    <i>I</i>
                  </button>
                  <button type="button" title="Underline" onMouseDown={(e) => {e.preventDefault(); formatText('underline')}}>
                    <u>U</u>
                  </button>
                  <button type="button" title="Strikethrough" onMouseDown={(e) => {e.preventDefault(); formatText('strikethrough')}}>
                    <span style={{textDecoration: 'line-through'}}>S</span>
                  </button>
                </div>
                
                <div className="toolbar-group">
                  <select onChange={(e) => formatText('formatBlock', e.target.value)} defaultValue="">
                    <option value="">Format</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="pre">Preformatted</option>
                  </select>
                  
                  <select onChange={(e) => formatText('fontSize', e.target.value)} defaultValue="3">
                    <option value="1">Small</option>
                    <option value="5">Large</option>
                    <option value="6">Huge</option>
                  </select>
                </div>
                
                <div className="toolbar-group">
                  <button type="button" title="Align Left" onMouseDown={(e) => {e.preventDefault(); formatText('justifyLeft')}}>
                    <span className="material-icons">format_align_left</span>
                  </button>
                  <button type="button" title="Align Center" onMouseDown={(e) => {e.preventDefault(); formatText('justifyCenter')}}>
                    <span className="material-icons">format_align_center</span>
                  </button>
                  <button type="button" title="Align Right" onMouseDown={(e) => {e.preventDefault(); formatText('justifyRight')}}>
                    <span className="material-icons">format_align_right</span>
                  </button>
                  <button type="button" title="Justify" onMouseDown={(e) => {e.preventDefault(); formatText('justifyFull')}}>
                    <span className="material-icons">format_align_justify</span>
                  </button>
                </div>
                
                <div className="toolbar-group">
                  <button type="button" title="Bullet List" onMouseDown={(e) => {e.preventDefault(); formatText('insertUnorderedList')}}>
                    <span className="material-icons">format_list_bulleted</span>
                  </button>
                  <button type="button" title="Numbered List" onMouseDown={(e) => {e.preventDefault(); formatText('insertOrderedList')}}>
                    <span className="material-icons">format_list_numbered</span>
                  </button>
                </div>
                
                <div className="toolbar-group">
                  <input 
                    type="color" 
                    title="Text Color" 
                    onChange={(e) => handleColorChange('foreColor', e.target.value)}
                    style={{width: '30px', height: '30px', border: 'none', backgroundColor: 'transparent'}}
                  />
                  <input 
                    type="color" 
                    title="Background Color" 
                    onChange={(e) => handleColorChange('hiliteColor', e.target.value)}
                    style={{width: '30px', height: '30px', border: 'none', backgroundColor: 'transparent'}}
                  />
                </div>
                
                <div className="toolbar-group">
                  <button type="button" title="Undo" onMouseDown={(e) => {e.preventDefault(); formatText('undo')}}>
                    <span className="material-icons">undo</span>
                  </button>
                  <button type="button" title="Redo" onMouseDown={(e) => {e.preventDefault(); formatText('redo')}}>
                    <span className="material-icons">redo</span>
                  </button>
                </div>
              </div>
              <div
                id="body"
                name="body"
                contentEditable
                className="editor-content"
                style={{ minHeight: '200px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                dangerouslySetInnerHTML={{ __html: formData.body }}
                onBlur={(e) => handleRichTextChange('body', e.target.innerHTML)}
              ></div>
            </div>
          </div>

          {/* Row 5: Image Upload (Full Width) - Hidden for Quiz */}
          {formData.content_type !== 'quiz' && (
            <div className="grid-item-1-6">
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
                  <span className="material-icons upload-icon">image</span>
                  <p>Drag and drop an image, or <span>Browse</span></p>
                  <p className="upload-hint">Minimum 800px width recommended. Max 10MB each</p>
                </label>
              </div>
            </div>
          )}

          {/* Row 6: Photo Caption (Full Width) - Hidden for Quiz */}
          {formData.content_type !== 'quiz' && (
            <div className="form-group grid-item-1-6">
              <label htmlFor="photo_caption">Photo Caption</label>
              <input
                type="text"
                id="photo_caption"
                name="photo_caption"
                value={formData.photo_caption}
                onChange={handleChange}
                placeholder=""
              />
            </div>
          )}

          {/* Row 7: PDF Upload (Full Width) - Hidden for Quiz */}
          {formData.content_type !== 'quiz' && (
            <div className="grid-item-1-6">
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
                  <span className="material-icons upload-icon">picture_as_pdf</span>
                  <p>Drag and drop PDF file here, or <span>Browse</span></p>
                  <p className="upload-hint">Max PDF file size is 10MB</p>
                </label>
              </div>
            </div>
          )}

          </div> {/* End form-grid */}
        </form>
      </div>
    );
  }