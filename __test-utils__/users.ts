import * as faker from 'faker';
import jwt from 'jsonwebtoken';
import { Connection, DeepPartial } from 'typeorm';

import serverConfig from '../src/configs/serverConfig';
import { IContext } from '../src/definitions';
import { User } from '../src/entities';
import UserService from '../src/services/UserService';

interface IGenerateUserInput {
  emailFn?: () => string;
  passwordFn?: () => string;
}

export interface IUserWithToken {
  data: User;
  token: string;
}

interface IGenerateUsersInput extends IGenerateUserInput{
  count: number;
}

export const generateUser = ({
  emailFn = faker.internet.email,
  passwordFn = faker.internet.password,
}: IGenerateUserInput = {}) => ({
  email: emailFn(),
  password: passwordFn(),
});

export const generateUsers = ({
  count,
  emailFn,
  passwordFn,
}: IGenerateUsersInput) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(generateUser({ emailFn, passwordFn }));
  }

  return users;
};

export const createAndGetUser = async (
  connection: Connection,
  data?: Partial<User>,
): Promise<IUserWithToken> => {
  const userData = data || generateUser();
  const repository = connection.getRepository(User);
  const user = await repository.save(userData);

  return {
    data: user,
    token: generateJwt(user.id),
  };
};

export const getUserContext = (token: string): DeepPartial<IContext> => {
  const decodedUser = verifyJwt(token) as Partial<User>;

  return {
    req: {
      user: decodedUser,
    },
    user: decodedUser,
  };
};

export const generateJwt = (userId: string) => UserService.getTokenById(userId);

export const verifyJwt = (token: string) => jwt.verify(token, serverConfig.jwtAuthSecret);
