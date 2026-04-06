import { useState, useEffect, useMemo, useReducer } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { format, addMonths, subMonths } from "date-fns";
import axios from "axios";
import API from "../services/api";
import { sameLocalCalendarDay } from "../utils/sessionUtils";
import "./Dashboard.css";

const API_URL = "http://localhost:5000";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [subjectMap, setSubjectMap] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "tutor") {
        navigate("/", { replace: true });
        return;
      }
      if (!u.certifiedTutor) {
        navigate("/tutor/certification", { replace: true });
        return;
      }
      setMe(u);
      const token = localStorage.getItem("token");
      if (token) {
        API.get("/auth/me")
          .then((res) => {
            setMe(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          })
          .catch(() => {});
      }
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    axios
      .get(`${API_URL}/auth/tutor/exam/subjects`)
      .then((res) => {
        const m = {};
        (res.data.subjects || []).forEach((s) => {
          m[s.id] = s.name;
        });
        setSubjectMap(m);
      })
      .catch(() => {});
  }, []);

  const teachingSubjectsLine = useMemo(() => {
    if (!me?.teachingSubjects?.length) return "—";
    return me.teachingSubjects.map((id) => subjectMap[id] || id).join(", ");
  }, [me, subjectMap]);

  const subjectLabel = (id) => subjectMap[id] || id;

  const [bio, setBio] = useState("");
  const [editing, setEditing] = useState(false);
  const [profilePic, setProfilePic] = useState("/images/profile.jpg");

  const [tempBio, setTempBio] = useState("");
  const [tempPic, setTempPic] = useState(profilePic);

  const [feedbackList, setFeedbackList] = useState([]);

  const [sessionRequests, setSessionRequests] = useState([]);
  /** All accepted sessions (past + future) for the calendar */
  const [calendarSessions, setCalendarSessions] = useState([]);
  const [calendarVer, bumpCalendar] = useReducer((x) => x + 1, 0);

  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!me?._id) return;

    const fetchSessions = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/sessions/tutor/user/${me._id}`
        );

        const pending = res.data.filter((s) => s.status === "pending");
        const accepted = res.data.filter((s) => s.status === "accepted");

        setSessionRequests(pending);
        setCalendarSessions(accepted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSessions();
  }, [me?._id, calendarVer]);

  useEffect(() => {
    if (!me?._id) return;
    const loadFeedback = () => {
      axios
        .get(`${API_URL}/sessions/tutor/user/${me._id}/feedbacks`)
        .then((res) => setFeedbackList(res.data || []))
        .catch(() => setFeedbackList([]));
    };
    loadFeedback();
    const id = setInterval(loadFeedback, 30000);
    return () => clearInterval(id);
  }, [me?._id]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // ✅ ACCEPT → UPDATE DB
  const handleAccept = async (id) => {
    try {
      const res = await axios.patch(
        `${API_URL}/sessions/${id}/status`,
        { status: "accepted" }
      );

      setCalendarSessions((prev) => [...prev, res.data]);
      setSessionRequests((prev) => prev.filter((s) => s._id !== id));
      bumpCalendar();

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ REJECT → UPDATE DB
  const handleReject = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/sessions/${id}/status`,
        { status: "rejected" }
      );

      setSessionRequests((prev) => prev.filter((s) => s._id !== id));

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (me?.bio !== undefined) {
      const b = me.bio || "";
      setBio(b);
      setTempBio(b);
    }
  }, [me?.bio, me?._id]);

  const handleSave = async () => {
    try {
      await API.patch("/auth/profile", { bio: tempBio });
      const meRes = await API.get("/auth/me");
      const u = meRes.data.user;
      localStorage.setItem("user", JSON.stringify(u));
      setMe(u);
      setBio(tempBio);
      setProfilePic(tempPic);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Could not save profile");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setTempPic(URL.createObjectURL(file));
  };

  const daysInMonth = (date) => {
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const days = [];
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i));
    }
    return days;
  };

  const sessionsByDate = (date) =>
    calendarSessions.filter((s) => sameLocalCalendarDay(s.time, date));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  if (!me) {
    return (
      <div className="dashboard-container">
        <p className="dashboard-loading">Loading…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="top-header fixed-header">
        <div className="logo-section">
          <img src="/images/logo.jpg" alt="logo" />
          <h1>SkillSwap</h1>
        </div>
        <div className="auth-section">
          <NavLink to="/" className="auth-btn login">Home</NavLink>
          <button type="button" className="auth-btn login" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-scroll">
        <section className="dashboard-section">
          
          {/* PROFILE */}
          <div className="profile-panel fill-left">
            <img src={profilePic} alt="profile" className="profile-pic" />
            <h3 className="profile-display-name">{me.name}</h3>
            <p className="profile-subtitle">Tutor profile</p>
            <p><strong>Bio:</strong> {bio}</p>
            <p><strong>Subjects you teach:</strong> {teachingSubjectsLine}</p>
            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div className="dashboard-right">

            {/* RATINGS */}
            <div className="dash-card">
              <h3>⭐ Ratings</h3>
              {feedbackList.length === 0 && (
                <p className="ratings-empty">No feedback yet from students.</p>
              )}
              {feedbackList.map((r) => (
                <div key={r._id} className="rating-row">
                  <div className="rating-header">
                    <strong>{r.student}</strong>
                    <span className="rating-subject">{subjectLabel(r.subject)}</span>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= r.rating ? "star filled" : "star"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {r.feedback ? (
                    <span className="feedback">&ldquo;{r.feedback}&rdquo;</span>
                  ) : (
                    <span className="feedback muted">No written comment</span>
                  )}
                  <div className="rating-date">
                    {r.submittedAt
                      ? format(new Date(r.submittedAt), "MMM d, yyyy")
                      : ""}
                  </div>
                </div>
              ))}
            </div>

            {/* CALENDAR */}
            <div className="dash-card">
              <h3>📅 Session calendar</h3>
              <p className="calendar-hint">
                Accepted sessions appear on the day they are scheduled (local
                time).
              </p>
              <div className="calendar-header">
                <button
                  type="button"
                  className="edit-btn calendar-arrow-btn"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                >
                  ◀
                </button>
                <span>{format(currentMonth, "MMMM yyyy")}</span>
                <button
                  type="button"
                  className="edit-btn calendar-arrow-btn"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                >
                  ▶
                </button>
              </div>

              <div className="calendar-grid">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                  <div key={d}>{d}</div>
                ))}

                {daysInMonth(currentMonth).map((day) => {
                  const sessions = sessionsByDate(day);
                  return (
                    <div
                      key={day.getTime()}
                      className={sessions.length ? "calendar-day has-session" : "calendar-day"}
                      onClick={() => sessions.length && setSelectedDate(day)}
                    >
                      <span>{day.getDate()}</span>
                      {sessions.map((s,i) => (
                        <span key={i} className="dot"></span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SESSION REQUESTS */}
            <div className="dash-card">
              <h3>📩 Session Requests</h3>

              {sessionRequests.length === 0 && <p>No requests</p>}

              {sessionRequests.map(r => (
                <div key={r._id} className="request-row">
                  <div>
                    <strong>{r.studentName}</strong>
                    <p className="time">{format(new Date(r.time),"MMM dd, hh:mm a")}</p>
                    <span>{subjectLabel(r.subject)}</span>
                  </div>
                  <div className="actions">
                    <button className="accept-btn" onClick={()=>handleAccept(r._id)}>Accept</button>
                    <button className="reject-btn" onClick={()=>handleReject(r._id)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      </main>

      {/* MODALS remain EXACTLY SAME */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal-card profile-modal bigger-modal profile-edit-modal">
            <h2>Edit Profile</h2>
            <label className="profile-edit-label" htmlFor="profile-bio-edit">
              Bio
            </label>
            <textarea
              id="profile-bio-edit"
              className="profile-edit-bio"
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              rows={10}
            />
            <button type="button" className="edit-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="modal-overlay" onClick={()=>setSelectedDate(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Sessions on {format(selectedDate,"MMM dd, yyyy")}</h3>
            {sessionsByDate(selectedDate).map(s=>(
              <div key={s._id}>
                <strong>{s.studentName}</strong>
                <span>{subjectLabel(s.subject)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}