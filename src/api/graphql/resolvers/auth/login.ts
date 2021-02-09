import {
  Arg, Field, InputType, Query, Resolver,
} from 'type-graphql';

import UserService from '@/services/UserService';

@InputType()
class AuthLoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@Resolver()
export default class AuthLoginResolver {
  @Query(() => String)
  async login(@Arg('data') { email, password }: AuthLoginInput) {
    const userService = new UserService();
    return userService.login(email, password);
  }
}
