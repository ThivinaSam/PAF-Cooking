import React, { useState } from 'react';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
function AddNewPost() {
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState(''); // Add this new state
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState(''); // Add this new state
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]); // For storing media preview objects
  const [categories, setCategories] = useState(''); // New state for categories
  const [wordCount, setWordCount] = useState(0); // Add this state at the top with other state declarations
  const [titleWordCount, setTitleWordCount] = useState(0);
  const [customCategory, setCustomCategory] = useState(''); // Add new state for custom category
  const userID = localStorage.getItem('userID');

  const validateTitle = (value) => {
    // Check for alphanumeric characters only
    const alphanumericRegex = /^[a-zA-Z0-9\s]*$/;
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    const currentWordCount = words.length;
    setTitleWordCount(currentWordCount);
    
    if (currentWordCount > 25) {
      setTitleError('Title must not exceed 25 words');
      return false;
    } else if (!alphanumericRegex.test(value)) {
      setTitleError('Title can only contain letters and numbers');
      return false;
    } else {
      setTitleError('');
      return true;
    }
  };

  const validateDescription = (value) => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    const currentWordCount = words.length;
    setWordCount(currentWordCount);

    if (currentWordCount < 10) {
      setDescriptionError('Description must have at least 10 words');
      return false;
    } else if (currentWordCount > 50) {
      setDescriptionError('Description must not exceed 50 words');
      return false;
    } else {
      setDescriptionError('');
      return true;
    }
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    let imageCount = 0;
    let videoCount = 0;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        window.location.reload();
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
      } else if (file.type === 'video/mp4') {
        videoCount++;

        // Validate video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            window.location.reload();
          }
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        window.location.reload();
      }

      // Add file preview object with type and URL
      previews.push({ type: file.type, url: URL.createObjectURL(file) });
    }

    if (imageCount > 3) {
      alert('You can upload a maximum of 3 images.');
      window.location.reload();
    }

    if (videoCount > 1) {
      alert('You can upload only 1 video.');
      window.location.reload();
    }

    setMedia(files);
    setMediaPreviews(previews); // Set preview objects
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate title and description before submission
    if (!validateTitle(title) || !validateDescription(description)) {
      return;
    }
    
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    // Use custom category if "Others" is selected
    formData.append('category', categories === 'Others' ? customCategory : categories);
    media.forEach((file, index) => formData.append(`mediaFiles`, file));

    try {
      const response = await axios.post('http://localhost:8080/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post created successfully!');
      window.location.href = '/myAllPost';
    } catch (error) {
      console.error(error);
      alert('Failed to create post.');
      window.location.reload();
    }
  };

  return (
    <div className="post-container">
      <NavBar />
      <div className="post-form-container">
        <h1 className="post-heading">Create New Post</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter an engaging title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                validateTitle(e.target.value);
              }}
              required
            />
            <div className="word-counter">
              {titleError && 
                <span style={{ color: '#e74c3c' }}>{titleError}</span>
              }
              <span style={{ 
                color: titleWordCount > 25 ? '#e74c3c' : '#2ecc71' 
              }}>
                {titleWordCount}/25 words
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              placeholder="Share your thoughts (10-50 words)..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                validateDescription(e.target.value);
              }}
              required
              rows={4}
            />
            <div className="word-counter">
              {descriptionError && 
                <span style={{ color: '#e74c3c' }}>{descriptionError}</span>
              }
              <span style={{ 
                color: wordCount < 10 || wordCount > 50 ? '#e74c3c' : '#2ecc71' 
              }}>
                {wordCount}/50 words
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={categories}
              onChange={(e) => {
                setCategories(e.target.value);
                if (e.target.value !== 'Others') setCustomCategory('');
              }}
              required
            >
              <option value="" disabled>Select a category</option>
              <option value="Tech">Technology</option>
              <option value="Programming">Programming</option>
              <option value="Cooking">Cooking</option>
              <option value="Photography">Photography</option>
              <option value="Others">Others</option>
            </select>
            {categories === 'Others' && (
              <input
                className="form-input"
                type="text"
                placeholder="Specify your category..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                style={{ marginTop: '0.5rem' }}
                required
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Media</label>
            <div className="media-preview">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="media-item">
                  {preview.type.startsWith('video/') ? (
                    <video controls>
                      <source src={preview.url} type={preview.type} />
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <img src={preview.url} alt={`Preview ${index + 1}`} />
                  )}
                </div>
              ))}
            </div>
            <input
              className="form-input"
              type="file"
              accept="image/jpeg,image/png,image/jpg,video/mp4"
              multiple
              onChange={handleMediaChange}
            />
            <small style={{ 
              display: 'block', 
              marginTop: '0.5rem', 
              color: '#666' 
            }}>
              Upload up to 3 images (JPG, PNG) or 1 video (MP4, max 30 seconds)
            </small>
          </div>

          <button type="submit" className="submit-button">
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddNewPost;
