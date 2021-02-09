import { Arg, Query, Resolver } from 'type-graphql';

import UserService from '@/services/UserService';

import { User } from '@/entities';

@Resolver()
export default class UserResolver {
  @Query(() => User)
  async getUser(@Arg('id') id: string): Promise<User> {
    const userService = new UserService();
    return userService.getById(id);
  }
}
