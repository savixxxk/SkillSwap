import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizzes } from '../services/quizService';
import './TutorCertification.css';

export default function TutorCertification() {
  const [subjects, setSubjects] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        setMe(JSON.parse(rawUser));
      } catch {
        setMe(null);
      }
    }

    Promise.all([getQuizzes(), fetchUser()])
      .then(([quizRes, meRes]) => {
        const data = Array.isArray(quizRes.data) ? quizRes.data : quizRes.data?.data || [];
        setSubjects(data);
        if (meRes?.user) {
          setMe(meRes.user);
          localStorage.setItem('user', JSON.stringify(meRes.user));
        }
      })
      .catch((err) => {
        console.error('Tutor certification page load error:', err);
        setError(err.response?.data?.message || 'Failed to load certification page');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const response = await fetch('http://localhost:5000/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    return response.json();
  };

  const handleSubjectClick = (subject) => {
    navigate(`/quiz/${subject}`);
  };

  const certifiedSubjects = Array.isArray(me?.certifiedSubjects)
    ? me.certifiedSubjects
    : [];
  const isCertifiedTutor = Boolean(me?.certifiedTutor);

  if (loading) {
    return (
      <div className="tutor-cert-page-state">
        <div className="tutor-cert-state-card">
          <h2>Loading certification subjects</h2>
          <p>Please wait while we prepare your quiz tracks.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-cert-page-state">
        <div className="tutor-cert-state-card error">
          <h2>Could not load subjects</h2>
          <p>{error}</p>
          <button type="button" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-certification">
      <div className="tutor-cert-hero">
        <p className="tutor-cert-kicker">Tutor Track</p>
        <h1>Tutor Certification</h1>
        <p>Choose a subject and complete a quiz to unlock certified tutor status.</p>
        {isCertifiedTutor && (
          <div className="tutor-cert-certified-banner">
            <div>
              <strong>Status: Certified Tutor</strong>
              <p>Your account is approved for tutor dashboard access.</p>
            </div>
            <button type="button" onClick={() => navigate('/dashboard')}>
              Go to Tutor Dashboard
            </button>
          </div>
        )}
      </div>

      {isCertifiedTutor && (
        <section className="tutor-cert-certified-subjects">
          <h3>Certified Subjects</h3>
          {certifiedSubjects.length === 0 ? (
            <p className="tutor-cert-certified-empty">
              You are certified, but no subjects are listed yet.
            </p>
          ) : (
            <div className="tutor-cert-chip-list">
              {certifiedSubjects.map((subjectName) => (
                <span key={subjectName} className="tutor-cert-chip">
                  {subjectName}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="subjects-list">
        {subjects.length === 0 ? (
          <div className="tutor-cert-empty">
            <h3>No quizzes available yet</h3>
            <p>Ask an admin to create quizzes for your subjects.</p>
          </div>
        ) : (
          subjects.map((s) => (
            <button
              key={s.subject}
              className="subject-card"
              onClick={() => handleSubjectClick(s.subject)}
              type="button"
            >
              <h3>{s.subject}</h3>
              <p>{s.quizzes.length} quiz(s) available</p>
              <span className="subject-card-cta">Start quiz</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
