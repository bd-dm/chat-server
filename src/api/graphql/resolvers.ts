import authSignup from '@/api/graphql/resolvers/auth/signup';

import { IResolvers } from '@graphql-tools/utils';

const resolvers: IResolvers = {
  Query: {
  },
  Mutation: {
    // AUTH
    authSignup,
  },
};

export default resolvers;
