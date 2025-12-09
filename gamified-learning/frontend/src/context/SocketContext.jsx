import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './AuthContext.jsx';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuthContext();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    if (!user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('register', {
        userId: user._id,
        role: user.role,
        courseIds: [],
        batchIds: []
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user?._id, user?.role]);

  const subscribe = (event, callback) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on(event, callback);
    const id = `${event}-${Date.now()}-${Math.random()}`;
    listenersRef.current.set(id, { event, callback });
    return () => {
      socketRef.current?.off(event, callback);
      listenersRef.current.delete(id);
    };
  };

  const emit = (event, data) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    }
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, subscribe, emit }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

