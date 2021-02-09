import {
  Arg, Field, InputType, Query, Resolver,
} from 'type-graphql';

import UserService from '@/services/UserService';

@InputType()
class UserLoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@Resolver()
export default class UserLoginResolver {
  @Query(() => String)
  async login(@Arg('data') { email, password }: UserLoginInput) {
    const userService = new UserService();
    return userService.login(email, password);
  }
}
