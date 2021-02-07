import path from 'path';

import resolvers from '@/api/graphql/resolvers';

import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';

export default loadSchemaSync(path.resolve(__dirname, 'schema.graphql'), { // load from a single schema file
  loaders: [
    new GraphQLFileLoader(),
  ],
  resolvers,
});
