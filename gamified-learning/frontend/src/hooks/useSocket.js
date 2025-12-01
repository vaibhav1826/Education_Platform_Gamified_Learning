import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (event, handler) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    const socket = socketRef.current;
    if (event && handler) socket.on(event, handler);

    return () => {
      if (event && handler) socket.off(event, handler);
      socket.disconnect();
    };
  }, [event, handler]);
};

export default useSocket;