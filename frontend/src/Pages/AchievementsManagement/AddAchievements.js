import React, { useState, useEffect, useRef } from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import './AddAchievements.css';
import { motion } from 'framer-motion';
import { IoCloudUpload, IoImage, IoCheckmarkCircle, IoClose } from "react-icons/io5";
import { FaLaptopCode, FaCode, FaUtensils, FaCamera } from "react-icons/fa";

function AddAchievements() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    postOwnerID: '',
    category: '',
    postOwnerName: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const categories = [
    { value: 'Tech', label: 'Technology', icon: FaLaptopCode },
    { value: 'Programming', label: 'Programming', icon: FaCode },
    { value: 'Cooking', label: 'Cooking', icon: FaUtensils },
    { value: 'Photography', label: 'Photography', icon: FaCamera }
  ];

  const validateImage = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return false;
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      setError(null);
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && validateImage(file)) {
      setError(null);
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (userId) {
      setFormData((prevData) => ({ ...prevData, postOwnerID: userId }));
      fetch(`http://localhost:8080/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.fullname) {
            setFormData((prevData) => ({ ...prevData, postOwnerName: data.fullname }));
          }
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategorySelect = (categoryValue) => {
    handleChange({ target: { name: 'category', value: categoryValue } });
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = '';
      if (image) {
        // Create a FormData specifically for the image upload
        const imageFormData = new FormData();
        imageFormData.append('file', image);
        
        try {
          const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
            method: 'POST',
            body: imageFormData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Upload failed with status: ${uploadResponse.status}`);
          }
          
          imageUrl = await uploadResponse.text();
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          alert(`Image upload failed: ${uploadError.message}`);
          setIsSubmitting(false);
          return;
        }
      }
  
      // Create the achievement with the image URL
      const achievementData = {
        ...formData,
        imageUrl: imageUrl
      };
  
      // Send the achievement data to create a new achievement
      const achievementResponse = await fetch('http://localhost:8080/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievementData),
      });
  
      if (!achievementResponse.ok) {
        const errorText = await achievementResponse.text();
        throw new Error(`Failed to create achievement: ${errorText}`);
      }
      
      alert('Achievement added successfully!');
      window.location.href = '/myAchievements';
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Failed to add Achievement: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="achievement-form-container">
      <NavBar />
      <motion.div 
        className="form-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="form-header">
          <h1>Add New Learning Progress</h1>
          <p>Share your milestone with the community</p>
          <div className="progress-steps">
            {[1, 2, 3].map((step) => (
              <div className={`step ${currentStep >= step ? 'active' : ''}`} key={step}>
                <div className="step-number">{step}</div>
                <div className="step-label">
                  {step === 1 ? 'Details' : step === 2 ? 'Media' : 'Review'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-section">
            <motion.div 
              className={`upload-section ${isDragging ? 'dragging' : ''}`}
              whileHover={{ scale: 1.02 }}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden-input"
              />
              <label htmlFor="image-upload" className="upload-label">
                {imagePreview ? (
                  <motion.div 
                    className="preview-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <div className="preview-overlay">
                      <div className="preview-actions">
                        <button 
                          type="button" 
                          className="change-image" 
                          onClick={() => document.getElementById('image-upload').click()}
                        >
                          <IoImage />
                          <span>Change</span>
                        </button>
                        <button 
                          type="button" 
                          className="remove-image"
                          onClick={() => {
                            setImage(null);
                            setImagePreview(null);
                          }}
                        >
                          <IoClose />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className={`upload-placeholder ${isDragging ? 'dragging' : ''}`}>
                    <IoCloudUpload className="upload-icon" />
                    <span className="upload-text">
                      {isDragging ? 'Drop your image here' : 'Drag & drop your image or click to browse'}
                    </span>
                    {error && <span className="error-message">{error}</span>}
                  </div>
                )}
              </label>
            </motion.div>

            <div className="input-group">
              <div className="floating-input">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label>Learning progress Title</label>
              </div>

              <div className="floating-input category-dropdown" ref={dropdownRef}>
                <div 
                  className={`custom-select ${isDropdownOpen ? 'open' : ''} ${formData.category ? 'has-value' : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="selected-option">
                    {formData.category ? (
                      <>
                        {categories.find(cat => cat.value === formData.category)?.icon?.({ className: 'category-icon' })}
                        <span>{categories.find(cat => cat.value === formData.category)?.label}</span>
                      </>
                    ) : (
                      <span className="placeholder">Choose a category</span>
                    )}
                  </div>
                  <label className="floating-label">Category</label>
                  {isDropdownOpen && (
                    <motion.div 
                      className="options-container"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
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
              </div>

              <div className="floating-input description-field">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  rows={4}
                  className={formData.description ? 'has-value' : ''}
                />
                <label className="floating-label">Description</label>
              </div>

              <div className="floating-input">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
                <label>Learning Progress Date</label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <motion.button
              type="submit"
              className="submit-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading">Submitting...</div>
              ) : (
                <>Add Learning Progress</>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default AddAchievements;
