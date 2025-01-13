import React, { useState } from 'react';
import axios from 'axios';

const ReviewModal = ({ show, onClose, productID, productName, userID, onReviewSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!show) {
        return null; // Don't render the modal if `show` is false
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure all fields are filled correctly before submission
        if (!rating || !comment) {
            setError('Please provide both rating and comment.');
            return;
        }

        const reviewData = {
            productID: productID,
            userID: userID,
            rating: rating,
            comment: comment,
        };

        try {
            const response = await axios.post('http://localhost:8800/reviews', reviewData);
            console.log('Review submitted:', response.data);
            setSuccess(true);
            setError(null);
            setComment(reviewData.comment); // Store the submitted comment
            setRating(reviewData.rating); // Store the submitted rating
            alert("Review submitted successfully.");
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.response?.data?.message || 'Error submitting review');
            setSuccess(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
            <button
                    className="close-button"
                    onClick={onClose}
                    aria-label="Close review modal"
                    style={{
                        position: 'absolute',
                        top: '1px',
                        right: '15px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        color: '#aaa',
                        cursor: 'pointer',
                        transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#f00'} // Hover effect
                    onMouseLeave={(e) => e.target.style.color = '#aaa'} // Hover effect
                >
                    &times;
                </button>
                <h3 style={{margin:'30px'}}>Leave a Review for {productName}</h3>
                {error && <p className="error">{error}</p>}
                {success ? (
                    <div className="review-summary">
                        <p className="success">Review submitted successfully!</p>
                        <h3>Your Review</h3>
                        <p><strong>Rating:</strong> {rating} / 5</p>
                        <p><strong>Comment:</strong> {comment}</p>
                        <button onClick={onClose}>Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Rating:</label>
                            <select
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                required
                            >
                                <option value="" disabled>
                                    Select Rating
                                </option>
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Comment:</label>
                            <textarea
                                
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your review here"
                                required
                                style={{padding:'15px'}}
                            ></textarea>
                        </div>
                        <button style={{backgroundColor:'#444'}}type="submit">Submit Review</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReviewModal;
