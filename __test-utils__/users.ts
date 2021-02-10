import * as faker from 'faker';
import jwt from 'jsonwebtoken';

import serverConfig from '../src/configs/serverConfig';

interface IGenerateUserInput {
  emailFn?: () => string;
  passwordFn?: () => string;
}

interface IGenerateUsersInput extends IGenerateUserInput{
  count: number;
}

export const generateUser = ({
  emailFn = faker.internet.email,
  passwordFn = faker.internet.password,
}: IGenerateUserInput) => ({
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

export const verifyJwt = (token: string) => jwt.verify(token, serverConfig.jwtAuthSecret);
