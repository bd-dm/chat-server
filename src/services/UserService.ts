import { getRepository, Repository } from 'typeorm';

import Service from '@/lib/classes/Service';
import { ServerError } from '@/lib/utils';

import PasswordHelper from '@/lib/helpers/PasswordHelper';

import ApiError from '@/lib/utils/ApiError';

import { User } from '@/entities';

export default class UserService extends Service<User> {
  constructor(repository: Repository<User> = getRepository(User)) {
    super(repository);
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

  async login(email: string, password: string): Promise<User> {
    throw ApiError.fromServerError(new ServerError(30));
  }

  async getById(id: string): Promise<User> {
    const user = await this.repository.findOne({ id });

    if (!user) {
      throw ApiError.fromServerError(new ServerError(20));
    }

    return user;
  }
}
