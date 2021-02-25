import http from 'http';
import { Server, Socket } from 'socket.io';

import serverConfig from '@/configs/serverConfig';

export default async function initSocketIO(httpServer: http.Server) {
  const io = new Server(httpServer, {
    path: serverConfig.socketPath,
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket: Socket) => {
    socket.emit('event', 'arg1', 'arg2');
  });
}
