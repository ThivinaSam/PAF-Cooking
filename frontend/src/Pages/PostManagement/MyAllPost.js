import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSend, IoAdd, IoSearch, IoPlay } from "react-icons/io5";
import { FaEdit, FaCommentAlt } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { BiSolidLike } from "react-icons/bi";
import Modal from 'react-modal';
import NavBar from '../../Components/NavBar/NavBar';
import { GrUpdate } from "react-icons/gr";
import { FiSave } from "react-icons/fi";
import { TbPencilCancel } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import './MyAllPost.css';
Modal.setAppElement('#root');

const formatTimeAgo = (dateString) => {
  const now = new Date();
  const postDate = new Date(dateString);
  const secondsAgo = Math.floor((now - postDate) / 1000);

  if (secondsAgo < 60) {
    return 'Just now';
  } else if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (secondsAgo < 604800) {
    const days = Math.floor(secondsAgo / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return postDate.toLocaleDateString();
  }
};

function MyAllPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postOwners, setPostOwners] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [newComment, setNewComment] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/posts');
        const userID = localStorage.getItem('userID');

        // Filter posts to include only those with the logged-in user's ID
        const userPosts = response.data.filter((post) => post.userID === userID);

        setPosts(userPosts);
        setFilteredPosts(userPosts);

        // Fetch post owners' names
        const userIDs = [...new Set(userPosts.map((post) => post.userID))];
        const ownerPromises = userIDs.map((userID) =>
          axios.get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,
            }))
            .catch((error) => {
              console.error(`Error fetching user details for userID ${userID}:`, error);
              return { userID, fullName: 'Anonymous' };
            })
        );
        const owners = await Promise.all(ownerPromises);
        const ownerMap = owners.reduce((acc, owner) => {
          acc[owner.userID] = owner.fullName;
          return acc;
        }, {});
        setPostOwners(ownerMap);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      const userID = localStorage.getItem('userID');
      if (userID) {
        try {
          const response = await axios.get(`http://localhost:8080/user/${userID}/followedUsers`);
          setFollowedUsers(response.data);
        } catch (error) {
          console.error('Error fetching followed users:', error);
        }
      }
    };

    fetchFollowedUsers();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer) {
        if (window.scrollY > 10) {
          searchContainer.classList.add('scrolled');
        } else {
          searchContainer.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.textContent = 'Post deleted successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
      }, 100);
      
      setPosts(posts.filter((post) => post.id !== postId));
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleUpdate = (postId) => {
    navigate(`/updatePost/${postId}`);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    
    switch(filter) {
      case 'Popular':
        // Sort by likes count
        const sortedByLikes = [...posts].sort((a, b) => 
          Object.values(b.likes || {}).filter(liked => liked).length - 
          Object.values(a.likes || {}).filter(liked => liked).length
        );
        setFilteredPosts(sortedByLikes);
        break;
      case 'Recent':
        // Assuming posts have a createdAt field
        const sortedByDate = [...posts].sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setFilteredPosts(sortedByDate);
        break;
      case 'Following':
        // Show only posts from followed users
        setFilteredPosts(posts.filter(post => followedUsers.includes(post.userID)));
        break;
      default:
        // 'All' case - reset to all posts
        setFilteredPosts(posts);
    }
  };

  const handleLike = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to like a post.');
      return;
    }
    
    try {
      const response = await axios.put(`http://localhost:8080/posts/${postId}/like`, null, {
        params: { userID },
      });

      // Create a "liked" animation effect
      const likeButtons = document.querySelectorAll(`.like-btn-${postId}`);
      likeButtons.forEach(btn => {
        if (!btn.classList.contains('liked-animation')) {
          btn.classList.add('liked-animation');
          setTimeout(() => btn.classList.remove('liked-animation'), 500);
        }
      });

      // Update state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleFollowToggle = async (postOwnerID) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to follow or unfollow users.');
      return;
    }
    
    try {
      if (followedUsers.includes(postOwnerID)) {
        // Unfollow logic
        await axios.put(`http://localhost:8080/user/${userID}/unfollow`, { unfollowUserID: postOwnerID });
        setFollowedUsers(followedUsers.filter((id) => id !== postOwnerID));
      } else {
        // Follow logic
        await axios.put(`http://localhost:8080/user/${userID}/follow`, { followUserID: postOwnerID });
        setFollowedUsers([...followedUsers, postOwnerID]);
      }
    } catch (error) {
      console.error('Error toggling follow state:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Login first before comment.');
      return;
    }
    
    const content = newComment[postId] || '';
    if (!content.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    
    try {
      const response = await axios.post(`http://localhost:8080/posts/${postId}/comment`, {
        userID,
        content,
      });

      // Update the specific post's comments in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setNewComment({ ...newComment, [postId]: '' });
      
      // Scroll to newly added comment
      setTimeout(() => {
        const lastComment = document.querySelector(`.post-${postId} .coment_full_card:last-child`);
        if (lastComment) {
          lastComment.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const userID = localStorage.getItem('userID');
    try {
      await axios.delete(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        params: { userID },
      });

      // Update state to remove the deleted comment
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSaveComment = async (postId, commentId, content) => {
    try {
      const userID = localStorage.getItem('userID');
      await axios.put(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        userID,
        content,
      });

      // Update the comment in state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
            }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
            }
            : post
        )
      );

      setEditingComment({});
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase().trim();
    setSearchQuery(query);
  
    if (query === '') {
      setFilteredPosts(posts); // Reset to all posts when search is empty
      return;
    }
  
    const filtered = posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(query);
      const categoryMatch = post.category ? post.category.toLowerCase().includes(query) : false;
      
      return titleMatch || categoryMatch;
    });
  
    setFilteredPosts(filtered);
  };

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  const renderPostMedia = (post) => {
    if (!post.media || post.media.length === 0) {
      return null;
    }
  
    return (
      <div className={`media-collage media-count-${Math.min(post.media.length, 4)}`}>
        {post.media.slice(0, 4).map((mediaUrl, index) => (
          <motion.div
            key={index}
            className={`media-item ${post.media.length > 4 && index === 3 ? 'media-overlay' : ''}`}
            onClick={() => openModal(mediaUrl)}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            {mediaUrl.endsWith('.mp4') ? (
              <div className="video-thumbnail">
                <video 
                  preload="metadata"
                  className="hidden-video"
                >
                  <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                </video>
                <div className="video-overlay">
                  <IoPlay className="play-icon" />
                </div>
              </div>
            ) : (
              <img src={`http://localhost:8080${mediaUrl}`} alt="Post Media" />
            )}
            {post.media.length > 4 && index === 3 && (
              <div className="overlay-text">+{post.media.length - 4}</div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard-container"
    >
      <NavBar />
      <div className="content-wrapper">
        <motion.div 
          className="search-container"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="search-bar">
            <IoSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for recipes, people, and more..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <div className="filter-chips">
              {['All', 'Popular', 'Recent', 'Following'].map(filter => (
                <motion.button
                  key={filter}
                  className={`chip ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => handleFilterChange(filter)}
                  whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  {filter}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.button 
          className="create-post-btn"
          whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/addNewPost')}
        >
          <IoAdd size={20} />
          <span>Create Post</span>
        </motion.button>

        <AnimatePresence>
          {filteredPosts.length === 0 ? (
            <motion.div 
              className='empty-state'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className='empty-state-icon'></div>
              <h3>No posts found</h3>
              <p>Share your favorite recipes with the community</p>
              <motion.button 
                className='primary-button' 
                onClick={() => navigate('/addNewPost')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create New Post
              </motion.button>
            </motion.div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map((post, index) => (
                <motion.div 
                  key={post.id} 
                  className={`post-card post-${post.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <div className='post-header'>
                    <div className='user-info'>
                      <div className='user-avatar'>
                        {postOwners[post.userID]?.charAt(0) || 'A'}
                      </div>
                      <div className='user-details'>
                        <h4>{postOwners[post.userID] || 'Anonymous'}</h4>
                        <span className='post-time'>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className='post-actions'>
                      {post.userID !== loggedInUserID && (
                        <motion.button
                          className={`follow-button ${followedUsers.includes(post.userID) ? 'following' : ''}`}
                          onClick={() => handleFollowToggle(post.userID)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {followedUsers.includes(post.userID) ? 'Following' : 'Follow'}
                        </motion.button>
                      )}
                      
                      {post.userID === loggedInUserID && (
                        <div className='owner-actions'>
                          <motion.button 
                            className='icon-button edit'
                            onClick={() => handleUpdate(post.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            data-tooltip="Edit Post"
                          >
                            <FaEdit />
                          </motion.button>
                          <motion.button 
                            className='icon-button delete'
                            onClick={() => handleDelete(post.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            data-tooltip="Delete Post"
                          >
                            <RiDeleteBin6Fill />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className='post-content'>
                    <h3 className='post-title'>{post.title}</h3>
                    {post.category && (
                      <span className='post-category'>{post.category}</span>
                    )}
                    <p className='post-description'>{post.description}</p>
                  </div>
                  
                  {renderPostMedia(post)}
                  
                  <div className="social-interaction-section">
                    <div className="interaction-stats">
                      <motion.button 
                        className={`interaction-btn like-btn like-btn-${post.id} ${post.likes?.[loggedInUserID] ? 'active' : ''}`}
                        onClick={() => handleLike(post.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <BiSolidLike className="interaction-icon" />
                        <span>{Object.values(post.likes || {}).filter((liked) => liked).length}</span>
                      </motion.button>
                      <motion.button 
                        className="interaction-btn comment-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaCommentAlt className="interaction-icon" />
                        <span>{post.comments?.length || 0}</span>
                      </motion.button>
                    </div>

                    <div className="comments-section">
                      <div className="comment-input-wrapper">
                        <div className="user-avatar">
                          {loggedInUserID && postOwners[loggedInUserID]?.charAt(0)}
                        </div>
                        <div className="input-container">
                          <input
                            type="text"
                            className="comment-input"
                            placeholder="Share your thoughts..."
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          />
                          <motion.button 
                            className="send-button"
                            onClick={() => handleAddComment(post.id)}
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(102, 126, 234, 0.15)' }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <IoSend />
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="comments-list">
                        <AnimatePresence>
                          {post.comments?.map((comment) => (
                            <motion.div 
                              key={comment.id} 
                              className='comment-card'
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              layout
                            >
                              <div className='comment-content'>
                                <div className="comment-user-avatar">
                                  {comment.userFullName?.charAt(0) || 'A'}
                                </div>
                                <div className="comment-main">
                                  <div className="comment-header">
                                    <h5>{comment.userFullName}</h5>
                                    <span className="comment-time">
                                      {comment.createdAt ? formatTimeAgo(comment.createdAt) : 'Just now'}
                                    </span>
                                  </div>
                                  
                                  {editingComment.id === comment.id ? (
                                    <div className="edit-comment-container">
                                      <input
                                        type="text"
                                        className='edit-comment-input'
                                        value={editingComment.content}
                                        onChange={(e) =>
                                          setEditingComment({ ...editingComment, content: e.target.value })
                                        }
                                        autoFocus
                                      />
                                      <div className="edit-comment-actions">
                                        <motion.button 
                                          className="icon-button save"
                                          onClick={() => handleSaveComment(post.id, comment.id, editingComment.content)}
                                          whileHover={{ scale: 1.1 }}
                                        >
                                          <FiSave />
                                        </motion.button>
                                        <motion.button 
                                          className="icon-button cancel"
                                          onClick={() => setEditingComment({})}
                                          whileHover={{ scale: 1.1 }}
                                        >
                                          <TbPencilCancel />
                                        </motion.button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="comment-text">{comment.content}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className='comment-actions'>
                                {comment.userID === loggedInUserID && editingComment.id !== comment.id && (
                                  <>
                                    <motion.button 
                                      className="icon-button edit"
                                      onClick={() => setEditingComment({ id: comment.id, content: comment.content })}
                                      whileHover={{ scale: 1.1 }}
                                    >
                                      <GrUpdate />
                                    </motion.button>
                                    <motion.button 
                                      className="icon-button delete"
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      whileHover={{ scale: 1.1 }}
                                    >
                                      <MdDelete />
                                    </motion.button>
                                  </>
                                )}
                                {post.userID === loggedInUserID && comment.userID !== loggedInUserID && (
                                  <motion.button
                                    className="delete-btn"
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Delete
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal for displaying full media */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Media Viewer"
        className="media-modal"
        overlayClassName="media-modal-overlay"
      >
        <motion.div 
          className="modal-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="modal-header">
            <motion.button 
              className="close-button" 
              onClick={closeModal}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
            >
              <span className="close-icon">×</span>
            </motion.button>
          </div>
          <div className="modal-body">
            {selectedMedia && selectedMedia.endsWith('.mp4') ? (
              <div className="video-wrapper">
                <video controls className="modal-video" autoPlay>
                  <source src={`http://localhost:8080${selectedMedia}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="image-wrapper">
                <img src={`http://localhost:8080${selectedMedia}`} alt="Full Media" className="modal-image" />
              </div>
            )}
          </div>
        </motion.div>
      </Modal>
    </motion.div>
  );
}

export default MyAllPost;