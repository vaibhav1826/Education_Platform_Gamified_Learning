import 'dotenv/config';
import http from 'http';
import app from './server.js';
import connectDB from './config/db.js';
import initSocket from './utils/socket.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => console.log(`Server running on ${PORT}`));
};

start();