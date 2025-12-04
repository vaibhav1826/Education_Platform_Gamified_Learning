import { useEffect, useState, useCallback } from 'react';
import useApi from './useApi.js';

const useCourses = (params = {}) => {
  const api = useApi();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const serializedParams = JSON.stringify(params);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const query = JSON.parse(serializedParams || '{}');
    const { data } = await api.get('/courses', { params: query });
    setCourses(data);
    setLoading(false);
  }, [api, serializedParams]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, refetch: fetchCourses };
};

export default useCourses;