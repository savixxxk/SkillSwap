import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [userFilter, setUserFilter] = useState("all");
  const [busyUserId, setBusyUserId] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed.role !== "admin") {
        navigate("/", { replace: true });
        return;
      }
      setMe(parsed);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!me) return;

    setLoading(true);
    Promise.all([
      API.get("/admin/users"),
      API.get("/admin/sessions"),
      API.get("/admin/tutor-ratings"),
    ])
      .then(([usersRes, sessionsRes, ratingsRes]) => {
        setUsers(usersRes.data || []);
        setSessions(sessionsRes.data || []);
        setRatings(ratingsRes.data || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Unable to load admin data.");
      })
      .finally(() => setLoading(false));
  }, [me]);

  const filteredUsers = useMemo(() => {
    if (userFilter === "all") return users;
    return users.filter((user) => user.role === userFilter);
  }, [users, userFilter]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const openUser = async (userId) => {
    try {
      const res = await API.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load user details.");
    }
  };

  const closeUser = () => setSelectedUser(null);

  const setBlocked = async (userId, nextBlocked) => {
    setBusyUserId(userId);
    try {
      await API.patch(`/admin/users/${userId}/block`, {
        isBlocked: nextBlocked,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isBlocked: nextBlocked } : u,
        ),
      );
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update user block status.",
      );
    } finally {
      setBusyUserId("");
    }
  };

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
    setPdfLoading(true);
    try {
      const doc = new jsPDF();
      try {
        const logoData = await getLogoDataUrl();
        doc.addImage(logoData, "JPEG", 14, 10, 20, 20);
      } catch {
        // logo is optional in case image loading fails in browser security contexts
      }

      const pdfTitleMap = {
        users: "SkillSwap Login Accounts Report",
        ratings: "SkillSwap Tutor Ratings Report",
        sessions: "SkillSwap Sessions Report",
      };
      doc.setFontSize(18);
      doc.text(pdfTitleMap[activeTab] || "SkillSwap Admin Report", 40, 18);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 25);

      if (activeTab === "users") {
        autoTable(doc, {
          startY: 35,
          head: [["Metric", "Value"]],
          body: [
            ["Total users", String(counts.totalUsers)],
            ["Students", String(counts.students)],
            ["Tutors", String(counts.tutors)],
            ["Admins", String(counts.admins)],
            [
              "Blocked accounts",
              String(users.filter((u) => u.isBlocked).length),
            ],
          ],
        });

        autoTable(doc, {
          head: [["Name", "Email", "Role", "Blocked", "Joined"]],
          body: users
            .slice(0, 80)
            .map((u) => [
              u.name,
              u.email,
              u.role,
              u.isBlocked ? "Yes" : "No",
              new Date(u.createdAt).toLocaleDateString(),
            ]),
        });
      }

      if (activeTab === "ratings") {
        autoTable(doc, {
          startY: 35,
          head: [["Tutor", "Average Rating", "Ratings Count", "Certified"]],
          body: ratings.map((stat) => [
            stat.tutor?.name || "Unknown",
            stat.averageRating?.toFixed(2) || "-",
            String(stat.ratingCount || 0),
            stat.tutor?.certifiedTutor ? "Yes" : "No",
          ]),
        });
      }

      if (activeTab === "sessions") {
        autoTable(doc, {
          startY: 35,
          head: [["Metric", "Value"]],
          body: [
            ["Total sessions", String(counts.sessions)],
            ["Pending", String(sessionStatusCounts.pending)],
            ["Accepted", String(sessionStatusCounts.accepted)],
            ["Rejected", String(sessionStatusCounts.rejected)],
          ],
        });

        autoTable(doc, {
          head: [["Subject", "Tutor", "Student", "Status", "Time"]],
          body: sessions
            .slice(0, 120)
            .map((s) => [
              s.subject,
              s.tutorName,
              s.studentName,
              s.status,
              new Date(s.time).toLocaleString(),
            ]),
        });
      }

      // Add footer on every page.
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

      doc.save(`skillswap-${activeTab}-report-${Date.now()}.pdf`);
    } catch {
      setError("Failed to generate PDF report.");
    } finally {
      setPdfLoading(false);
    }
  };

  const counts = {
    totalUsers: users.length,
    students: users.filter((u) => u.role === "student").length,
    tutors: users.filter((u) => u.role === "tutor").length,
    admins: users.filter((u) => u.role === "admin").length,
    sessions: sessions.length,
  };

  const sessionStatusCounts = useMemo(() => {
    const summary = { pending: 0, accepted: 0, rejected: 0 };
    sessions.forEach((session) => {
      if (session.status in summary) summary[session.status] += 1;
    });
    return summary;
  }, [sessions]);

  const pieTotal = Math.max(counts.students + counts.tutors, 1);
  const studentPercent = Math.round((counts.students / pieTotal) * 100);
  const tutorPercent = Math.round((counts.tutors / pieTotal) * 100);
  const sessionMax = Math.max(
    sessionStatusCounts.pending,
    sessionStatusCounts.accepted,
    sessionStatusCounts.rejected,
    1,
  );

  return (
    <div className="admin-dashboard-container">
      <main className="admin-scroll">
        <section className="admin-overview">
          <div className="admin-card summary-card">
            <div className="summary-top-row">
              <div>
                <span className="admin-badge">Admin Control Center</span>
                <h2>Welcome back, {me?.name || "Admin"}</h2>
                <p className="admin-intro">
               
                </p>
              </div>
              <div className="summary-actions">
                <button
                  type="button"
                  className="row-btn logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="admin-stats-grid">
            <div className="admin-card stat-card">
              <span className="stat-label">Total users</span>
              <strong>{counts.totalUsers}</strong>
            </div>
            <div className="admin-card stat-card">
              <span className="stat-label">Students</span>
              <strong>{counts.students}</strong>
            </div>
            <div className="admin-card stat-card">
              <span className="stat-label">Tutors</span>
              <strong>{counts.tutors}</strong>
            </div>
            <div className="admin-card stat-card">
              <span className="stat-label">Sessions</span>
              <strong>{counts.sessions}</strong>
            </div>
          </div>

          <div className="admin-visuals-grid">
            <div className="admin-card chart-card">
              <div className="list-header chart-head">
                <div>
                  <h3>User Distribution</h3>
                  <p className="tab-subtitle">Students vs Tutors (pie chart)</p>
                </div>
              </div>
              <div className="pie-layout">
                <div
                  className="pie-chart"
                  style={{
                    background: `conic-gradient(#2563eb 0% ${studentPercent}%, #14b8a6 ${studentPercent}% ${studentPercent + tutorPercent}%, #dbeafe ${studentPercent + tutorPercent}% 100%)`,
                  }}
                  aria-label="Users pie chart"
                />
                <div className="pie-legend">
                  <div className="legend-item">
                    <span className="legend-dot students" />
                    <span>Students</span>
                    <strong>{counts.students}</strong>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot tutors" />
                    <span>Tutors</span>
                    <strong>{counts.tutors}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card chart-card">
              <div className="list-header chart-head">
                <div>
                  <h3>Session Status Overview</h3>
                  <p className="tab-subtitle">
                    Accepted and pending sessions graph
                  </p>
                </div>
              </div>
              <div className="bars-wrap">
                <div className="bar-row">
                  <span className="bar-label">Accepted</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill accepted"
                      style={{
                        width: `${(sessionStatusCounts.accepted / sessionMax) * 100}%`,
                      }}
                    />
                  </div>
                  <strong>{sessionStatusCounts.accepted}</strong>
                </div>
                <div className="bar-row">
                  <span className="bar-label">Pending</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill pending"
                      style={{
                        width: `${(sessionStatusCounts.pending / sessionMax) * 100}%`,
                      }}
                    />
                  </div>
                  <strong>{sessionStatusCounts.pending}</strong>
                </div>
                <div className="bar-row">
                  <span className="bar-label">Rejected</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill rejected"
                      style={{
                        width: `${(sessionStatusCounts.rejected / sessionMax) * 100}%`,
                      }}
                    />
                  </div>
                  <strong>{sessionStatusCounts.rejected}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-tab-panel">
          <div className="admin-tab-list">
            <button
              type="button"
              className={
                activeTab === "users" ? "admin-tab active" : "admin-tab"
              }
              onClick={() => setActiveTab("users")}
            >
              Users
            </button>
            <button
              type="button"
              className={
                activeTab === "ratings" ? "admin-tab active" : "admin-tab"
              }
              onClick={() => setActiveTab("ratings")}
            >
              Tutor Ratings
            </button>
            <button
              type="button"
              className={
                activeTab === "sessions" ? "admin-tab active" : "admin-tab"
              }
              onClick={() => setActiveTab("sessions")}
            >
              Sessions
            </button>
            <button
              type="button"
              className="admin-tab pdf-generate-btn"
              onClick={exportReportPdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? "Generating PDF..." : "Generate PDF"}
            </button>
          </div>

          {error && <div className="admin-error">{error}</div>}
          {loading ? (
            <div className="admin-loading">Loading admin data…</div>
          ) : (
            <div className="admin-tab-content">
              {activeTab === "users" && (
                <div className="admin-card list-card">
                  <div className="list-header">
                    <div>
                      <h3>Users</h3>
                      <p className="tab-subtitle">
                        Filter the list to show students or tutors.
                      </p>
                    </div>
                    <div className="filter-row">
                      <button
                        type="button"
                        className={
                          userFilter === "all"
                            ? "filter-btn active"
                            : "filter-btn"
                        }
                        onClick={() => setUserFilter("all")}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className={
                          userFilter === "student"
                            ? "filter-btn active"
                            : "filter-btn"
                        }
                        onClick={() => setUserFilter("student")}
                      >
                        Students
                      </button>
                      <button
                        type="button"
                        className={
                          userFilter === "tutor"
                            ? "filter-btn active"
                            : "filter-btn"
                        }
                        onClick={() => setUserFilter("tutor")}
                      >
                        Tutors
                      </button>
                    </div>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.slice(0, 25).map((user) => (
                          <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                              <span
                                className={
                                  user.isBlocked
                                    ? "status-chip blocked"
                                    : "status-chip active"
                                }
                              >
                                {user.isBlocked ? "Blocked" : "Active"}
                              </span>
                            </td>
                            <td>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="actions-inline">
                                <button
                                  className="row-btn"
                                  type="button"
                                  onClick={() => openUser(user._id)}
                                >
                                  View Profile
                                </button>
                                {user.role !== "admin" && (
                                  <button
                                    className={`row-btn ${user.isBlocked ? "unblock-btn" : "block-btn"}`}
                                    type="button"
                                    disabled={busyUserId === user._id}
                                    onClick={() =>
                                      setBlocked(user._id, !user.isBlocked)
                                    }
                                  >
                                    {busyUserId === user._id
                                      ? "Saving..."
                                      : user.isBlocked
                                        ? "Unblock User"
                                        : "Block User"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "ratings" && (
                <div className="admin-card list-card wide-card">
                  <div className="list-header">
                    <div>
                      <h3>Tutor Ratings</h3>
                      <p className="tab-subtitle">
                        Review average tutor ratings and volume.
                      </p>
                    </div>
                    <span>{ratings.length} entries</span>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Tutor</th>
                          <th>Average</th>
                          <th>Ratings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ratings.map((stat) => (
                          <tr key={stat.tutorId}>
                            <td>{stat.tutor?.name || "Unknown"}</td>
                            <td>{stat.averageRating?.toFixed(2) || "—"}</td>
                            <td>{stat.ratingCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "sessions" && (
                <div className="admin-card list-card wide-card">
                  <div className="list-header">
                    <div>
                      <h3>Sessions</h3>
                      <p className="tab-subtitle">
                        Inspect session requests, accepted bookings, and
                        completed sessions.
                      </p>
                    </div>
                    <span>{sessions.length} total</span>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Tutor</th>
                          <th>Student</th>
                          <th>Status</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.slice(0, 50).map((session) => (
                          <tr key={session._id}>
                            <td>{session.subject}</td>
                            <td>{session.tutorName}</td>
                            <td>{session.studentName}</td>
                            <td>
                              <span className="status-chip session-chip">
                                {session.status}
                              </span>
                            </td>
                            <td>{new Date(session.time).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {selectedUser && (
        <div className="modal-overlay" onClick={closeUser}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedUser.user.name}</h2>
              <button className="close-btn" type="button" onClick={closeUser}>
                ×
              </button>
            </div>
            <p>{selectedUser.user.email}</p>
            <p>Role: {selectedUser.user.role}</p>
            {selectedUser.user.bio && <p>Bio: {selectedUser.user.bio}</p>}
            <div className="user-sessions">
              <h4>Related sessions</h4>
              {selectedUser.sessions.length === 0 ? (
                <p>No sessions found.</p>
              ) : (
                <ul>
                  {selectedUser.sessions.slice(0, 10).map((session) => (
                    <li key={session._id}>
                      {session.subject} — {session.status} —{" "}
                      {new Date(session.time).toLocaleString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
