import { mutationType, stringArg, idArg } from '@prisma/nexus';
import { loginAuthZeroUser, createAuthZeroUser } from '../auth';
import { config } from '../config';
import { UserInputError, Auth0Error } from '../errors';

export const Mutation = mutationType({
  definition(t) {
    t.crud.createOneEvent({
      alias: 'createEvent',
    });
    t.crud.updateOneEvent({
      alias: 'updateEvent',
    });
    t.crud.deleteOneEvent({
      alias: 'deleteEvent',
    });
    // Prevent duplicate joins
    t.field('joinEvent', {
      type: 'Event',
      args: {
        eventId: idArg(),
        username: stringArg(),
      },
      resolve: (_, { eventId, username }, ctx) => {
        return ctx.photon.events.update({
          where: { id: eventId },
          data: {
            participants: {
              connect: { username },
            },
          },
        });
      },
    });

    t.field('unjoinEvent', {
      type: 'Event',
      args: {
        eventId: idArg(),
        username: stringArg(),
      },
      resolve: (_, { eventId, username }, ctx) => {
        return ctx.photon.events.update({
          where: { id: eventId },
          data: {
            participants: {
              disconnect: { username },
            },
          },
        });
      },
    });

    t.field('login', {
      type: 'AuthPayload',
      args: {
        username: stringArg(),
        password: stringArg(),
      },
      resolve: async (_, { username, password }, ctx) => {
        try {
          if (!username || !password) {
            return new Auth0Error();
          }
          
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

          if (!email || !username || !password) {
            return new Auth0Error();
          }
          const auth0User = await createAuthZeroUser(email, username, password);

          if (!auth0User) {
            return new Auth0Error();
          }
          const { user_id: auth0Id } = auth0User;

          if (!auth0Id) {
            return new Auth0Error();
          }

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
          return new Auth0Error();
        }
      },
    });
  },
});
