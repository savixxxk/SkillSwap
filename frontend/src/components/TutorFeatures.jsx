import React from 'react';
import { Search, SlidersHorizontal, ShieldCheck, BarChart3 } from 'lucide-react';
import './TutorFeatures.css';

const features = [
  {
    icon: <Search size={24} color="#3B82F6" />,
    bgColor: '#EFF6FF',
    title: 'Self-Paced Search',
    description: 'Search across 20+ subjects. Filter by availability, rating, and location.'
  },
  {
    icon: <SlidersHorizontal size={24} color="#8B5CF6" />,
    bgColor: '#F5F3FF',
    title: 'Advanced Filters',
    description: 'Match with your ideal tutor precisely by using specific advanced filtering.'
  },
  {
    icon: <ShieldCheck size={24} color="#10B981" />,
    bgColor: '#ECFDF5',
    title: 'Verified Tutors',
    description: 'Tutors pass strict background screening to guarantee top quality instruction.'
  },
  {
    icon: <BarChart3 size={24} color="#F59E0B" />,
    bgColor: '#FFFBEB',
    title: 'Performance Tracking',
    description: 'Track student progress, log lessons, manage schedules, and review past classes.'
  }
];

const TutorFeatures = () => {
  return (
    <div className="tutor-features-grid">
      {features.map((feature, index) => (
        <div key={index} className="feature-card">
          <div className="feature-icon" style={{ backgroundColor: feature.bgColor }}>
            {feature.icon}
          </div>
          <h3 className="feature-title">{feature.title}</h3>
          <p className="feature-description">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

export default TutorFeatures;
