import '../dotenv';
import '../alias';
import 'reflect-metadata';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import { createConnection } from 'typeorm';

import initApolloServer from '@/api/apollo';
import SocketServer from '@/api/sockets';

import * as middlewares from '@/middlewares';

const main = async () => {
  const connection = await createConnection();
  console.log(`Successfully connected to DB ${connection.name}`);

  const app = express();
  const httpServer = createServer(app);

  app.set('host', process.env.HOST);
  app.set('port', +process.env.PORT);

  app.use(helmet());
  app.use(cors());

  await initApolloServer(app);
  SocketServer.init(httpServer);

  app.use('/*', middlewares.notfound());
  app.use(middlewares.error());

  httpServer.listen(app.get('port'), () => {
    console.log(`Successfully loaded. Listening on http://${app.get('host')}:${app.get('port')}`);
  });
};

main().then();
