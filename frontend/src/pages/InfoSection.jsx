import React from 'react';
import './InfoSection.css';

const InfoSection = ({ label, title, description, backgroundColor = 'var(--white)', children }) => {
  return (
    <section className="info-section" style={{ backgroundColor }}>
      <div className="container">
        <div className="info-header">
          <span className="section-label">{label}</span>
          <h2 className="info-title">{title}</h2>
          <p className="info-description">{description}</p>
        </div>
        {children && <div className="info-content-below">{children}</div>}
      </div>
    </section>
  );
};

export default InfoSection;
