import React, { useState, useEffect } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { fetchReviews } from '../../../Api/api';
import ReviewForm from '../ReviewForm/ReviewForm';
import './Reviews.css';

const Reviews = ({ isOpen, onClose, propertyId }) => {
  const [sortOption, setSortOption] = useState('Most recent');
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    totalReviews: 0,
  });
  
  // Add useEffect to manage body overflow
  useEffect(() => {
    if (isOpen) {
      // Save the current scroll position and body styles
      const scrollY = window.scrollY;
      const originalStyle = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
        paddingRight: document.body.style.paddingRight
      };
      
      // Prevent background scrolling - lock the body in place
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Add padding to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      // Cleanup function to restore original style when component unmounts or modal closes
      return () => {
        document.body.style.overflow = originalStyle.overflow;
        document.body.style.position = originalStyle.position;
        document.body.style.top = originalStyle.top;
        document.body.style.width = originalStyle.width;
        document.body.style.paddingRight = originalStyle.paddingRight;
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
  
  // Fetch reviews for the property
  useEffect(() => {
    if (isOpen && propertyId) {
      fetchReviews(propertyId)
        .then(data => {
          if (data.reviews) {
            setReviews(data.reviews);
            
            // Update the summary
            if (data.summary) {
              setSummary(data.summary);
            }
          }
        })
        .catch(err => {
          console.error('Error fetching reviews:', err);
          setError('Failed to load reviews. Please try again later.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, propertyId]);

  if (!isOpen) return null;

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    // Here you would re-sort the reviews based on the selected option
    // For now, we'll just update the state
  };

  const renderRatingBar = (rating, percentage) => {
    return (
      <div className="rating-bar-container">
        <div className="rating-number">{rating}</div>
        <div className="rating-bar">
          <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
  };
  
  const handleOpenReviewForm = () => {
    setReviewFormOpen(true);
  };
  
  const handleCloseReviewForm = () => {
    setReviewFormOpen(false);
    // Optionally refresh reviews after submission
    if (propertyId) {
      setIsLoading(true);
      fetchReviews(propertyId)
        .then(data => {
          if (data.reviews) {
            setReviews(data.reviews);
            
            // Update the summary
            if (data.summary) {
              setSummary(data.summary);
            }
          }
        })
        .catch(err => {
          console.error('Error fetching reviews:', err);
          setError('Failed to load reviews. Please try again later.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // Create a custom close handler to handle both state and body overflow
  const handleClose = () => {
    onClose();
  };
  
  // Use placeholder data if no reviews are available yet
  const displayReviews = reviews.length > 0 ? reviews : [
    {
      id: 1,
      name: "Ridzuan",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      yearsOnPlatform: 5,
      rating: 5,
      datePosted: "6 days ago",
      comment: "Quite and privacy on this place is on top 👍"
    },
    {
      id: 2,
      name: "MuhdNurAzreen",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      yearsOnPlatform: 0,
      isNew: true,
      rating: 5,
      datePosted: "1 week ago",
      comment: "very helpful"
    },
    {
      id: 3,
      name: "Sabrina",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      yearsOnPlatform: 1,
      rating: 3,
      datePosted: "1 week ago",
      comment: "Seamless check in, free parking, nice pool, the TV in the room was very easy to use and facilities were very convenient and helpful."
    }
  ];
  
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "star-filled" : "star-empty"} />
    ));
  };

  return (
    <>
      <div className="filter-overlay">
        <div className="filter-overlay-content">
          <div className="filter-header">
            <h3>Reviews</h3>
            <button className="cls-button" onClick={handleClose}>
              <IoMdClose />
            </button>
          </div>
          
          <div className="filter-content-scrollable">
            <div className="reviews-content">
              <div className="reviews-summary">
                <div className="reviews-average">
                  <FaStar className="star-icon" />
                  <span className="total-reviews">{summary.totalReviews} reviews</span>
                </div>
                
                <div className="sort-dropdown">
                  <select value={sortOption} onChange={handleSortChange}>
                    <option value="Most recent">Most recent</option>
                    <option value="Highest rated">Highest rated</option>
                    <option value="Lowest rated">Lowest rated</option>
                  </select>
                </div>
              </div>
              
              <div className="reviews-search-container">
                <div className="reviews-search">
                  <input 
                    type="text" 
                    placeholder="Search reviews" 
                    className="reviews-search-input"
                  />
                </div>
                
                <button 
                  className="submit-button" 
                  onClick={handleOpenReviewForm}
                >
                  Write a review
                </button>
              </div>
              
              {isLoading ? (
                <div className="loading">Loading reviews...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : (
                <div className="reviews-list">
                  {displayReviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="reviewer-info">
                        <img 
                          src={review.avatar ? 
                               (review.avatar.startsWith && review.avatar.startsWith('http') ? 
                                review.avatar : 
                                `data:image/jpeg;base64,${review.avatar}`) : 
                               `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`}
                          alt={review.name} 
                          className="reviewer-avatar" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`;
                          }}
                        />
                        <div className="reviewer-details">
                          <div className="reviewer-name">{review.name}</div>
                          {review.isNew ? (
                            <div className="reviewer-status">New user</div>
                          ) : (
                            <div className="reviewer-status">{review.yearsOnPlatform} {review.yearsOnPlatform === 1 ? 'year' : 'years'} on platform</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="review-content">
                        <div className="review-rating">
                          {review.rating && renderStars(review.rating)}
                          <span className="review-date">{review.datePosted}</span>
                        </div>
                        <p className="review-text">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ReviewForm 
        isOpen={reviewFormOpen} 
        onClose={handleCloseReviewForm} 
        propertyId={propertyId}
      />
    </>
  );
};

export default Reviews;
