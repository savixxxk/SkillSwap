import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Home.css";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const images = [
    "/images/slide6.jpg",
    "/images/slide7.jpg",
    "/images/slide8.jpg",
    "/images/slide9.jpg",
    "/images/slide10.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
          <NavLink to="/login" className="auth-btn login">
            Login
          </NavLink>
          <NavLink to="/register" className="auth-btn register">
            Sign-up
          </NavLink>
        </div>
      </header>

      {/* NAVBAR */}
      <nav className={`navbar ${menuOpen ? "active" : ""}`}>
        <div
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>

        <ul className="nav-links">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Tutor Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/profiles"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Student Profiles
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
              to="/booking"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Session Booking
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* HERO / SLIDESHOW */}
      <section className="hero-section">
        <img src={images[current]} alt="Slideshow" />

        {/* Overlay text so it doesn’t feel empty */}
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