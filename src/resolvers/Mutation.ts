import { mutationType, stringArg } from '@prisma/nexus';
import { loginAuthZeroUser, createAuthZeroUser } from '../auth';
import { config } from '../config';
import { UserInputError, Auth0Error } from '../errors';

export const Mutation = mutationType({
  definition(t) {
    t.field('login', {
      type: 'AuthPayload',
      args: {
        username: stringArg(),
        password: stringArg(),
      },
      resolve: async (_, { username, password }, ctx) => {
        try {
          const authZeroUser = await loginAuthZeroUser(username, password);

          return authZeroUser;
        } catch (error) {
          console.error(error);
          return new Auth0Error();
        }
      },
    });

    t.field('signup', {
      type: 'User',
      args: {
        email: stringArg(),
        username: stringArg(),
        password: stringArg(),
        name: stringArg({ nullable: true }),
        registerSecret: stringArg(),
      },
      resolve: async (
        _,
        { email, username, password, name, registerSecret },
        ctx,
      ) => {
        try {
          if (config.registerSecret !== registerSecret) {
            return new UserInputError({
              data: {
                registerSecret: 'Väärä rekisteröintikoodi',
              },
            });
          }
          console.log('Create', email, username);
          const auth0User = await createAuthZeroUser(email, username, password);
          console.log('stuff coming out', auth0User);

          if (!auth0User) {
            return new Auth0Error();
          }
          const { user_id: auth0Id } = auth0User;

          const user = await ctx.photon.users.create({
            data: {
              name,
              email,
              username,
              auth0Id,
            },
          });

          return user;
        } catch (error) {
          console.error(error);
          return new Error();
        }
      },
    });
  },
});
