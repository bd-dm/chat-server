import { MinLength } from 'class-validator';
import { GraphQLEmail } from 'graphql-custom-types';
import {
  Args,
  ArgsType,
  Field,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';

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
  @Query(() => String)
  async stub() {
    return 'stub';
  }

  @Mutation(() => String)
  async signup(@Args() args: AuthSignupArgs) {
    return 'success';
  }
}
