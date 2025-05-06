import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import { motion, AnimatePresence } from "framer-motion";
import { IoCloudUpload, IoImageOutline, IoVideocam, IoTrash, IoArrowBack, IoSave } from "react-icons/io5";
import './UpdatePost.css';

function UpdatePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [existingMedia, setExistingMedia] = useState([]);
  const [newMedia, setNewMedia] = useState([]);
  const [newMediaPreviews, setNewMediaPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customCategory, setCustomCategory] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/posts/${id}`);
        const post = response.data;
        setTitle(post.title || '');
        setDescription(post.description || '');
        setCategory(post.category || '');
        setExistingMedia(post.media || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to fetch post details.');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    // Create previews for newly added media files
    if (newMedia.length > 0) {
      const previews = newMedia.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type
      }));
      setNewMediaPreviews(previews);
      
      // Clean up URLs when component unmounts
      return () => {
        previews.forEach(preview => URL.revokeObjectURL(preview.url));
      };
    }
  }, [newMedia]);

  const handleDeleteMedia = async (mediaUrl) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this media file?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/posts/${id}/media`, {
        data: { mediaUrl },
      });
      setExistingMedia(existingMedia.filter((url) => url !== mediaUrl));
      alert('Media file deleted successfully!');
    } catch (error) {
      console.error('Error deleting media file:', error);
      alert('Failed to delete media file.');
    }
  };

  const removeNewMedia = (index) => {
    const updatedMedia = [...newMedia];
    updatedMedia.splice(index, 1);
    setNewMedia(updatedMedia);
    
    const updatedPreviews = [...newMediaPreviews];
    URL.revokeObjectURL(updatedPreviews[index].url);
    updatedPreviews.splice(index, 1);
    setNewMediaPreviews(updatedPreviews);
  };

  const validateVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          reject(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
        } else {
          resolve();
        }
      };

      video.onerror = () => {
        reject(`Failed to load video metadata for ${file.name}.`);
      };
    });
  };

  const handleNewMediaChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    handleNewMediaFiles(files);
  };

  const handleNewMediaFiles = async (files) => {
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const maxImageCount = 3;

    let imageCount = existingMedia.filter((url) => !url.endsWith('.mp4')).length;
    let videoCount = existingMedia.filter((url) => url.endsWith('.mp4')).length;

    // Count already added new media
    imageCount += newMedia.filter(file => file.type.startsWith('image/')).length;
    videoCount += newMedia.filter(file => file.type === 'video/mp4').length;

    const validFiles = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        continue;
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
        if (imageCount > maxImageCount) {
          alert('You can upload a maximum of 3 images.');
          break;
        }
        validFiles.push(file);
      } else if (file.type === 'video/mp4') {
        videoCount++;
        if (videoCount > 1) {
          alert('You can upload only 1 video.');
          break;
        }

        try {
          await validateVideoDuration(file);
          validFiles.push(file);
        } catch (error) {
          alert(error);
        }
      } else {
        alert(`Unsupported file type: ${file.type}`);
      }
    }

    if (validFiles.length > 0) {
      setNewMedia([...newMedia, ...validFiles]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleNewMediaFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title for your post.');
      return;
    }
    
    if (!description.trim()) {
      alert('Please provide a description for your post.');
      return;
    }
    
    if (!category) {
      alert('Please select a category.');
      return;
    }
    
    if (category === 'Others' && !customCategory.trim()) {
      alert('Please specify the custom category.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category === 'Others' ? customCategory : category);
    newMedia.forEach((file) => formData.append('newMediaFiles', file));

    try {
      await axios.put(`http://localhost:8080/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post updated successfully!');
      navigate('/allPost');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="loading-skeleton">
      <div className="skeleton-header"></div>
      <div className="skeleton-input"></div>
      <div className="skeleton-textarea"></div>
      <div className="skeleton-select"></div>
      <div className="skeleton-media-grid">
        <div className="skeleton-media-item"></div>
        <div className="skeleton-media-item"></div>
      </div>
      <div className="skeleton-upload"></div>
      <div className="skeleton-buttons"></div>
    </div>
  );

  return (
    <div className="update-post-container">
      <NavBar />
      <div className="page-background"></div>
      
      <div className="update-content">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <motion.div 
            className="form-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="form-header" variants={itemVariants}>
              <h1>Update Your Post</h1>
              <p>Make your content even more amazing</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="modern-form">
              <motion.div className="form-group" variants={itemVariants}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder=" "
                  maxLength={100}
                />
                <label>Title</label>
                <div className="input-border"></div>
              </motion.div>

              <motion.div className="form-group" variants={itemVariants}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder=" "
                  rows={5}
                  maxLength={1000}
                />
                <label>Description</label>
                <div className="input-border"></div>
                <div className="char-count">{description.length}/1000</div>
              </motion.div>

              <motion.div className="form-group category-group" variants={itemVariants}>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value !== 'Others') {
                      setCustomCategory('');
                    }
                  }}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Drinks">Drinks and MilkShakes</option>
                  <option value="Bakery">Bakery Items</option>
                  <option value="Cooking">Cooking Items</option>
                  <option value="Others">Others</option>
                </select>
                <div className="select-arrow"></div>

                <AnimatePresence>
                  {category === 'Others' && (
                    <motion.div 
                      className="form-group custom-category"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category"
                        required={category === 'Others'}
                      />
                      <div className="input-border"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div className="media-section" variants={itemVariants}>
                <h3>Media Files</h3>
                <p className="media-info">You can upload up to 3 images and 1 video (30 sec max)</p>
                
                {(existingMedia.length > 0 || newMediaPreviews.length > 0) && (
                  <div className="media-preview">
                    <AnimatePresence>
                      {existingMedia.map((mediaUrl, index) => (
                        <motion.div
                          key={`existing-${index}`}
                          className="media-item"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {mediaUrl.endsWith('.mp4') ? (
                            <div className="video-wrapper">
                              <video controls>
                                <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                              </video>
                              <div className="media-type-indicator video">
                                <IoVideocam />
                                <span>Video</span>
                              </div>
                            </div>
                          ) : (
                            <div className="image-wrapper">
                              <img src={`http://localhost:8080${mediaUrl}`} alt={`Media ${index}`} />
                              <div className="media-type-indicator image">
                                <IoImageOutline />
                                <span>Image</span>
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            className="delete-media"
                            onClick={() => handleDeleteMedia(mediaUrl)}
                            aria-label="Delete media"
                          >
                            <IoTrash />
                          </button>
                        </motion.div>
                      ))}
                      
                      {newMediaPreviews.map((preview, index) => (
                        <motion.div
                          key={`new-${index}`}
                          className="media-item new-media"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {preview.type.startsWith('video/') ? (
                            <div className="video-wrapper">
                              <video controls>
                                <source src={preview.url} type={preview.type} />
                              </video>
                              <div className="media-type-indicator video">
                                <IoVideocam />
                                <span>New Video</span>
                              </div>
                            </div>
                          ) : (
                            <div className="image-wrapper">
                              <img src={preview.url} alt={`New media ${index}`} />
                              <div className="media-type-indicator image">
                                <IoImageOutline />
                                <span>New Image</span>
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            className="delete-media"
                            onClick={() => removeNewMedia(index)}
                            aria-label="Remove new media"
                          >
                            <IoTrash />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                <div 
                  className={`upload-section ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <label className="upload-label">
                    <IoCloudUpload className="upload-icon" />
                    <span className="upload-title">Drop files here or click to browse</span>
                    <span className="upload-subtitle">Accept JPG, PNG or MP4 (Max: 50MB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,video/mp4"
                      multiple
                      onChange={handleNewMediaChange}
                      hidden
                    />
                  </label>
                </div>
              </motion.div>

              <motion.div className="form-actions" variants={itemVariants}>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => navigate('/allPost')}
                >
                  <IoArrowBack className="button-icon" />
                  <span>Cancel</span>
                </button>
                <button type="submit" className="submit-button">
                  <IoSave className="button-icon" />
                  <span>Update Post</span>
                </button>
              </motion.div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default UpdatePost;