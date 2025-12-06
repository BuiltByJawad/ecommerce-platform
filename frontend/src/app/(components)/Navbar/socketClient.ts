import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (socket) return socket;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  const url = apiBase.replace(/\/api$/, '');
  socket = io(url, {
    withCredentials: true,
    transports: ['websocket'],
  });
  return socket;
};
