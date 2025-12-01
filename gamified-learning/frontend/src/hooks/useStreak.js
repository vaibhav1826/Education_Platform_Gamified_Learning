import { useEffect, useState, useCallback } from 'react';
import useApi from './useApi.js';

const useStreak = () => {
  const api = useApi();
  const [streak, setStreak] = useState({ count: 0, lastLogin: null });

  const refresh = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    setStreak(data.streak || { count: 0, lastLogin: null });
  }, [api]);

  useEffect(() => {
    const mark = async () => {
      await api.post('/gamification/event', { event: 'daily_login' });
      await refresh();
    };
    mark();
  }, [api, refresh]);

  return streak;
};

export default useStreak;