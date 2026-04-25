import React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="glow-circle left"></div>
        <div className="glow-circle right"></div>
      </div>
      
      <div className="container hero-content">
        <div className="badge hero-badge">
          <span className="dot-pulse"></span>
          OVER 100 ACTIVE TUTORS
        </div>

        <h1 className="hero-title">
          Find Your <br/> <span className="text-gold">Perfect Tutor</span> <br/> Today
        </h1>

        <p className="hero-subtitle">
          Match with top-rated tutors for personalized learning and student success - all in one place.
        </p>

        <div className="search-bar">
          <div className="search-input-wrapper">
             <Search className="search-icon" size={20} />
             <input type="text" placeholder="What do you want to learn? (IT & Software...)" />
          </div>
          <button className="btn-primary search-btn">
            Find Tutors <ArrowRight size={16} />
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <h2>100+</h2>
            <p>Active Tutors</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h2>1,000+</h2>
            <p>Students Enrolled</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h2>98%</h2>
            <p>Satisfaction Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
