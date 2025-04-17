import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import './UpdateUserProfile.css';

function UpdateUserProfile() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    skills: [],
    bio: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  useEffect(() => {
    fetch(`http://localhost:8080/user/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((data) => setFormData(data))
      .catch((error) => console.error('Error:', error));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        if (profilePicture) {
          const formData = new FormData();
          formData.append('file', profilePicture);
          await fetch(`http://localhost:8080/user/${id}/uploadProfilePicture`, {
            method: 'PUT',
            body: formData,
          });
        }
        alert('Profile updated successfully!');
        window.location.href = '/userProfile';
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="update-profile-container">
      <NavBar />
      <div className="update-profile-content">
        <div className="update-profile-card">
          <div className="update-profile-header">
            <h1>Update Your Profile</h1>
            <p>Make changes to your profile information</p>
          </div>

          <form onSubmit={handleSubmit} className="update-profile-form">
            <div className="profile-upload-section">
              <div className="profile-preview" onClick={() => document.getElementById('profile-upload').click()}>
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="preview-image" />
                ) : formData.profilePicturePath ? (
                  <img
                    src={`http://localhost:8080/uploads/profile/${formData.profilePicturePath}`}
                    alt="Current Profile"
                    className="preview-image"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <span>Click to upload</span>
                  </div>
                )}
              </div>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                hidden
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label className="floating-label">Full Name</label>
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label className="floating-label">Email Address</label>
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder=" "
                />
                <label className="floating-label">Password</label>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder=" "
                  maxLength="10"
                  pattern="[0-9]{10}"
                />
                <label className="floating-label">Phone</label>
              </div>
            </div>

            <div className="skills-section">
              <label className="section-label">Skills</label>
              <div className="skills-container">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button 
                      type="button"
                      className="remove-skill"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="skill-input-group">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="form-input"
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <button 
                  type="button"
                  onClick={handleAddSkill}
                  className="add-skill-btn"
                >
                  <IoMdAdd />
                </button>
              </div>
            </div>

            <div className="form-group full-width">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                required
                className="form-input"
                rows={4}
                placeholder=" "
              />
              <label className="floating-label">Bio</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="update-button">
                Save Changes
                <span className="button-icon">→</span>
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/userProfile')} 
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateUserProfile;
