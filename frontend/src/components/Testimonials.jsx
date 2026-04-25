import React from 'react';
import { Quote } from 'lucide-react';
import './Testimonials.css';

const testimonialsData = [
  {
    text: "I found a great Maths tutor in 20 minutes! My Grade 5 son loves his classes and is already showing progress.",
    letter: "B",
    color: "#3B82F6",
    name: "Beenu Amerasinghe",
    role: "O/L Student"
  },
  {
    text: "Personalized filters are a game changer. I was finding it difficult to get a qualified tutor with time – until I used SkillSwap to find exactly what I needed.",
    letter: "Y",
    color: "#10B981",
    name: "Yashmin Nazeer",
    role: "A/L Student"
  },
  {
    text: "Loved the UI experience and finding a reliable French tutor was so much easier. The filtering process removes all the guessing.",
    letter: "M",
    color: "#8B5CF6",
    name: "Mia Raymond",
    role: "BSc Student"
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <span className="section-label">TESTIMONIALS</span>
          <h2 className="testimonials-title">What Our Students Say</h2>
        </div>
        
        <div className="testimonials-grid">
          {testimonialsData.map((t, index) => (
            <div key={index} className="testimonial-card">
              <Quote className="quote-icon" size={24} />
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar" style={{ backgroundColor: t.color }}>{t.letter}</div>
                <div>
                  <h4 className="author-name">{t.name}</h4>
                  <p className="author-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
