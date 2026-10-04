import { io, Socket } from 'socket.io-client';
import { getToken } from '../utils/storage';

// Needs to match the backend URL
import { API_BASE_URL } from '../config/env';

let socket: Socket | null = null;

export const initSocket = async () => {
  if (socket) return socket;
  
  const token = await getToken();
  if (!token) return null;

  const url = API_BASE_URL.replace('/api', '');

  socket = io(url, {
    auth: {
      token: token,
    },
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
