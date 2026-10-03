import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

let socket: Socket | null = null;

export function connectSocket(token?: string | null): Socket {
  if (socket) socket.disconnect();
  socket = io(API_BASE_URL, { auth: token ? { token } : {} });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
