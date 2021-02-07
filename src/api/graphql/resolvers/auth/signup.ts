import { MutationResolvers } from '../../../../../generated/graphqlTypes';

const authSignup: MutationResolvers['authSignup'] = async (
  root,
  args,
  ctx,
) => {
  console.log('login is', args.userData.login);
  console.log('ctx', ctx);

  return {
    token: '123123',
  };
};

export default authSignup;
