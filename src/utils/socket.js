// src/utils/socket.js
import { io } from 'socket.io-client';
export const socket = io('https://blinksybackend.onrender.com', {
  withCredentials: true,
  transports: ['websocket']
});
