import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import { getQuizzes } from "../services/quizService";
import "./TutorCertification.css";

export default function TutorCertification() {
  const [subjects, setSubjects] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadPage = async () => {
      try {
        const [quizRes, meRes] = await Promise.all([getQuizzes(), fetchUser()]);
        const quizList = Array.isArray(quizRes.data) ? quizRes.data : quizRes.data?.data || [];
        setSubjects(quizList);

        if (meRes) {
          setMe(meRes);
          localStorage.setItem("user", JSON.stringify(meRes));
        }
      } catch (err) {
        console.error("Tutor certification page load error:", err);
        setError(err.response?.data?.message || "Failed to load certification page");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [navigate]);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch("http://localhost:5000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.user || null;
  };

  const handleSubjectClick = (subject) => {
    navigate(`/quiz/${subject}`);
  };

  const certifiedSubjects = Array.isArray(me?.certifiedSubjects) ? me.certifiedSubjects : [];
  const isCertifiedTutor = Boolean(me?.certifiedTutor);

  if (loading) {
    return (
      <div className="tutor-certification min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <AppHeader />
        <div className="tutor-cert-page-state">
          <div className="tutor-cert-state-card mx-auto mt-24 w-full max-w-xl rounded-2xl border border-white/15 bg-white/5 p-6 text-center backdrop-blur">
            <h2 className="text-2xl font-black text-white">Loading certification subjects</h2>
            <p className="mt-2 text-slate-300">Please wait while we prepare your quiz tracks.</p>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-certification min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <AppHeader />
        <div className="tutor-cert-page-state">
          <div className="tutor-cert-state-card error mx-auto mt-24 w-full max-w-xl rounded-2xl border border-rose-300/30 bg-rose-300/10 p-6 text-center">
            <h2 className="text-2xl font-black text-white">Could not load subjects</h2>
            <p className="mt-2 text-rose-100">{error}</p>
            <button
              type="button"
              className="mt-4 rounded-xl bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="tutor-certification min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <AppHeader />
      <div className="tutor-cert-hero mx-auto w-full max-w-5xl rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 p-7 shadow-[0_30px_80px_-35px_rgba(34,211,238,0.55)]">
        <p className="tutor-cert-kicker inline-flex rounded-full border border-sky-300/35 bg-sky-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
          Tutor Track
        </p>
        <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">Tutor Certification</h1>
        <p className="mt-2 text-slate-300">
          Choose a subject and complete a quiz to unlock certified tutor status.
        </p>

        {isCertifiedTutor && (
          <div className="tutor-cert-certified-banner mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-300/35 bg-emerald-300/10 p-4">
            <div>
              <strong className="text-emerald-100">Status: Certified Tutor</strong>
              <p className="text-sm text-emerald-100/90">
                Your account is approved for tutor dashboard access.
              </p>
            </div>
            <button
              type="button"
              className="rounded-xl bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950"
              onClick={() => navigate("/dashboard")}
            >
              Go to Tutor Dashboard
            </button>
          </div>
        )}
      </div>

      {isCertifiedTutor && (
        <section className="tutor-cert-certified-subjects mx-auto mt-5 w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <h3 className="text-xl font-bold text-white">Certified Subjects</h3>
          {certifiedSubjects.length === 0 ? (
            <p className="tutor-cert-certified-empty mt-2 text-slate-300">
              You are certified, but no subjects are listed yet.
            </p>
          ) : (
            <div className="tutor-cert-chip-list mt-3 flex flex-wrap gap-2">
              {certifiedSubjects.map((subjectName) => (
                <span
                  key={subjectName}
                  className="tutor-cert-chip rounded-full border border-emerald-300/40 bg-emerald-300/15 px-3 py-1 text-sm font-semibold text-emerald-100"
                >
                  {subjectName}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="subjects-list mx-auto mt-5 grid w-full max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.length === 0 ? (
          <div className="tutor-cert-empty col-span-full rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
            <h3 className="text-xl font-bold text-white">No quizzes available yet</h3>
            <p className="mt-2 text-slate-300">Ask an admin to create quizzes for your subjects.</p>
          </div>
        ) : (
          subjects.map((subject) => (
            <button
              key={subject.subject}
              className="subject-card rounded-2xl border border-white/15 bg-white/5 p-5 text-left transition hover:-translate-y-0.5 hover:border-sky-300/50"
              onClick={() => handleSubjectClick(subject.subject)}
              type="button"
            >
              <h3 className="text-lg font-bold text-white">{subject.subject}</h3>
              <p className="mt-1 text-sm text-slate-300">
                {(subject.quizzes?.length || 0)} quiz(s) available
              </p>
              <span className="subject-card-cta mt-3 inline-flex rounded-full bg-sky-300/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-100">
                Start quiz
              </span>
            </button>
          ))
        )}
      </div>
      <AppFooter />
    </div>
  );
}