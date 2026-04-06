import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./TutorCertification.css";

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function subjectPassed(user, subjectId) {
  return (user?.examAttempts || []).some(
    (a) => a.subjectId === subjectId && a.passed
  );
}

export default function TutorCertification() {
  const navigate = useNavigate();
  const [user, setUser] = useState(readStoredUser);
  const [subjectsCatalog, setSubjectsCatalog] = useState([]);
  const [passPercent, setPassPercent] = useState(70);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeExamSubject, setActiveExamSubject] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingSubjects, setSavingSubjects] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);

  const syncUser = useCallback((next) => {
    setUser(next);
    localStorage.setItem("user", JSON.stringify(next));
  }, []);

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const res = await API.get("/auth/me");
    syncUser(res.data.user);
    return res.data.user;
  }, [syncUser]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const u = await refreshMe();
        if (cancelled) return;
        if (!u || u.role !== "tutor") {
          navigate("/", { replace: true });
          return;
        }
        if (u.certifiedTutor) {
          navigate("/", { replace: true });
          return;
        }

        const subRes = await API.get("/auth/tutor/exam/subjects");
        if (cancelled) return;
        setSubjectsCatalog(subRes.data.subjects || []);
        setPassPercent(subRes.data.passPercent ?? 70);
        setSelectedIds(u.teachingSubjects || []);
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || "Could not load certification");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, refreshMe]);

  const remainingExamSubjects = useMemo(() => {
    const list = user?.teachingSubjects || [];
    return list.filter((id) => !subjectPassed(user, id));
  }, [user]);

  const toggleSubject = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const saveSubjects = async () => {
    setError("");
    if (selectedIds.length === 0) {
      setError("Choose at least one university subject you want to teach.");
      return;
    }
    try {
      setSavingSubjects(true);
      const res = await API.put("/auth/tutor/teaching-subjects", {
        subjectIds: selectedIds,
      });
      syncUser(res.data.user);
    } catch (e) {
      setError(e.response?.data?.message || "Could not save subjects");
    } finally {
      setSavingSubjects(false);
    }
  };

  const startExamFor = async (subjectId) => {
    setError("");
    setActiveExamSubject(subjectId);
    setAnswers([]);
    try {
      const res = await API.get(`/auth/tutor/exam/${subjectId}/questions`);
      setExamQuestions(res.data.questions || []);
      setAnswers(Array((res.data.questions || []).length).fill(-1));
    } catch (e) {
      setError(e.response?.data?.message || "Could not load exam");
      setActiveExamSubject(null);
      setExamQuestions([]);
    }
  };

  const submitExam = async () => {
    if (!activeExamSubject) return;
    if (answers.some((a) => a < 0)) {
      setError("Answer every question before submitting.");
      return;
    }
    setError("");
    try {
      setSubmittingExam(true);
      const res = await API.post("/auth/tutor/exam/submit", {
        subjectId: activeExamSubject,
        answers,
      });
      syncUser(res.data.user);
      setActiveExamSubject(null);
      setExamQuestions([]);
      if (!res.data.passed) {
        setError(
          `Score ${res.data.percent}% — you need at least ${res.data.passPercent}% to pass. Try again.`
        );
      } else {
        setError("");
      }
      if (res.data.certifiedTutor) {
        navigate("/", { replace: true });
      }
    } catch (e) {
      setError(e.response?.data?.message || "Submit failed");
    } finally {
      setSubmittingExam(false);
    }
  };

  if (loading) {
    return (
      <div className="tutor-cert-page">
        <p className="tutor-cert-loading">Loading certification…</p>
      </div>
    );
  }

  return (
    <div className="tutor-cert-page">
      <div className="tutor-cert-panel">
        <h1>Tutor entrance exam</h1>
        <p className="tutor-cert-lead">
          Select the university subjects you want to teach, then pass a short
          quiz for each (at least {passPercent}% per subject). After you pass
          all selected subjects, you are certified and can use the site as a
          tutor.
        </p>

        {error && <div className="tutor-cert-error">{error}</div>}

        {!activeExamSubject && (
          <>
            <section className="tutor-cert-section">
              <h2>1. Subjects to teach</h2>
              <div className="tutor-cert-subject-grid">
                {subjectsCatalog.map((s) => (
                  <label key={s.id} className="tutor-cert-subject-tile">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggleSubject(s.id)}
                    />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="tutor-cert-primary"
                onClick={saveSubjects}
                disabled={savingSubjects}
              >
                {savingSubjects ? "Saving…" : "Save subjects & continue"}
              </button>
            </section>

            {user?.teachingSubjects?.length > 0 && (
              <section className="tutor-cert-section">
                <h2>2. Exams by subject</h2>
                {remainingExamSubjects.length === 0 ? (
                  <p>All selected exams passed. Redirecting…</p>
                ) : (
                  <ul className="tutor-cert-exam-list">
                    {user.teachingSubjects.map((id) => {
                      const name =
                        subjectsCatalog.find((x) => x.id === id)?.name || id;
                      const done = subjectPassed(user, id);
                      return (
                        <li key={id}>
                          <span>{name}</span>
                          {done ? (
                            <span className="tutor-cert-badge pass">Passed</span>
                          ) : (
                            <button
                              type="button"
                              className="tutor-cert-linkish"
                              onClick={() => startExamFor(id)}
                            >
                              Start exam
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}
          </>
        )}

        {activeExamSubject && (
          <section className="tutor-cert-section tutor-cert-exam-active">
            <h2>
              Exam:{" "}
              {subjectsCatalog.find((x) => x.id === activeExamSubject)?.name ||
                activeExamSubject}
            </h2>
            <button
              type="button"
              className="tutor-cert-back"
              onClick={() => {
                setActiveExamSubject(null);
                setExamQuestions([]);
                setError("");
              }}
            >
              ← Back to list
            </button>
            {examQuestions.map((q, qi) => (
              <div key={q.id} className="tutor-cert-question">
                <p className="tutor-cert-qtext">
                  {qi + 1}. {q.question}
                </p>
                <div className="tutor-cert-options">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className="tutor-cert-option">
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[qi] === oi}
                        onChange={() => {
                          const next = [...answers];
                          next[qi] = oi;
                          setAnswers(next);
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="tutor-cert-primary"
              onClick={submitExam}
              disabled={submittingExam || examQuestions.length === 0}
            >
              {submittingExam ? "Submitting…" : "Submit answers"}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
