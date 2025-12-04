import { useCallback, useEffect, useState } from 'react';
import useApi from './useApi.js';

const useAnalytics = (role = 'student') => {
  const api = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const endpoint = role === 'teacher' ? '/analytics/teacher' : '/analytics/student';

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const response = await api.get(endpoint);
    setData(response.data);
    setLoading(false);
  }, [api, endpoint]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, refresh: fetchAnalytics };
};

export default useAnalytics;

