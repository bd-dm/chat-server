import { RequestHandler } from 'express';

import { ServerError } from '@/lib/utils';

export const notfound = (): RequestHandler =>
  (req, res, next) =>
    next(new ServerError(1));
