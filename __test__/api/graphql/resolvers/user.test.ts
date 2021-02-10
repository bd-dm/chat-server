import '@/../dotenv';

import faker from 'faker';
import { Connection } from 'typeorm';

import testConnection from '@/../__test-utils__/testConnection';

import gCall from '../../../../__test-utils__/apiCall';
import { generateUser, generateUsers, verifyJwt } from '../../../../__test-utils__/users';
import { User } from '../../../../src/entities';
import PasswordHelper from '../../../../src/lib/helpers/PasswordHelper';

let connection: Connection;

beforeAll(async () => {
  connection = await testConnection(true);
});

afterAll(async () => {
  await connection.close();
});

const signupMutation = `
mutation Signup($data: UserSignupInput!) {
  signup(data: $data)
}
`;

const loginQuery = `
query Login($data: UserLoginInput!) {
  login(data: $data)
}
`;

const getCurrentUserQuery = `
query GetCurrentUser {
  getCurrentUser {
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

describe('Api:user.signup [mutation]', () => {
  it('Signs users up', async () => {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const response = await gCall({
        source: signupMutation,
        variableValues: {
          data: user,
        },
      });

      const dbUser = await User.findOne({ email: user.email });
      const isPasswordValid = await PasswordHelper.validate(user.password, dbUser.password);

      expect(typeof response.data.signup).toBe('string');
      expect(dbUser).toBeDefined();
      expect(isPasswordValid).toBe(true);
    }
  });

  it('Not signs up users with password length < 6', async () => {
    const user = generateUser({ passwordFn: () => faker.internet.password(5) });
    const response = await gCall({
      source: signupMutation,
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
        source: signupMutation,
        variableValues: {
          data: user,
        },
      });

      expect(response.errors).toBeDefined();
      expect(response.data).toBeNull();
    }
  });
});

describe('Api:user.login [query]', () => {
  it('Lets users log in and checks password the right way', async () => {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const dbUser = await User.findOne({ email: user.email });
      const isPasswordValid = await PasswordHelper.validate(user.password, dbUser.password);

      const response = await gCall({
        source: loginQuery,
        variableValues: {
          data: user,
        },
      });

      userTokens.push({
        id: dbUser.id,
        token: response.data.login,
      });

      expect(typeof response.data.login).toBe('string');
      expect(isPasswordValid).toBe(true);
    }
  });
});

describe('Api:user.getCurrentUser [query]', () => {
  it('Fetches current user and decodes jwt token right', async () => {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const dbUser = await User.findOne({ email: user.email });
      const userToken = userTokens.find((el) => el.id === dbUser.id).token;

      const decodedUser = verifyJwt(userToken) as Partial<User>;

      const response = await gCall({
        source: getCurrentUserQuery,
        contextValue: {
          req: {
            user: decodedUser,
          },
          user: decodedUser,
        },
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.getCurrentUser).toMatchObject({
        id: dbUser.id,
        email: dbUser.email,
      });
    }
  });
});
