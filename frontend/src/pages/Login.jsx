import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../services/api";
import { getPostAuthPath } from "../utils/authRedirect";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
const heroImage = "/images/login-bg.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", form);
      localStorage.removeItem("authToken");
      localStorage.removeItem("jwtToken");
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      navigate(getPostAuthPath(response.data.user), { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 503) {
        setError(
          "Database is offline. Start MongoDB or set MONGO_URI in backend/.env, then retry login.",
        );
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-12 text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl floating-blob" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl floating-blob floating-blob-delay" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.15),transparent_55%)]" />

      <section className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900/60 shadow-[0_30px_80px_-30px_rgba(30,64,175,0.5)] backdrop-blur md:grid-cols-2">
        <div className="hidden md:block">
          <img
            src={heroImage}
            alt="Students studying together"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-center px-6 py-10 md:px-10 md:py-14">
          <div className="fade-up w-full max-w-md">
            <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
              Secure Access
            </p>
            <h1 className="mt-4 text-3xl font-extrabold text-white">Login</h1>
            <p className="mt-2 text-sm text-slate-300">Welcome back to SkillSwap.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="you@example.com"
                  className="auth-form-input w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 text-white caret-white outline-none ring-cyan-300/60 transition placeholder:text-slate-500 focus:ring"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    required
                    placeholder="••••••••"
                    className="auth-form-input w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 pr-12 text-white caret-white outline-none ring-cyan-300/60 transition placeholder:text-slate-500 focus:ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-slate-400 transition-colors hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error ? <p className="text-sm text-red-300">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <a
                href={`${API_BASE}/oauth2/authorization/google`}
                className="flex w-full items-center justify-center rounded-lg border border-slate-600 bg-slate-950/60 px-4 py-2 font-semibold text-white transition hover:border-cyan-300 hover:bg-slate-900"
              >
                Continue with Google
              </a>
            </form>

            <p className="mt-6 text-sm text-slate-300">
              New user?{" "}
              <Link to="/register" className="font-semibold text-cyan-200 underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}