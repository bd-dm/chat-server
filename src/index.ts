/* eslint-disable import/first */
require('dotenv').config();
/* eslint-disable import/first */
import moduleAlias from 'module-alias';
/* eslint-disable import/first */
moduleAlias.addAlias('@', __dirname);

import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createConnection } from 'typeorm';

import graphql from '@/api/graphql';

import * as entities from '@/entities';
import * as middlewares from '@/middlewares';

createConnection({
  type: 'postgres',
  host: process.env.PGHOST,
  port: +process.env.PGPORT,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  entities: Object.values(entities),
  synchronize: true,
  logging: false,
})
  .then(() => {
    console.log('Successfully connected to DB');

    const app = express();
    const server = new ApolloServer({ schema: graphql });

    app.set('host', process.env.HOST);
    app.set('port', +process.env.PORT);

    app.use(helmet());
    app.use(cors());

    server.applyMiddleware({ app, path: '/graphql' });

    app.use('/*', middlewares.notfound());

    app.use(middlewares.error());

    app.listen(app.get('port'), () => {
      console.log(`Successfully loaded. Listening on ${app.get('port')}`);
    });
  })
  .catch((e) => {
    console.error(e);
  });
