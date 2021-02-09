module.exports = {
  type: 'postgres',
  host: process.env.PGHOST,
  port: +process.env.PGPORT,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  entities: ['src/entities/**/*.ts'],
  synchronize: true,
  logging: false,
};
