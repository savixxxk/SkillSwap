import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Search, ArrowRight, Target, Award, Calendar, TrendingUp, User, Mail, BookOpen, Star, Settings, Users, Clock, DollarSign, Trophy } from 'lucide-react';

// Import all the same components
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
import './StudentEnhancedSearch.css';

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

const StudentEnhancedSearch = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subjectMap, setSubjectMap] = useState({});
  const [allTutors, setAllTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState(null);
  const [myStats, setMyStats] = useState({
    totalSessions: 0,
    totalSpent: 0,
    averageRating: 0,
    favoriteSubjects: []
  });
  const [myGoals, setMyGoals] = useState({
    weeklySessions: 5,
    monthlySessions: 20,
    studyHours: 10
  });

  const subjectLabel = useCallback(
    (id) => subjectMap[id] || id,
    [subjectMap]
  );

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }
    const u = JSON.parse(raw);
    if (u.role !== "student") {
      navigate("/", { replace: true });
      return;
    }
    setUser(u);
  }, [navigate]);

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

  // Load student's personal stats and goals
  useEffect(() => {
    if (!user?._id) return;
    
    // Load saved goals
    const savedGoals = localStorage.getItem("studentGoals");
    if (savedGoals) {
      setMyGoals(JSON.parse(savedGoals));
    }
    
    // Load mock student stats (in real app, this would come from backend)
    const loadMyStats = async () => {
      try {
        // Mock data - in real app, fetch from backend
        const mockStats = {
          totalSessions: 12,
          totalSpent: 600,
          averageRating: 4.7,
          favoriteSubjects: ['Mathematics', 'Physics']
        };
        
        setMyStats(mockStats);
      } catch (error) {
        console.error("Could not load student stats:", error);
      }
    };
    
    loadMyStats();
  }, [user]);

  // Handle search filtering
  const handleSearch = useCallback((filters) => {
    if (!filters) {
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
      // Backend already filters for certified tutors
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

  // Transform tutor data for AvailableTutors component
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
      isVerified: true,
      gradient: randomGradient,
      bio: tutor.bio || ''
    };
  };

  const transformedTutors = filteredTutors.map(transformTutorData);

  const getCurrentWeekSessions = () => {
    // Mock calculation - in real app, calculate from actual session data
    return 3;
  };

  const getCurrentMonthSessions = () => {
    // Mock calculation - in real app, calculate from actual session data
    return 12;
  };

  const getProgressPercentage = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  if (loading) {
    return (
      <div className="student-enhanced-search">
        <div className="loading-spinner">Loading tutors...</div>
      </div>
    );
  }

  return (
    <div className="student-enhanced-search">
      {/* Student-specific Hero Section */}
      <section className="student-hero-section">
        <div className="container">
          <div className="student-hero-content">
            <div className="student-welcome">
              <h1>Welcome back, {user?.name || 'Student'}!</h1>
              <p>Find your perfect tutor and track your learning progress</p>
            </div>
            <div className="student-quick-stats">
              <div className="quick-stat">
                <BookOpen size={20} />
                <div>
                  <h3>{myStats.totalSessions}</h3>
                  <p>Sessions Completed</p>
                </div>
              </div>
              <div className="quick-stat">
                <DollarSign size={20} />
                <div>
                  <h3>${myStats.totalSpent}</h3>
                  <p>Total Spent</p>
                </div>
              </div>
              <div className="quick-stat">
                <Star size={20} />
                <div>
                  <h3>{myStats.averageRating}</h3>
                  <p>Avg Rating Given</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Goals Progress */}
      <section className="student-goals-section">
        <div className="container">
          <div className="goals-header">
            <h2>
              <Target size={24} />
              Your Learning Goals
            </h2>
            <Link to="/student-profile" className="btn-outline">
              <Settings size={16} />
              Edit Goals
            </Link>
          </div>
          <div className="goals-grid">
            <div className="goal-card">
              <div className="goal-header">
                <Calendar size={20} />
                <span>Weekly Sessions</span>
              </div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${getProgressPercentage(getCurrentWeekSessions(), myGoals.weeklySessions)}%` }}
                  />
                </div>
                <span className="goal-text">
                  {getCurrentWeekSessions()} / {myGoals.weeklySessions}
                </span>
              </div>
            </div>
            
            <div className="goal-card">
              <div className="goal-header">
                <Target size={20} />
                <span>Monthly Sessions</span>
              </div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${getProgressPercentage(getCurrentMonthSessions(), myGoals.monthlySessions)}%` }}
                  />
                </div>
                <span className="goal-text">
                  {getCurrentMonthSessions()} / {myGoals.monthlySessions}
                </span>
              </div>
            </div>
            
            <div className="goal-card">
              <div className="goal-header">
                <Trophy size={20} />
                <span>Achievement Points</span>
              </div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }} />
                </div>
                <span className="goal-text">750 / 1000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <CategoriesBar />

      {/* Advanced Search Section */}
      <section className="info-section" style={{ backgroundColor: 'var(--white)', padding: '60px 0' }}>
        <div className="container">
          <div className="info-header text-center">
            <span className="section-label">FIND TUTORS</span>
            <h2 className="info-title">Discover Your Perfect Tutor</h2>
            <p className="info-description">Search from our network of certified tutors and start your learning journey.</p>
          </div>
          <div className="info-content-below">
            <TutorSearchCard onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Available Tutors Section */}
      <AvailableTutors tutors={transformedTutors} isLoading={loading} />

      {/* Student-specific Features */}
      <section className="info-section" style={{ backgroundColor: '#f8fafc', padding: '80px 0' }}>
        <div className="container">
          <div className="info-header text-center">
            <span className="section-label">STUDENT TOOLS</span>
            <h2 className="info-title">Your Learning Dashboard</h2>
            <p className="info-description">Manage your learning journey and track your progress.</p>
          </div>
          <div className="info-content-below">
            <div className="student-tools-grid">
              <div className="tool-card">
                <Calendar size={32} />
                <h3>Session History</h3>
                <p>View your past sessions and track progress</p>
                <Link to="/student-profile" className="btn-primary">View History</Link>
              </div>
              <div className="tool-card">
                <Trophy size={32} />
                <h3>Learning Games</h3>
                <p>Earn points and achievements while learning</p>
                <Link to="/games" className="btn-primary">Play Games</Link>
              </div>
              <div className="tool-card">
                <Target size={32} />
                <h3>Goal Settings</h3>
                <p>Set and track your learning goals</p>
                <Link to="/student-profile" className="btn-primary">Manage Goals</Link>
              </div>
            </div>
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

export default StudentEnhancedSearch;
