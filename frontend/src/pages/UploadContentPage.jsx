// src/pages/UploadContentPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, notification } from 'antd';
import { createContentItem } from '../api/django-api';

export default function UploadContentPage() {
  const navigate = useNavigate();
  
  // State to manage all form fields - using backend field names
  const [formData, setFormData] = useState({
    title: '',
    body: '', 
    status: 'for_editing', // Default status matching backend workflow
    content_type: 'text', // Changed to snake_case to match backend
    meta_keywords: '',  // Changed to snake_case to match backend
    meta_description: '', // Changed to snake_case to match backend
    photo_caption: '', // Changed to snake_case to match backend
    highlights: '', 
    ar_marker: false, // Changed to snake_case to match backend
    quiz: false,
    enable_badges: false, // Changed to snake_case to match backend
    chat_bot_allow: true, // Changed to snake_case to match backend
    exclude_audio: false, // Changed to snake_case to match backend
  });

  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generic handler for all input changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'radio' ? (type === 'radio' ? checked && value : checked) : value,
    }));
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
      // Create form data for file upload
      const contentData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        contentData.append(key, value);
      });
      
      // Add file if available
      if (imageFile) {
        contentData.append('file', imageFile);
      } else if (pdfFile) {
        contentData.append('file', pdfFile);
      }
      
      // Set status to draft
      contentData.set('status', 'for_editing');

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
      // Create form data for file upload
      const contentData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        contentData.append(key, value);
      });
      
      // Add file if available
      if (imageFile) {
        contentData.append('file', imageFile);
      } else if (pdfFile) {
        contentData.append('file', pdfFile);
      }
      
      // Set status to for approval
      contentData.set('status', 'for_approval');

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
        
        {/* Top Controls: Checkboxes and Action Buttons */}
        <div className="form-header-controls">
          <div className="checkbox-group">
            {/* Checkbox 1: AR Marker */}
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="ar_marker"
                checked={formData.ar_marker}
                onChange={handleChange}
              />
              <span className="checkbox-custom"></span>
              AR Marker
            </label>
            {/* Checkbox 2: Quiz */}
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="quiz"
                checked={formData.quiz}
                onChange={handleChange}
              />
              <span className="checkbox-custom"></span>
              Quiz
            </label>
            {/* Checkbox 3: Enable Badges */}
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="enable_badges"
                checked={formData.enable_badges}
                onChange={handleChange}
              />
              <span className="checkbox-custom"></span>
              Enable Badges
            </label>
          </div>
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
            </select>
          </div>

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

          {/* Row 5: Meta Keywords & Meta Description (2 columns) */}
          <div className="form-group grid-item-1-3">
            <label htmlFor="meta_keywords">Meta Keywords *</label>
            <textarea
              id="meta_keywords"
              name="meta_keywords"
              value={formData.meta_keywords}
              onChange={handleChange}
              rows="4"
              placeholder=""
              required
            ></textarea>
          </div>
          <div className="form-group grid-item-4-6">
            <label htmlFor="meta_description">Meta Description *</label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              rows="4"
              placeholder=""
              required
            ></textarea>
          </div>

          {/* Row 6: Image Upload (Full Width) */}
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

          {/* Row 7: Photo Caption (Full Width) */}
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

          {/* Row 8: Highlights (Rich Text Editor with full Word-like functionality, Full Width) */}
          <div className="form-group grid-item-1-6">
            <label htmlFor="highlights">Highlights</label>
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
                id="highlights"
                name="highlights"
                contentEditable
                className="editor-content"
                style={{ minHeight: '150px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                dangerouslySetInnerHTML={{ __html: formData.highlights }}
                onBlur={(e) => handleRichTextChange('highlights', e.target.innerHTML)}
              ></div>
            </div>
          </div>

          {/* Row 5: Chat Bot & Exclude Audio (Full Width control) */}
          <div className="form-group grid-item-1-6 chatbot-controls">
            <label className="chat-bot-label">Chat Bot</label>
            <div className="radio-group">
              <label className="radio-container">
                <input
                  type="radio"
                  name="chat_bot_allow"
                  value="true"
                  checked={formData.chat_bot_allow === true}
                  onChange={() => setFormData(prev => ({ ...prev, chat_bot_allow: true }))}
                />
                <span className="radio-custom"></span>
                Allow
              </label>
              <label className="radio-container">
                <input
                  type="radio"
                  name="chat_bot_allow"
                  value="false"
                  checked={formData.chat_bot_allow === false}
                  onChange={() => setFormData(prev => ({ ...prev, chat_bot_allow: false }))}
                />
                <span className="radio-custom"></span>
                Disallow
              </label>
            </div>
            <label className="checkbox-container exclude-audio-checkbox">
              <input
                type="checkbox"
                name="exclude_audio"
                checked={formData.exclude_audio}
                onChange={handleChange}
              />
              <span className="checkbox-custom"></span>
                Exclude Audio
              </label>
            </div>

            {/* Row 7: PDF Upload (Full Width) */}
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

          </div> {/* End form-grid */}
        </form>
      </div>
    );
  }