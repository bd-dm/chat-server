import express from 'express';
import { createServer } from 'http';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client/build/socket';

import SocketServer from '../src/api/sockets';

interface ITestWebsocketsResult {
  client: Socket;
  closeServer?: () => void;
}

const { HOST, PORT } = process.env;

const getIoClient = async (): Promise<Socket> => {
  const ioClient = io(`ws://${HOST}:${PORT}`, {
    path: process.env.SOCKET_PATH,
    forceNew: true,
    reconnection: false,
    transports: ['websocket'],
    timeout: 1000,
  });

  await new Promise((resolve, reject) => {
    ioClient.on('connect', () => {
      resolve();
    });
    ioClient.on('connect_error', (e: Error) => {
      reject(e);
    });
  });

  return ioClient;
};

export default async (): Promise<ITestWebsocketsResult> => {
  let ioClient: Socket;
  try {
    ioClient = await getIoClient();
  } catch (e) {
    console.log('Need to create new WS server...');
  }

  if (ioClient) {
    return {
      client: ioClient,
    };
  }

  const app = express();
  const httpServer = createServer(app);

  SocketServer.init(httpServer);
  const ioServer = SocketServer.getInstance();

  await new Promise((resolve, reject) => {
    httpServer
      .listen(+PORT, HOST, () => {
        resolve();
      })
      .on('error', reject);
  });

  const closeServer = async () => {
    await ioServer.close();
    await httpServer.close();
  };

  ioClient = await getIoClient();

  return {
    client: ioClient,
    closeServer,
  };
};
