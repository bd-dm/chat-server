import { Socket } from 'socket.io';

import { User } from '@/entities';

export enum ISocketEvents {
  CHAT_NEW_MESSAGE = 'CHAT_NEW_MESSAGE',
}

export interface IAuthorizedSocket extends Socket {
  user?: User;
}
