import { useEffect, useState, useCallback } from 'react';
import useApi from './useApi.js';
import useSocket from './useSocket.js';

const useLeaderboardData = () => {
  const api = useApi();
  const [leaders, setLeaders] = useState([]);

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await api.get('/leaderboard');
    setLeaders(data);
  }, [api]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useSocket('leaderboard:update', (entry) =>
    setLeaders((prev) => {
      const filtered = prev.filter((item) => item.user?._id !== entry.user?._id);
      return [entry, ...filtered];
    })
  );

  return { leaders, setLeaders };
};

export default useLeaderboardData;