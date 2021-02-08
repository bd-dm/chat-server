import { mergeResolvers } from '@graphql-tools/merge';

import auth from './resolvers/auth';

const resolvers = [
  auth,
];

export default mergeResolvers(resolvers);
