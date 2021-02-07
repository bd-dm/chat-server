import * as entities from './src/entities';

export default {
  type: 'postgres',
  host: process.env.PGHOST,
  port: +process.env.PGPORT,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  entities: Object.values(entities),
  synchronize: true,
  logging: false,
};
