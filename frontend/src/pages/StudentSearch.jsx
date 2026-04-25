import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Compass, ArrowRight } from "lucide-react";
import AppFooter from "../components/AppFooter";
import StudentAppHeader from "../components/StudentAppHeader";
import "./StudentSubPage.css";
import "./StudentSearch.css";

export default function StudentSearch() {
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }
    const u = JSON.parse(raw);
    if (!["student", "tutor"].includes(u.role)) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="student-search-page bg-slate-950 text-slate-100">
      <StudentAppHeader />
      <main className="student-sub-main student-search-main border border-white/10 bg-white/5 backdrop-blur">
        <section className="student-search-hero">
          <span className="section-label">Student Space</span>
          <h1>Explore More Ways To Learn</h1>
          <p>
            Continue with tutor discovery, review your session progress, or jump
            right into your personalized learning dashboard.
          </p>
        </section>

        <div className="student-search-panels">
          <article className="student-search-panel">
            <div className="student-search-icon-wrap">
              <Compass size={20} />
            </div>
            <h3>Discover Tutors</h3>
            <p>
              Search certified tutors by subject, ratings, and availability to
              find the best match.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/tutor-search")}
            >
              Open Tutor Search
              <ArrowRight size={16} />
            </button>
          </article>

          <article className="student-search-panel">
            <div className="student-search-icon-wrap alt">
              <Sparkles size={20} />
            </div>
            <h3>Track Your Progress</h3>
            <p>
              View your goals, learning stats, and session history in one sleek
              student profile hub.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/student-profile")}
            >
              Open Profile
              <ArrowRight size={16} />
            </button>
          </article>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
