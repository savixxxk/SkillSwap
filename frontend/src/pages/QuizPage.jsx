import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRandomQuiz, attemptQuiz } from '../services/quizService';
import './QuizPage.css';

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
    <div className="quiz-state-page">
      <div className="quiz-state-card">
        <h2>Loading quiz</h2>
        <p>Preparing your certification challenge...</p>
      </div>
    </div>
  );

  if (loadError) return (
    <div className="quiz-state-page">
      <div className="quiz-state-card error">
        <h2>Unable to start quiz</h2>
        <p>{loadError}</p>
        <button onClick={() => navigate('/tutor/certification')}>Back to Certification</button>
      </div>
    </div>
  );

  if (result) {
    const passed = result.isPassed;
    return (
      <div className="quiz-state-page">
        <div className={`quiz-state-card result ${passed ? 'pass' : 'fail'}`}>
          <p className="quiz-result-kicker">{passed ? 'Passed' : 'Try Again'}</p>
          <h1>Quiz Result</h1>
          <p className="quiz-result-score">{result.score.toFixed(2)}%</p>
          <p>{passed ? 'Great work! You passed and are now certified for this subject.' : 'You did not pass this attempt. You can retry after 24 hours.'}</p>
          <button onClick={() => navigate('/tutor/certification')}>Back to Certification</button>
        </div>
      </div>
    );
  }

  if (!quiz) return (
    <div className="quiz-state-page">
      <div className="quiz-state-card">
        <h2>No quiz available</h2>
        <p>Please choose another subject from certification page.</p>
        <button onClick={() => navigate('/tutor/certification')}>Back to Certification</button>
      </div>
    </div>
  );

  const q = quiz.questions[currentQuestion];

  return (
    <div className="quiz-page">
      <div className="quiz-shell">
        <div className="quiz-hero">
          <p className="quiz-kicker">{subject}</p>
          <h1>{quiz.title}</h1>
          <div className="question-counter">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
        </div>

        <div className="question">
          <p>{q.questionText}</p>
          <div className="options">
            {q.options.map((opt, i) => (
              <label key={i} className={`option ${answers[currentQuestion] === opt ? 'selected' : ''}`}>
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

        <div className="navigation">
          <button className="ghost-btn" onClick={previous} disabled={currentQuestion === 0}>Previous</button>
          {currentQuestion < quiz.questions.length - 1 ? (
            <button className="primary-btn" onClick={next}>Next</button>
          ) : (
            <button className="primary-btn" onClick={submit}>Submit</button>
          )}
        </div>
      </div>
    </div>
  );
}