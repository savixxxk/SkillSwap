import { useState } from "react";
import API from "../services/api";
import "./Register.css";

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "" });
  const [error, setError] = useState("");

  const nextStep = (selectedRole) => {
    setRole(selectedRole);
    setForm({ ...form, role: selectedRole });
    setStep(2);
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
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

    try {
      await API.post("/auth/register", form);
      alert("Registered successfully!");
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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

            {/* BIG COLLAGE */}
            <div className="collage">
              <img src="/images/slide1.jpg" className="collage-img" />
              <img src="/images/slide2.jpg" className="collage-img" />
              <img src="/images/slide3.jpg" className="collage-img" />
              <img src="/images/slide4.jpg" className="collage-img" />
              <img src="/images/slide5.jpg" className="collage-img" />
            </div>

            {/* STYLISH BUTTONS */}
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
              placeholder="Full Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button onClick={submit}>Register</button>
          </div>
        )}

      </div>
    </div>
  );
}