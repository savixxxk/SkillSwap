import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import StudentAppHeader from "../components/StudentAppHeader";
import "./StudentSubPage.css";
import "./StudentSearch.css";

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

export default function StudentSearch() {
  const navigate = useNavigate();
  const [subjectMap, setSubjectMap] = useState({});
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalTutor, setModalTutor] = useState(null);
  const [modalReviews, setModalReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

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
    if (u.role !== "student" && u.role !== "tutor") {
      navigate("/", { replace: true });
    }
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API}/tutors/directory`);
        if (!cancelled) setTutors(res.data || []);
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || "Could not load tutors");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openModal = async (tutor) => {
    setModalTutor(tutor);
    setModalReviews([]);
    setReviewsLoading(true);
    try {
      const res = await axios.get(`${API}/tutors/${tutor._id}/reviews`);
      setModalReviews(res.data || []);
    } catch {
      setModalReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const closeModal = () => {
    setModalTutor(null);
    setModalReviews([]);
  };

  const truncate = (text, max) => {
    if (!text) return "No bio yet.";
    const t = text.trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max).trim()}…`;
  };

  return (
    <div className="student-sub-page student-search-page">
      <StudentAppHeader />
      <main className="student-search-main">
        <header className="student-search-hero">
          <h1>Find a tutor</h1>
          <p>
            Certified tutors are listed by student ratings (highest first).
            Open a profile to read their full bio and recent feedback.
          </p>
        </header>

        {loading && <p className="student-search-status">Loading tutors…</p>}
        {error && <p className="student-search-error">{error}</p>}

        {!loading && !error && tutors.length === 0 && (
          <p className="student-search-empty">
            No certified tutors are available yet.
          </p>
        )}

        <ul className="tutor-card-grid">
          {tutors.map((t, index) => (
            <li key={t._id} className="tutor-card">
              {index === 0 && t.averageRating != null && (
                <span className="tutor-card-badge">Top rated</span>
              )}
              <div className="tutor-card-avatar" aria-hidden>
                {initials(t.name)}
              </div>
              <h2 className="tutor-card-name">{t.name}</h2>
              <div className="tutor-card-rating-block">
                {t.averageRating != null ? (
                  <>
                    <StarDisplay value={t.averageRating} />
                    <span className="tutor-card-rating-num">
                      {t.averageRating.toFixed(1)}
                    </span>
                    <span className="tutor-card-review-count">
                      ({t.reviewCount}{" "}
                      {t.reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  </>
                ) : (
                  <span className="tutor-card-no-rating">No ratings yet</span>
                )}
              </div>
              <p className="tutor-card-bio-preview">
                {truncate(t.bio, 140)}
              </p>
              <div className="tutor-card-subjects">
                {(t.teachingSubjects || []).slice(0, 4).map((sid) => (
                  <span key={sid} className="subject-chip">
                    {subjectLabel(sid)}
                  </span>
                ))}
                {(t.teachingSubjects || []).length > 4 && (
                  <span className="subject-chip more">
                    +{(t.teachingSubjects || []).length - 4} more
                  </span>
                )}
              </div>
              <button
                type="button"
                className="tutor-card-cta"
                onClick={() => openModal(t)}
              >
                View profile
              </button>
            </li>
          ))}
        </ul>
      </main>

      {modalTutor && (
        <div
          className="tutor-modal-overlay"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="tutor-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="tutor-modal-title"
          >
            <button
              type="button"
              className="tutor-modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>
            <div className="tutor-modal-avatar">{initials(modalTutor.name)}</div>
            <h2 id="tutor-modal-title" className="tutor-modal-name">
              {modalTutor.name}
            </h2>
            <div className="tutor-modal-rating">
              {modalTutor.averageRating != null ? (
                <>
                  <StarDisplay value={modalTutor.averageRating} size="lg" />
                  <span className="tutor-modal-rating-num">
                    {modalTutor.averageRating.toFixed(1)} / 5
                  </span>
                  <span className="tutor-modal-review-total">
                    Based on {modalTutor.reviewCount}{" "}
                    {modalTutor.reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </>
              ) : (
                <p className="tutor-modal-no-rating">No ratings yet</p>
              )}
            </div>

            <section className="tutor-modal-section">
              <h3>Bio</h3>
              <p className="tutor-modal-bio">
                {modalTutor.bio?.trim()
                  ? modalTutor.bio.trim()
                  : "This tutor has not added a bio yet."}
              </p>
            </section>

            <section className="tutor-modal-section">
              <h3>Subjects</h3>
              <div className="tutor-modal-subjects">
                {(modalTutor.teachingSubjects || []).length === 0 && (
                  <span className="muted">No subjects listed.</span>
                )}
                {(modalTutor.teachingSubjects || []).map((sid) => (
                  <span key={sid} className="subject-chip dark">
                    {subjectLabel(sid)}
                  </span>
                ))}
              </div>
            </section>

            <section className="tutor-modal-section">
              <h3>Recent feedback</h3>
              {reviewsLoading && (
                <p className="muted">Loading reviews…</p>
              )}
              {!reviewsLoading && modalReviews.length === 0 && (
                <p className="muted">No written feedback yet.</p>
              )}
              <ul className="tutor-modal-reviews">
                {modalReviews.map((r, i) => (
                  <li key={`${r.submittedAt}-${i}`} className="tutor-review-row">
                    <div className="tutor-review-top">
                      <strong>{r.student}</strong>
                      <StarDisplay value={r.rating} />
                      <span className="tutor-review-subject">
                        {subjectLabel(r.subject)}
                      </span>
                    </div>
                    {r.comment ? (
                      <p className="tutor-review-comment">&ldquo;{r.comment}&rdquo;</p>
                    ) : null}
                    <span className="tutor-review-date">
                      {r.submittedAt
                        ? format(new Date(r.submittedAt), "MMM d, yyyy")
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="tutor-modal-actions">
              <Link to="/booking" className="tutor-modal-book" onClick={closeModal}>
                Book a session
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
