import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
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
    <div className="admin-quiz-creation">
      <div className="quiz-creation-container">
        <div className="quiz-creation-header">
          <div>
            <p className="quiz-kicker">Admin Tools</p>
            <h1>Create New Quiz</h1>
            <p className="quiz-subtitle">
              Build a polished assessment for tutor certification.
            </p>
          </div>
          <div className="quiz-header-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="btn-cancel btn-inline"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="quiz-form">
          {/* Quiz Info Section */}
          <section className="form-section">
            <h2>Quiz Information</h2>
            
            <div className="form-group">
              <label>Quiz Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g., Mathematics Basics"
                required
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <select value={formData.subject} onChange={handleSubjectChange} required>
                <option value="">Select a subject</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Pass Mark (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.passMark}
                onChange={handlePassMarkChange}
                required
              />
            </div>
          </section>

          {/* Questions Section */}
          <section className="form-section">
            <h2>Questions</h2>
            <p className="section-caption">
              Total questions: <strong>{formData.questions.length}</strong>
            </p>

            {formData.questions.map((question, qIndex) => (
              <div key={qIndex} className="question-card">
                <div className="question-header">
                  <h3>Question {qIndex + 1}</h3>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Question Text *</label>
                  <textarea
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                    placeholder="Enter question text"
                    required
                  />
                </div>

                <div className="options-container">
                  <label>Options (select correct answer) *</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="option-input">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        required
                      />
                      <label className="radio-label">
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
              className="btn-add-question"
            >
              + Add Question
            </button>
          </section>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
