import { Server } from 'socket.io';

let ioInstance = null;

const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    socket.on('register', ({ userId, role, courseIds = [], batchIds = [] } = {}) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      if (role) socket.join(`role:${role}`);
      courseIds.filter(Boolean).forEach((courseId) => socket.join(`course:${courseId}`));
      batchIds.filter(Boolean).forEach((batchId) => socket.join(`batch:${batchId}`));
    });

    socket.on('joinCourse', (courseId) => {
      if (!courseId) return;
      socket.join(`course:${courseId}`);
    });

    socket.on('joinBatch', (batchId) => {
      if (!batchId) return;
      socket.join(`batch:${batchId}`);
    });

    socket.on('disconnect', () => {});
  });

  return ioInstance;
};

export const io = () => ioInstance;

// Helper functions to emit events
export const emitToUser = (userId, event, data) => {
  const socket = ioInstance;
  if (socket) socket.to(`user:${userId}`).emit(event, data);
};

export const emitToRole = (role, event, data) => {
  const socket = ioInstance;
  if (socket) socket.to(`role:${role}`).emit(event, data);
};

export const emitToBatch = (batchId, event, data) => {
  const socket = ioInstance;
  if (socket) socket.to(`batch:${batchId}`).emit(event, data);
};

export const emitToCourse = (courseId, event, data) => {
  const socket = ioInstance;
  if (socket) socket.to(`course:${courseId}`).emit(event, data);
};

export const emitToAll = (event, data) => {
  const socket = ioInstance;
  if (socket) socket.emit(event, data);
};

export default initSocket;