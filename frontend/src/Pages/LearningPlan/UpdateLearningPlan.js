import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import { FiEdit } from 'react-icons/fi';
import { MdDashboardCustomize } from 'react-icons/md';
import './post.css';
import './Templates.css';
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";
import { FaImage, FaVideo } from "react-icons/fa";

function UpdateLearningPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/learningPlan/${id}`);
        const { title, description, contentURL, tags, imageUrl, templateID, startDate, endDate, category } = response.data;
        setTitle(title);
        setDescription(description);
        setContentURL(contentURL);
        setTags(tags);
        setExistingImage(imageUrl);
        setTemplateID(templateID);
        setStartDate(startDate);
        setEndDate(endDate);
        setCategory(category);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

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
    setImageUploadError('');
    setIsImageUploading(false);
    setImage(null);
    setImagePreview(null);

    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
      setImageUploadError('Only JPG and PNG files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('File size must be less than 5MB');
      return;
    }

    try {
      setIsImageUploading(true);
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
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = existingImage;

    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      try {
        const uploadResponse = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image.');
        return;
      }
    }

    const updatedPost = { title, description, contentURL, tags, imageUrl, postOwnerID: localStorage.getItem('userID'), templateID, startDate, endDate, category };
    try {
      await axios.put(`http://localhost:8080/learningPlan/${id}`, updatedPost);
      alert('Post updated successfully!');
      window.location.href = '/allLearningPlan';
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    }
  };

  return (
    <div className="learning-plan-container">
      <NavBar />
      <div className="main-content">
        <div className="section-header">
          <h1>Update Learning Plan</h1>
          <p>Modify your learning journey</p>
        </div>
        
        <div className="two-column-layout">
          {/* Template Selection Section */}
          <div className="template-section">
            <div className="section-title">
              <h2>Choose Your Template</h2>
              <p>Select a layout that best fits your content</p>
            </div>
            <div className="templates-grid">
              {[1, 2, 3].map((tempId) => (
                <div
                  key={tempId}
                  className={`template-card ${templateID === tempId ? 'active' : ''}`}
                  onClick={() => setTemplateID(tempId)}
                >
                  <div className="template-header">Template {tempId}</div>
                  <div className={`template template-${tempId}`}>
                    <p className='template_id_one'>template {tempId}</p>
                    {imagePreview ? (
                      <div className="image-preview-achi">
                        <img src={imagePreview} alt="Preview" className="iframe_preview" />
                      </div>
                    ) : existingImage && (
                      <div className="image-preview-achi">
                        <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="iframe_preview" />
                      </div>
                    )}
                    {contentURL && (
                      <iframe
                        src={getEmbedURL(contentURL)}
                        title="Content Preview"
                        className="iframe_preview"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    )}
                    <p className='template_title'>{title || "Title Preview"}</p>
                    <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
                    <p className='template_description'>{category}</p>
                    <hr></hr>
                    <p className='template_description'>{description || "Description Preview"}</p>
                    <div className="tags_preview">
                      {tags.map((tag, index) => (
                        <span key={index} className="tagname">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <div className="form-section">
            <div className="section-title">
              <h2>Update Your Learning Plan</h2>
              <p>Modify the details of your learning journey</p>
            </div>
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-grid">
                <div className="form-group floating">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="modern-input"
                    required
                    id="title"
                  />
                  <label htmlFor="title" className="floating-label">Title</label>
                </div>

                <div className="form-group floating">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="modern-input"
                    required
                    id="category"
                  >
                    <option value="" disabled></option>
                    <option value="Tech">Tech</option>
                    <option value="Programming">Programming</option>
                    <option value="Cooking">Cooking</option>
                    <option value="Photography">Photography</option>
                  </select>
                  <label htmlFor="category" className="floating-label">Category</label>
                </div>

                <div className="form-group floating date-group">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="modern-input"
                    required
                    id="startDate"
                  />
                  <label htmlFor="startDate" className="floating-label">Start Date</label>
                </div>

                <div className="form-group floating date-group">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="modern-input"
                    required
                    id="endDate"
                  />
                  <label htmlFor="endDate" className="floating-label">End Date</label>
                </div>
              </div>

              <div className="form-group floating">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="modern-input"
                  rows={4}
                  required
                  id="description"
                />
                <label htmlFor="description" className="floating-label">Description</label>
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
                  <div className="form-group">
                    <label>Image</label>
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
                      
                      {(imagePreview || existingImage) ? (
                        <div className="image-preview-container">
                          <img 
                            src={imagePreview || `http://localhost:8080/learningPlan/planImages/${existingImage}`} 
                            alt="Preview" 
                            className="preview-image" 
                          />
                          <div className="image-preview-overlay">
                            <div className="image-actions">
                              <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => {
                                  setImage(null);
                                  setImagePreview(null);
                                  setExistingImage('');
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

              <div className="form-group floating">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="modern-input"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  id="tags"
                />
                <label htmlFor="tags" className="floating-label">Add Tags</label>
                <button type="button" onClick={handleAddTag} className="add-tag-btn">
                  <IoMdAdd />
                </button>
              </div>

              <div className="tags-container">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                    <button type="button" onClick={() => handleDeleteTag(index)}>×</button>
                  </span>
                ))}
              </div>

              <button type="submit" className="submit-button">
                Update Learning Plan
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateLearningPost;
