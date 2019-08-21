import { idArg, objectType, stringArg, booleanArg, inputObjectType } from 'nexus';
import * as EmailValidator from 'email-validator';
import { contains, assoc } from 'ramda';
import { loginAuthZeroUser, createAuthZeroUser, fetchAuth0Subject } from '../auth';
import { config } from '../config';
import { UserInputError, Auth0Error } from '../errors';
import { AuthPayload } from './AuthPayload';
import { Event } from './Event';

const fetchUserEmail = async (username: string, UserModel: any) => {
  const { email } = await UserModel.findOne({ 'username': username }).select({ email: 1 });
  return email;
}

export const EventInput = inputObjectType({
  name: 'EventData',
  definition(t) {
    t.string('title', { required: true });
    t.string('subtitle');
    t.boolean('race')
    t.string('type', { required: true });
    t.string('date', { required: true });
    t.string('time')
    t.string('description')
  },
});


export const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.field("signup", {
      type: "User",
      args: {
        email: stringArg({ required: true }),
        username: stringArg({ required: true }),
        password: stringArg({ required: true }),
        name: stringArg({ required: true }),
        registerSecret: stringArg({ required: true }),
      },
      async resolve(_, { email, username, password, name, registerSecret }, { mongoose }) {
        if (config.registerSecret !== registerSecret) {
          return new UserInputError({
            data: {
              registerSecret: 'Väärä rekisteröintikoodi',
            },
          });
        }

        if (!EmailValidator.validate(email)) {
          return new UserInputError({
            data: {
              email: 'Email väärässä muodossa',
            },
          });
        }

        if (!username || !password) {
          return new UserInputError({
            data: {
              msg: 'Puuttuvia arvoja',
            },
          });
        }
        const auth0User = await createAuthZeroUser(email, username, password);

        if (!auth0User) {
          return new Auth0Error({
            data: {
              msg: 'Auth0 ei voinut luoda käyttäjää',
            },
          });
        }
        const { user_id: auth0Id } = auth0User;
        const { UserModel } = mongoose;
        const createdUser = await UserModel.create({ email, username, password, name, auth0Id });

        return createdUser;
      },
    });

    t.field('login', {
      type: AuthPayload,
      args: {
        usernameOrEmail: stringArg({ required: true }),
        password: stringArg({ required: true }),
      },
      async resolve(_, { usernameOrEmail, password }, { mongoose }) {
        if (!usernameOrEmail) {
          throw new UserInputError({
            data: {
              usernameOrEmail: 'Käyttäjätunnus puuttuu,'
            },
          })
        }
        const isEmail = contains('@', usernameOrEmail);
        if (isEmail && !EmailValidator.validate(usernameOrEmail)) {
          return new UserInputError({
            data: {
              email: 'Email väärässä muodossa',
            },
          });
        }
        const { UserModel } = mongoose;

        const userEmail = isEmail ? usernameOrEmail : await fetchUserEmail(usernameOrEmail, UserModel);

        const authZeroUser = await loginAuthZeroUser(userEmail, password);
        return authZeroUser;

      },
    });

    t.field('createEvent', {
      type: Event,
      args: {
        event: EventInput,
        addMe: booleanArg({ default: false }),
      },
      async resolve(_, { addMe, event }, { mongoose, accessToken }) {
        const { EventModel, UserModel } = mongoose;
        const sub = await fetchAuth0Subject(accessToken);
        console.log('sub', sub);
        if (!sub) {
          return new Auth0Error({
            message: 'No userinfo available',
          })
        }


        const user = await UserModel.findOne({ auth0Id: sub })
        if (!user) {
          return new Error('No user found in db');
        }

        const me = {
          username: user.username,
          userId: user.id,
        }

        const eventWithCreator = {
          ...event,
          creator: me,
        }

        const withMe = addMe ? assoc('participants', [me], eventWithCreator) : eventWithCreator

        return EventModel.create(withMe);
      }
    });

    t.field('deleteEvent', {
      type: 'Boolean',
      args: {
        id: idArg({ required: true }),
      },
      async resolve(_, { id }, { mongoose }) {
        const { EventModel } = mongoose;
        const res = await EventModel.deleteOne({ _id: id });
        const { deletedCount } = res;
        return deletedCount === 1;
      }
    })

    // t.crud.updateOneEvent({
    //   alias: 'updateEvent',
    // });
    // t.crud.deleteOneEvent({
    //   alias: 'deleteEvent',
    // });
    // Prevent duplicate joins
    // t.field('joinEvent', {
    //   type: 'Event',
    //   args: {
    //     eventId: idArg(),
    //     username: stringArg(),
    //   },
    //   resolve: (_, { eventId, username }, ctx) => {
    //     return ctx.photon.events.update({
    //       where: { id: eventId },
    //       data: {
    //         participants: {
    //           connect: { username },
    //         },
    //       },
    //     });
    //   },
    // });

    // t.field('unjoinEvent', {
    //   type: 'Event',
    //   args: {
    //     eventId: idArg(),
    //     username: stringArg(),
    //   },
    //   resolve: (_, { eventId, username }, ctx) => {
    //     return ctx.photon.events.update({
    //       where: { id: eventId },
    //       data: {
    //         participants: {
    //           disconnect: { username },
    //         },
    //       },
    //     });
    //   },
    // });




    // });
  },
});
