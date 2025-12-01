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
    socket.on('disconnect', () => {});
  });

  return ioInstance;
};

export const io = () => ioInstance;

export default initSocket;