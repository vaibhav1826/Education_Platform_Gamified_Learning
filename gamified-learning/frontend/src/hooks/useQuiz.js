import { useReducer, useCallback, useRef, useEffect } from 'react';
import useApi from './useApi.js';

const initialState = {
  quiz: null,
  answers: {},
  timeLeft: 0,
  status: 'idle'
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_QUIZ':
      return { ...state, quiz: action.payload, timeLeft: action.payload.timeLimit, status: 'active' };
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

const useQuiz = (quizId) => {
  const api = useApi();
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef();

  const fetchQuiz = useCallback(async () => {
    const { data } = await api.get(`/quizzes/${quizId}`);
    dispatch({ type: 'SET_QUIZ', payload: data });
  }, [api, quizId]);

  const answerQuestion = useCallback((questionId, answer) => {
    dispatch({ type: 'ANSWER', payload: { id: questionId, answer } });
  }, []);

  const submitQuiz = useCallback(async (courseId) => {
    dispatch({ type: 'FINISH' });
    const payload = {
      courseId,
      answers: Object.entries(state.answers).map(([questionId, answer]) => ({ questionId, answer }))
    };
    const { data } = await api.post(`/quizzes/${quizId}/submit`, payload);
    return data;
  }, [api, quizId, state.answers]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  useEffect(() => {
    if (state.status !== 'active') return;
    timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(timerRef.current);
  }, [state.status]);

  return { ...state, answerQuestion, submitQuiz };
};

export default useQuiz;