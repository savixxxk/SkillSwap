import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

// Import all the components
import Hero from './Hero';
import CategoriesBar from './CategoriesBar';
import TutorSearchCard from './TutorSearchCard';
import AvailableTutors from './AvailableTutors';
import TutorFeatures from './TutorFeatures';
import HowItWorks from './HowItWorks';
import Testimonials from './Testimonials';
import CallToAction from './CallToAction';
import InfoSection from './InfoSection';
import Footer from './Footer';

// Import CSS files
import './EnhancedSearchPage.css';
import './Hero.css';
import './CategoriesBar.css';
import './TutorSearchCard.css';
import './AvailableTutors.css';
import './TutorFeatures.css';
import './HowItWorks.css';
import './Testimonials.css';
import './CallToAction.css';
import './InfoSection.css';
import './Footer.css';
import './Home.css';

const API = "http://localhost:5000";

function StarDisplay({ value, size = "md" }) {
  const v = value == null || Number.isNaN(Number(value)) ? 0 : Number(value);
  const rounded = Math.round(v);
  const cls = size === "lg" ? "search-star lg" : "search-star";
  return (
    <span className="search-star-row" aria-label={`${v} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rounded ? `${cls} filled` : cls}>
          ★
        </span>
      ))}
    </span>
  );
}

function initials(name) {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const EnhancedSearchPage = () => {
  const navigate = useNavigate();
  const [subjectMap, setSubjectMap] = useState({});
  const [allTutors, setAllTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState(null);

  const subjectLabel = useCallback(
    (id) => subjectMap[id] || id,
    [subjectMap]
  );

  // Load subjects
  useEffect(() => {
    axios
      .get(`${API}/auth/tutor/exam/subjects`)
      .then((res) => {
        const m = {};
        (res.data.subjects || []).forEach((s) => {
          m[s.id] = s.name;
        });
        setSubjectMap(m);
      })
      .catch(() => {});
  }, []);

  // Load certified tutors from backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/tutors/directory`);
        if (!cancelled) {
          setAllTutors(res.data || []);
          setFilteredTutors(res.data || []);
        }
      } catch (e) {
        console.error("Could not load tutors:", e);
        if (!cancelled) {
          setAllTutors([]);
          setFilteredTutors([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle search filtering
  const handleSearch = useCallback((filters) => {
    if (!filters) {
      // Clear all filters
      setFilteredTutors(allTutors);
      setSearchFilters(null);
      return;
    }

    setSearchFilters(filters);
    
    let filtered = [...allTutors];

    // Filter by search query
    if (filters.query && filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(tutor => 
        tutor.name.toLowerCase().includes(query) ||
        tutor.bio.toLowerCase().includes(query) ||
        tutor.teachingSubjects.some(subject => 
          subjectLabel(subject).toLowerCase().includes(query)
        )
      );
    }

    // Filter by subject
    if (filters.subject) {
      filtered = filtered.filter(tutor =>
        tutor.teachingSubjects.some(subject =>
          subjectLabel(subject).toLowerCase().includes(filters.subject.toLowerCase())
        )
      );
    }

    // Filter by verified only
    if (filters.chips && filters.chips['Verified only']) {
      // Backend already filters for certified tutors, so this is redundant
      // but keeping for consistency
    }

    // Filter by top rated
    if (filters.chips && filters.chips['Top rated']) {
      filtered = filtered.filter(tutor => 
        tutor.averageRating && tutor.averageRating >= 4.5
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'Top Rated':
          filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
          break;
        case 'Most Reviews':
          filtered.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        case 'Newest':
          filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
        default:
          break;
      }
    }

    setFilteredTutors(filtered);
  }, [allTutors, subjectLabel]);

  // Transform tutor data for AvailableTutors component - exact match
  const transformTutorData = (tutor) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ];
    
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    
    return {
      _id: tutor._id,
      name: tutor.name,
      letter: initials(tutor.name),
      subject: tutor.teachingSubjects.length > 0 
        ? subjectLabel(tutor.teachingSubjects[0]) 
        : 'No subject specified',
      subjects: tutor.teachingSubjects.map(subjectLabel),
      tags: tutor.teachingSubjects.slice(0, 3).map(subjectLabel),
      rating: tutor.averageRating || 0,
      reviewsCount: tutor.reviewCount || 0,
      mode: 'Online',
      isVerified: true, // All tutors from backend are certified
      gradient: randomGradient,
      bio: tutor.bio || ''
    };
  };

  const transformedTutors = filteredTutors.map(transformTutorData);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <Hero />

      {/* Categories Bar */}
      <CategoriesBar />

      {/* Advanced Search Section */}
      <section className="info-section" style={{ backgroundColor: 'var(--white)', padding: '60px 0' }}>
        <div className="container">
          <div className="info-header text-center">
            <span className="section-label">SEARCH TUTORS</span>
            <h2 className="info-title">Find Your Perfect Tutor</h2>
            <p className="info-description">Use our advanced search to filter certified tutors by subject, rating, and availability.</p>
          </div>
          <div className="info-content-below">
            <TutorSearchCard onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Available Tutors Section - Using exact AvailableTutors component */}
      <AvailableTutors tutors={transformedTutors} isLoading={loading} />

      {/* Tutor Features */}
      <section className="info-section" style={{ backgroundColor: '#f8fafc', padding: '80px 0' }}>
        <div className="container">
          <div className="info-header text-center">
            <span className="section-label">FEATURES</span>
            <h2 className="info-title">Why Choose SkillSwap?</h2>
            <p className="info-description">Discover the features that make us the best platform for finding certified tutors.</p>
          </div>
          <div className="info-content-below">
            <TutorFeatures />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* Call to Action */}
      <CallToAction />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default EnhancedSearchPage;
