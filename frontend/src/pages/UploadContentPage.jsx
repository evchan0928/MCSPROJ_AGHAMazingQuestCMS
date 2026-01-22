// src/pages/UploadContentPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadContentPage() {
  const navigate = useNavigate();
  
  // State to manage all form fields
  const [formData, setFormData] = useState({
    arMarker: false,
    quiz: false,
    enableBadges: false,
    code: '',
    shortTitle: '',
    contentTitle: '',
    slugIntro: '',
    topicTags: '',
    description: '', 
    metaKeywords: '',
    metaDescription: '',
    photoCaption: '',
    highlights: '', 
    chatBotAllow: true, 
    excludeAudio: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generic handler for all input changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  const handleSaveDraft = () => {
    // Simulate saving draft functionality
    console.log('Saving as draft:', { ...formData, imageFile, pdfFile });
    
    // In a real application, you would send the data to your backend
    alert('Content saved as draft successfully!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // --- Replace this with your actual API call ---
    console.log('Submitting Data:', formData, 'Image:', imageFile, 'PDF:', pdfFile);
    
    setTimeout(() => {
      setLoading(false);
      // Navigate away after successful submission
      // 🔑 FIX: The navigate function is now used, resolving the ESLint warning.
      navigate('/dashboard/content'); 
      
    }, 1500);
  }
  
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
                name="arMarker"
                checked={formData.arMarker}
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
                name="enableBadges"
                checked={formData.enableBadges}
                onChange={handleChange}
              />
              <span className="checkbox-custom"></span>
              Enable Badges
            </label>
          </div>
          <div className="action-buttons">
            <button type="button" className="secondary-action-btn" onClick={handleSaveDraft}>
              Save as Draft
            </button>
            <button type="submit" className="primary-action-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Main Form Grid Layout */}
        <div className="form-grid">
          
          {/* Row 1: Code, Short Title, Content Title (3 columns) */}
          <div className="form-group grid-item-1-2">
            <label htmlFor="code">Unity Access Token (Script) *</label>
            <div className="input-with-icon">
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Code"
                required
              />
              <span className="material-icons icon-right">delete</span>
            </div>
          </div>
          <div className="form-group grid-item-3-4">
            <label htmlFor="shortTitle">Short Title *</label>
            <input
              type="text"
              id="shortTitle"
              name="shortTitle"
              value={formData.shortTitle}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>
          <div className="form-group grid-item-5-6">
            <label htmlFor="contentTitle">Content Title *</label>
            <input
              type="text"
              id="contentTitle"
              name="contentTitle"
              value={formData.contentTitle}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>

          {/* Row 2: Slug Intro (Full Width) */}
          <div className="form-group grid-item-1-6">
            <label htmlFor="slugIntro">Slug Intro *</label>
            <input
              type="text"
              id="slugIntro"
              name="slugIntro"
              value={formData.slugIntro}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>
          
          {/* Row 3: Topic Tags (Full Width) */}
          <div className="form-group grid-item-1-6">
            <label htmlFor="topicTags">Topic Tags (1-2 tags in english) *</label>
            <input
              type="text"
              id="topicTags"
              name="topicTags"
              value={formData.topicTags}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>

          {/* Row 4: Description (Rich Text Editor with full Word-like functionality, Full Width) */}
          <div className="form-group grid-item-1-6">
            <label htmlFor="description">Description</label>
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
                id="description"
                name="description"
                contentEditable
                className="editor-content"
                style={{ minHeight: '200px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                dangerouslySetInnerHTML={{ __html: formData.description }}
                onBlur={(e) => handleRichTextChange('description', e.target.innerHTML)}
              ></div>
            </div>
          </div>

          {/* Row 5: Meta Keywords & Meta Description (2 columns) */}
          <div className="form-group grid-item-1-3">
            <label htmlFor="metaKeywords">Meta Keywords *</label>
            <textarea
              id="metaKeywords"
              name="metaKeywords"
              value={formData.metaKeywords}
              onChange={handleChange}
              rows="4"
              placeholder=""
              required
            ></textarea>
          </div>
          <div className="form-group grid-item-4-6">
            <label htmlFor="metaDescription">Meta Description *</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
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
            <label htmlFor="photoCaption">Photo Caption</label>
            <input
              type="text"
              id="photoCaption"
              name="photoCaption"
              value={formData.photoCaption}
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

          {/* Row 9: Chat Bot & Exclude Audio (Full Width control) */}
          <div className="form-group grid-item-1-6 chatbot-controls">
            <label className="chat-bot-label">Chat Bot</label>
            <div className="radio-group">
              <label className="radio-container">
                <input
                  type="radio"
                  name="chatBotAllow"
                  value="true"
                  checked={formData.chatBotAllow === true}
                  onChange={() => setFormData(prev => ({ ...prev, chatBotAllow: true }))}
                />
                <span className="radio-custom"></span>
                Allow
              </label>
              <label className="radio-container">
                <input
                  type="radio"
                  name="chatBotAllow"
                  value="false"
                  checked={formData.chatBotAllow === false}
                  onChange={() => setFormData(prev => ({ ...prev, chatBotAllow: false }))}
                />
                <span className="radio-custom"></span>
                Disallow
              </label>
            </div>
            <label className="checkbox-container exclude-audio-checkbox">
              <input
                type="checkbox"
                name="excludeAudio"
                checked={formData.excludeAudio}
                onChange={handleChange}
              />
              <span className="checkbox-custom"></span>
              Exclude Audio
            </label>
          </div>

          {/* Row 10: PDF Upload (Full Width) */}
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