import { IsEmail, MinLength } from 'class-validator';
import {
  Arg, Field, InputType, Mutation, Resolver,
} from 'type-graphql';

import UserService from '@/services/UserService';

@InputType()
class AuthSignupInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;
}

@Resolver()
export default class AuthSignupResolver {
  @Mutation(() => String)
  async signup(@Arg('data') { email, password }: AuthSignupInput) {
    const userService = new UserService();
    const userId = await userService.signup(email, password);

    return UserService.getTokenById(userId);
  }
}
