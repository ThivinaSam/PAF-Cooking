import React, { useState } from 'react';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import './AddNewPost.css';

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

  // Update the validateTitle function
  const validateTitle = (value) => {
    // Regex that allows English, Sinhala and spaces
    // Unicode ranges: 
    // - \u0D80-\u0DFF : Sinhala
    // - \u0020 : Space
    // - a-zA-Z : English letters
    const validCharactersRegex = /^[\u0D80-\u0DFF\u0020a-zA-Z\s]*$/;
    
    // Remove extra spaces and split into words
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    const currentWordCount = words.length;
    setTitleWordCount(currentWordCount);

    // Validate word count and characters
    if (currentWordCount > 25) {
      setTitleError('Title must not exceed 25 words');
      return false;
    } else if (!validCharactersRegex.test(value)) {
      setTitleError('Title can only contain Sinhala and English letters');
      return false;
    } else if (value.length > 100) {
      setTitleError('Title must not exceed 100 characters');
      return false;
    } else if (value.trim().length === 0) {
      setTitleError('Title cannot be empty');
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
    <div>
      <div className='continer'>
        <NavBar />
        <div className='continSection'>
          <div className="from_continer">
            <p className="Auth_heading">Add a New Post...</p>
            <form onSubmit={handleSubmit} className='from_data'>
              <div className="Auth_formGroup">
                <label className="Auth_label">Title</label>
                <input
                  className="Auth_input"
                  type="text"
                  placeholder="Enter title in Sinhala or English (max 25 words)"
                  value={title}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setTitle(newValue);
                    validateTitle(newValue);
                  }}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                  {titleError && 
                    <span style={{ color: 'red', fontSize: '12px' }}>
                      {titleError}
                    </span>
                  }
                  <span style={{ 
                    fontSize: '12px', 
                    color: titleWordCount > 25 ? 'red' : 'green' 
                  }}>
                    {titleWordCount} words
                  </span>
                </div>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Description</label>
                <textarea
                  className="Auth_input"
                  placeholder="Description (10-50 words)"
                  value={description}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setDescription(newValue);
                    validateDescription(newValue);
                  }}
                  required
                  rows={3}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                  {descriptionError && 
                    <span style={{ color: 'red', fontSize: '12px' }}>
                      {descriptionError}
                    </span>
                  }
                  <span style={{ 
                    fontSize: '12px', 
                    color: wordCount < 10 ? 'red' : wordCount > 50 ? 'red' : 'green' 
                  }}>
                    {wordCount} words
                  </span>
                </div>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Category</label>
                <select
                  className="Auth_input"
                  value={categories}
                  onChange={(e) => {
                    setCategories(e.target.value);
                    if (e.target.value !== 'Others') {
                      setCustomCategory('');
                    }
                  }}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Tech">Drinks</option>
                  <option value="Programming">Bakery</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Photography">Cakes and Sweets</option>
                  <option value="Others">Others</option>
                </select>
                {categories === 'Others' && (
                  <input
                    className="Auth_input"
                    type="text"
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{ marginTop: '10px' }}
                    required
                  />
                )}
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Media</label>
                <div className='seket_media'>
                  {mediaPreviews.map((preview, index) => (
                    <div key={index}>
                      {preview.type.startsWith('video/') ? (
                        <video controls className='media_file_se'>
                          <source src={preview.url} type={preview.type} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img className='media_file_se' src={preview.url} alt={`Media Preview ${index}`} />
                      )}
                    </div>
                  ))}
                </div>
                <input
                  className="Auth_input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,video/mp4"
                  multiple
                  onChange={handleMediaChange}
                />
              </div>
              <button type="submit" className="Auth_button">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddNewPost;
