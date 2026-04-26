import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import './AdminQuizCreation.css';

export default function AdminQuizCreation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    passMark: 70,
    questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Data Structures & Algorithms', 'Databases', 'Linear Algebra', 'Probability & Statistics'];

  const handleTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value });
  };

  const handleSubjectChange = (e) => {
    setFormData({ ...formData, subject: e.target.value });
  };

  const handlePassMarkChange = (e) => {
    setFormData({ ...formData, passMark: parseInt(e.target.value) });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData({ ...formData, questions: newQuestions });
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Quiz title is required';
    if (!formData.subject) return 'Subject is required';
    if (formData.passMark < 0 || formData.passMark > 100) return 'Pass mark must be between 0 and 100';

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.questionText.trim()) return `Question ${i + 1} text is required`;
      if (q.options.some(opt => !opt.trim())) return `Question ${i + 1}: All options must be filled`;
      if (!q.correctAnswer) return `Question ${i + 1}: Correct answer must be selected`;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await API.post('/api/admin/quizzes', formData);
      setSuccess('Quiz created successfully!');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session expired. Please log in again as admin.');
      } else {
        setError(err.response?.data?.message || 'Failed to create quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-quiz-creation min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <AppHeader />
      <div className="quiz-creation-container mx-auto w-full max-w-5xl rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_30px_80px_-35px_rgba(34,211,238,0.55)] backdrop-blur">
        <div className="quiz-creation-header mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="quiz-kicker inline-flex rounded-full border border-sky-300/35 bg-sky-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">Admin Tools</p>
            <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">Create New Quiz</h1>
            <p className="quiz-subtitle mt-2 text-slate-300">
              Build a polished assessment for tutor certification.
            </p>
          </div>
          <div className="quiz-header-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="btn-cancel btn-inline rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-300/60"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error rounded-xl border border-rose-300/30 bg-rose-300/15 px-4 py-3 text-rose-100">{error}</div>}
        {success && <div className="alert alert-success rounded-xl border border-emerald-300/30 bg-emerald-300/15 px-4 py-3 text-emerald-100">{success}</div>}

        <form onSubmit={handleSubmit} className="quiz-form space-y-6">
          {/* Quiz Info Section */}
          <section className="form-section rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold text-white">Quiz Information</h2>

            <div className="form-group mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-200">Quiz Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g., Mathematics Basics"
                className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-4 py-3 text-slate-100"
                required
              />
            </div>

            <div className="form-group mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-200">Subject *</label>
              <select value={formData.subject} onChange={handleSubjectChange} className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-4 py-3 text-slate-100" required>
                <option value="">Select a subject</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-200">Pass Mark (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.passMark}
                onChange={handlePassMarkChange}
                className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-4 py-3 text-slate-100"
                required
              />
            </div>
          </section>

          {/* Questions Section */}
          <section className="form-section rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold text-white">Questions</h2>
            <p className="section-caption mt-2 text-sm text-slate-300">
              Total questions: <strong>{formData.questions.length}</strong>
            </p>

            {formData.questions.map((question, qIndex) => (
              <div key={qIndex} className="question-card mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="question-header mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-sky-200">Question {qIndex + 1}</h3>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="btn-remove rounded-lg bg-rose-300 px-3 py-1 text-sm font-semibold text-slate-950"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label className="mb-2 block text-sm font-semibold text-[#e2e8f0]">Question Text *</label>
                  <textarea
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                    placeholder="Enter question text"
                    className="bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-3 w-full"
                    required
                  />
                </div>

                <div className="options-container mt-3">
                  <label className="mb-2 block text-sm font-semibold text-[#e2e8f0]">Options (select correct answer) *</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="option-input mb-2 flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 min-w-[220px] bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-2"
                        required
                      />
                      <label className="radio-label inline-flex items-center gap-2 text-sm text-slate-200">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          value={option}
                          checked={question.correctAnswer === option}
                          onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                          required
                        />
                        <span>Correct</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="btn-add-question mt-2 rounded-xl bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
            >
              + Add Question
            </button>
          </section>

          <div className="form-actions flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="btn-cancel rounded-xl border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-300/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit rounded-xl bg-sky-400 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
      <AppFooter />
    </div>
  );
}
