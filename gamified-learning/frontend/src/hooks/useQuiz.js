import { useReducer, useCallback, useRef, useEffect } from 'react';
import useApi from './useApi.js';

const initialState = {
  quiz: null,
  answers: {},
  timeLeft: 0,
  status: 'idle',
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_QUIZ':
      return { ...state, quiz: action.payload, timeLeft: action.payload.timeLimit || 0, status: 'active', error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, status: 'error' };
    case 'ANSWER':
      return { ...state, answers: { ...state.answers, [action.payload.id]: action.payload.answer } };
    case 'TICK':
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1), status: state.timeLeft - 1 <= 0 ? 'finished' : state.status };
    case 'FINISH':
      return { ...state, status: 'finished' };
    default:
      return state;
  }
};

/**
 * Hook for managing quiz state
 * @param {string} quizId - The quiz ID
 * @param {string} userRole - The user's role ('student', 'teacher', 'admin')
 * @param {string} batchId - Optional batch ID for student submissions
 */
const useQuiz = (quizId, userRole = 'student', batchId = null) => {
  const api = useApi();
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef();

  const fetchQuiz = useCallback(async () => {
    try {
      // Use appropriate endpoint based on user role
      const endpoint = userRole === 'student'
        ? `/student/quizzes/${quizId}`
        : `/quizzes/${quizId}`;
      const { data } = await api.get(endpoint);
      dispatch({ type: 'SET_QUIZ', payload: data });
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to load quiz' });
    }
  }, [api, quizId, userRole]);

  const answerQuestion = useCallback((questionId, answer) => {
    dispatch({ type: 'ANSWER', payload: { id: questionId, answer } });
  }, []);

  const submitQuiz = useCallback(async () => {
    if (!state.quiz) return null;
    dispatch({ type: 'FINISH' });

    try {
      // Use appropriate endpoint based on user role
      if (userRole === 'student') {
        const payload = {
          batchId: batchId || state.quiz.assignedBatches?.[0]?._id || state.quiz.assignedBatches?.[0],
          answers: Object.entries(state.answers).map(([questionId, answer], index) => ({
            questionIndex: index,
            selectedIndex: typeof answer === 'number' ? answer : 0
          }))
        };
        const { data } = await api.post(`/student/quizzes/${quizId}/submit`, payload);
        return data;
      } else {
        // Teacher endpoint for course-based quizzes
        const payload = {
          courseId: state.quiz?.course?._id || state.quiz?.course,
          answers: Object.entries(state.answers).map(([questionId, answer]) => ({ questionId, answer }))
        };
        const { data } = await api.post(`/quizzes/${quizId}/submit`, payload);
        return data;
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      throw error;
    }
  }, [api, quizId, state.answers, state.quiz, userRole, batchId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  useEffect(() => {
    if (state.status !== 'active' || !state.timeLeft) return;
    timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(timerRef.current);
  }, [state.status, state.timeLeft]);

  return { ...state, answerQuestion, submitQuiz };
};

export default useQuiz;
