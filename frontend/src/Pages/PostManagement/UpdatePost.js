import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import { motion, AnimatePresence } from "framer-motion";
import { IoCloudUpload, IoImageOutline, IoVideocam } from "react-icons/io5";
import './UpdatePost.css'
function UpdatePost() {
  const { id } = useParams(); // Get the post ID from the URL
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); // New state for category
  const [existingMedia, setExistingMedia] = useState([]); // Initialize as an empty array
  const [newMedia, setNewMedia] = useState([]); // New media files to upload
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Fetch the post details
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/posts/${id}`);
        const post = response.data;
        setTitle(post.title || ''); // Ensure title is not undefined
        setDescription(post.description || ''); // Ensure description is not undefined
        setCategory(post.category || ''); // Set category
        setExistingMedia(post.media || []); // Ensure media is an array
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to fetch post details.');
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchPost();
  }, [id]);

  const handleDeleteMedia = async (mediaUrl) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this media file?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${id}/media`, {
        data: { mediaUrl },
      });
      setExistingMedia(existingMedia.filter((url) => url !== mediaUrl)); // Remove from UI
      alert('Media file deleted successfully!');
    } catch (error) {
      console.error('Error deleting media file:', error);
      alert('Failed to delete media file.');
    }
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
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const maxImageCount = 3;

    let imageCount = existingMedia.filter((url) => !url.endsWith('.mp4')).length;
    let videoCount = existingMedia.filter((url) => url.endsWith('.mp4')).length;

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        return;
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
        if (imageCount > maxImageCount) {
          alert('You can upload a maximum of 3 images.');
          return;
        }
      } else if (file.type === 'video/mp4') {
        videoCount++;
        if (videoCount > 1) {
          alert('You can upload only 1 video.');
          return;
        }

        try {
          await validateVideoDuration(file);
        } catch (error) {
          alert(error);
          return;
        }
      } else {
        alert(`Unsupported file type: ${file.type}`);
        return;
      }
    }

    setNewMedia(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category); // Include category in the update
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="update-post-container"
    >
      <NavBar />
      <div className="update-content">
        {loading ? (
          <div className="loading-skeleton">
            {/* Add loading skeleton UI */}
          </div>
        ) : (
          <motion.div 
            className="form-container"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            <div className="form-header">
              <h1>Update Your Post</h1>
              <p>Make changes to your amazing post</p>
            </div>

            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-group">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder=" "
                />
                <label>Title</label>
              </div>

              <div className="form-group">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder=" "
                  rows={5}
                />
                <label>Description</label>
              </div>

             
              <div className="media-section">
                <h3>Media Files</h3>
                <div className="media-preview">
                  <AnimatePresence>
                    {existingMedia.map((mediaUrl, index) => (
                      <motion.div
                        key={index}
                        className="media-item"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        {mediaUrl.endsWith('.mp4') ? (
                          <div className="video-wrapper">
                            <video controls>
                              <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                            </video>
                            <IoVideocam className="media-icon" />
                          </div>
                        ) : (
                          <div className="image-wrapper">
                            <img src={`http://localhost:8080${mediaUrl}`} alt={`Media ${index}`} />
                            <IoImageOutline className="media-icon" />
                          </div>
                        )}
                        <button
                          type="button"
                          className="delete-media"
                          onClick={() => handleDeleteMedia(mediaUrl)}
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="upload-section">
                  <label className="upload-label">
                    <IoCloudUpload className="upload-icon" />
                    <span>Choose files to upload</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,video/mp4"
                      multiple
                      onChange={handleNewMediaChange}
                      hidden
                    />
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Update Post
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => navigate('/allPost')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default UpdatePost;
