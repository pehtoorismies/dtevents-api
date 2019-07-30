import {  mutationType, stringArg } from '@prisma/nexus';
import { loginAuthZeroUser } from '../auth';
// import { APP_SECRET, getUserId } from '../utils'

export const Mutation = mutationType({
  definition(t) {
    t.field('login', {
      type: 'AuthPayload',
      args: {
        username: stringArg(),
        password: stringArg(),
      },
      resolve: async (_, { username, password }, ctx) => {
        console.log('username', username)
        try {
          const authZeroUser = await loginAuthZeroUser(username, password);
          console.log('stuff coming out', authZeroUser)
          return authZeroUser;
        } catch (error) {
          console.error(error);
          return new Error();
        }
      },
    });
  },
});
