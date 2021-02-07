import * as fs from 'fs';

import { MutationResolvers } from '../../../../generated/graphqlTypes';

const authSignup: MutationResolvers['authSignup'] = async (
  root,
  args,
  ctx,
) => {
  fs.readFileSync('/does/not/exist');

  return {
    token: '123123',
  };
};

export default authSignup;
