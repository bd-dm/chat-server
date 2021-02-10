import '../dotenv';
import '../alias';
import 'reflect-metadata';

import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import expressJwt from 'express-jwt';
import helmet from 'helmet';
import { createConnection } from 'typeorm';

import getGraphqlSchema from '@/api/graphql';

import serverConfig from '@/configs/serverConfig';

import * as middlewares from '@/middlewares';

const main = async () => {
  const connection = await createConnection();
  console.log(`Successfully connected to DB ${connection.name}`);

  const app = express();
  const schema = await getGraphqlSchema();
  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({
      req,
      user: req.user,
    }),
  });
  const serverPath = '/graphql';

  app.set('host', process.env.HOST);
  app.set('port', +process.env.PORT);

  app.use(helmet());
  app.use(cors());

  app.use(serverPath, expressJwt({
    secret: serverConfig.jwtAuthSecret,
    algorithms: ['HS256'],
    credentialsRequired: false,
  }));

  server.applyMiddleware({ app, path: serverPath });

  app.use('/*', middlewares.notfound());

  app.use(middlewares.error());

  app.listen(app.get('port'), () => {
    console.log(`Successfully loaded. Listening on http://${app.get('host')}:${app.get('port')}`);
  });
};

main();
