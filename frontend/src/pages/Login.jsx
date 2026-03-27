import { useState } from "react";
import API from "../services/api";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email.");
      return;
    }

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">

      {/* LEFT SIDE - Branding */}
      <div className="login-left">
        <h1>SkillSwap</h1>
        <p>“𝒴𝑜𝓊 𝒹𝑜𝓃’𝓉 𝒽𝒶𝓋𝑒 𝓉𝑜 𝒷𝑒 𝑔𝓇𝑒𝒶𝓉 𝓉𝑜 𝓈𝓉𝒶𝓇𝓉, 𝒷𝓊𝓉 𝓎𝑜𝓊 𝒽𝒶𝓋𝑒 𝓉𝑜 𝓈𝓉𝒶𝓇𝓉 𝓉𝑜 𝒷𝑒 𝑔𝓇𝑒𝒶𝓉.” — 𝒵𝒾𝑔 𝒵𝒾𝑔𝓁𝒶𝓇</p>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          {error && <div className="error">{error}</div>}
          <input
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <button onClick={submit}>Login</button>
        </div>
      </div>

    </div>
  );
}