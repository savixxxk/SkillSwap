import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" }); // role handled separately
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Move to step 2 and set role
  const nextStep = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
    setError("");
  };

  // Submit form to backend
  const submit = async () => {
    setError("");

    // Form validation
    if (!form.name || !form.email || !form.password || !role) {
      setError("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Invalid email.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const fullForm = { ...form, role };

    try {
      setLoading(true);
      const res = await API.post("/auth/register", fullForm);
      const { user, token } = res.data;
      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("token", token);

      if (role === "tutor") {
        navigate("/tutor/certification", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Backend error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">

      {/* LEFT SIDE */}
      <div className="register-left">
        <h1>SkillSwap</h1>
        <p>Connect. Learn. Grow.</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">

        {step === 1 && (
          <div className="role-selection">
            <h2>Join as Student or Tutor</h2>

            <div className="collage">
              <img src="/images/slide1.jpg" className="collage-img" alt="Slide 1"/>
              <img src="/images/slide2.jpg" className="collage-img" alt="Slide 2"/>
              <img src="/images/slide3.jpg" className="collage-img" alt="Slide 3"/>
              <img src="/images/slide4.jpg" className="collage-img" alt="Slide 4"/>
              <img src="/images/slide5.jpg" className="collage-img" alt="Slide 5"/>
            </div>

            <div className="role-buttons">
              <button onClick={() => nextStep("student")}>Student</button>
              <button onClick={() => nextStep("tutor")}>Tutor</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="register-card">
            <h2>Register as {role}</h2>

            {error && <div className="error">{error}</div>}

            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button onClick={submit} disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}