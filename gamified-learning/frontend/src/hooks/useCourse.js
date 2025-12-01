import { useEffect, useState, useCallback } from 'react';
import useApi from './useApi.js';

const useCourse = (courseId) => {
  const api = useApi();
  const [course, setCourse] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    const { data } = await api.get(`/courses/${courseId}`);
    setCourse(data);
  }, [api, courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course };
};

export default useCourse;