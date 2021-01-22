import resolvers from '@/api/resolvers';
import typeDefs from '@/api/typeDefs';

import { makeExecutableSchema } from '@graphql-tools/schema';

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
