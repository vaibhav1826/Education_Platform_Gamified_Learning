import { useEffect, useState, useCallback, useMemo } from 'react';
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

  const handleRealtime = useCallback((entry) => {
    setLeaders((prev) => {
      const filtered = prev.filter((item) => item.user?._id !== entry.user?._id);
      return [entry, ...filtered];
    });
  }, []);

  const bindings = useMemo(() => [{ event: 'leaderboard:update', handler: handleRealtime }], [handleRealtime]);
  useSocket(bindings);

  return { leaders, setLeaders };
};

export default useLeaderboardData;
