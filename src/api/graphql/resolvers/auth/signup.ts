import { MinLength } from 'class-validator';
import { GraphQLEmail } from 'graphql-custom-types';
import {
  Args,
  ArgsType,
  Field,
  Mutation,
  Resolver,
} from 'type-graphql';

import UserService from '@/services/UserService';

@ArgsType()
class AuthSignupArgs {
  @Field(() => GraphQLEmail)
  email: string;

  @Field(() => String)
  @MinLength(6)
  password: string;
}

@Resolver()
export default class AuthSignupResolver {
  @Mutation(() => String)
  async signup(@Args() args: AuthSignupArgs) {
    const userService = new UserService();
    const userId = await userService.signup(args.email, args.password);

    return 'success';
  }
}
