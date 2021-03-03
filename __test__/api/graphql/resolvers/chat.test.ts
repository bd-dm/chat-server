import '@/../dotenv';

import * as faker from 'faker';
import { Socket } from 'socket.io-client/build/socket';
import { Connection } from 'typeorm';

import testConnection from '@/../__test-utils__/testConnection';

import gCall from '../../../../__test-utils__/apiCall';
import testWebsockets from '../../../../__test-utils__/testWebsockets';
import {
  createAndGetUser, generateUser, getUserContext, IUserWithToken,
} from '../../../../__test-utils__/users';
import { ISocketEvents } from '../../../../src/definitions/socket';
import { ChatRoom } from '../../../../src/entities';

const USERS_COUNT = 10;
let connection: Connection;
const users: IUserWithToken[] = [];

let ioClient: Socket;
let closeWsConnection: () => void;

beforeAll(async () => {
  connection = await testConnection();

  const {
    client,
    closeServer,
  } = await testWebsockets();

  closeWsConnection = closeServer;
  ioClient = client;

  users.push(
    await createAndGetUser(connection, {
      ...generateUser(),
      socketId: ioClient.id,
    }),
  );

  for (let i = 0; i < USERS_COUNT - 1; i++) {
    users.push(await createAndGetUser(connection));
  }
});

afterAll(async () => {
  await connection.close();
  await closeWsConnection();
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

const chatMessageSendMutation = `
mutation ChatMessageSend($data: ChatMessageSendInput!) {
  chatMessageSend(data: $data) {
    id
    createdAt
    updatedAt
    text
    author {
      id
      createdAt
      updatedAt
      email
    }
    chatRoom {
      id
    }
  }
}
`;

const chatMessageListMutation = `
query ChatMessageList($data: ChatMessageListInput!) {
  chatMessageList(data: $data) {
    data {
      id
      createdAt
      updatedAt
      text
      author {
        id
        createdAt
        updatedAt
        email
      }
      chatRoom {
        id
      }
    }
  }
}
`;

jest.setTimeout(10000);

describe('Api:chatCreate [mutation]', () => {
  const roomName = 'All users party!';
  let partyRoomId: string;

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
      id: response?.data?.chatCreate.id,
    });
    expect(dbChatRoom).toBeDefined();
    expect(dbChatRoom.id).toBeDefined();

    partyRoomId = dbChatRoom.id;
  });

  it('Sends new chat rooms to clients', (done) => {
    const creatorUser = users[0];

    const onNewRoom = (data: any) => {
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.name).toBeDefined();

      done();
    };

    ioClient.once(ISocketEvents.CHAT_NEW_ROOM, onNewRoom);

    gCall({
      source: chatCreateMutation,
      variableValues: {
        data: {
          name: roomName,
          userIds: users.map((user) => user.data.id),
        },
      },
      contextValue: getUserContext(creatorUser.token),
    }).then();
  });

  it('Creates chat with name length = 255', async () => {
    const creatorUser = users[0];
    const response = await gCall({
      source: chatCreateMutation,
      variableValues: {
        data: {
          name: 's'.repeat(255),
          userIds: users.map((user) => user.data.id),
        },
      },
      contextValue: getUserContext(creatorUser.token),
    });

    expect(response?.errors).toBeUndefined();
    expect(response?.data?.chatCreate).toBeDefined();
  });

  it('Not creates chat with name length > 255', async () => {
    const creatorUser = users[0];
    const response = await gCall({
      source: chatCreateMutation,
      variableValues: {
        data: {
          name: 's'.repeat(256),
          userIds: users.map((user) => user.data.id),
        },
      },
      contextValue: getUserContext(creatorUser.token),
    });

    expect(response?.errors).toBeDefined();
    expect(response?.data?.chatCreate).toBeUndefined();
  });

  it('Not creates chat with users.length < 2', async () => {
    const creatorUser = users[0];
    const response = await gCall({
      source: chatCreateMutation,
      variableValues: {
        data: {
          name: roomName,
          userIds: [users[1]],
        },
      },
      contextValue: getUserContext(creatorUser.token),
    });

    expect(response?.errors).toBeDefined();
    expect(response?.data?.chatCreate).toBeUndefined();
  });

  it('Lists chats of user', async () => {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const response = await gCall({
        source: chatListQuery,
        contextValue: getUserContext(user.token),
      });

      expect(response?.errors).toBeUndefined();
      expect(response?.data?.chatList[0].name).toBe(roomName);
    }
  });

  it('Lets user send message', async () => {
    const user = users[0];

    const response = await gCall({
      source: chatMessageSendMutation,
      variableValues: {
        data: {
          text: faker.lorem.text(),
          chatRoomId: partyRoomId,
        },
      },
      contextValue: getUserContext(user.token),
    });

    expect(response?.errors).toBeUndefined();
    expect(response?.data?.chatMessageSend).toBeDefined();
  });

  it('Sends new messages to user\'s sockets', (done) => {
    const user = users[0];

    const onNewMessage = (data: any) => {
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.text).toBeDefined();
      done();
    };

    ioClient.on(ISocketEvents.CHAT_NEW_MESSAGE, onNewMessage);

    gCall({
      source: chatMessageSendMutation,
      variableValues: {
        data: {
          text: faker.lorem.text(),
          chatRoomId: partyRoomId,
        },
      },
      contextValue: getUserContext(user.token),
    }).then();
  });

  it('Lets user list messages in chat', async () => {
    const user = users[0];

    const response = await gCall({
      source: chatMessageListMutation,
      variableValues: {
        data: {
          chatRoomId: partyRoomId,
        },
      },
      contextValue: getUserContext(user.token),
    });

    expect(response?.errors).toBeUndefined();
    expect(response?.data?.chatMessageList).toBeDefined();
    expect(response?.data?.chatMessageList.data.length > 0).toBe(true);
    expect(response?.data?.chatMessageList.data[0].text).toBeDefined();
  });
});
