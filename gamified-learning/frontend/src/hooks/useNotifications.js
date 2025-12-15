import { useCallback, useEffect, useState } from 'react';
import useApi from './useApi.js';

const useNotifications = () => {
  const api = useApi();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    const { data } = await api.get('/notifications');
    setNotifications(data);
  }, [api]);

  const markAsRead = useCallback(
    async (id) => {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    },
    [api, fetchNotifications]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, refetch: fetchNotifications, markAsRead };
};

export default useNotifications;

