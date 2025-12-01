import { useEffect, useState, useCallback } from 'react';
import useApi from './useApi.js';

const useCourses = () => {
  const api = useApi();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/courses');
    setCourses(data);
    setLoading(false);
  }, [api]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, refetch: fetchCourses };
};

export default useCourses;