import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

const parseCookies = (cookieHeader) => {
  const list = {};
  if (!cookieHeader) return list;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const key = pair.slice(0, idx).trim();
      const val = decodeURIComponent(pair.slice(idx + 1).trim());
      list[key] = val;
    }
  }
  return list;
};

export const initIo = (httpServer) => {
  const allowedOrigins = [
    process.env.NEXT_APP_FRONTEND,
    process.env.CORS_ORIGIN,
    'http://localhost:3000',
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || '';
      const cookies = parseCookies(cookieHeader);
      const token = cookies['access_token'] || socket.handshake.auth?.token || null;
      if (!token) return next(); // allow connection but without joining a room
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
      socket.data.userId = decoded.userId;
      return next();
    } catch (_e) {
      // continue without user room
      return next();
    }
  });

  io.on('connection', (socket) => {
    const uid = socket.data?.userId;
    if (uid) {
      socket.join(`user:${uid}`);
    }
    socket.on('disconnect', () => {
      // no-op
    });
  });

  return io;
};

export const getIo = () => io;

export const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
};
