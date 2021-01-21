import { RequestHandler } from 'express';

import { ServerError } from '@/utils';

export const notfound = (): RequestHandler =>
  (req, res, next) =>
    next(new ServerError(1));
