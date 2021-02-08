import { MutationResolvers } from '@/generated/graphqlTypes';

const signup: MutationResolvers['authSignup'] = async (
  root,
  args,
  ctx,
) => ({
  token: '123123',
});

export default signup;
