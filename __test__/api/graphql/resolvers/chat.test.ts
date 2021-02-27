import '@/../dotenv';

import express from 'express';
import { createServer, Server } from 'http';
import { Server as IOServer } from 'socket.io';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client/build/socket';
import { Connection } from 'typeorm';

import testConnection from '@/../__test-utils__/testConnection';

import gCall from '../../../../__test-utils__/apiCall';
import {
  createAndGetUser, generateUser, getUserContext, IUserWithToken,
} from '../../../../__test-utils__/users';
import SocketServer from '../../../../src/api/sockets';
import { ISocketEvents } from '../../../../src/definitions/socket';
import { ChatRoom } from '../../../../src/entities';

const USERS_COUNT = 10;
let connection: Connection;
const users: IUserWithToken[] = [];

let ioServer: IOServer;
let ioClient: Socket;
let httpServer: Server;

beforeAll(async () => {
  const app = express();
  httpServer = createServer(app);

  connection = await testConnection(true);

  SocketServer.init(httpServer);
  ioServer = SocketServer.getInstance();
  await new Promise((resolve, reject) => {
    httpServer
      .listen(process.env.PORT, +process.env.HOST, () => {
        resolve();
      })
      .on('error', reject);
  });

  ioClient = io(`ws://${process.env.HOST}:${process.env.PORT}`, {
    path: process.env.SOCKET_PATH,
    forceNew: true,
    reconnection: false,
    transports: ['websocket'],
  });
  await new Promise((resolve, reject) => {
    ioClient.on('connect', () => {
      resolve();
    });
    ioClient.on('connect_error', (e: Error) => {
      reject(e);
    });
  });

  users.push(await createAndGetUser(connection, {
    ...generateUser(),
    socketId: ioClient.id,
  }));

  for (let i = 0; i < USERS_COUNT - 1; i++) {
    users.push(await createAndGetUser(connection));
  }
});

afterAll(async () => {
  await connection.close();
  ioServer.close();
  httpServer.close();
});

const chatCreateMutation = `
mutation ChatCreate($data: ChatCreateInput!) {
  chatCreate(data: $data) {
    id
    createdAt
    updatedAt
    name
    users {
      id
      createdAt
      updatedAt
      email
    }
  }
}
`;

const chatListQuery = `
query ChatList {
  chatList {
    id
    createdAt
    updatedAt
    name
    users {
      id
      createdAt
      updatedAt
      email
    }
  }
}
`;

jest.setTimeout(10000);

describe('Api:chatCreate [mutation]', () => {
  const roomName = 'All users party!';

  it('Has users list', async () => {
    expect(users).toBeDefined();
    expect(users.length).toBe(USERS_COUNT);

    for (let i = 0; i < USERS_COUNT; i++) {
      expect(users[i]).toBeDefined();
      expect(typeof users[i].token).toBe('string');
      expect(users[i].data).toBeDefined();
    }
  });

  it('Creates chat, sends chat to clients', async () => {
    const creatorUser = users[0];

    ioClient.on(ISocketEvents.CHAT_NEW_ROOM, (data: any) => {
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.name).toBeDefined();
    });

    const response = await gCall({
      source: chatCreateMutation,
      variableValues: {
        data: {
          name: roomName,
          userIds: users.map((user) => user.data.id),
        },
      },
      contextValue: getUserContext(creatorUser.token),
    });

    expect(response?.errors).toBeUndefined();
    expect(response?.data?.chatCreate).toBeDefined();

    const dbChatRoom = await ChatRoom.findOne({
      name: roomName,
    });
    expect(dbChatRoom).toBeDefined();
    expect(dbChatRoom.id).toBeDefined();
  });

  it('Lists chats of user', async () => {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const response = await gCall({
        source: chatListQuery,
        contextValue: getUserContext(user.token),
      });

      expect(response?.errors).toBeUndefined();
      expect(response?.data?.chatList).toBeDefined();
      expect(response?.data?.chatList[0]).toBeDefined();
      expect(response?.data?.chatList[0].name).toBe(roomName);
    }
  });
});
