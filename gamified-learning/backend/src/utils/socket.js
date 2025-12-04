import { Server } from 'socket.io';

let ioInstance = null;

const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket) => {
    socket.on('register', ({ userId, courseIds = [] } = {}) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      courseIds.filter(Boolean).forEach((courseId) => socket.join(`course:${courseId}`));
    });

    socket.on('joinCourse', (courseId) => {
      if (!courseId) return;
      socket.join(`course:${courseId}`);
    });

    socket.on('disconnect', () => {});
  });

  return ioInstance;
};

export const io = () => ioInstance;

export default initSocket;