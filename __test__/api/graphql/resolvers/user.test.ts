import '@/../dotenv';

import faker from 'faker';
import { Connection } from 'typeorm';

import testConnection from '@/../__test-utils__/testConnection';

import gCall from '../../../../__test-utils__/apiCall';
import {
  generateUser,
  generateUsers,
  getUserContext,
} from '../../../../__test-utils__/users';
import { User } from '../../../../src/entities';
import PasswordHelper from '../../../../src/lib/helpers/PasswordHelper';

let connection: Connection;

beforeAll(async () => {
  connection = await testConnection();
});

afterAll(async () => {
  await connection.close();
});

const userSignupMutation = `
mutation UserSignup($data: UserSignupInput!) {
  userSignup(data: $data)
}
`;

const userLoginQuery = `
query UserLogin($data: UserLoginInput!) {
  userLogin(data: $data)
}
`;

const userGetCurrentQuery = `
query UserGetCurrent {
  userGetCurrent {
    id
    email
  }
}
`;

const users = generateUsers({
  count: 5,
});

interface IUserToken {
  id: string;
  token: string;
}

const userTokens: IUserToken[] = [];

jest.setTimeout(10000);

describe('Api:userSignup [mutation]', () => {
  it('Has database connection', async () => {
    expect(connection).toBeDefined();
    expect(connection.isConnected).toBe(true);
  });

  it('Signs users up', async () => {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const response = await gCall({
        source: userSignupMutation,
        variableValues: {
          data: user,
        },
      });

      expect(response.errors).toBeUndefined();
      expect(response.data).toBeDefined();

      const dbUser = await User.findOne({ email: user.email });
      expect(dbUser).toBeDefined();

      const isPasswordValid = await PasswordHelper.validate(user.password, dbUser.password);

      expect(typeof response.data.userSignup).toBe('string');
      expect(isPasswordValid).toBe(true);
    }
  });

  it('Not signs up users with password length < 6', async () => {
    const user = generateUser({ passwordFn: () => faker.internet.password(5) });
    const response = await gCall({
      source: userSignupMutation,
      variableValues: {
        data: user,
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.data).toBeNull();
  });

  it('Not signs up users with wrong email', async () => {
    const wrongEmailUsers = generateUsers({
      count: 5,
      emailFn: () => faker.random.word(),
    });

    for (let i = 0; i < wrongEmailUsers.length; i++) {
      const user = wrongEmailUsers[i];
      const response = await gCall({
        source: userSignupMutation,
        variableValues: {
          data: user,
        },
      });

      expect(response.errors).toBeDefined();
      expect(response.data).toBeNull();
    }
  });
});

describe('Api:userLogin [query]', () => {
  it('Lets users log in and checks password the right way', async () => {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const dbUser = await User.findOne({ email: user.email });
      const isPasswordValid = await PasswordHelper.validate(user.password, dbUser.password);

      const response = await gCall({
        source: userLoginQuery,
        variableValues: {
          data: user,
        },
      });

      userTokens.push({
        id: dbUser.id,
        token: response.data.userLogin,
      });

      expect(typeof response.data.userLogin).toBe('string');
      expect(isPasswordValid).toBe(true);
    }
  });
});

describe('Api:userGetCurrent [query]', () => {
  it('Fetches current user and decodes jwt token right', async () => {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const dbUser = await User.findOne({ email: user.email });
      const userToken = userTokens.find((el) => el.id === dbUser.id).token;

      expect(typeof userToken).toBe('string');

      const response = await gCall({
        source: userGetCurrentQuery,
        contextValue: getUserContext(userToken),
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.userGetCurrent).toMatchObject({
        id: dbUser.id,
        email: dbUser.email,
      });
    }
  });
});
