import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="top-header">
      <div className="logo-section">
        <img src="/images/logo.jpeg" alt="SkillSwap Logo" />
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
          Register
        </NavLink>
      </div>
    </header>
  );
}
