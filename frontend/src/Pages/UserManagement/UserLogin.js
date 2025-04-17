import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './user.css'
import GoogalLogo from './img/glogo.png'

function UserLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userID', data.id); // Save user ID in local storage
        alert('Login successful!');
        navigate('/allPost');
      } else if (response.status === 401) {
        alert('Invalid credentials!');
      } else {
        alert('Failed to login!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="Auth_container">
      <div className="glass_container">
        <div className="Auth_innerContainer">
          <div className="Auth_content new_content">
            <div className="welcome_section">
              <h1 className="welcome_title">Welcome Back!</h1>
              <p className="welcome_subtitle">We're so excited to see you again!</p>
            </div>
            
            <form onSubmit={handleSubmit} className="Auth_form">
              <div className="input_group">
                <div className="Auth_formGroup">
                  <input
                    type="email"
                    name="email"
                    placeholder=""
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="Auth_input"
                  />
                  <label className="floating_label">Email Address</label>
                </div>
                <div className="Auth_formGroup">
                  <input
                    type="password"
                    name="password"
                    placeholder=""
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="Auth_input"
                  />
                  <label className="floating_label">Password</label>
                </div>
              </div>

              <div className="button_group">
                <button type="submit" className="Auth_button">
                  <span>Login</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
                
                <button
                  type="button"
                  onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                  className="Auth_googleButton"
                >
                  <img src={GoogalLogo} alt='glogo' className='glogo' />
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="Auth_footer">
                <p className="Auth_signupPrompt">
                  New here? <span onClick={() => (window.location.href = '/register')} className="Auth_signupLink">Create an account</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
