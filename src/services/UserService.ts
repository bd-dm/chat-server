import jwt from 'jsonwebtoken';
import { getRepository, Repository } from 'typeorm';

import Service from '@/lib/classes/Service';
import { ServerError } from '@/lib/utils';

import PasswordHelper from '@/lib/helpers/PasswordHelper';

import ApiError from '@/lib/utils/ApiError';

import serverConfig from '@/configs/serverConfig';

import { User } from '@/entities';

export default class UserService extends Service<User> {
  constructor(repository: Repository<User> = getRepository(User)) {
    super(repository);
  }

  static getTokenById(id: string) {
    return jwt.sign({ id }, serverConfig.jwtAuthSecret);
  }

  static decodeToken(token: string) {
    return jwt.verify(token, serverConfig.jwtAuthSecret);
  }

  async getByIds(ids: string[]): Promise<User[]> {
    return this.repository.findByIds(ids);
  }

  async signup(email: string, password: string): Promise<string> {
    const passwordHash = await PasswordHelper.encrypt(password);

    const user = await this.repository.create({
      email,
      password: passwordHash,
    }).save();

    if (!user) {
      throw ApiError.fromServerError(new ServerError(10));
    }

    return user.id;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.repository.findOne({ email }, { select: ['id', 'email', 'password'] });
    if (!user) {
      throw ApiError.fromServerError(new ServerError(30));
    }

    const isPasswordValid = await PasswordHelper.validate(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.fromServerError(new ServerError(30));
    }

    return UserService.getTokenById(user.id);
  }

  async getById(id: string): Promise<User> {
    const user = await this.repository.findOne({ id });

    if (!user) {
      return null;
    }

    return user;
  }

  async updateSocketId(userId: string, socketId: string): Promise<void> {
    await this.repository.update({ id: userId }, { socketId });
  }
}
