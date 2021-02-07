import { IResolvers } from '@graphql-tools/utils';

const resolvers: IResolvers = {
  Query: {
    books: () => [{ title: 'title', author: 'author' }],
  },
};

export default resolvers;
