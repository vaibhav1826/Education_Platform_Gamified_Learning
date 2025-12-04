import { useEffect, useState, useCallback } from 'react';
import useApi from './useApi.js';

const useCourse = (courseId) => {
  const api = useApi();
  const [course, setCourse] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    const { data } = await api.get(`/courses/${courseId}`);
    setCourse(data);
  }, [api, courseId]);

  const fetchAnnouncements = useCallback(async () => {
    if (!courseId) return;
    const { data } = await api.get(`/courses/${courseId}/announcements`);
    setAnnouncements(data);
  }, [api, courseId]);

  const enroll = useCallback(async () => {
    if (!courseId) return null;
    const { data } = await api.post(`/courses/${courseId}/enroll`);
    await fetchCourse();
    return data;
  }, [api, courseId, fetchCourse]);

  useEffect(() => {
    fetchCourse();
    fetchAnnouncements();
  }, [fetchCourse, fetchAnnouncements]);

  return { course, announcements, enroll, refetch: fetchCourse };
};

export default useCourse;