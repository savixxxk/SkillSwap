import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoriesBar from './components/CategoriesBar';
import InfoSection from './components/InfoSection';
import TutorSearchCard from './components/TutorSearchCard';
import TutorFeatures from './components/TutorFeatures';
import AvailableTutors from './components/AvailableTutors';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import './index.css'; 

export const allTutors = [
  {
    gradient: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
    letter: 'A',
    mode: 'Online',
    name: 'Anna Silva',
    subject: 'Chemistry',
    tags: ['Undergraduate'],
    rating: 4.9,
    reviewsCount: 120,
    isVerified: true
  },
  {
    gradient: 'linear-gradient(135deg, #065F46, #10B981)',
    letter: 'R',
    mode: 'In-person',
    name: 'Roshan Perera',
    subject: 'ICT',
    tags: [ 'Professional', 'Postgraduate'],
    rating: 4.8,
    reviewsCount: 85,
    isVerified: false
  },
  {
    gradient: 'linear-gradient(135deg, #4C1D95, #8B5CF6)',
    letter: 'N',
    mode: 'Online',
    name: 'Nada Fernando',
    subject: 'Economics',
    tags: ['Undergraduate'],
    rating: 5.0,
    reviewsCount: 42,
    isVerified: true
  },
  {
    gradient: 'linear-gradient(135deg, #92400E, #F59E0B)',
    letter: 'K',
    mode: 'In-person',
    name: 'Kumari Jayasuriya',
    subject: 'Mathematics',
    tags: ['A/L'],
    rating: 4.7,
    reviewsCount: 64,
    isVerified: true
  },
  {
    gradient: 'linear-gradient(135deg, #0284C7, #38BDF8)',
    letter: 'S',
    mode: 'Online',
    name: 'Supun Silva',
    subject: 'Physics',
    tags: ['A/L', 'O/L'],
    rating: 4.6,
    reviewsCount: 150,
    isVerified: true
  }
];

function App() {
  const [displayedTutors, setDisplayedTutors] = useState([]);

  useEffect(() => {
    // Default sorting based on performance (rating * reviews)
    const sorted = [...allTutors].sort((a, b) => (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount));
    setDisplayedTutors(sorted);
  }, []);

  const handleSearch = (filters) => {
    if (!filters) {
      // Clear All pressed
      const sorted = [...allTutors].sort((a, b) => (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount));
      setDisplayedTutors(sorted);
      return;
    }

    let filtered = [...allTutors];
    
    // Applying filtering logic
    if (filters.query && filters.query.trim().length >= 2) {
       const q = filters.query.toLowerCase();
       filtered = filtered.filter(t => 
         t.name.toLowerCase().includes(q) || 
         t.subject.toLowerCase().includes(q) || 
         t.tags.some(tag => tag.toLowerCase().includes(q))
       );
    }
    
    if (filters.subject) {
       filtered = filtered.filter(t => t.subject === filters.subject);
    }

    if (filters.level) {
       filtered = filtered.filter(t => t.tags.includes(filters.level));
    }

    if (filters.chips['Online'] && !filters.chips['In-person']) {
       filtered = filtered.filter(t => t.mode === 'Online');
    } else if (filters.chips['In-person'] && !filters.chips['Online']) {
       filtered = filtered.filter(t => t.mode === 'In-person');
    }

    if (filters.chips['Verified only']) {
       filtered = filtered.filter(t => t.isVerified);
    }

    if (filters.chips['Top rated']) {
       filtered = filtered.filter(t => t.rating >= 4.8);
    }
    
    // Sort logic
    if (filters.sortBy) {
      if (filters.sortBy === 'Top Rated') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (filters.sortBy === 'Most Reviews') {
        filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
      }
      // other sort options like Price can be added here if data supports it
    } else {
      // Default sort
      filtered.sort((a, b) => (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount));
    }

    setDisplayedTutors(filtered);
  };

  return (
    <div className="app-container">
      <Navbar />
      <Hero />
      <CategoriesBar />
      
      <InfoSection 
        label="FOR STUDENTS"
        title="Find the Right Tutor for Any Subject"
        description="Discover expert tutors in virtually any topic. From algebra and accounting to coding, languages, and music, our platform makes it easy to find your perfect match."
        backgroundColor="var(--white)"
      >
         <TutorSearchCard onSearch={handleSearch} />
      </InfoSection>
      
      <InfoSection 
        label="FOR TUTORS"
        title="Powered by a Smart Matching Engine"
        description="Our advanced matchmaking algorithm connects students with the perfect tutor based on skill level, availability, goals and learning style."
        backgroundColor="var(--off-white)"
      >
         <TutorFeatures />
      </InfoSection>
      
      <AvailableTutors tutors={displayedTutors} />
      
      <HowItWorks />
      
      <Testimonials />
      
      <CallToAction />
      
      <Footer />
    </div>
  );
}

export default App;
