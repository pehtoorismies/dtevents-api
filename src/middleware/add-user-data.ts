const fetchUser = async (
  resolve: any,
  root: any,
  args: any,
  context: any,
  info: any,
) => {
  const {
    sub,
    mongoose: { UserModel },
  } = context;

  if (!sub) {
    return new Error('Middleware error, no sub found');
  }

  const user = await UserModel.findOne({ auth0Id: sub });
  if (!user) {
    return new Error('Middleware error. No user found in db');
  }
  
  const newContext = {
    ...context,
    user,
  };
  const result = await resolve(root, args, newContext, info);
  return result;
};

const addUserData = {
  Query: {
    me: fetchUser,
  },
  Mutation: {
    createEvent: fetchUser,
    toggleJoinEvent: fetchUser,
    updateMyPreferences: fetchUser,
    updateMe: fetchUser,
  },
};

export default addUserData;
