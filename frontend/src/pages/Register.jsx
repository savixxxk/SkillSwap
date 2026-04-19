import { useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Users, Award, Shield } from "lucide-react";
import api from "../services/api";
import { getPostAuthPath } from "../utils/authRedirect";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", adminCode: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "", adminCode: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { id: "student", label: "Student", icon: Users, desc: "Learn from tutors" },
    { id: "tutor", label: "Tutor", icon: Award, desc: "Share your knowledge" },
    { id: "admin", label: "Admin", icon: Shield, desc: "Manage the platform" }
  ];

  const validateName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return "Name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
    return "";
  };

  const validateAdminCode = (adminCode) => {
    if (role === "admin" && !adminCode.trim()) return "Admin code is required";
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    let error = "";
    switch (name) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "adminCode":
        error = validateAdminCode(value);
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const adminCodeError = validateAdminCode(form.adminCode);

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      adminCode: adminCodeError
    });

    if (nameError || emailError || passwordError || adminCodeError) {
      return "Please fix the errors above";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        ...(role === "admin" && { adminCode: form.adminCode })
      });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      navigate(getPostAuthPath(response.data.user), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#081121] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-blue-500/25 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
      </div>
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10 relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 relative z-10 tracking-tight">Join SkillSwap</h1>
          <p className="text-blue-100/90 text-base sm:text-lg relative z-10">
            {step === 1 ? "Choose your role" : `Complete your ${role} profile`}
          </p>
        </div>
        {step === 1 ? (
          <div className="space-y-4">
            {roles.map((r) => {
              const Icon = r.icon;
              const roleImages = {student: "books.jpg", tutor: "knowledge.jpg", admin: "progress.jpg"};
              return (
                <button key={r.id} onClick={() => { setRole(r.id); setStep(2); setError(""); }} className="w-full relative border border-white/15 hover:border-white/25 bg-white/5 hover:bg-white/10 rounded-xl transition-all transform hover:scale-[1.02] group shadow-lg overflow-hidden h-32">
                  <img src={`/images/${roleImages[r.id]}`} alt={r.label} className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-40 transition-opacity" />
                  <div className="relative z-10 flex items-center gap-4 h-full p-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md flex-shrink-0">
                      <Icon size={24} />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold">{r.label}</div>
                      <div className="text-blue-300 text-sm font-medium">{r.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 space-y-6 shadow-2xl shadow-black/30">
            {error && <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm font-medium">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="John Doe" style={{ color: "#000000", caretColor: "#000000" }} className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all ${
                errors.name ? "border-red-400" : "border-white/15"
              }`} />
              {errors.name && <p className="mt-2 text-red-300 text-sm">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="your@email.com" style={{ color: "#000000", caretColor: "#000000" }} className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all ${
                errors.email ? "border-red-400" : "border-white/15"
              }`} />
              {errors.email && <p className="mt-2 text-red-300 text-sm">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleInputChange} placeholder="At least 6 characters" style={{ color: "#000000", caretColor: "#000000" }} className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all pr-12 ${
                  errors.password ? "border-red-400" : "border-white/15"
                }`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-blue-300 hover:text-white transition-colors p-1">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
              {errors.password && <p className="mt-2 text-red-300 text-sm">{errors.password}</p>}
            </div>
            {role === "admin" && <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Admin Code</label>
              <input type="password" name="adminCode" value={form.adminCode} onChange={handleInputChange} placeholder="Enter admin code" style={{ color: "#000000", caretColor: "#000000" }} className={`w-full px-4 py-3 bg-white border rounded-xl text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all ${
                errors.adminCode ? "border-red-400" : "border-white/15"
              }`} />
              {errors.adminCode && <p className="mt-2 text-red-300 text-sm">{errors.adminCode}</p>}
              <p className="mt-2 text-xs text-blue-300 font-medium">Required for admin registration</p>
            </div>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-500 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 hover:shadow-lg shadow-md">{loading ? "Creating account..." : "Create Account"}</button>
            <button type="button" onClick={() => {setStep(1); setRole(""); setError("");}} className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-colors">← Back to Role Selection</button>
            <p className="text-center text-blue-100/80 text-sm">
              Already have an account?{" "}
              <NavLink to="/login" className="text-cyan-300 font-semibold underline underline-offset-2">
                Sign in
              </NavLink>
            </p>
          </form>
        )}
        {step === 1 && (
          <div className="mt-8 text-center space-y-3">
            <p className="text-blue-100/85 text-sm sm:text-base">
              Already have an account?{" "}
              <NavLink to="/login" className="text-cyan-300 hover:text-cyan-200 font-semibold underline underline-offset-2">
                Sign in
              </NavLink>
            </p>
            <NavLink to="/" className="text-blue-200/80 hover:text-white text-sm transition-colors block">
              ← Back to home
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}
