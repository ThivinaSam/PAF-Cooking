import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import './MyAchievements.css';
import NavBar from '../../Components/NavBar/NavBar';
import { motion, AnimatePresence } from 'framer-motion';
import { FaAward, FaTrophy, FaMedal, FaSort } from "react-icons/fa";
import { IoStatsChart, IoGrid, IoList, IoAdd } from "react-icons/io5";

function MyAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    categories: {}
  });
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        const userFilteredData = data.filter((achievement) => achievement.postOwnerID === userId);
        setProgressData(userFilteredData);
        setFilteredData(userFilteredData);
        setStats({
          total: userFilteredData.length,
          thisMonth: userFilteredData.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length,
          categories: userFilteredData.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + 1;
            return acc;
          }, {})
        });
      })
      .catch((error) => console.error('Error fetching Achievements data:', error));
  }, [userId]);

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="achievements-dashboard"
    >
      <NavBar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-title">
            <h1>My Learning Progress</h1>
            <p>Track your progress and celebrate milestones</p>
          </div>

          <div className="stats-banner">
            <div className="stat-card">
              <FaTrophy className="stat-icon trophy" />
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Learning Progress</span>
              </div>
            </div>
            <div className="stat-card">
              <IoStatsChart className="stat-icon trending" />
              <div className="stat-info">
                <span className="stat-value">{stats.thisMonth}</span>
                <span className="stat-label">This Month</span>
              </div>
            </div>
          </div>

          <div className="controls-section">
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <IoGrid />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <IoList />
              </button>
            </div>

            <motion.button
              className="add-achievement-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/addAchievements'}
            >
              <IoAdd />
              <span>New Learning Progress</span>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          <motion.div 
            className={`achievements-grid ${viewMode}`}
            layout
          >
            {filteredData.length === 0 ? (
              <motion.div 
                className="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FaTrophy className="empty-icon" />
                <h3>No Learning Progress Yet</h3>
                <p>Start documenting your journey</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/addAchievements'}
                >
                  Add First Achievement
                </motion.button>
              </motion.div>
            ) : (
              filteredData.map((progress) => (
                <motion.div 
                  key={progress.id}
                  className="achievement-card"
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                >
                  <div className='user_details_card'>
                    <div className='name_section_post_achi'>
                      <p className='name_section_post_owner_name'>{progress.postOwnerName}</p>
                      <p className='date_card_dte'> {progress.date}</p>
                    </div>
                    {progress.postOwnerID === userId && (
                      <div className='action_btn_icon_post'>
                        <FaEdit 
                          onClick={() => (window.location.href = `/updateAchievements/${progress.id}`)} 
                          className='action_btn_icon' 
                        />
                        <RiDeleteBin6Fill 
                          onClick={() => handleDelete(progress.id)} 
                          className='action_btn_icon' 
                        />
                      </div>
                    )}
                  </div>
                  <div className='dis_con'>
                    <p className='topic_cont'>{progress.title}</p>
                    <p className='dis_con_pera' style={{ whiteSpace: "pre-line" }}>{progress.description}</p>
                    {progress.imageUrl && (
                      <img 
                        className='achievement_image'
                        alt="Achievement"
                        src={`http://localhost:8080/achievements/images/${progress.imageUrl}`}
                      />
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default MyAchievements;