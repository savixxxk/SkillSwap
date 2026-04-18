import React from 'react';
import './HowItWorks.css';

const steps = [
  {
    number: '1',
    title: 'Search Your Subject',
    description: 'Find the ideal tutor to help you achieve your goals and excel in your learning journey.'
  },
  {
    number: '2',
    title: 'View & Compare',
    description: 'Check ratings, reviews, availability, and compare top-rated tutors near you.'
  },
  {
    number: '3',
    title: 'Book a Session',
    description: 'Select a time that works best for you and easily book your personalized session.'
  },
  {
    number: '4',
    title: 'Learn & Review',
    description: 'Start learning directly from experts and leave your honest review.'
  }
];

const HowItWorks = () => {
  return (
    <section className="how-it-works-section">
      <div className="container">
        <div className="hiw-header text-center">
          <span className="section-label dark-context">HOW IT WORKS</span>
          <h2 className="hiw-title">How SkillSwap Works</h2>
          <p className="hiw-subtitle">Get started with your perfect tutor in just 4 easy steps.</p>
        </div>

        <div className="steps-container">
          {/* Connector line behind steps */}
          <div className="steps-connector"></div>
          
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-icon-wrapper">
                  <div className="step-icon">
                    <div className="step-number">{step.number}</div>
                  </div>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
