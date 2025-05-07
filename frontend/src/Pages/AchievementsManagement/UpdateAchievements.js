import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloudUpload, IoImage, IoClose, IoChevronDown } from "react-icons/io5";
import { FiCheckCircle } from 'react-icons/fi';
import { FaLaptopCode, FaCode, FaUtensils, FaCamera } from "react-icons/fa";
import NavBar from '../../Components/NavBar/NavBar';
import './UpdateAchievements.css';

function UpdateAchievements() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    postOwnerID: '',
    postOwnerName: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const categories = [
    { value: 'Tech', label: 'Technology', icon: FaLaptopCode },
    { value: 'Programming', label: 'Programming', icon: FaCode },
    { value: 'Cooking', label: 'Cooking', icon: FaUtensils },
    { value: 'Photography', label: 'Photography', icon: FaCamera }
  ];

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch achievement');
        }
        const data = await response.json();
        setFormData(data);
        if (data.imageUrl) {
          setPreviewImage(`http://localhost:8080/achievements/images/${data.imageUrl}`);
        }
      } catch (error) {
        console.error('Error fetching Achievements data:', error);
        alert('Error loading achievement data');
      }
    };
    fetchAchievement();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
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
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCategorySelect = (value) => {
    handleInputChange({ target: { name: 'category', value } });
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }
        imageUrl = await uploadResponse.text();
      }

      // Update achievement data
      const updatedData = { ...formData, imageUrl };
      const response = await fetch(`http://localhost:8080/achievements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = '/allAchievements';
        }, 1500);
      } else {
        throw new Error('Failed to update achievement');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred during update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="achievement-update-container">
      <NavBar />
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            className="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FiCheckCircle className="success-icon" />
            <p>Successfully Updated!</p>
          </motion.div>
        )}
        
        <motion.div 
          className="update-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="form-header">
            <h1>Update Learning Progress</h1>
            <p>Refine and improve your milestone</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="media-section"
                 onDragOver={handleDragOver}
                 onDragLeave={handleDragLeave}
                 onDrop={handleDrop}>
              <motion.div 
                className={`upload-container ${isDragging ? 'dragging' : ''}`}
                whileHover={{ scale: 1.02 }}
              >
                {previewImage ? (
                  <div className="preview-wrapper">
                    <motion.img
                      src={previewImage}
                      alt="Achievement Preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                    <div className="preview-actions">
                      <button type="button" onClick={() => document.getElementById('file-input').click()}>
                        <IoImage />
                        <span>Change Image</span>
                      </button>
                      <button 
                        type="button" 
                        className="remove-btn"
                        onClick={() => {
                          setPreviewImage('');
                          setSelectedFile(null);
                        }}
                      >
                        <IoClose />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="upload-label" htmlFor="file-input">
                    <IoCloudUpload className="upload-icon" />
                    <span>Choose an image to upload</span>
                    <p className="upload-hint">Drag & drop or click to browse</p>
                  </label>
                )}
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden-input"
                />
              </motion.div>
            </div>

            <div className="form-fields">
              <div className="input-group">
                <div className="floating-input">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                  />
                  <label>Learning Progress Title</label>
                  {errors.title && (
                    <motion.span 
                      className="error-message"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.title}
                    </motion.span>
                  )}
                </div>

                <div className="floating-input category-dropdown" ref={dropdownRef}>
                  <div 
                    className={`custom-select ${isDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="selected-option">
                      {formData.category ? (
                        <>
                          {categories.find(cat => cat.value === formData.category)?.icon?.({ className: 'category-icon' })}
                          <span>{categories.find(cat => cat.value === formData.category)?.label}</span>
                        </>
                      ) : (
                        <span className="placeholder">Select Category</span>
                      )}
                      <IoChevronDown className={`arrow-icon ${isDropdownOpen ? 'open' : ''}`} />
                    </div>
                    
                    {isDropdownOpen && (
                      <motion.div 
                        className="options-container"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {categories.map((category) => (
                          <div
                            key={category.value}
                            className={`option ${formData.category === category.value ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategorySelect(category.value);
                            }}
                          >
                            <category.icon className="category-icon" />
                            <span>{category.label}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  <label className="floating-label">Category</label>
                  {errors.category && (
                    <motion.span 
                      className="error-message"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.category}
                    </motion.span>
                  )}
                </div>

                <div className="floating-input description-field">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                    rows={4}
                  />
                  <label className="floating-label">Description</label>
                  {errors.description && (
                    <motion.span className="error-message">
                      {errors.description}
                    </motion.span>
                  )}
                </div>

                <div className="floating-input">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                  <label>Achievement Date</label>
                  {errors.date && (
                    <motion.span 
                      className="error-message"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.date}
                    </motion.span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <motion.button
                type="submit"
                className="submit-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Achievement'
                )}
              </motion.button>
              <motion.button
                type="button"
                className="cancel-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/allAchievements'}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default UpdateAchievements;
