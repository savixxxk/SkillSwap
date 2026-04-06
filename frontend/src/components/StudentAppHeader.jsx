import { Link, NavLink, useNavigate } from "react-router-dom";
import "./StudentAppHeader.css";

export default function StudentAppHeader({ showBack = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="student-app-header">
      <div className="student-app-header-left">
        {showBack && (
          <button
            type="button"
            className="student-back-btn"
            onClick={() => navigate("/")}
            aria-label="Back to home"
          >
            ←
          </button>
        )}
        <Link to="/" className="student-app-logo">
          <img src="/images/logo.jpg" alt="" />
          <span>SkillSwap</span>
        </Link>
      </div>
      <div className="student-app-header-right">
        <NavLink to="/" className="student-header-link" end>
          Home
        </NavLink>
        <button
          type="button"
          className="student-header-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
