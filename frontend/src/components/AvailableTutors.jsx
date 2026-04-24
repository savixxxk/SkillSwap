import React from 'react';
import { ArrowRight, Star, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AvailableTutors.css';

const TutorCard = ({ data }) => {
  const navigate = useNavigate();
  
  const handleBookSession = () => {
    navigate('/booking', { state: { tutor: data } });
  };
  return (
    <div className="tutor-card">
      <div className="tutor-card-top" style={{ background: data.gradient }}>
        <span className="tutor-mode-badge">{data.mode}</span>
        <div className="tutor-avatar">{data.letter}</div>
      </div>
      <div className="tutor-card-bottom">
        <h3 className="tutor-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {data.name}
          {data.isVerified && <BadgeCheck size={16} color="#3B82F6" title="Verified Tutor" />}
        </h3>
        <p className="tutor-subject">{data.subject}</p>
        <div className="tutor-tags">
          {data.tags.map((tag, i) => (
            <span key={i} className="tutor-tag">{tag}</span>
          ))}
        </div>
        <div className="tutor-card-footer">
          <div className="tutor-rating">
             <div className="stars">
               {[1,2,3,4,5].map(star => <Star key={star} size={14} fill="#F5A623" color="#F5A623" />)}
             </div>
             <span className="rating-score">{data.rating.toFixed(1)}</span>
             <span className="rating-reviews">({data.reviewsCount})</span>
          </div>
          <button className="btn-primary tutor-book-btn" onClick={handleBookSession}>Book Session</button>
        </div>
      </div>
    </div>
  );
}

const AvailableTutors = ({ tutors = [], isLoading = false }) => {
  return (
    <section className="available-tutors-section">
      <div className="container">
        <div className="tutors-header">
          <div className="tutors-header-text">
            <span className="section-label">EXPLORE</span>
            <h2 className="tutors-title">Available Tutors</h2>
            <p className="tutors-subtitle">Discover top-rated verified tutors in any subject.</p>
          </div>
          <button className="btn-outline view-all-btn">
            View All Tutors <ArrowRight size={16} />
          </button>
        </div>
        
        {isLoading ? (
          <div className="loading-state" style={{ textAlign: 'center', padding: '40px', color: '#3B82F6', fontWeight: 500 }}>
            <span className="spinner"></span> Loading top tutors...
          </div>
        ) : tutors.length > 0 ? (
          <div className="tutors-grid">
             {tutors.map((tutor, idx) => (
               <TutorCard key={tutor._id || idx} data={tutor} />
             ))}
          </div>
        ) : (
          <div className="no-tutors-found" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No tutors found matching your criteria.
          </div>
        )}
      </div>
    </section>
  );
};

export default AvailableTutors;
