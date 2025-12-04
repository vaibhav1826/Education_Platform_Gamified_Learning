import { useEffect, useState, useCallback } from 'react';
import useApi from './useApi.js';

const useLesson = (lessonId) => {
  const api = useApi();
  const [lesson, setLesson] = useState(null);

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;
    const { data } = await api.get(`/lessons/${lessonId}`);
    setLesson(data);
  }, [api, lessonId]);

  const completeLesson = useCallback(async () => {
    if (!lessonId) return null;
    const { data } = await api.post(`/lessons/${lessonId}/complete`);
    return data;
  }, [api, lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return { lesson, completeLesson, refetch: fetchLesson };
};

export default useLesson;