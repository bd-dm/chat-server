import http from 'http';
import { Server } from 'socket.io';

import { User } from '@/entities/User';

import { IAuthorizedSocket } from '@/definitions/socket';

import UserService from '@/services/UserService';

import serverConfig from '@/configs/serverConfig';

export default class SocketServer {
  private static socketServer: Server;

  static getInstance() {
    return SocketServer.socketServer;
  }

  static getSocket(socketId: string) {
    return SocketServer.getInstance().of('/').sockets.get(socketId);
  }

  static init(httpServer: http.Server) {
    SocketServer.socketServer = new Server(httpServer, {
      path: serverConfig.socketPath,
      cors: {
        origin: '*',
      },
    });

    SocketServer.socketServer.use((socket: IAuthorizedSocket, next) => {
      const { token } = socket.handshake.auth;

      if (token) {
        // eslint-disable-next-line no-param-reassign
        socket.user = UserService.decodeToken(token) as User;
      }
      next();
    });

    SocketServer.socketServer.on('connection', async (socket: IAuthorizedSocket) => {
      if (socket.user?.id) {
        const userService = new UserService();
        await userService.updateSocketId(socket.user.id, socket.id);
      }
    });
  }
}
