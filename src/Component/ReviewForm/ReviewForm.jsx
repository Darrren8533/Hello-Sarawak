import React, { useState, useEffect } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { submitReview } from '../../../Api/api';

const ReviewForm = ({ isOpen, onClose, propertyId }) => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add useEffect to manage body overflow similar to Reviews.jsx
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (review.trim() === '') {
      setError('Please write a review');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Get the user ID from localStorage
      const userId = localStorage.getItem('userid');
      
      if (!userId) {
        setError('You must be logged in to submit a review');
        setIsSubmitting(false);
        return;
      }
      
      // Create the review data object
      const reviewData = {
        userid: parseInt(userId),
        propertyid: parseInt(propertyId),
        review: review,
        rating: rating
      };
      
      // Call the API endpoint to submit the review
      const response = await submitReview(reviewData);
      
      // Success
      setSuccess('Your review has been submitted!');
      setReview('');
      setRating(0);
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      setError(error.message || 'An error occurred while submitting your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="filter-overlay">
      <div className="filter-overlay-content">
        <div className="filter-header">
          <h3>Write a Review</h3>
          <button className="cls-button" onClick={onClose}>
            <IoMdClose />
          </button>
        </div>
        
        <div className="filter-content-scrollable">
          <form onSubmit={handleSubmit} className="review-form">
            
            <div className="rating-selection">
              <h4>Rate your experience</h4>
              <div className="star-rating">
                {[...Array(5)].map((star, index) => {
                  const ratingValue = index + 1;
                  
                  return (
                    <label key={index}>
                      <input 
                        type="radio" 
                        name="rating" 
                        value={ratingValue}
                        onClick={() => setRating(ratingValue)}
                        style={{ display: "none" }}
                      />
                      <FaStar 
                        className="star" 
                        size={24}
                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                        style={{ cursor: "pointer" }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
            
            <div className="review-input">
              <h4>Your review</h4>
              <textarea
                rows={5}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this property..."
                maxLength={255}
              />
              <div className="character-count">
                {review.length}/255 characters
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="review-form-buttons">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm; 
