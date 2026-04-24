import { Link, NavLink, useNavigate } from "react-router-dom";

function getAuthState() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function AppHeader() {
  const navigate = useNavigate();
  const user = getAuthState();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const canBook = user?.role === "student" || !user;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 text-white">
          <img src="/images/logo.jpg" alt="SkillSwap" className="h-10 w-10 rounded-xl object-cover" />
          <span className="text-sm font-bold tracking-[0.18em] text-sky-200">SKILLSWAP</span>
        </Link>

        <div className="flex items-center gap-2">
          <NavLink className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60" to="/">
            Home
          </NavLink>
          {canBook && (
            <NavLink className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60" to="/booking">
              Book Session
            </NavLink>
          )}
          <NavLink className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60" to="/tutor-search">
            Tutor Search
          </NavLink>
          {user?.role === "student" && (
            <NavLink className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60" to="/student-profile">
              Sessions
            </NavLink>
          )}
          {user?.role === "tutor" && (
            <NavLink className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60" to="/dashboard">
              Dashboard
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60" to="/admin/dashboard">
              Admin
            </NavLink>
          )}
          {user ? (
            <button
              type="button"
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-300/60"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
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
  );
}