import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import {
  Search,
  ArrowRight,
  Target,
  Award,
  Calendar,
  TrendingUp,
  User,
  Mail,
  BookOpen,
  Star,
  Settings,
  Users,
  Clock,
  DollarSign,
} from "lucide-react";

// Import all the same components
import Hero from "../components/Hero";
import CategoriesBar from "../components/CategoriesBar";
import TutorSearchCard from "../components/TutorSearchCard";
import AvailableTutors from "../components/AvailableTutors";
import TutorFeatures from "../components/TutorFeatures";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import CallToAction from "../components/CallToAction";
import InfoSection from "../components/InfoSection";
import Footer from "../components/Footer";

// Page-specific CSS
import "./TutorSearchPage.css";

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

const TutorSearchPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [viewerRole, setViewerRole] = useState("student");
  const [subjectMap, setSubjectMap] = useState({});
  const [allTutors, setAllTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState(null);
  const [myStats, setMyStats] = useState({
    totalSessions: 0,
    totalEarnings: 0,
    averageRating: 0,
    activeStudents: 0,
  });

  const subjectLabel = useCallback((id) => subjectMap[id] || id, [subjectMap]);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }
    const u = JSON.parse(raw);
    if (!["student", "tutor"].includes(u.role)) {
      navigate("/", { replace: true });
      return;
    }
    setUser(u);
    setViewerRole(u.role);
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
        const cleanTutors = (res.data || []).filter(
          (item) => item.role !== "admin",
        );
        if (!cancelled) {
          setAllTutors(cleanTutors);
          setFilteredTutors(cleanTutors);
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

  // Load tutor's personal stats
  useEffect(() => {
    if (!user?._id || viewerRole !== "tutor") return;

    const loadMyStats = async () => {
      try {
        const res = await axios.get(`${API}/sessions/tutor/user/${user._id}`);
        const sessions = res.data || [];
        const acceptedSessions = sessions.filter(
          (s) => s.status === "accepted",
        );
        const completedSessions = acceptedSessions.filter(
          (s) => new Date(s.time) < new Date(),
        );

        const totalEarnings = completedSessions.reduce((sum, session) => {
          return sum + (session.price || 50); // Default price of $50 per session
        }, 0);

        const ratings = completedSessions
          .filter((s) => s.studentFeedback?.rating)
          .map((s) => s.studentFeedback.rating);

        const averageRating =
          ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(
                1,
              )
            : 0;

        const uniqueStudents = new Set(
          completedSessions.map((s) => s.studentName),
        ).size;

        setMyStats({
          totalSessions: completedSessions.length,
          totalEarnings,
          averageRating,
          activeStudents: uniqueStudents,
        });
      } catch (error) {
        console.error("Could not load tutor stats:", error);
      }
    };

    loadMyStats();
  }, [user, viewerRole]);

  // Handle search filtering
  const handleSearch = useCallback(
    (filters) => {
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
        filtered = filtered.filter(
          (tutor) =>
            tutor.name.toLowerCase().includes(query) ||
            tutor.bio.toLowerCase().includes(query) ||
            tutor.teachingSubjects.some((subject) =>
              subjectLabel(subject).toLowerCase().includes(query),
            ),
        );
      }

      // Filter by subject
      if (filters.subject) {
        filtered = filtered.filter((tutor) =>
          tutor.teachingSubjects.some((subject) =>
            subjectLabel(subject)
              .toLowerCase()
              .includes(filters.subject.toLowerCase()),
          ),
        );
      }

      // Filter by verified only
      if (filters.chips && filters.chips["Verified only"]) {
        // Backend already filters for certified tutors
      }

      // Filter by top rated
      if (filters.chips && filters.chips["Top rated"]) {
        filtered = filtered.filter(
          (tutor) => tutor.averageRating && tutor.averageRating >= 4.5,
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "Top Rated":
            filtered.sort(
              (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
            );
            break;
          case "Most Reviews":
            filtered.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
          case "Newest":
            filtered.sort(
              (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
            );
            break;
          default:
            break;
        }
      }

      setFilteredTutors(filtered);
    },
    [allTutors, subjectLabel],
  );

  // Transform tutor data for AvailableTutors component
  const transformTutorData = (tutor) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    ];

    const randomGradient =
      gradients[Math.floor(Math.random() * gradients.length)];

    return {
      _id: tutor._id,
      name: tutor.name,
      letter: initials(tutor.name),
      subject:
        tutor.teachingSubjects.length > 0
          ? subjectLabel(tutor.teachingSubjects[0])
          : "No subject specified",
      subjects: tutor.teachingSubjects.map(subjectLabel),
      tags: tutor.teachingSubjects.slice(0, 3).map(subjectLabel),
      rating: tutor.averageRating || 0,
      reviewsCount: tutor.reviewCount || 0,
      mode: "Online",
      isVerified: true,
      gradient: randomGradient,
      bio: tutor.bio || "",
    };
  };

  const transformedTutors = filteredTutors.map(transformTutorData);

  if (loading) {
    return (
      <div className="tutor-search-page min-h-screen bg-slate-950 text-slate-100">
        <div className="loading-spinner flex min-h-screen items-center justify-center text-xl font-semibold text-sky-200">Loading tutors...</div>
      </div>
    );
  }

  return (
    <div className="tutor-search-page min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="tutor-hero-section border-b border-white/10">
        <div className="container">
          <div className="tutor-hero-content">
            <div className="tutor-welcome">
              <h1>
                {viewerRole === "tutor"
                  ? `Welcome back, ${user?.name || "Tutor"}!`
                  : `Welcome, ${user?.name || "Student"}!`}
              </h1>
              <p>
                {viewerRole === "tutor"
                  ? "Discover fellow certified tutors and track your performance"
                  : "Find certified tutors by subject, rating, and availability"}
              </p>
            </div>
            <div className="tutor-quick-stats">
              <div className="quick-stat">
                <DollarSign size={20} />
                <div>
                  <h3>
                    {viewerRole === "tutor"
                      ? `$${myStats.totalEarnings}`
                      : filteredTutors.length}
                  </h3>
                  <p>
                    {viewerRole === "tutor" ? "Total Earnings" : "Tutors Found"}
                  </p>
                </div>
              </div>
              <div className="quick-stat">
                <Users size={20} />
                <div>
                  <h3>
                    {viewerRole === "tutor" ? myStats.totalSessions : "24/7"}
                  </h3>
                  <p>
                    {viewerRole === "tutor" ? "Sessions Completed" : "Support"}
                  </p>
                </div>
              </div>
              <div className="quick-stat">
                <Star size={20} />
                <div>
                  <h3>
                    {viewerRole === "tutor" ? myStats.averageRating : "4.9"}
                  </h3>
                  <p>
                    {viewerRole === "tutor"
                      ? "Average Rating"
                      : "Avg Tutor Rating"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <CategoriesBar />

      {/* Advanced Search Section */}
      <section
        className="info-section"
        style={{ backgroundColor: "transparent", padding: "60px 0" }}
      >
        <div className="container">
          <div className="info-header text-center">
            <span className="section-label">DISCOVER TUTORS</span>
            <h2 className="info-title">
              {viewerRole === "tutor"
                ? "Find Fellow Certified Tutors"
                : "Find Your Perfect Tutor"}
            </h2>
            <p className="info-description">
              {viewerRole === "tutor"
                ? "Search and connect with other qualified tutors on the platform."
                : "Use filters to compare top tutors and book sessions confidently."}
            </p>
          </div>
          <div className="info-content-below search-filter-panel">
            <TutorSearchCard onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Available Tutors Section */}
      <AvailableTutors tutors={transformedTutors} isLoading={loading} />

      {/* Role-specific Tools */}
      <section
        className="info-section"
        style={{ backgroundColor: "transparent", padding: "80px 0" }}
      >
        <div className="container">
          <div className="info-header text-center">
            <span className="section-label">
              {viewerRole === "tutor" ? "TUTOR TOOLS" : "STUDENT TOOLS"}
            </span>
            <h2 className="info-title">
              {viewerRole === "tutor"
                ? "Your Teaching Dashboard"
                : "Your Learning Dashboard"}
            </h2>
            <p className="info-description">
              {viewerRole === "tutor"
                ? "Manage your tutoring career and grow your student base."
                : "Discover tutors, review profiles, and schedule sessions in minutes."}
            </p>
          </div>
          <div className="info-content-below">
            <div className="tutor-tools-grid">
              <div className="tool-card">
                <Calendar size={32} />
                <h3>
                  {viewerRole === "tutor"
                    ? "Session Calendar"
                    : "Upcoming Sessions"}
                </h3>
                <p>
                  {viewerRole === "tutor"
                    ? "Manage your schedule and upcoming sessions"
                    : "Track your booked and upcoming sessions"}
                </p>
                <Link
                  to={
                    viewerRole === "tutor" ? "/dashboard" : "/student-profile"
                  }
                  className="btn-primary"
                >
                  {viewerRole === "tutor" ? "View Calendar" : "View Sessions"}
                </Link>
              </div>
              <div className="tool-card">
                <DollarSign size={32} />
                <h3>
                  {viewerRole === "tutor"
                    ? "Earnings Tracker"
                    : "Tutor Compare"}
                </h3>
                <p>
                  {viewerRole === "tutor"
                    ? "Monitor your income and payment history"
                    : "Compare tutors by rating and experience"}
                </p>
                <Link to="/tutor-search" className="btn-primary">
                  {viewerRole === "tutor" ? "View Earnings" : "Compare Tutors"}
                </Link>
              </div>
              <div className="tool-card">
                <Award size={32} />
                <h3>
                  {viewerRole === "tutor"
                    ? "Performance Analytics"
                    : "Learning Progress"}
                </h3>
                <p>
                  {viewerRole === "tutor"
                    ? "Track your ratings and student feedback"
                    : "Review your bookings and progress over time"}
                </p>
                <Link
                  to={
                    viewerRole === "tutor" ? "/dashboard" : "/student-profile"
                  }
                  className="btn-primary"
                >
                  {viewerRole === "tutor" ? "View Stats" : "View Progress"}
                </Link>
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

export default TutorSearchPage;
