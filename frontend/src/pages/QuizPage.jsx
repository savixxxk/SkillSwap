import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRandomQuiz, attemptQuiz } from '../services/quizService';
import './QuizPage.css';
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";

export default function QuizPage() {
  const { subject } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoadError('');
    setSubmitError('');
    getRandomQuiz(subject)
      .then(res => {
        setQuiz(res.data);
        setAnswers(new Array(res.data.questions.length).fill(''));
      })
      .catch(err => {
        if (err.response?.status === 403) {
          setLoadError('You must wait 24 hours before retrying.');
        } else if (err.response?.status === 400) {
          setLoadError('You are already certified for this subject.');
        } else {
          setLoadError('Failed to load quiz.');
        }
      })
      .finally(() => setLoading(false));
  }, [subject]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const next = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previous = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submit = async () => {
    if (answers.some(a => a === '')) {
      setSubmitError('Please answer all questions before submitting.');
      return;
    }
    setSubmitError('');
    try {
      const res = await attemptQuiz(quiz._id, answers);
      setResult(res.data);
    } catch {
      setSubmitError('Error submitting quiz.');
    }
  };

  if (loading) return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative z-10 px-4 py-10">
        <AppHeader />
        <div className="quiz-state-card mx-auto mt-24 w-full max-w-xl rounded-2xl border border-white/15 bg-white/5 p-6 text-center">
          <h2 className="text-2xl font-black text-white">Loading quiz</h2>
          <p className="mt-2 text-slate-300">Preparing your certification challenge...</p>
        </div>
        <AppFooter />
      </div>
    </main>
  );

  if (loadError) return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative z-10 px-4 py-10">
        <AppHeader />
        <div className="quiz-state-card error mx-auto mt-24 w-full max-w-xl rounded-2xl border border-rose-300/30 bg-rose-300/10 p-6 text-center">
          <h2 className="text-2xl font-black text-white">Unable to start quiz</h2>
          <p className="mt-2 text-rose-100">{loadError}</p>
          <button className="mt-4 rounded-xl bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950" onClick={() => navigate('/tutor/certification')}>Back to Certification</button>
        </div>
        <AppFooter />
      </div>
    </main>
  );

  if (result) {
    const passed = result.isPassed;
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative z-10 px-4 py-10">
          <AppHeader />
          <div className={`quiz-state-card result ${passed ? 'pass' : 'fail'} mx-auto mt-24 w-full max-w-xl rounded-2xl border p-6 text-center ${passed ? 'border-emerald-300/35 bg-emerald-300/10' : 'border-rose-300/35 bg-rose-300/10'}`}>
            <p className="quiz-result-kicker inline-flex rounded-full bg-sky-300/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-100">{passed ? 'Passed' : 'Try Again'}</p>
            <h1 className="mt-3 text-3xl font-black text-white">Quiz Result</h1>
            <p className="quiz-result-score mt-3 text-4xl font-black text-sky-200">{result.score.toFixed(2)}%</p>
            <p className="mt-3 text-slate-200">{passed ? 'Great work! You passed and are now certified for this subject.' : 'You did not pass this attempt. You can retry after 24 hours.'}</p>
            <button className="mt-5 rounded-xl bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950" onClick={() => navigate('/tutor/certification')}>Back to Certification</button>
          </div>
          <AppFooter />
        </div>
      </main>
    );
  }

  if (!quiz) return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative z-10 px-4 py-10">
        <AppHeader />
        <div className="quiz-state-card mx-auto mt-24 w-full max-w-xl rounded-2xl border border-white/15 bg-white/5 p-6 text-center">
          <h2 className="text-2xl font-black text-white">No quiz available</h2>
          <p className="mt-2 text-slate-300">Please choose another subject from certification page.</p>
          <button className="mt-4 rounded-xl bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950" onClick={() => navigate('/tutor/certification')}>Back to Certification</button>
        </div>
        <AppFooter />
      </div>
    </main>
  );

  const q = quiz.questions[currentQuestion];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative z-10 px-4 py-10">
        <AppHeader />
        <div className="quiz-shell mx-auto w-full max-w-4xl rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_30px_80px_-35px_rgba(34,211,238,0.55)] backdrop-blur">
          <div className="quiz-hero rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/35 p-5">
            <p className="quiz-kicker inline-flex rounded-full border border-sky-300/35 bg-sky-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">{subject}</p>
            <h1 className="mt-3 text-3xl font-black text-white">{quiz.title}</h1>
            <div className="question-counter mt-3 inline-flex rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>
          </div>

          <div className="question mt-5 rounded-2xl border border-white/10 bg-slate-900/55 p-5">
            <p className="text-lg font-semibold text-white">{q.questionText}</p>
            <div className="options mt-4 grid gap-3">
              {q.options.map((opt, i) => (
                <label key={i} className={`option flex items-center gap-3 rounded-xl border px-4 py-3 ${answers[currentQuestion] === opt ? 'selected border-sky-300 bg-sky-300/10' : 'border-white/15 bg-white/5'}`}>
                  <input
                    type="radio"
                    name="answer"
                    value={opt}
                    onChange={() => handleAnswer(opt)}
                    checked={answers[currentQuestion] === opt}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {submitError && <p className="quiz-inline-error">{submitError}</p>}

          <div className="navigation mt-5 flex flex-wrap justify-between gap-3">
            <button className="ghost-btn rounded-xl border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-200" onClick={previous} disabled={currentQuestion === 0}>Previous</button>
            {currentQuestion < quiz.questions.length - 1 ? (
              <button className="primary-btn rounded-xl bg-sky-400 px-5 py-2 text-sm font-bold text-slate-950" onClick={next}>Next</button>
            ) : (
              <button className="primary-btn rounded-xl bg-sky-400 px-5 py-2 text-sm font-bold text-slate-950" onClick={submit}>Submit</button>
            )}
          </div>
          <AppFooter />
        </div>
      </div>
    </main>
  );
}