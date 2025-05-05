import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import './Templates.css'; // Import the updated CSS file
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";

function AddLearningPlan() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndUploadImage(file);
    }
  };

  const validateAndUploadImage = async (file) => {
    // Reset states
    setImageUploadError('');
    setIsImageUploading(false);
    setImage(null);
    setImagePreview(null);

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
      setImageUploadError('Only JPG and PNG files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('File size must be less than 5MB');
      return;
    }

    try {
      setIsImageUploading(true);
      
      // Create preview immediately
      setImagePreview(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        setImage(response.data);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setImageUploadError('Failed to upload image. Please try again.');
      setImagePreview(null);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndUploadImage(file);
    }
  };

  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (startDate === endDate) {
      alert("Start date and end date cannot be the same.");
      setIsSubmitting(false);
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be greater than end date.");
      setIsSubmitting(false);
      return;
    }

    const postOwnerID = localStorage.getItem('userID');
    const postOwnerName = localStorage.getItem('userFullName');

    if (!postOwnerID) {
      alert('Please log in to add a post.');
      navigate('/');
      return;
    }

    if (tags.length < 2) {
      alert("Please add at least two tags.");
      setIsSubmitting(false);
      return;
    }

    if (!templateID) {
      alert("Please select a template.");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = '';
      if (image) {
        imageUrl = image; // Use the uploaded image URL
      }

      // Create the new post object
      const newPost = {
        title,
        description,
        contentURL,
        tags,
        postOwnerID,
        postOwnerName,
        imageUrl,
        templateID,
        startDate, // New field
        endDate,   // New field
        category   // New field
      };

      // Submit the post data
      await axios.post('http://localhost:8080/learningPlan', newPost);
      alert('Post added successfully!');
      navigate('/allLearningPlan');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url; // Return the original URL if it's not a YouTube link
    } catch (error) {
      console.error('Invalid URL:', url);
      return ''; // Return an empty string for invalid URLs
    }
  };

  return (
    <div className="learning-plan-container">
      <NavBar />
      <div className="main-content">
        <div className="section-header">
          <h1>Create Learning Plan</h1>
          <p>Design your perfect learning journey</p>
        </div>
        
        <div className="two-column-layout">
          {/* Template Selection Section */}
          <div className="template-section">
            <div className="section-title">
              <h2>Choose Your Template</h2>
              <p>Select a layout that best fits your content</p>
            </div>
            <div className="templates-grid">
              <div 
                className={`template-card ${templateID === '1' ? 'selected' : ''}`}
                onClick={() => setTemplateID('1')}
              >
                <div className="template template-1">
                  <div className="template-preview">
                    <span className="template-badge">Template 1</span>
                    <p className='template_title'>{title || "Classic Layout"}</p>
                    <p className='template_dates'><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</p>
                    <p className='template_description'>{category || "Category"}</p>
                    <hr />
                    <p className='template_description'>{description || "Your content will appear here"}</p>
                    <div className="tags_preview">
                      {tags.length > 0 ? tags.map((tag, index) => (
                        <span key={index} className="tagname">#{tag}</span>
                      )) : <span className="tagname">#tags</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className={`template-card ${templateID === '2' ? 'selected' : ''}`}
                onClick={() => setTemplateID('2')}
              >
                <div className="template template-2">
                  <div className="template-preview">
                    <span className="template-badge">Template 2</span>
                    <p className='template_title'>{title || "Modern Layout"}</p>
                    <p className='template_dates'><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</p>
                    <p className='template_description'>{category || "Category"}</p>
                    <hr />
                    <p className='template_description'>{description || "Your content will appear here"}</p>
                    <div className="tags_preview">
                      {tags.length > 0 ? tags.map((tag, index) => (
                        <span key={index} className="tagname">#{tag}</span>
                      )) : <span className="tagname">#tags</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className={`template-card ${templateID === '3' ? 'selected' : ''}`}
                onClick={() => setTemplateID('3')}
              >
                <div className="template template-3">
                  <div className="template-preview">
                    <span className="template-badge">Template 3</span>
                    <p className='template_title'>{title || "Creative Layout"}</p>
                    <p className='template_dates'><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</p>
                    <p className='template_description'>{category || "Category"}</p>
                    <hr />
                    <p className='template_description'>{description || "Your content will appear here"}</p>
                    <div className="tags_preview">
                      {tags.length > 0 ? tags.map((tag, index) => (
                        <span key={index} className="tagname">#{tag}</span>
                      )) : <span className="tagname">#tags</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="form-section">
            <div className="section-title">
              <h2>Create Your Learning Plan</h2>
              <p>Fill in the details of your learning journey</p>
              
            </div>
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-row">
                <div className="form-group full-width">
                  <input
                    className="form-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label className="floating-label">Learning Plan Title *</label>
                </div>
              </div>

              <div className="form-row two-columns">
                <div className="form-group">
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Bakery">Bakery</option>
                    <option value="cake">Cake</option>
                    <option value="lunch">Lunch</option>
                  </select>
                  <label className="floating-label">Learning Category *</label>
                </div>

                <div className="form-group tags-container">
                  <div className="tags-input-container">
                    <input
                      className="form-input tag-input"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder=" "
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <label className="floating-label">Topic Tags * (minimum 2)</label>
                    <button type="button" className="tag-add-btn" onClick={handleAddTag}>
                      <IoMdAdd />
                    </button>
                  </div>
                  <div className="tags-list">
                    {tags.map((tag, index) => (
                      <span key={index} className="tag-item">
                        #{tag}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => setTags(tags.filter((_, i) => i !== index))}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row two-columns">
                <div className="form-group">
                  <input
                    className="form-input"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    placeholder=" "
                  />
                  <label className="floating-label">Start Date *</label>
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    placeholder=" "
                  />
                  <label className="floating-label">Target End Date *</label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <textarea
                    className="form-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder=" "
                    required
                    rows={4}
                  />
                  <label className="floating-label">Learning Plan Description *</label>
                </div>
              </div>

              <div className="media-section">
                <div className="media-buttons">
                  <button 
                    type="button" 
                    className={`media-btn ${showContentURLInput ? 'active' : ''}`}
                    onClick={() => setShowContentURLInput(!showContentURLInput)}
                  >
                    <FaVideo /> <span>Add Video</span>
                  </button>
                  <button 
                    type="button" 
                    className={`media-btn ${showImageUploadInput ? 'active' : ''}`}
                    onClick={() => setShowImageUploadInput(!showImageUploadInput)}
                  >
                    <FaImage /> <span>Add Image</span>
                  </button>
                </div>

                {showContentURLInput && (
                  <div className="form-group media-input">
                    <input
                      className="form-input"
                      type="url"
                      value={contentURL}
                      onChange={(e) => setContentURL(e.target.value)}
                      placeholder=" "
                    />
                    <label className="floating-label">Video URL</label>
                  </div>
                )}

                {showImageUploadInput && (
                  <div className="form-group media-input">
                    <div 
                      className={`file-upload-container ${isDragging ? 'dragging' : ''}`}
                      onDragEnter={handleDragEnter}
                      onDragOver={(e) => e.preventDefault()}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleImageChange}
                        id="image-upload"
                        className="hidden-input"
                        disabled={isImageUploading}
                      />
                      
                      {imagePreview ? (
                        <div className="image-preview-container">
                          <img src={imagePreview} alt="Preview" className="preview-image" />
                          <div className="image-preview-overlay">
                            <div className="image-actions">
                              <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => {
                                  setImage(null);
                                  setImagePreview(null);
                                  setImageUploadError('');
                                }}
                                disabled={isImageUploading}
                              >
                                Remove
                              </button>
                              <button 
                                type="button"
                                className={`change-image-btn ${isImageUploading ? 'disabled' : ''}`}
                                onClick={() => document.getElementById('image-upload').click()}
                              >
                                Change Image
                              </button>
                            </div>
                          </div>
                          {isImageUploading && (
                            <div className="upload-loading-overlay">
                              <div className="upload-spinner"></div>
                              <span>Uploading...</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="upload-placeholder"
                          onClick={() => document.getElementById('image-upload').click()}
                        >
                          <div className={`upload-label ${isImageUploading ? 'disabled' : ''}`}>
                            <div className="upload-content">
                              <FaImage className="upload-icon" />
                              <span className="upload-text">
                                {isImageUploading ? 'Uploading...' : 'Click or drag image here'}
                              </span>
                              <span className="upload-hint">Max size: 5MB. JPG, PNG files only</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {imageUploadError && (
                        <div className="upload-error">
                          <span className="error-message">{imageUploadError}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="loading">Creating your plan...</span>
                ) : (
                  <span>Create Learning Plan</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddLearningPlan;