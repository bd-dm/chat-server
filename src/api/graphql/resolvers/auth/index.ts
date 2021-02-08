import { IResolvers } from '@graphql-tools/utils';

import signup from './signup';

const resolvers: IResolvers = {
  Query: {
  },
  Mutation: {
    authSignup: signup,
  },
};

export default resolvers;
