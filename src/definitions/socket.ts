import { Socket } from 'socket.io';

import { User } from '@/entities';

export enum ISocketEvents {

}

export interface IAuthorizedSocket extends Socket {
  user?: User;
}
