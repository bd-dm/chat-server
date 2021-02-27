import '@/../dotenv';

import express from 'express';
import { createServer } from 'http';
import { Connection } from 'typeorm';

import testConnection from '@/../__test-utils__/testConnection';

import gCall from '../../../../__test-utils__/apiCall';
import {
  createAndGetUser, getUserContext, IUserWithToken,
} from '../../../../__test-utils__/users';
import SocketServer from '../../../../src/api/sockets';
import { ChatRoom } from '../../../../src/entities';

const USERS_COUNT = 10;
let connection: Connection;
const users: IUserWithToken[] = [];

beforeAll(async () => {
  const app = express();
  const httpServer = createServer(app);
  SocketServer.init(httpServer);

  connection = await testConnection(true);

  for (let i = 0; i < USERS_COUNT; i++) {
    users.push(await createAndGetUser(connection));
  }
});

afterAll(async () => {
  await connection.close();
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

jest.setTimeout(10000);

describe('Api:chatCreate [mutation]', () => {
  it('Has users list', async () => {
    expect(users).toBeDefined();
    expect(users.length).toBe(USERS_COUNT);

    for (let i = 0; i < USERS_COUNT; i++) {
      expect(users[i]).toBeDefined();
      expect(typeof users[i].token).toBe('string');
      expect(users[i].data).toBeDefined();
    }
  });

  it('Creates chat', async () => {
    const creatorUser = users[0];
    const roomName = 'All users party!';

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
});
