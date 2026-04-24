import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Users, Award, Shield } from "lucide-react";
import api from "../services/api";
import { getPostAuthPath } from "../utils/authRedirect";

const roleImages = {
  student: "/images/books.jpg",
  tutor: "/images/knowledge.jpg",
  admin: "/images/progress.jpg",
};

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    adminCode: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    adminCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { id: "student", label: "Student", icon: Users, desc: "Learn from tutors" },
    { id: "tutor", label: "Tutor", icon: Award, desc: "Share your knowledge" },
    { id: "admin", label: "Admin", icon: Shield, desc: "Manage the platform" },
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    let nextError = "";
    switch (name) {
      case "name":
        nextError = validateName(value);
        break;
      case "email":
        nextError = validateEmail(value);
        break;
      case "password":
        nextError = validatePassword(value);
        break;
      case "adminCode":
        nextError = validateAdminCode(value);
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: nextError }));
    setError("");
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
      adminCode: adminCodeError,
    });

    if (nameError || emailError || passwordError || adminCodeError) {
      return "Please fix the errors above";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
        ...(role === "admin" && { adminCode: form.adminCode }),
      });

      localStorage.removeItem("authToken");
      localStorage.removeItem("jwtToken");
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
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-12 text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl floating-blob" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl floating-blob floating-blob-delay" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_55%)]" />

      <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900/60 shadow-[0_30px_80px_-30px_rgba(30,64,175,0.5)] backdrop-blur">
        <div className="grid md:grid-cols-2">
          <div className="relative hidden min-h-[680px] md:block">
            <img
              src="/images/reg.jpg"
              alt="Students collaborating"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-slate-950/30 to-cyan-950/50" />
            <div className="absolute inset-0 flex flex-col justify-end p-10">
              <p className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-100">
                Join the network
              </p>
              <h1 className="mt-4 max-w-sm text-4xl font-extrabold text-white">
                Create your SkillSwap account
              </h1>
              <p className="mt-3 max-w-md text-sm text-slate-200/90">
                Choose your role, set your profile, and start using the platform with a navy-blue interface that stays readable.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-10 md:px-10 md:py-14">
            <div className="fade-up w-full max-w-md">
              <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
                Secure Registration
              </p>
              <h1 className="mt-4 text-3xl font-extrabold text-white">Register</h1>
              <p className="mt-2 text-sm text-slate-300">
                {step === 1 ? "Choose your role" : `Complete your ${role} profile`}
              </p>

              {step === 1 ? (
                <div className="mt-6 space-y-4">
                  {roles.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setRole(item.id);
                          setStep(2);
                          setError("");
                        }}
                        className="group relative h-32 w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-900/70 text-left transition hover:border-cyan-300/60 hover:bg-slate-900 hover:scale-[1.01]"
                      >
                        <img
                          src={roleImages[item.id]}
                          alt={item.label}
                          className="absolute inset-0 h-full w-full object-cover opacity-25 transition-opacity group-hover:opacity-40"
                        />
                        <div className="relative z-10 flex h-full items-center gap-4 p-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 text-slate-950 shadow-md transition-transform group-hover:scale-110">
                            <Icon size={24} />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{item.label}</div>
                            <div className="text-sm font-medium text-slate-300">{item.desc}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  <div className="pt-2 text-center text-sm text-slate-300">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-cyan-200 underline">
                      Sign in
                    </Link>
                  </div>
                  <div className="text-center text-sm text-slate-400">
                    <Link to="/" className="transition-colors hover:text-slate-200">
                      ← Back to home
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-cyan-900/20">
                  {error ? (
                    <div className="rounded-lg border border-red-400/40 bg-red-500/15 p-4 text-sm font-medium text-red-200">
                      {error}
                    </div>
                  ) : null}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/40 ${
                        errors.name ? "border-red-400/80" : "border-slate-600"
                      }`}
                    />
                    {errors.name ? <p className="mt-2 text-sm text-red-300">{errors.name}</p> : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/40 ${
                        errors.email ? "border-red-400/80" : "border-slate-600"
                      }`}
                    />
                    {errors.email ? <p className="mt-2 text-sm text-red-300">{errors.email}</p> : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        placeholder="At least 6 characters"
                        className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 pr-12 text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/40 ${
                          errors.password ? "border-red-400/80" : "border-slate-600"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-3.5 text-slate-400 transition-colors hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password ? <p className="mt-2 text-sm text-red-300">{errors.password}</p> : null}
                  </div>

                  {role === "admin" ? (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">Admin Code</label>
                      <input
                        type="password"
                        name="adminCode"
                        value={form.adminCode}
                        onChange={handleInputChange}
                        placeholder="Enter admin code"
                        className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/40 ${
                          errors.adminCode ? "border-red-400/80" : "border-slate-600"
                        }`}
                      />
                      {errors.adminCode ? <p className="mt-2 text-sm text-red-300">{errors.adminCode}</p> : null}
                      <p className="mt-2 text-xs font-medium text-slate-400">Required for admin registration</p>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setRole("");
                      setError("");
                    }}
                    className="w-full rounded-lg border border-slate-600 bg-slate-950/60 px-4 py-2 font-medium text-slate-100 transition hover:border-cyan-300 hover:bg-slate-900"
                  >
                    ← Back to Role Selection
                  </button>

                  <p className="text-center text-sm text-slate-300">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-cyan-200 underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}