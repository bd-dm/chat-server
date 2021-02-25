import http from 'http';
import { Server } from 'socket.io';

import { User } from '@/entities/User';

import { IAuthorizedSocket } from '@/definitions/socket';

import UserService from '@/services/UserService';

import serverConfig from '@/configs/serverConfig';

export default async function initSocketIO(httpServer: http.Server) {
  const io = new Server(httpServer, {
    path: serverConfig.socketPath,
    cors: {
      origin: '*',
    },
  });

  io.use((socket: IAuthorizedSocket, next) => {
    const { token } = socket.handshake.auth;

    if (token) {
      // eslint-disable-next-line no-param-reassign
      socket.user = UserService.decodeToken(token) as User;
    }
    next();
  });

  io.on('connection', async (socket: IAuthorizedSocket) => {
    if (socket.user?.id) {
      const userService = new UserService();
      await userService.updateSocketId(socket.user.id, socket.id);
    }
  });
}

