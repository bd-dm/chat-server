import {
  Authorized,
  Ctx,
  Query,
  Resolver,
} from 'type-graphql';

import UserService from '@/services/UserService';

import { IContext } from '@/definitions';
import { User } from '@/entities';

@Resolver()
export default class UserResolver {
  @Authorized()
  @Query(() => User, { nullable: true })
  async getCurrentUser(@Ctx() ctx: IContext): Promise<User> {
    const userId = ctx.user.id;

    const userService = new UserService();
    return userService.getById(userId);
  }
}
