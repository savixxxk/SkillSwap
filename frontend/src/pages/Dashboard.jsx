import { useState, useEffect, useMemo, useReducer } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { format, addMonths, subMonths } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../services/api";
import { sameLocalCalendarDay } from "../utils/sessionUtils";
import "./Dashboard.css";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [subjectMap, setSubjectMap] = useState({});
  const [activeTab, setActiveTab] = useState("profile");

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
    API.get("/auth/tutor/exam/subjects")
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
  const [tempPic, setTempPic] = useState("/images/profile.jpg");

  const [feedbackList, setFeedbackList] = useState([]);

  const [sessionRequests, setSessionRequests] = useState([]);
  /** All accepted sessions (past + future) for the calendar */
  const [calendarSessions, setCalendarSessions] = useState([]);
  const [calendarVer, bumpCalendar] = useReducer((x) => x + 1, 0);

  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Report generation state
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!me?._id) return;

    const fetchSessions = async () => {
      try {
        const res = await API.get(`/sessions/tutor/user/${me._id}`);

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
      API.get(`/sessions/tutor/user/${me._id}/feedbacks`)
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
    const sessionToAccept = sessionRequests.find((s) => s._id === id);
    if (!sessionToAccept) return;

    // Check for time clashes with accepted sessions
    const sessionTime = new Date(sessionToAccept.time);
    const hasClash = calendarSessions.some((acceptedSession) => {
      const acceptedTime = new Date(acceptedSession.time);
      // Check if times are within 1 hour of each other (assuming 1-hour sessions)
      const timeDiff = Math.abs(sessionTime - acceptedTime);
      return timeDiff < 60 * 60 * 1000; // 1 hour in milliseconds
    });

    if (hasClash) {
      alert("This session conflicts with an already accepted session. Please choose a different time or reject the conflicting session first.");
      return;
    }

    try {
      const res = await API.patch(`/sessions/${id}/status`, {
        status: "accepted",
      });

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
      await API.patch(`/sessions/${id}/status`, { status: "rejected" });

      setSessionRequests((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (me?._id) {
      const currentBio = me.bio || "";
      const currentPic = me.profilePic || "/images/profile.jpg";
      setBio(currentBio);
      setTempBio(currentBio);
      setProfilePic(currentPic);
      setTempPic(currentPic);
    }
  }, [me?._id, me?.bio, me?.profilePic]);

  const handleSave = async () => {
    try {
      await API.patch("/auth/profile", {
        bio: tempBio,
        profilePic: tempPic,
      });
      const meRes = await API.get("/auth/me");
      const u = meRes.data.user;
      localStorage.setItem("user", JSON.stringify(u));
      setMe(u);
      setBio(tempBio);
      setProfilePic(tempPic);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          err.response?.statusText ||
          err.message ||
          "Could not save profile",
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempPic(reader.result);
    };
    reader.readAsDataURL(file);
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

  const averageRating = useMemo(() => {
    if (!feedbackList.length) return "0.0";
    const total = feedbackList.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0,
    );
    return (total / feedbackList.length).toFixed(1);
  }, [feedbackList]);

  const getLogoDataUrl = () =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      };
      img.onerror = reject;
      img.src = "/images/logo.jpg";
    });

  const exportReportPdf = async () => {
    if (!reportStartDate || !reportEndDate) {
      alert("Please select both start and end dates for the report.");
      return;
    }

    const start = new Date(reportStartDate);
    const end = new Date(reportEndDate);
    if (start > end) {
      alert("Start date must be before end date.");
      return;
    }

    setPdfLoading(true);
    try {
      // Get all sessions for the tutor
      const res = await API.get(`/sessions/tutor/user/${me._id}`);
      const allSessions = res.data || [];

      // Filter sessions by date range
      const filteredSessions = allSessions.filter((s) => {
        const sessionDate = new Date(s.time);
        return sessionDate >= start && sessionDate <= end;
      });

      // Count by status
      const statusCounts = { pending: 0, accepted: 0, rejected: 0, completed: 0 };
      filteredSessions.forEach((s) => {
        if (s.status in statusCounts) statusCounts[s.status] += 1;
        if (s.status === "accepted" && new Date(s.time) < new Date()) {
          statusCounts.completed += 1;
        }
      });

      const doc = new jsPDF();
      try {
        const logoData = await getLogoDataUrl();
        doc.addImage(logoData, "JPEG", 14, 10, 20, 20);
      } catch {
        // logo is optional
      }

      doc.setFontSize(18);
      doc.text("SkillSwap Tutor Sessions Report", 40, 18);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 25);
      doc.text(`Tutor: ${me.name}`, 40, 30);
      doc.text(`Period: ${format(start, "MMM dd, yyyy")} - ${format(end, "MMM dd, yyyy")}`, 40, 35);

      autoTable(doc, {
        startY: 45,
        head: [["Status", "Count"]],
        body: [
          ["Completed", String(statusCounts.completed)],
          ["Accepted (Upcoming)", String(statusCounts.accepted - statusCounts.completed)],
          ["Pending", String(statusCounts.pending)],
          ["Rejected", String(statusCounts.rejected)],
        ],
      });

      autoTable(doc, {
        head: [["Student", "Subject", "Status", "Time"]],
        body: filteredSessions
          .slice(0, 100)
          .map((s) => [
            s.studentName,
            subjectMap[s.subject] || s.subject,
            s.status,
            new Date(s.time).toLocaleString(),
          ]),
      });

      // Add footer
      const pageCount = doc.getNumberOfPages();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(
          "SkillSwap all rights reserved",
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" },
        );
      }
      doc.setTextColor(0);

      doc.save(`skillswap-tutor-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF report.");
    } finally {
      setPdfLoading(false);
    }
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
      <main className="dashboard-scroll">
        <section className="dashboard-hero">
          <div className="dashboard-hero-content">
            <div className="dashboard-hero-text">
              <h1>Welcome back, {me.name}</h1>
              <p>
                Manage your tutoring profile, sessions, and feedback in one
                place.
              </p>
            </div>
            <div className="dashboard-quick-stats">
              <div className="dashboard-quick-stat">
                <h3>{sessionRequests.length}</h3>
                <p>Pending Requests</p>
              </div>
              <div className="dashboard-quick-stat">
                <h3>{calendarSessions.length}</h3>
                <p>Accepted Sessions</p>
              </div>
              <div className="dashboard-quick-stat">
                <h3>{averageRating}</h3>
                <p>Average Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* TABS NAVIGATION */}
        <div className="dashboard-tabs-nav">
          <button
            className={`dashboard-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Tutor Profile
          </button>
          <button
            className={`dashboard-tab ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            📩 Session Requests
          </button>
          <button
            className={`dashboard-tab ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            📅 Session Calendar
          </button>
          <button
            className={`dashboard-tab ${activeTab === "ratings" ? "active" : ""}`}
            onClick={() => setActiveTab("ratings")}
          >
            ⭐ Ratings
          </button>
          <button
            className={`dashboard-tab ${activeTab === "report" ? "active" : ""}`}
            onClick={() => setActiveTab("report")}
          >
            📊 Generate Report
          </button>
          <button
            className="dashboard-tab"
            onClick={() => navigate("/tutor/certification")}
          >
            ✅ Certification
          </button>
        </div>

        {/* TAB CONTENTS */}
        <section className="dashboard-tabs-content">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="tab-panel">
              <div className="profile-panel fill-left">
                <img src={profilePic} alt="profile" className="profile-pic" />
                <h3 className="profile-display-name">{me.name}</h3>
                <p className="profile-subtitle">Tutor profile</p>
                <p className="profile-bio-block">
                  <strong>Bio:</strong> {bio}
                </p>
                <p className="profile-subjects-block">
                  <strong>Subjects you teach:</strong> {teachingSubjectsLine}
                </p>
                <button
                  className="edit-btn profile-edit-btn"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* SESSION REQUESTS TAB */}
          {activeTab === "requests" && (
            <div className="tab-panel">
              <div className="dash-card">
                <h3>📩 Session Requests</h3>

                {sessionRequests.length === 0 && <p>No pending requests</p>}

                {sessionRequests.map((r) => (
                  <div key={r._id} className="request-row">
                    <div>
                      <strong>{r.studentName}</strong>
                      <p className="time">
                        {format(new Date(r.time), "MMM dd, hh:mm a")}
                      </p>
                      <span>{subjectLabel(r.subject)}</span>
                    </div>
                    <div className="actions">
                      <button
                        className="accept-btn"
                        onClick={() => handleAccept(r._id)}
                      >
                        Accept
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(r._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SESSION CALENDAR TAB */}
          {activeTab === "calendar" && (
            <div className="tab-panel">
              <div className="dash-card">
                <h3>📅 Session Calendar</h3>
                <p className="calendar-hint">
                  Click on a date with sessions to view details
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
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}

                  {daysInMonth(currentMonth).map((day) => {
                    const sessions = sessionsByDate(day);
                    return (
                      <div
                        key={day.getTime()}
                        className={
                          sessions.length
                            ? "calendar-day has-session"
                            : "calendar-day"
                        }
                        onClick={() => sessions.length && setSelectedDate(day)}
                      >
                        <span>{day.getDate()}</span>
                        {sessions.map((s, i) => (
                          <span key={i} className="dot"></span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* RATINGS TAB */}
          {activeTab === "ratings" && (
            <div className="tab-panel">
              <div className="dash-card">
                <h3>⭐ Ratings & Feedback</h3>
                {feedbackList.length === 0 && (
                  <p className="ratings-empty">No feedback yet from students.</p>
                )}
                {feedbackList.map((r) => (
                  <div key={r._id} className="rating-row">
                    <div className="rating-header">
                      <strong>{r.student}</strong>
                      <span className="rating-subject">
                        {subjectLabel(r.subject)}
                      </span>
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
            </div>
          )}

          {/* REPORT TAB */}
          {activeTab === "report" && (
            <div className="tab-panel">
              <div className="dash-card">
                <h3>📊 Generate Session Report</h3>
                <p className="calendar-hint">
                  Select date range and download your session report as PDF
                </p>
                <div className="report-filters">
                  <div className="filter-group">
                    <label htmlFor="report-start">Start Date:</label>
                    <input
                      id="report-start"
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label htmlFor="report-end">End Date:</label>
                    <input
                      id="report-end"
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="edit-btn report-generate-btn"
                  onClick={exportReportPdf}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? "Generating PDF..." : "Generate PDF Report"}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODALS */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal-card profile-modal bigger-modal profile-edit-modal">
            <h2>Edit Profile</h2>
            <div className="profile-photo-upload">
              <img
                src={tempPic}
                alt="Preview"
                className="profile-photo-preview"
              />
              <label className="profile-upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
                Change Profile Photo
              </label>
            </div>
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
        <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Sessions on {format(selectedDate, "MMM dd, yyyy")}</h3>
            {sessionsByDate(selectedDate).map((s) => (
              <div key={s._id} className="session-popup-row">
                <strong>{s.studentName}</strong>
                <span>{subjectLabel(s.subject)}</span>
                <span className="session-popup-time">
                  {format(new Date(s.time), "hh:mm a")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
