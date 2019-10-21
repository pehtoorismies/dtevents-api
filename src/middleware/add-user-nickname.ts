import { fetchNickname } from '../auth';

const fetchUser = async (
  resolve: any,
  root: any,
  args: any,
  context: any,
  info: any,
) => {
  const { sub, nickname } = context;

  if (!sub) {
    return new Error('Middleware error, no sub found');
  }

  if (nickname) {
    return resolve(root, args, context, info);
  }

  // TODO: remove when everybody has nick in access token
  const nName = await fetchNickname(sub);
  const newContext = {
    ...context,
    nickname: nName,
  };
  const result = await resolve(root, args, newContext, info);
  return result;
};

const addUserNickname = {
  Mutation: {
    createEvent: fetchUser,
    toggleJoinEvent: fetchUser,
  },
};

export { addUserNickname };
