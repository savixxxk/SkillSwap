import React from 'react';
import { Briefcase, Palette, MonitorPlay, Code, Globe, ToolCase, Shield, BarChart } from 'lucide-react';
import './CategoriesBar.css';

const categories = [
  { name: 'Business', icon: <Briefcase size={16} color="#3B82F6" /> },
  { name: 'Data Science', icon: <BarChart size={16} color="#EC4899" /> },
  { name: 'IT & Software', icon: <MonitorPlay size={16} color="#10B981" /> },
  { name: 'Programming', icon: <Code size={16} color="#8B5CF6" /> },
  { name: 'Languages', icon: <Globe size={16} color="#F59E0B" /> },
  { name: 'Engineering', icon: <ToolCase size={16} color="#14B8A6" /> },
  { name: 'Cybersecurity', icon: <Shield size={16} color="#F97316" /> },
  
];

const CategoriesBar = () => {
  return (
    <div className="categories-bar">
      <div className="container categories-container">
        {categories.map((category, index) => (
          <div key={index} className="category-item">
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesBar;
