import { useState, useEffect, useMemo, useCallback, useReducer } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { sessionEnded } from "../utils/sessionUtils";
import StudentAppHeader from "../components/StudentAppHeader";
import "./SessionBooking.css";

const API = "http://localhost:5000";

function studentRowStatus(s) {
  if (s.status === "pending") return { label: "Pending", cls: "pending" };
  if (s.status === "rejected") return { label: "Declined", cls: "rejected" };
  if (s.status === "accepted") {
    if (!sessionEnded(s)) return { label: "Confirmed", cls: "accepted" };
    return { label: "Completed", cls: "completed" };
  }
  return { label: s.status, cls: "" };
}

function FeedbackCard({ session, subjectLabel, studentId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    try {
      setSending(true);
      await axios.post(`${API}/sessions/${session._id}/feedback`, {
        studentId,
        rating,
        comment,
      });
      onSubmitted();
    } catch (e) {
      setErr(e.response?.data?.message || "Could not submit feedback");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="feedback-card">
      <div className="feedback-card-head">
        <strong>{session.tutorName}</strong>
        <span>{subjectLabel(session.subject)}</span>
        <div className="session-meta">
          {format(new Date(session.time), "MMM d, yyyy · h:mm a")} ·{" "}
          {session.location}
        </div>
      </div>
      <p className="feedback-card-note">
        Rate this session and optionally leave a comment for your tutor.
      </p>
      {err && <div className="feedback-card-error">{err}</div>}
      <label className="feedback-label">Rating</label>
      <div className="star-rating-input">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={n <= rating ? "star-btn on" : "star-btn"}
            onClick={() => setRating(n)}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <label className="feedback-label">Comment (optional)</label>
      <textarea
        className="feedback-textarea"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What went well? What could improve?"
      />
      <button
        type="button"
        className="gradient-btn feedback-submit"
        onClick={submit}
        disabled={sending}
      >
        {sending ? "Submitting…" : "Submit feedback"}
      </button>
    </div>
  );
}

export default function SessionBooking() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("book");
  const [certifiedTutors, setCertifiedTutors] = useState([]);
  const [subjectCatalog, setSubjectCatalog] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [, tick] = useReducer((x) => x + 1, 0);

  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");

  const [campusLocations] = useState([
    "Birdnest",
    "New Building",
    "Juice Bar",
    "Anohana",
    "Basement Canteen",
    "Study Area",
  ]);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role === "tutor" && !u.certifiedTutor) {
        navigate("/tutor/certification", { replace: true });
        return;
      }
      setUser(u);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const id = setInterval(() => tick(), 60000);
    return () => clearInterval(id);
  }, []);

  const subjectLabel = useCallback(
    (id) => subjectCatalog.find((s) => s.id === id)?.name || id,
    [subjectCatalog]
  );

  const loadCertifiedTutors = useCallback(async () => {
    const res = await axios.get(`${API}/sessions/certified-tutors`);
    setCertifiedTutors(res.data || []);
  }, []);

  const loadSubjectCatalog = useCallback(async () => {
    const res = await axios.get(`${API}/auth/tutor/exam/subjects`);
    setSubjectCatalog(res.data.subjects || []);
  }, []);

  const loadMySessions = useCallback(async () => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const u = JSON.parse(raw);
    if (!u._id || u.role !== "student") return;
    const res = await axios.get(`${API}/sessions/student/user/${u._id}`);
    setMySessions(res.data || []);
  }, []);

  useEffect(() => {
    loadSubjectCatalog();
    loadCertifiedTutors();
  }, [loadSubjectCatalog, loadCertifiedTutors]);

  useEffect(() => {
    if (user?.role === "student" && user?._id) {
      loadMySessions();
    }
  }, [user, loadMySessions, tick]);

  useEffect(() => {
    if (activeTab === "my-sessions" && user?.role === "student" && user?._id) {
      loadMySessions();
    }
    if (activeTab === "feedback" && user?.role === "student" && user?._id) {
      loadMySessions();
    }
  }, [activeTab, user, loadMySessions]);

  const selectedTutor = useMemo(
    () => certifiedTutors.find((t) => t._id === selectedTutorId),
    [certifiedTutors, selectedTutorId]
  );

  const sessionsNeedingFeedback = useMemo(() => {
    return mySessions.filter(
      (s) =>
        s.status === "accepted" &&
        sessionEnded(s) &&
        !s.studentFeedback?.rating
    );
  }, [mySessions, tick]);

  useEffect(() => {
    setSelectedSubject("");
  }, [selectedTutorId]);

  const handleSubmit = async () => {
    if (!user || user.role !== "student") return;
    if (
      !selectedTutorId ||
      !selectedSubject ||
      !selectedTime ||
      !selectedPlace
    ) {
      alert("Fill all fields");
      return;
    }

    const tutor = certifiedTutors.find((t) => t._id === selectedTutorId);
    if (!tutor) {
      alert("Select a valid tutor");
      return;
    }

    try {
      await axios.post(`${API}/sessions/book`, {
        studentId: user._id,
        tutorId: selectedTutorId,
        studentName: user.name,
        tutorName: tutor.name,
        subject: selectedSubject,
        time: selectedTime,
        location: selectedPlace,
      });

      setSelectedTutorId("");
      setSelectedSubject("");
      setSelectedTime("");
      setSelectedPlace("");
      setActiveTab("my-sessions");
      await loadMySessions();
      tick();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error booking session");
    }
  };

  if (!user) {
    return (
      <div className="session-booking-page session-booking-loading-wrap">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="session-booking-page">
      <StudentAppHeader />
      <div className="session-booking-container">
      <h2>📚 Session booking</h2>

      <div className="session-booking-tabs">
        {user.role === "student" && (
          <>
            <button
              type="button"
              className={activeTab === "book" ? "tab active" : "tab"}
              onClick={() => setActiveTab("book")}
            >
              Book a session
            </button>
            <button
              type="button"
              className={activeTab === "feedback" ? "tab active" : "tab"}
              onClick={() => setActiveTab("feedback")}
            >
              Session feedback
              {sessionsNeedingFeedback.length > 0 && (
                <span className="tab-badge">{sessionsNeedingFeedback.length}</span>
              )}
            </button>
            <button
              type="button"
              className={activeTab === "my-sessions" ? "tab active" : "tab"}
              onClick={() => setActiveTab("my-sessions")}
            >
              My sessions
            </button>
          </>
        )}
        {user.role === "tutor" && (
          <p className="session-booking-hint">
            Students book sessions with you from their account. Open your{" "}
            <Link to="/dashboard">tutor dashboard</Link> for requests and your
            calendar.
          </p>
        )}
      </div>

      {user.role === "student" && activeTab === "book" && (
        <div className="book-form">
          <label>Tutor</label>
          <select
            value={selectedTutorId}
            onChange={(e) => setSelectedTutorId(e.target.value)}
          >
            <option value="">Select a certified tutor</option>
            {certifiedTutors.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
                {t.teachingSubjects?.length
                  ? ` — ${t.teachingSubjects.map(subjectLabel).join(", ")}`
                  : ""}
              </option>
            ))}
          </select>

          <label>Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedTutor}
          >
            <option value="">
              {selectedTutor ? "Select subject" : "Choose a tutor first"}
            </option>
            {(selectedTutor?.teachingSubjects || []).map((sid) => (
              <option key={sid} value={sid}>
                {subjectLabel(sid)}
              </option>
            ))}
          </select>

          <label>Time</label>
          <input
            type="datetime-local"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />

          <label>Place</label>
          <select
            value={selectedPlace}
            onChange={(e) => setSelectedPlace(e.target.value)}
          >
            <option value="">Select place</option>
            {campusLocations.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <button className="gradient-btn" type="button" onClick={handleSubmit}>
            Request session
          </button>
        </div>
      )}

      {user.role === "student" && activeTab === "feedback" && (
        <div className="feedback-tab-panel">
          <h3>Session feedback</h3>
          <p className="feedback-tab-lead">
            After a confirmed session ends (60 minutes after the scheduled start
            by default), you can rate your tutor here. Your{" "}
            <button
              type="button"
              className="linkish"
              onClick={() => setActiveTab("my-sessions")}
            >
              My sessions
            </button>{" "}
            tab shows each booking as <strong>Completed</strong> once the time
            has passed—without showing the form there.
          </p>
          {sessionsNeedingFeedback.length === 0 && (
            <p className="feedback-empty">
              No sessions need feedback right now.
            </p>
          )}
          {sessionsNeedingFeedback.map((s) => (
            <FeedbackCard
              key={s._id}
              session={s}
              subjectLabel={subjectLabel}
              studentId={user._id}
              onSubmitted={async () => {
                await loadMySessions();
                tick();
              }}
            />
          ))}
        </div>
      )}

      {user.role === "student" && activeTab === "my-sessions" && (
        <div className="student-requests">
          <h3>Your bookings</h3>
          {mySessions.length === 0 && <p>No sessions yet.</p>}
          {mySessions.map((s) => {
            const st = studentRowStatus(s);
            const showRated =
              s.status === "accepted" &&
              sessionEnded(s) &&
              s.studentFeedback?.rating;
            return (
              <div key={s._id} className="student-session-row">
                <div>
                  <strong>{s.tutorName}</strong>
                  <div>{subjectLabel(s.subject)}</div>
                  <div className="session-meta">
                    {format(new Date(s.time), "MMM d, yyyy · h:mm a")} ·{" "}
                    {s.location}
                  </div>
                </div>
                <div className="student-session-status-col">
                  <span className={st.cls}>{st.label}</span>
                  {showRated && (
                    <span className="rated-pill">Feedback sent</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
