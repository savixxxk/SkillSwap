import React from 'react';
import './CallToAction.css';

const CallToAction = () => {
  return (
    <section className="cta-section">
      <div className="container text-center">
        <h2 className="cta-title">Start Learning<br/>Smarter Today</h2>
        <p className="cta-subtitle">Join thousands of students and tutors on SkillSwap today.</p>
        <div className="cta-buttons">
          <button className="btn-primary cta-primary-btn">
             Find a Tutor Now
          </button>
          <button className="btn-outline cta-outline-btn">
             Become a Tutor
          </button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
