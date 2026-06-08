import React, { useState } from 'react';
import './SharedComponents.css';

export default function DoctorRating({ consultationId, onRated }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/consultations/${consultationId}/rate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, review_text: reviewText })
      });
      if (res.ok) {
        setSubmitted(true);
        if (onRated) onRated();
      }
    } catch (err) {
      console.error('Error submitting rating', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ background: 'rgba(16,185,129,0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
        <div style={{ color: '#f59e0b', fontSize: '1.4rem', marginBottom: '8px', letterSpacing: '2px' }}>
          {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </div>
        <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>Rating submitted. Thank you for your feedback.</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Rate Your Consultation</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
        Your feedback helps improve our system and helps other patients choose the right specialist.
      </p>
      
      <div className="star-rating-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (hover || rating) ? 'active' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(rating)}
          >
            ★
          </span>
        ))}
      </div>

      <textarea
        placeholder="Write a brief review about your experience (optional)..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        style={{
          width: '100%',
          minHeight: '80px',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '12px',
          color: 'white',
          marginBottom: '16px',
          resize: 'vertical',
          outline: 'none'
        }}
      />

      <button 
        className="btn btn--glow" 
        onClick={handleSubmit} 
        disabled={rating === 0 || isSubmitting}
        style={{ width: '100%' }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  );
}

