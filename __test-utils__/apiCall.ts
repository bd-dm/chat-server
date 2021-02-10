import { graphql, GraphQLSchema } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
import { DeepPartial } from 'typeorm';

import getGraphqlSchema from '../src/api/graphql';
import { IContext } from '../src/definitions';

interface IGCallOptions {
  source: string;
  variableValues?: Maybe<{ [key: string]: any }>;
  contextValue?: DeepPartial<IContext>;
}

let schema: GraphQLSchema;

export default async ({ source, variableValues, contextValue }: IGCallOptions) => {
  if (!schema) {
    schema = await getGraphqlSchema();
  }

  return graphql({
    schema,
    source,
    variableValues,
    contextValue,
  });
};
