import React, { useState } from "react";
import {
  FaBroom,
  FaCheckCircle,
  FaKey,
  FaComments,
  FaMapMarkerAlt,
  FaDollarSign,
} from "react-icons/fa";
import './Reviews.css';

const Reviews = ({ propertyDetails }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);

  return (
    <div className="reviews-section">
      {/* Overall Rating and Total Reviews */}
      <div className="review-summary">
        <div className="overall-rating">
          <span className="average-rating">4.81</span>
          <span className="total-reviews">· 1,559 reviews</span>
        </div>
        <button
          className="show-all-reviews-button"
          onClick={() => setShowAllReviews(true)}
        >
          Show all reviews
        </button>
      </div>

      {/* Ratings Breakdown */}
      <div className="ratings-breakdown">
        <div className="rating-category">
          <div className="category-icon">
            <FaBroom />
          </div>
          <div className="category-info">
            <span className="category-name">Cleanliness</span>
            <span className="category-rating">4.7</span>
          </div>
        </div>
        <div className="rating-category">
          <div className="category-icon">
            <FaCheckCircle />
          </div>
          <div className="category-info">
            <span className="category-name">Accuracy</span>
            <span className="category-rating">4.8</span>
          </div>
        </div>
        <div className="rating-category">
          <div className="category-icon">
            <FaKey />
          </div>
          <div className="category-info">
            <span className="category-name">Check-in</span>
            <span className="category-rating">4.9</span>
          </div>
        </div>
        <div className="rating-category">
          <div className="category-icon">
            <FaComments />
          </div>
          <div className="category-info">
            <span className="category-name">Communication</span>
            <span className="category-rating">4.9</span>
          </div>
        </div>
        <div className="rating-category">
          <div className="category-icon">
            <FaMapMarkerAlt />
          </div>
          <div className="category-info">
            <span className="category-name">Location</span>
            <span className="category-rating">4.8</span>
          </div>
        </div>
        <div className="rating-category">
          <div className="category-icon">
            <FaDollarSign />
          </div>
          <div className="category-info">
            <span className="category-name">Value</span>
            <span className="category-rating">4.8</span>
          </div>
        </div>
      </div>

      {/* Reviews Overlay */}
      {showAllReviews && (
        <div className="reviews-overlay">
          <div className="reviews-modal">
            <div className="reviews-header">
              <h2>Reviews</h2>
              <button
                className="close-button"
                onClick={() => setShowAllReviews(false)}
              >
                ✕
              </button>
            </div>
            <div className="reviews-content">
              {propertyDetails?.reviews?.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.reviewerName}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-rating">
                    <span className="rating">{review.rating}</span>
                  </div>
                  <p className="review-text">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;