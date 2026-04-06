import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [user, setUser] = useState(null);

  const images = [
    "/images/slide6.jpg",
    "/images/slide7.jpg",
    "/images/slide8.jpg",
    "/images/slide9.jpg",
    "/images/slide10.jpg"
  ];

  // Slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Get user from localStorage; uncertified tutors finish certification first
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const parsed = JSON.parse(storedUser);
    setUser(parsed);
    if (parsed.role === "tutor" && !parsed.certifiedTutor) {
      navigate("/tutor/certification", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <div className="home-container">

      {/* HEADER */}
      <header className="top-header">
        <div className="logo-section">
          <img src="/images/logo.jpg" alt="logo" />
          <h1>SkillSwap</h1>
        </div>

        <div className="header-quote">
          "𝒪𝓃𝒸𝑒 𝓎𝑜𝓊 𝓈𝓉𝑜𝓅 𝓁𝑒𝒶𝓇𝓃𝒾𝓃𝑔, 𝓎𝑜𝓊 𝓈𝓉𝒶𝓇𝓉 𝒹𝓎𝒾𝓃𝑔." — 𝒜𝓁𝒷𝑒𝓇𝓉 𝐸𝒾𝓃𝓈𝓉𝑒𝒾𝓃
        </div>

        <div className="auth-section">
          {user ? (
            <>
              <span className="header-welcome">
                Welcome,{" "}
                <span className="header-welcome-name">{user.name}</span>
              </span>
              <button className="auth-btn login" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="auth-btn login">
                Login
              </NavLink>
              <NavLink to="/register" className="auth-btn login">
                Sign-up
              </NavLink>
            </>
          )}
        </div>
      </header>

      {/* Logged-in students & certified tutors only — guests: header only */}
      {user &&
        (user.role === "student" ||
          (user.role === "tutor" && user.certifiedTutor)) && (
        <nav className={`navbar ${menuOpen ? "active" : ""}`}>
          <div
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && setMenuOpen((o) => !o)
            }
            aria-label="Toggle menu"
          >
            ☰
          </div>

          <ul className="nav-links">
            {user.role === "student" && (
              <>
                <li>
                  <NavLink
                    to="/search"
                    className={({ isActive }) =>
                      isActive ? "nav-item active" : "nav-item"
                    }
                  >
                    Search
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/games"
                    className={({ isActive }) =>
                      isActive ? "nav-item active" : "nav-item"
                    }
                  >
                    Games
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/student-profile"
                    className={({ isActive }) =>
                      isActive ? "nav-item active" : "nav-item"
                    }
                  >
                    Student Profile
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/booking"
                    className={({ isActive }) =>
                      isActive ? "nav-item active" : "nav-item"
                    }
                  >
                    Session Booking
                  </NavLink>
                </li>
              </>
            )}

            {user.role === "tutor" && user.certifiedTutor && (
              <>
                <li>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      isActive ? "nav-item active" : "nav-item"
                    }
                    end
                  >
                    Tutor Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/search"
                    className={({ isActive }) =>
                      isActive ? "nav-item active" : "nav-item"
                    }
                  >
                    Search
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
        )}

      {/* HERO */}
      <section className="hero-section">
        <img src={images[current]} alt="Slideshow" />
        <div className="hero-overlay">
          <h1>SkillSwap</h1>
          <p>Learn from the best. Teach your skills.</p>
        </div>
      </section>

      {/* FEATURES */}
      <div className="features-grid">
        <div className="feature-card image-card">
          <img src="/images/tutor.jpg" alt="Certified Tutors" />
          <div className="card-overlay">
            <h3>Certified Tutors</h3>
            <p>Only qualified tutors can teach.</p>
          </div>
        </div>

        <div className="feature-card image-card">
          <img src="/images/progress.jpg" alt="Track Progress" />
          <div className="card-overlay">
            <h3>Track Progress</h3>
            <p>Visual roadmap for student learning.</p>
          </div>
        </div>

        <div className="feature-card image-card">
          <img src="/images/sheduling.jpg" alt="Flexible Scheduling" />
          <div className="card-overlay">
            <h3>Flexible Scheduling</h3>
            <p>Book sessions anytime.</p>
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <section className="contact-section">
        <h2>Contact Us</h2>

        <div className="contact-row">
          <div className="contact-item">
            <img src="/images/facebook.jpg" alt="Facebook" />
            <span>facebook.com/SkillSwap</span>
          </div>

          <div className="contact-item">
            <img src="/images/whatsapp.png" alt="WhatsApp" />
            <span>+94 77 123 4567</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        © 2026 SkillSwap. All rights reserved.
      </footer>

    </div>
  );
}