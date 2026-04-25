import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import AppFooter from "../components/AppFooter";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user?._id || user.role !== "tutor") {
      setPendingRequests(0);
      return;
    }
    let mounted = true;
    const loadPending = () => {
      fetch(`http://localhost:5000/sessions/tutor/user/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((list) => {
          if (!mounted) return;
          const count = (list || []).filter(
            (s) => s.status === "pending",
          ).length;
          setPendingRequests(count);
        })
        .catch(() => {
          if (mounted) setPendingRequests(0);
        });
    };
    loadPending();
    const id = setInterval(loadPending, 20000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [user?._id, user?.role]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-sky-200">SKILLSWAP</p>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              user.role === "tutor" ? (
                <>
                  <button
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60"
                    type="button"
                    onClick={() => navigate("/tutor-search")}
                  >
                    Tutor Search
                  </button>
                  <button
                    className="relative rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60"
                    type="button"
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                    {pendingRequests > 0 && (
                      <span className="ml-2 inline-flex min-w-6 h-6 px-2 rounded-full bg-red-500 text-white text-xs items-center justify-center">
                        {pendingRequests}
                      </span>
                    )}
                  </button>
                  <button
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60"
                    type="button"
                    onClick={() => navigate("/booking")}
                  >
                    Book Session
                  </button>
                  <button
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60"
                    type="button"
                    onClick={() => navigate("/tutor-search")}
                  >
                    Tutor Search
                  </button>
                  <button
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60"
                    type="button"
                    onClick={() => navigate("/student-profile")}
                  >
                    Sessions
                  </button>
                  <button
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )
            ) : (
              <>
                <button
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60"
                  type="button"
                  onClick={() => navigate("/booking")}
                >
                  Book Session
                </button>
                <NavLink className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60" to="/login">
                  Login
                </NavLink>
                <NavLink className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60" to="/register">
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:py-24">
        <div>
          {user && (
            <p className="inline-flex items-center rounded-full border border-emerald-300/35 bg-emerald-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              Welcome, {user?.name || "Student"}
            </p>
          )}

          <p className="mt-3 inline-flex items-center rounded-full border border-sky-300/35 bg-sky-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
            Learning-first platform
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
            Learn Smarter,
            <span className="block text-sky-300">Book Better Tutors Faster</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-200/90">
            SkillSwap unifies tutor discovery, session booking, and progress tracking
            into one smooth experience that feels great on every device.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              user.role === "admin" ? (
                <NavLink
                  to="/admin/dashboard"
                  className="group rounded-xl bg-sky-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-sky-300"
                >
                  Go to Admin Dashboard
                  <span className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
                </NavLink>
              ) : (
                <p className="rounded-xl border border-emerald-300/35 bg-emerald-300/10 px-6 py-3 text-sm font-semibold text-emerald-100">
                  You are logged in. Continue to your workspace.
                </p>
              )
            ) : (
              <>
                <NavLink
                  to="/register"
                  className="group rounded-xl bg-sky-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-sky-300"
                >
                  Create Account
                  <ArrowRight className="ml-2 inline-block h-4 w-4 transition group-hover:translate-x-1" />
                </NavLink>
                <NavLink
                  to="/login"
                  className="rounded-xl border border-slate-500/70 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-sky-300/60"
                >
                  Login Now
                </NavLink>
              </>
            )}
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              { label: "Access", value: "24/7" },
              { label: "Tutors", value: "500+" },
              { label: "Satisfaction", value: "98%" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <p className="text-2xl font-extrabold text-sky-200">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-sky-400/25 via-emerald-400/15 to-indigo-500/25 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-slate-900/60 p-3 shadow-[0_30px_80px_-30px_rgba(34,211,238,0.55)] backdrop-blur">
            <img
              src="/images/knowledge.jpg"
              alt="Students collaborating"
              className="h-[420px] w-full rounded-[1.35rem] object-cover transition duration-700 hover:scale-[1.03]"
            />
            <div className="absolute bottom-8 left-8 rounded-xl border border-white/30 bg-slate-950/65 px-4 py-3 text-sm text-slate-100 backdrop-blur">
              <p className="font-semibold">Live Learning Hub</p>
              <p className="text-slate-300">Search tutors, track sessions, and grow skills</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10 pt-2 md:pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Smart Discovery",
              desc: "Use filters and ratings to find tutors that truly match your goals.",
              icon: <Users className="h-5 w-5" />,
            },
            {
              title: "Trusted Certification",
              desc: "Every certified tutor is verified through subject-specific assessment.",
              icon: <ShieldCheck className="h-5 w-5" />,
            },
            {
              title: "Momentum Tools",
              desc: "Track sessions, feedback, and milestones to keep learning on pace.",
              icon: <Sparkles className="h-5 w-5" />,
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <div className="mb-3 inline-flex rounded-lg bg-sky-300/15 p-2 text-sky-200">{item.icon}</div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-4">
        <div className="rounded-3xl border border-sky-300/25 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 p-8 shadow-[0_30px_80px_-35px_rgba(34,211,238,0.55)] md:p-12">
          <p className="text-sm uppercase tracking-[0.22em] text-sky-200">Learner Voice</p>
          <blockquote className="mt-4 max-w-3xl text-2xl font-semibold leading-relaxed text-white md:text-3xl">
            "SkillSwap made weekly learning more consistent. Everything from finding tutors to session follow-up now feels seamless."
          </blockquote>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-300">Nithin R. · Engineering Student</p>
            <NavLink
              to={user ? "/tutor-search" : "/register"}
              className="rounded-xl bg-sky-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-sky-300"
            >
              Start Learning
            </NavLink>
          </div>
        </div>
      </section>
      <AppFooter />
    </main>
  );
}
