import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import GoogalLogo from './img/glogo.png';
import { IoMdAdd } from "react-icons/io";

function UserRegister() {
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
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [userEnteredCode, setUserEnteredCode] = useState('');
    const [skillInput, setSkillInput] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddSkill = () => {
        if (skillInput.trim()) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput] });
            setSkillInput('');
        }
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

    const triggerFileInput = () => {
        document.getElementById('profilePictureInput').click();
    };

    const sendVerificationCode = async (email) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('verificationCode', code);
        try {
            await fetch('http://localhost:8080/sendVerificationCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
        } catch (error) {
            console.error('Error sending verification code:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;

        if (!formData.email) {
            alert("Email is required");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            alert("Email is invalid");
            isValid = false;
        }

        if (!profilePicture) {
            alert("Profile picture is required");
            isValid = false;
        }
        if (formData.skills.length < 2) {
            alert("Add atleast two skills");
            isValid = false;
        }
        if (!isValid) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullname: formData.fullname,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    skills: formData.skills,
                    bio: formData.bio,
                }),
            });

            if (response.ok) {
                const userId = (await response.json()).id;

                if (profilePicture) {
                    const profileFormData = new FormData();
                    profileFormData.append('file', profilePicture);
                    await fetch(`http://localhost:8080/user/${userId}/uploadProfilePicture`, {
                        method: 'PUT',
                        body: profileFormData,
                    });
                }

                sendVerificationCode(formData.email);
                setIsVerificationModalOpen(true);
            } else if (response.status === 409) {
                alert('Email already exists!');
            } else {
                alert('Failed to register user.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleVerifyCode = () => {
        const savedCode = localStorage.getItem('verificationCode');
        if (userEnteredCode === savedCode) {
            alert('Verification successful!');
            localStorage.removeItem('verificationCode');
            window.location.href = '/';
        } else {
            alert('Invalid verification code. Please try again.');
        }
    };

    return (
        <div className="Auth_container">
            <div className="glass_container">
                <div className="register_inner_container">
                    <div className="register_content">
                        <div className="register_header">
                            <h1 className="register_title">Create Account</h1>
                            <p className="register_subtitle">Join our community today!</p>
                        </div>

                        <form onSubmit={handleSubmit} className="register_form">
                            <div className="profile_upload_section">
                                <div className="profile-icon-container" onClick={triggerFileInput}>
                                    {previewImage ? (
                                        <img src={previewImage} alt="Selected Profile" className="profile_preview" />
                                    ) : (
                                        <FaUserCircle className="profile_icon" />
                                    )}
                                </div>
                                <input id="profilePictureInput" type="file" accept="image/*" onChange={handleProfilePictureChange} hidden />
                            </div>

                            <div className="form_grid">
                                <div className="form_group">
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleInputChange}
                                        required
                                        className="form_input"
                                        placeholder=" "
                                    />
                                    <label className="floating_label">Full Name</label>
                                </div>
                                <div className="form_group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="form_input"
                                        placeholder=" "
                                    />
                                    <label className="floating_label">Email Address</label>
                                </div>
                                <div className="form_group">
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="form_input"
                                        placeholder=" "
                                    />
                                    <label className="floating_label">Password</label>
                                </div>
                                <div className="form_group">
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const re = /^[0-9\b]{0,10}$/;
                                            if (re.test(e.target.value)) {
                                                handleInputChange(e);
                                            }
                                        }}
                                        maxLength="10"
                                        pattern="[0-9]{10}"
                                        title="Please enter exactly 10 digits."
                                        required
                                        className="form_input"
                                        placeholder=" "
                                    />
                                    <label className="floating_label">Phone</label>
                                </div>
                            </div>

                            <div className="skills_section">
                                <label className="section_label">Skills</label>
                                <div className="skills_container">
                                    {formData.skills.map((skill, index) => (
                                        <span key={index} className="skill_tag">
                                            {skill}
                                            <span className="remove_skill" onClick={() => {
                                                const newSkills = formData.skills.filter((_, i) => i !== index);
                                                setFormData({ ...formData, skills: newSkills });
                                            }}>×</span>
                                        </span>
                                    ))}
                                </div>
                                <div className="skill_input_group">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        className="form_input"
                                        placeholder="Add a skill"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                    />
                                    <button type="button" onClick={handleAddSkill} className="add_skill_btn">
                                        <IoMdAdd />
                                    </button>
                                </div>
                            </div>

                            <div className="form_group full_width">
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    required
                                    className="form_input"
                                    rows={4}
                                    placeholder=" "
                                />
                                <label className="floating_label">Bio</label>
                            </div>

                            <div className="form_actions">
                                <button type="submit" className="submit_button">
                                    Create Account
                                    <span className="button_icon">→</span>
                                </button>
                                
                                <div className="separator">
                                    <span className="separator_text">or</span>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'} 
                                    className="google_button"
                                >
                                    <div className="google_button_content">
                                        <img src={GoogalLogo} alt='Google' className='google_icon' />
                                        <span>Continue with Google</span>
                                    </div>
                                </button>
                            </div>

                            <div className="auth_footer">
                                <p className="login_prompt">
                                    Already have an account? 
                                    <button 
                                        type="button"
                                        onClick={() => window.location.href = '/'} 
                                        className="login_link"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            {isVerificationModalOpen && (
                <div className="verification_modal">
                    <div className="modal_content">
                        <div className="modal_header">
                            <h2 className="modal_title">Email Verification</h2>
                            <p className="modal_description">
                                We've sent a verification code to <br/>
                                <span className="user_email">{formData.email}</span>
                            </p>
                        </div>
                        
                        <div className="verification_input_container">
                            <div className="otp_fields">
                                {Array(6).fill(0).map((_, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        className="otp_input"
                                        value={userEnteredCode[index] || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) {
                                                const newCode = userEnteredCode.split('');
                                                newCode[index] = val;
                                                const finalCode = newCode.join('');
                                                setUserEnteredCode(finalCode);
                                                
                                                if (val && e.target.nextSibling) {
                                                    e.target.nextSibling.focus();
                                                }
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
                                                e.target.previousSibling.focus();
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                            <button onClick={handleVerifyCode} className="verify_button">
                                Verify Code
                            </button>
                            <div className="verification_footer">
                                <p>Didn't receive the code?</p>
                                <button 
                                    type="button"
                                    className="resend_button"
                                    onClick={() => sendVerificationCode(formData.email)}
                                >
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserRegister;
