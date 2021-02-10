import { AuthChecker } from 'type-graphql';

import UserService from '@/services/UserService';

import { IContext } from '@/definitions';

export const authChecker: AuthChecker<IContext> = async ({ context }) => {
  if (!context?.user) {
    return false;
  }

  const userService = new UserService();
  const user = await userService.getById(context.user.id);

  return !!user;
};
