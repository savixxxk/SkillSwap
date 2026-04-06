import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Award, Calendar, TrendingUp, User, Mail, BookOpen, Star, Settings } from "lucide-react";
import StudentAppHeader from "../components/StudentAppHeader";
import "./StudentSubPage.css";
import "./StudentProfilePage.css";

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState({
    weeklySessions: 5,
    monthlySessions: 20,
    targetSubjects: [],
    studyHours: 10
  });
  const [sessions, setSessions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [tempGoals, setTempGoals] = useState({ ...goals });

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
    
    // Load saved goals from localStorage
    const savedGoals = localStorage.getItem("studentGoals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
      setTempGoals(JSON.parse(savedGoals));
    }
    
    // Load mock session data
    loadSessionData();
    setLoading(false);
  }, [navigate]);

  const loadSessionData = () => {
    // Mock session data - in real app, this would come from backend
    const mockSessions = [
      { id: 1, subject: "Mathematics", date: "2026-04-05", duration: 60, rating: 5, tutor: "John Doe" },
      { id: 2, subject: "Physics", date: "2026-04-04", duration: 45, rating: 4, tutor: "Jane Smith" },
      { id: 3, subject: "Chemistry", date: "2026-04-03", duration: 90, rating: 5, tutor: "Mike Johnson" },
      { id: 4, subject: "Mathematics", date: "2026-04-02", duration: 60, rating: 4, tutor: "John Doe" },
      { id: 5, subject: "Biology", date: "2026-04-01", duration: 75, rating: 5, tutor: "Sarah Wilson" }
    ];
    setSessions(mockSessions);
  };

  const getCurrentWeekSessions = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return sessions.filter(session => new Date(session.date) >= weekStart).length;
  };

  const getCurrentMonthSessions = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return sessions.filter(session => new Date(session.date) >= monthStart).length;
  };

  const getAverageRating = () => {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, session) => sum + session.rating, 0);
    return (total / sessions.length).toFixed(1);
  };

  const getTotalStudyHours = () => {
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    return Math.round(totalMinutes / 60);
  };

  const handleSaveGoals = () => {
    setGoals({ ...tempGoals });
    localStorage.setItem("studentGoals", JSON.stringify(tempGoals));
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setTempGoals({ ...goals });
    setEditMode(false);
  };

  const getProgressPercentage = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  if (loading) {
    return (
      <div className="student-sub-page">
        <StudentAppHeader />
        <main className="student-sub-main">
          <div className="loading-spinner">Loading profile...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="student-sub-page">
      <StudentAppHeader />
      <main className="student-sub-main">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-info">
            <h1>{user?.name || "Student"}</h1>
            <p className="profile-email">
              <Mail size={16} />
              {user?.email || "student@example.com"}
            </p>
          </div>
          <button 
            className="edit-profile-btn"
            onClick={() => setEditMode(!editMode)}
          >
            <Settings size={20} />
            {editMode ? "Cancel" : "Edit Goals"}
          </button>
        </div>

        {/* Goals Section */}
        <section className="goals-section">
          <h2>
            <Target size={24} />
            Learning Goals
          </h2>
          
          {editMode ? (
            <div className="goals-edit-form">
              <div className="goal-input-group">
                <label>Weekly Sessions Goal</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={tempGoals.weeklySessions}
                  onChange={(e) => setTempGoals({...tempGoals, weeklySessions: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="goal-input-group">
                <label>Monthly Sessions Goal</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={tempGoals.monthlySessions}
                  onChange={(e) => setTempGoals({...tempGoals, monthlySessions: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="goal-input-group">
                <label>Weekly Study Hours Goal</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tempGoals.studyHours}
                  onChange={(e) => setTempGoals({...tempGoals, studyHours: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="goal-actions">
                <button className="btn-primary" onClick={handleSaveGoals}>
                  Save Goals
                </button>
                <button className="btn-outline" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
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
                      style={{ width: `${getProgressPercentage(getCurrentWeekSessions(), goals.weeklySessions)}%` }}
                    />
                  </div>
                  <span className="goal-text">
                    {getCurrentWeekSessions()} / {goals.weeklySessions}
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
                      style={{ width: `${getProgressPercentage(getCurrentMonthSessions(), goals.monthlySessions)}%` }}
                    />
                  </div>
                  <span className="goal-text">
                    {getCurrentMonthSessions()} / {goals.monthlySessions}
                  </span>
                </div>
              </div>
              
              <div className="goal-card">
                <div className="goal-header">
                  <BookOpen size={20} />
                  <span>Study Hours</span>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage(getTotalStudyHours(), goals.studyHours)}%` }}
                    />
                  </div>
                  <span className="goal-text">
                    {getTotalStudyHours()} / {goals.studyHours}h
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Statistics Section */}
        <section className="stats-section">
          <h2>
            <Award size={24} />
            Learning Statistics
          </h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <h3>{sessions.length}</h3>
                <p>Total Sessions</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-content">
                <h3>{getAverageRating()}</h3>
                <p>Average Rating</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <h3>{getTotalStudyHours()}h</h3>
                <p>Total Study Hours</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Sessions */}
        <section className="recent-sessions">
          <h2>Recent Sessions</h2>
          <div className="sessions-list">
            {sessions.slice(0, 5).map(session => (
              <div key={session.id} className="session-item">
                <div className="session-info">
                  <h4>{session.subject}</h4>
                  <p>{session.tutor} • {session.duration} minutes</p>
                </div>
                <div className="session-meta">
                  <span className="session-date">{session.date}</span>
                  <div className="session-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < session.rating ? "#f59e0b" : "none"}
                        color={i < session.rating ? "#f59e0b" : "#d1d5db"}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
