import { IsEmail, MinLength } from 'class-validator';
import {
  Arg, Field, InputType, Mutation, Resolver,
} from 'type-graphql';

import UserService from '@/services/UserService';

@InputType()
class UserSignupInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;
}

@Resolver()
export default class UserSignupResolver {
  @Mutation(() => String)
  async signup(@Arg('data') { email, password }: UserSignupInput) {
    const userService = new UserService();
    const userId = await userService.signup(email, password);

    return UserService.getTokenById(userId);
  }
}
