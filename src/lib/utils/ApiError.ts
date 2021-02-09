import { ApolloError } from 'apollo-server-express';

import { ServerError } from '@/lib/utils/ServerError';

export default class ApiError {
  static fromServerError(e: ServerError) {
    return new ApolloError(e.message, e.code.toString());
  }
}
