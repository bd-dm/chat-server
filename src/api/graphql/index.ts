import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';

import AuthResolver from '@/api/graphql/resolvers/auth';

export default (): Promise<GraphQLSchema> => buildSchema({
  resolvers: [
    AuthResolver,
  ],
});
