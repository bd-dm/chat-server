import { IsEmail, MinLength } from 'class-validator';
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';

import UserService from '@/services/UserService';

import { IContext } from '@/definitions';
import { User } from '@/entities';

@InputType()
class UserLoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class UserSignupInput {
  @Field()
  @IsEmail() // Max: 254
  email: string;

  @Field()
  @MinLength(6)
  password: string;
}

@Resolver()
export default class UserResolver {
  @Mutation(() => String)
  async userSignup(@Arg('data') { email, password }: UserSignupInput) {
    const userService = new UserService();
    const userId = await userService.signup(email, password);

    return UserService.getTokenById(userId);
  }

  @Query(() => String)
  async userLogin(@Arg('data') { email, password }: UserLoginInput) {
    const userService = new UserService();
    return userService.login(email, password);
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  async userGetCurrent(@Ctx() ctx: IContext): Promise<User> {
    const userId = ctx.user.id;

    const userService = new UserService();
    return userService.getById(userId);
  }
}
