import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from '../context/AuthContext.jsx';

const useSocket = (bindings = [], options = {}) => {
  const socketRef = useRef(null);
  const { user } = useAuthContext();
  const serializedCourses = JSON.stringify(options.courseIds || []);

  useEffect(() => {
    if (!user || !bindings.length) return undefined;
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', { transports: ['websocket'] });
    const socket = socketRef.current;
    socket.emit('register', { userId: user._id, courseIds: JSON.parse(serializedCourses) });
    bindings.forEach(({ event, handler }) => {
      if (event && handler) socket.on(event, handler);
    });

    return () => {
      bindings.forEach(({ event, handler }) => {
        if (event && handler) socket.off(event, handler);
      });
      socket.disconnect();
    };
  }, [bindings, serializedCourses, user?._id]);

  return socketRef.current;
};

export default useSocket;
