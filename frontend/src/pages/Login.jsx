import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "../services/api";
import { getPostAuthPath } from "../utils/authRedirect";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
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

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError("");
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setError("");
    setPasswordError(validatePassword(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit(e);
  };

  return (
    <div className="min-h-screen bg-[#081121] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-blue-500/25 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10 relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 relative z-10 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-blue-100/80 text-base sm:text-lg relative z-10">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 space-y-6 shadow-2xl shadow-black/30">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-blue-100 mb-3">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={handleKeyPress}
              placeholder="you@example.com"
              style={{ color: "#000000", caretColor: "#000000" }}
              className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all ${
                emailError ? "border-red-400" : "border-white/15"
              }`}
            />
            {emailError && (
              <p className="mt-2 text-red-300 text-sm">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-100 mb-3">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyPress}
                placeholder="••••••••"
                style={{ color: "#000000", caretColor: "#000000" }}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all pr-12 ${
                  passwordError ? "border-red-400" : "border-white/15"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-blue-300 hover:text-white transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && (
              <p className="mt-2 text-red-300 text-sm">{passwordError}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-500 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 hover:shadow-lg shadow-md flex items-center justify-center gap-2"
          >
            {loading ? "Signing in..." : "Sign In"}{" "}
            {!loading && <ArrowRight size={20} />}
          </button>
        </div>

        <div className="mt-8 text-center space-y-3">
          <p className="text-blue-100/85 text-sm sm:text-base">
            Don&apos;t have an account?{" "}
            <NavLink
              to="/register"
              className="text-cyan-300 hover:text-cyan-200 font-semibold underline underline-offset-2"
            >
              Sign up
            </NavLink>
          </p>
          <NavLink
            to="/"
            className="text-blue-200/80 hover:text-white text-sm transition-colors"
          >
            ← Back to home
          </NavLink>
        </div>
      </div>
    </div>
  );
}
