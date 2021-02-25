import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import expressJwt from 'express-jwt';

import getGraphqlSchema from '@/api/graphql';

import serverConfig from '@/configs/serverConfig';

export default async function initApolloServer(app: express.Application) {
  const schema = await getGraphqlSchema();
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }) => ({
      req,
      user: req.user,
    }),
  });
  const serverPath = '/graphql';

  app.use(serverPath, expressJwt({
    secret: serverConfig.jwtAuthSecret,
    algorithms: ['HS256'],
    credentialsRequired: false,
  }));

  apolloServer.applyMiddleware({ app, path: serverPath });
}
