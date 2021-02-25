import './alias';

import * as fs from 'fs';
import { printSchema } from 'graphql';

import getGraphqlSchema from './src/api/graphql';

(async () => {
  const schema = await getGraphqlSchema();
  const sdl = printSchema(schema);
  await fs.writeFileSync(`${__dirname}/src/_generated/schema.graphql`, sdl);
})();
