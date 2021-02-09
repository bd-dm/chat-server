import { Request } from 'express';

import { User } from '@/entities';
import errors from '@/errors';

export type IServerErrorCode = keyof (typeof errors);

export interface IContext {
  req: Request;
  user: {
    id: User['id'],
    iat: number,
  },
}
