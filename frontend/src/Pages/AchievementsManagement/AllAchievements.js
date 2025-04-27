import React, { useEffect, useState } from 'react';
import { FaAward, FaTrophy, FaMedal, FaCrown } from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { IoSearch, IoStatsChart, IoTrendingUp } from "react-icons/io5";
import { motion, AnimatePresence } from 'framer-motion';
import './Achievements.css';

function AllAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const userId = localStorage.getItem('userID');

  const categories = [
    { id: 'all', label: 'All Achievements', icon: FaTrophy },
    { id: 'technical', label: 'Technical', icon: FaAward },
    { id: 'soft', label: 'Soft Skills', icon: FaMedal },
    { id: 'certifications', label: 'Certifications', icon: FaCrown }
  ];

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        setProgressData(data);
        setFilteredData(data);
      })
      .catch((error) => console.error('Error fetching Achievements data:', error));
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = progressData.filter(
      (achievement) =>
        achievement.title.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Achievements?')) {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Achievements deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete Achievements.');
        }
      } catch (error) {
        console.error('Error deleting Achievements:', error);
      }
    }
  };

  return (
    <div className="achievements-container">
      <NavBar />
      <div className="achievements-content">
        <div className="achievements-header">
          <div className="header-top">
            <div className="header-title">
              <h1>Learning Progress</h1>
              <p className="subtitle">Track your journey of success</p>
            </div>
          </div>

          <div className="stats-banner">
            <div className="stat-item">
              <FaTrophy className="stat-icon trophy" />
              <div className="stat-details">
                <span className="stat-value">{filteredData.length}</span>
                <span className="stat-label">Total Learning Progress</span>
              </div>
            </div>
            <div className="stat-item">
              <IoStatsChart className="stat-icon trending" />
              <div className="stat-details">
                <span className="stat-value">
                  {filteredData.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length}
                </span>
                <span className="stat-label">This Month</span>
              </div>
            </div>
            <div className="stat-item">
              <IoTrendingUp className="stat-icon growth" />
              <div className="stat-details">
                <span className="stat-value">
                  {Math.round((filteredData.length / progressData.length) * 100)}%
                </span>
                <span className="stat-label">Growth Rate</span>
              </div>
            </div>
          </div>

          <div className="filter-section">
            <div className="search-container">
              <IoSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
            </div>

            <div className="category-filters">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-filter ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <cat.icon />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.button
          className="floating-add-button"
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)"
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => window.location.href = '/addAchievements'}
        >
          <div className="button-inner">
            <IoIosCreate className="add-icon" />
            <span className="button-text">Add Achievement</span>
          </div>
          <div className="button-glow" />
        </motion.button>

        <AnimatePresence>
          <div className="achievements-grid">
            {filteredData.length === 0 ? (
              <div className="empty-state">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="empty-content"
                >
                  <FaTrophy className="empty-icon" />
                  <h3>Start Your Achievement Journey</h3>
                  <p>Create your first milestone and track your progress</p>
                  <motion.button
                    className="first-achievement-btn"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/addAchievements'}
                  >
                    <IoIosCreate className="btn-icon" />
                    <span>Add First Achievement</span>
                    <div className="btn-shine"></div>
                  </motion.button>
                </motion.div>
              </div>
            ) : (
              <motion.div 
                className="cards-container"
                layout
              >
                {filteredData.map((progress) => (
                  <motion.div
                    key={progress.id}
                    className="achievement-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {progress.imageUrl && (
                      <motion.div 
                        className="achievement-media"
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src={`http://localhost:8080/achievements/images/${progress.imageUrl}`}
                          alt="Achievement"
                        />
                        <div className="media-overlay" />
                      </motion.div>
                    )}
                    
                    <div className="achievement-content">
                      <div className="achievement-meta">
                        <motion.div 
                          className="meta-header"
                          layout
                        >
                          <span className="achievement-date">{progress.date}</span>
                          <h3>{progress.title}</h3>
                        </motion.div>
                      </div>
                      
                      <p className="achievement-description">{progress.description}</p>
                      
                      <motion.div 
                        className="achievement-footer"
                        layout
                      >
                        <div className="achievement-tags">
                          <motion.span 
                            className="tag"
                            whileHover={{ scale: 1.05 }}
                          >
                            Professional
                          </motion.span>
                          <motion.span 
                            className="tag"
                            whileHover={{ scale: 1.05 }}
                          >
                            Growth
                          </motion.span>
                        </div>
                        
                        {progress.postOwnerID === userId && (
                          <div className="action-buttons">
                            <motion.button
                              className="action-btn edit-btn"
                              whileHover={{ 
                                scale: 1.05,
                                backgroundColor: '#667eea',
                                color: 'white' 
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => window.location.href = `/updateAchievements/${progress.id}`}
                            >
                              <MdEdit className="btn-icon" />
                              <span className="btn-text">Edit</span>
                            </motion.button>
                            <motion.button
                              className="action-btn delete-btn"
                              whileHover={{ 
                                scale: 1.05,
                                backgroundColor: '#ff4444',
                                color: 'white'
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(progress.id)}
                            >
                              <MdDelete className="btn-icon" />
                              <span className="btn-text">Delete</span>
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AllAchievements;
