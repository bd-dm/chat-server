import { Query, Resolver } from 'type-graphql';

@Resolver()
export default class AuthResolver {
  @Query(() => String)
  async logIn() {
    console.log('123');
  }
}
