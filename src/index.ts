/* eslint-disable import/first */
require('dotenv').config();

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import moduleAlias from 'module-alias';
import { createConnection } from 'typeorm';

moduleAlias.addAlias('@', __dirname);

import api from '@/api';
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

    app.set('host', process.env.HOST);
    app.set('port', +process.env.PORT);

    app.use(helmet());
    app.use(cors());

    app.use('/api', api);

    app.use('/*', middlewares.notfound());

    app.use(middlewares.error());

    app.listen(app.get('port'), () => {
      console.log(`Successfully loaded. Listening on ${app.get('port')}`);
    });
  })
  .catch((e) => {
    console.error(e);
  });
