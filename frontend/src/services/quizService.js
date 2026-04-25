import API from './api';

export const getQuizzes = () => API.get('/api/tutor/quizzes');

export const getRandomQuiz = (subject) => API.get(`/api/tutor/quizzes/${subject}`);

export const attemptQuiz = (quizId, answers) => API.post(`/api/tutor/attempt/${quizId}`, { answers });
