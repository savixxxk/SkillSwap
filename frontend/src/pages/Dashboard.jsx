import { useState } from "react";
import { NavLink } from "react-router-dom";
import { format, isSameDay, addMonths, subMonths } from "date-fns";
import "./Dashboard.css";

export default function TutorDashboard() {
  const [bio, setBio] = useState(
    "Passionate about teaching programming and web development."
  );
  const [subjects] = useState("JavaScript, React, HTML/CSS"); // read-only
  const [editing, setEditing] = useState(false);
  const [profilePic, setProfilePic] = useState("/images/profile.jpg");

  const [tempBio, setTempBio] = useState(bio);
  const [tempPic, setTempPic] = useState(profilePic);

  const [ratings] = useState([
    { student: "Eva", rating: 5, feedback: "Great session!" },
    { student: "Frank", rating: 4, feedback: "Very helpful." },
  ]);

  const [sessionRequests, setSessionRequests] = useState([
    { student: "Charlie", time: "2026-03-29T16:00", subject: "React", id: 1 },
    { student: "Dana", time: "2026-03-30T11:00", subject: "HTML/CSS", id: 2 },
  ]);

  const [upcomingSessions, setUpcomingSessions] = useState([
    { student: "Alice", time: "2026-03-27T10:00", subject: "React", id: 1 },
    { student: "Bob", time: "2026-03-28T14:00", subject: "JavaScript", id: 2 },
    { student: "Eve", time: "2026-03-28T16:00", subject: "HTML/CSS", id: 3 },
    { student: "Charlie", time: "2026-03-20T11:00", subject: "React", id: 4 },
  ]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleAccept = (id) => {
    const session = sessionRequests.find((s) => s.id === id);
    setUpcomingSessions([...upcomingSessions, session]);
    setSessionRequests(sessionRequests.filter((s) => s.id !== id));
  };

  const handleReject = (id) => {
    setSessionRequests(sessionRequests.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    setBio(tempBio);
    setProfilePic(tempPic);
    setEditing(false);
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
    upcomingSessions.filter((s) => isSameDay(new Date(s.time), date));

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="top-header fixed-header">
        <div className="logo-section">
          <img src="/images/logo.jpg" alt="logo" />
          <h1>SkillSwap</h1>
        </div>
        <div className="auth-section">
          <NavLink to="/" className="auth-btn login">Home</NavLink>
          <NavLink to="/logout" className="auth-btn login">Logout</NavLink>
        </div>
      </header>

      {/* MAIN */}
      <main className="dashboard-scroll">
        <section className="dashboard-section">
          {/* PROFILE */}
          <div className="profile-panel fill-left">
            <img src={profilePic} alt="profile" className="profile-pic" />
            <h3>Your Profile</h3>
            <p><strong>Bio:</strong> {bio}</p>
            <p><strong>Subjects:</strong> {subjects}</p>
            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div className="dashboard-right">
            {/* RATINGS */}
            <div className="dash-card">
              <h3>⭐ Ratings</h3>
              {ratings.map((r, i) => (
                <div key={i} className="rating-row">
                  <div className="rating-header">
                    <strong>{r.student}</strong>
                    <div className="stars">
                      {[1,2,3,4,5].map((star) => (
                        <span
                          key={star}
                          className={star <= r.rating ? "star filled" : "star"}
                        >★</span>
                      ))}
                    </div>
                  </div>
                  <span className="feedback">"{r.feedback}"</span>
                </div>
              ))}
            </div>

            {/* CALENDAR */}
            <div className="dash-card">
              <h3>📅 Upcoming Sessions</h3>
              <div className="calendar-header">
                <button className="calendar-nav" onClick={handlePrevMonth}>◀</button>
                <span>{format(currentMonth, "MMMM yyyy")}</span>
                <button className="calendar-nav" onClick={handleNextMonth}>▶</button>
              </div>
              <div className="calendar-grid">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                  <div key={d} className="calendar-day-header">{d}</div>
                ))}
                {daysInMonth(currentMonth).map(day => {
                  const sessions = sessionsByDate(day);
                  const isPast = sessions.some(s => new Date(s.time) < new Date());
                  return (
                    <div key={day} className="calendar-day"
                      onClick={() => sessions.length && setSelectedDate(day)}>
                      <span>{day.getDate()}</span>
                      <div className="dots">
                        {sessions.map((s,i) => (
                          <span key={i} className={isPast ? "dot green" : "dot blue"} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SESSION REQUESTS */}
            <div className="dash-card">
              <h3>📩 Session Requests</h3>
              {sessionRequests.map(r => (
                <div key={r.id} className="request-row">
                  <div>
                    <strong>{r.student}</strong>
                    <p className="time">{format(new Date(r.time),"MMM dd, hh:mm a")}</p>
                    <span>{r.subject}</span>
                  </div>
                  <div className="actions">
                    <button className="accept-btn" onClick={()=>handleAccept(r.id)}>Accept</button>
                    <button className="reject-btn" onClick={()=>handleReject(r.id)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* PROFILE EDIT MODAL */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal-card profile-modal bigger-modal">
            <h2>Edit Profile</h2>
            <div className="profile-modal-content">
              <div className="profile-pic-section">
                <img src={tempPic} alt="preview" className="profile-pic large"/>
                <input type="file" onChange={handleImageChange} />
              </div>

              <div className="profile-info-section">
                <div className="profile-field">
                  <label>Bio</label>
                  <textarea value={tempBio} onChange={(e)=>setTempBio(e.target.value)}/>
                </div>
                <div className="profile-field">
                  <label>Subjects</label>
                  <input type="text" value={subjects} readOnly/>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleSave} className="save-btn gradient-btn">Save</button>
              <button onClick={()=>setEditing(false)} className="cancel-btn gradient-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* SESSION MODAL */}
      {selectedDate && (
        <div className="modal-overlay" onClick={()=>setSelectedDate(null)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <h3>Sessions on {format(selectedDate,"MMM dd, yyyy")}</h3>
            {sessionsByDate(selectedDate).map(s=>(
              <div key={s.id} className="session-popup-row">
                <strong>{s.student}</strong>
                <span>{s.subject}</span>
                <span>{format(new Date(s.time),"hh:mm a")}</span>
              </div>
            ))}
            <button className="cancel-btn" onClick={()=>setSelectedDate(null)}>Close</button>
          </div>
        </div>
      )}

      <footer className="home-footer fixed-footer">
        © 2026 SkillSwap. All rights reserved.
      </footer>
    </div>
  );
}