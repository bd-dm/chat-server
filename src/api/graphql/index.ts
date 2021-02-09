import { GraphQLSchema } from 'graphql';
import path from 'path';
import { buildSchema } from 'type-graphql';
import { NonEmptyArray } from 'type-graphql/dist/interfaces/NonEmptyArray';

import { loadFilesSync } from '@graphql-tools/load-files';

const resolvers = loadFilesSync(
  path.join(__dirname, './resolvers'),
  { recursive: true },
) as NonEmptyArray<Function> | NonEmptyArray<string>;

export default (): Promise<GraphQLSchema> => buildSchema({
  resolvers,
});
