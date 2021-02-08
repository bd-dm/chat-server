import { makeExecutableSchema } from '@graphql-tools/schema';

import resolvers from './resolvers';
import schemas from './schemas';

export default makeExecutableSchema({ // load from a single schema file
  typeDefs: schemas,
  resolvers,
});
