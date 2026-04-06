import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Target, Zap, Award, Calendar, TrendingUp, Star, BookOpen, Clock, Users, Gamepad2 } from "lucide-react";
import StudentAppHeader from "../components/StudentAppHeader";
import "./StudentSubPage.css";
import "./StudentGames.css";

export default function StudentGames() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState({
    weeklySessions: 5,
    monthlySessions: 20,
    studyHours: 10
  });
  const [sessions, setSessions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState(0);
  const [selectedGame, setSelectedGame] = useState(null);

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
    
    // Load saved goals
    const savedGoals = localStorage.getItem("studentGoals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    
    // Load game data
    loadGameData();
    setLoading(false);
  }, [navigate]);

  const loadGameData = () => {
    // Mock session data
    const mockSessions = [
      { id: 1, subject: "Mathematics", date: "2026-04-05", duration: 60, rating: 5, tutor: "John Doe" },
      { id: 2, subject: "Physics", date: "2026-04-04", duration: 45, rating: 4, tutor: "Jane Smith" },
      { id: 3, subject: "Chemistry", date: "2026-04-03", duration: 90, rating: 5, tutor: "Mike Johnson" },
      { id: 4, subject: "Mathematics", date: "2026-04-02", duration: 60, rating: 4, tutor: "John Doe" },
      { id: 5, subject: "Biology", date: "2026-04-01", duration: 75, rating: 5, tutor: "Sarah Wilson" },
      { id: 6, subject: "Mathematics", date: "2026-03-31", duration: 60, rating: 5, tutor: "John Doe" },
      { id: 7, subject: "Physics", date: "2026-03-30", duration: 45, rating: 4, tutor: "Jane Smith" }
    ];
    setSessions(mockSessions);

    // Calculate streak (consecutive days with sessions)
    const calculatedStreak = calculateStreak(mockSessions);
    setStreak(calculatedStreak);

    // Mock achievements
    const mockAchievements = [
      { id: 1, title: "First Session", description: "Complete your first tutoring session", icon: "🎯", unlocked: true, progress: 1, target: 1 },
      { id: 2, title: "Week Warrior", description: "Complete 5 sessions in a week", icon: "⚔️", unlocked: true, progress: 5, target: 5 },
      { id: 3, title: "Month Master", description: "Complete 20 sessions in a month", icon: "👑", unlocked: false, progress: 15, target: 20 },
      { id: 4, title: "Perfect Student", description: "Get 5-star ratings on 10 sessions", icon: "⭐", unlocked: false, progress: 7, target: 10 },
      { id: 5, title: "Study Marathon", description: "Complete 100 hours of tutoring", icon: "🏃", unlocked: false, progress: 65, target: 100 },
      { id: 6, title: "Subject Explorer", description: "Learn from 5 different subjects", icon: "🌍", unlocked: true, progress: 5, target: 5 }
    ];
    setAchievements(mockAchievements);
  };

  const calculateStreak = (sessionData) => {
    if (sessionData.length === 0) return 0;
    
    const dates = sessionData.map(s => new Date(s.date)).sort((a, b) => b - a);
    let streak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.floor((dates[i-1] - dates[i]) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
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

  const getTotalStudyHours = () => {
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    return Math.round(totalMinutes / 60);
  };

  const getAverageRating = () => {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, session) => sum + session.rating, 0);
    return (total / sessions.length).toFixed(1);
  };

  const getProgressPercentage = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getLevel = () => {
    const totalSessions = sessions.length;
    if (totalSessions >= 50) return { level: 5, title: "Master Student", color: "#8b5cf6" };
    if (totalSessions >= 30) return { level: 4, title: "Advanced Learner", color: "#ec4899" };
    if (totalSessions >= 20) return { level: 3, title: "Dedicated Student", color: "#f59e0b" };
    if (totalSessions >= 10) return { level: 2, title: "Active Learner", color: "#10b981" };
    return { level: 1, title: "Beginner", color: "#3b82f6" };
  };

  const games = [
    {
      id: 1,
      title: "Session Quest",
      description: "Complete daily and weekly session goals to earn points and level up!",
      icon: <Target size={32} />,
      color: "#3b82f6",
      progress: getProgressPercentage(getCurrentWeekSessions(), goals.weeklySessions),
      stats: `${getCurrentWeekSessions()}/${goals.weeklySessions} sessions this week`
    },
    {
      id: 2,
      title: "Knowledge Hunter",
      description: "Explore different subjects and become a versatile learner!",
      icon: <BookOpen size={32} />,
      color: "#10b981",
      progress: 75,
      stats: "5 subjects mastered"
    },
    {
      id: 3,
      title: "Streak Master",
      description: "Maintain consecutive learning days to build momentum!",
      icon: <Zap size={32} />,
      color: "#f59e0b",
      progress: Math.min((streak / 7) * 100, 100),
      stats: `${streak} day streak`
    },
    {
      id: 4,
      title: "Rating Champion",
      description: "Provide excellent feedback and maintain high ratings!",
      icon: <Star size={32} />,
      color: "#ec4899",
      progress: (getAverageRating() / 5) * 100,
      stats: `${getAverageRating()} average rating`
    }
  ];

  const studentLevel = getLevel();

  if (loading) {
    return (
      <div className="student-sub-page">
        <StudentAppHeader />
        <main className="student-sub-main">
          <div className="loading-spinner">Loading games...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="student-sub-page">
      <StudentAppHeader />
      <main className="student-sub-main">
        {/* Level and Progress Header */}
        <div className="games-header">
          <div className="level-badge" style={{ backgroundColor: studentLevel.color }}>
            <Trophy size={24} />
            <div className="level-info">
              <span className="level-number">Level {studentLevel.level}</span>
              <span className="level-title">{studentLevel.title}</span>
            </div>
          </div>
          
          <div className="progress-stats">
            <div className="stat-item">
              <Calendar size={20} />
              <span>{streak} Day Streak</span>
            </div>
            <div className="stat-item">
              <BookOpen size={20} />
              <span>{sessions.length} Sessions</span>
            </div>
            <div className="stat-item">
              <Star size={20} />
              <span>{getAverageRating()} Avg Rating</span>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <section className="games-section">
          <h2>
            <Gamepad2 size={24} />
            Learning Games
          </h2>
          <div className="games-grid">
            {games.map(game => (
              <div 
                key={game.id} 
                className="game-card"
                onClick={() => setSelectedGame(game)}
              >
                <div className="game-icon" style={{ backgroundColor: game.color }}>
                  {game.icon}
                </div>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className="game-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${game.progress}%`, backgroundColor: game.color }}
                    />
                  </div>
                  <span className="game-stats">{game.stats}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="achievements-section">
          <h2>
            <Award size={24} />
            Achievements
          </h2>
          <div className="achievements-grid">
            {achievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">
                  <span className="achievement-emoji">{achievement.icon}</span>
                  {achievement.unlocked && <Trophy size={16} className="achievement-badge" />}
                </div>
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                <div className="achievement-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage(achievement.progress, achievement.target)}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {achievement.progress}/{achievement.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leaderboard */}
        <section className="leaderboard-section">
          <h2>
            <TrendingUp size={24} />
            Weekly Leaderboard
          </h2>
          <div className="leaderboard">
            <div className="leaderboard-item">
              <div className="rank">1</div>
              <div className="leaderboard-info">
                <h4>You</h4>
                <p>{getCurrentWeekSessions()} sessions</p>
              </div>
              <div className="leaderboard-score">{getCurrentWeekSessions() * 100}</div>
            </div>
            <div className="leaderboard-item">
              <div className="rank">2</div>
              <div className="leaderboard-info">
                <h4>Alex Chen</h4>
                <p>6 sessions</p>
              </div>
              <div className="leaderboard-score">600</div>
            </div>
            <div className="leaderboard-item">
              <div className="rank">3</div>
              <div className="leaderboard-info">
                <h4>Sarah Johnson</h4>
                <p>5 sessions</p>
              </div>
              <div className="leaderboard-score">500</div>
            </div>
          </div>
        </section>

        {/* Game Detail Modal */}
        {selectedGame && (
          <div className="game-modal-overlay" onClick={() => setSelectedGame(null)}>
            <div className="game-modal" onClick={(e) => e.stopPropagation()}>
              <div className="game-modal-header" style={{ backgroundColor: selectedGame.color }}>
                <div className="game-modal-icon">
                  {selectedGame.icon}
                </div>
                <h3>{selectedGame.title}</h3>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedGame(null)}
                >
                  ×
                </button>
              </div>
              <div className="game-modal-content">
                <p>{selectedGame.description}</p>
                <div className="game-modal-progress">
                  <h4>Your Progress</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${selectedGame.progress}%`, backgroundColor: selectedGame.color }}
                    />
                  </div>
                  <span>{selectedGame.stats}</span>
                </div>
                <div className="game-modal-rewards">
                  <h4>Rewards</h4>
                  <div className="rewards-list">
                    <div className="reward-item">
                      <Trophy size={16} />
                      <span>+{Math.round(selectedGame.progress * 10)} XP</span>
                    </div>
                    <div className="reward-item">
                      <Star size={16} />
                      <span>+{Math.round(selectedGame.progress / 10)} Badge Points</span>
                    </div>
                  </div>
                </div>
                <button className="btn-primary play-game-btn">
                  Continue Playing
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
