import { createConnection } from 'typeorm';

export default (dropSchema: boolean = true) => createConnection({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  username: 'chat_test_user',
  password: '1234',
  database: 'chat_test',
  entities: [`${__dirname}/../src/entities/**/*.ts`],
  synchronize: dropSchema,
  dropSchema,
});
