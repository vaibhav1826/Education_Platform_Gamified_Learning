import { useEffect, useState, useCallback } from 'react';
import useApi from './useApi.js';

const useGamification = () => {
  const api = useApi();
  const [state, setState] = useState({ progress: [], user: null, requirements: 0 });

  const fetchProgress = useCallback(async () => {
    const { data } = await api.get('/gamification/progress');
    setState(data);
  }, [api]);

  const triggerEvent = useCallback(async (event, meta) => {
    const { data } = await api.post('/gamification/event', { event, meta });
    setState((prev) => ({ ...prev, user: data }));
  }, [api]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { ...state, triggerEvent };
};

export default useGamification;