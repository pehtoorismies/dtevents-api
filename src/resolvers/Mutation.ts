import * as EmailValidator from 'email-validator';
import {
  booleanArg,
  idArg,
  inputObjectType,
  objectType,
  stringArg,
  arg,
} from 'nexus';
import { assoc, contains, findIndex, path, propEq, remove } from 'ramda';

import {
  createAuthZeroUser,
  loginAuthZeroUser,
  requestChangePasswordEmail,
} from '../auth';
import { config } from '../config';
import {
  Auth0Error,
  NotFoundError,
  ServerError,
  UserInputError,
} from '../errors';
import { ISimpleUser } from '../types';
import { notifyEventCreationSubscribers } from '../nofications';
import fetchOldEvents from '../event-importer/fetchOldEvents';

const fetchUserEmail = async (
  username: string,
  UserModel: any,
): Promise<string | undefined> => {
  const user = await UserModel.findOne({ username: username }).select({
    email: 1,
  });

  return path(['email'], user);
};

const findParticipantIndex = (
  username: string,
  participants: ISimpleUser[],
) => {
  return findIndex(propEq('username', username))(participants);
};

export const EventInput = inputObjectType({
  name: 'EventData',
  definition(t) {
    t.string('title', { required: true });
    t.string('subtitle');
    t.boolean('race');
    t.string('type', { required: true });
    t.string('date', { required: true });
    t.boolean('exactTime', { default: false });
    t.string('description');
  },
});

export const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: 'User',
      args: {
        email: stringArg({ required: true }),
        username: stringArg({ required: true }),
        password: stringArg({ required: true }),
        name: stringArg({ required: true }),
        registerSecret: stringArg({ required: true }),
      },
      async resolve(
        _,
        { email, username, password, name, registerSecret },
        { mongoose },
      ) {
        if (config.registerSecret !== registerSecret) {
          return new UserInputError({
            data: {
              field: 'registerSecret',
              message: 'Väärä rekisteröintikoodi',
            },
          });
        }

        if (!EmailValidator.validate(email)) {
          return new UserInputError({
            data: {
              field: 'email',
              message: 'Email väärässä muodossa',
            },
          });
        }

        if (!username) {
          return new UserInputError({
            data: {
              field: 'username',
              message: 'Käyttäjätunnus puuttuu',
            },
          });
        }
        if (!password) {
          return new UserInputError({
            data: {
              field: 'password',
              message: 'Salasana puuttuu',
            },
          });
        }

        try {
          const auth0User = await createAuthZeroUser(email, username, password);
          const { auth0UserId, error } = auth0User;
          if (error) {
            return new Auth0Error({
              data: {
                message: 'Auth0 ei voinut luoda käyttäjää',
                internalData: {
                  error,
                },
              },
            });
          }
          if (!auth0UserId) {
            return new ServerError({
              data: {
                message: 'Auth0 palautti tyhjän käyttäjän',
              },
            });
          }

          const { UserModel } = mongoose;
          const createdUser = await UserModel.create({
            email,
            username,
            password,
            name,
            auth0Id: auth0UserId,
          });

          return createdUser;
        } catch (error) {
          console.error('Error when registering');
          console.error(error);
          return new ServerError({
            data: {
              message: 'Käyttäjää ei voitu luoda',
              internalData: {
                error,
              },
            },
          });
        }
      },
    });

    t.field('login', {
      type: 'AuthPayload',
      args: {
        usernameOrEmail: stringArg({ required: true }),
        password: stringArg({ required: true }),
      },
      async resolve(_, { usernameOrEmail, password }, { mongoose }) {
        if (!usernameOrEmail) {
          throw new UserInputError({
            data: {
              field: 'usernameOrEmail',
              message: 'Käyttäjätunnus puuttuu',
            },
          });
        }
        const isEmail = contains('@', usernameOrEmail);

        if (isEmail && !EmailValidator.validate(usernameOrEmail)) {
          return new UserInputError({
            data: {
              field: 'usernameOrEmail',
              message: 'Email väärässä muodossa',
            },
          });
        }
        const { UserModel } = mongoose;

        const userEmail = isEmail
          ? usernameOrEmail
          : await fetchUserEmail(usernameOrEmail, UserModel);

        if (!userEmail) {
          return new UserInputError({
            data: {
              field: 'usernameOrEmail',
              message: 'Tarkista tunnus tai sähköposti',
            },
          });
        }

        const { user, error } = await loginAuthZeroUser(userEmail, password);
        if (error) {
          return new Auth0Error({
            data: {
              message: 'Kirjautumisvirhe',
              internalData: {
                error,
              },
            },
          });
        }
        return user;
      },
    });

    t.field('forgotPassword', {
      type: 'Boolean',
      args: {
        email: stringArg({ required: true }),
      },
      async resolve(_, { email }, { mongoose }) {
        if (!email) {
          throw new UserInputError({
            data: {
              field: 'email',
              message: 'Sähköposti puuttuu',
            },
          });
        }
        // fire and forget
        requestChangePasswordEmail(email);

        return true;
      },
    });

    t.field('updateMyPreferences', {
      type: 'User',
      args: {
        subscribeEventCreationEmail: booleanArg({ required: false }),
        subscribeWeeklyEmail: booleanArg({ required: false }),
      },
      async resolve(
        _,
        { subscribeEventCreationEmail, subscribeWeeklyEmail },
        { mongoose, user },
      ) {
        const { UserModel } = mongoose;
        const conditions = { _id: user.id };

        const update = {
          preferences: {
            subscribeEventCreationEmail,
            subscribeWeeklyEmail,
          },
        };
        const options = {
          new: true,
        };

        const res = await UserModel.findOneAndUpdate(
          conditions,
          update,
          options,
        );

        return res;
      },
    });

    t.field('createEvent', {
      type: 'Event',
      args: {
        event: arg({ type: EventInput, required: true }),
        addMe: booleanArg({ default: false }),
        notifySubscribers: booleanArg({ default: true }),
      },
      async resolve(
        _,
        { addMe, event, notifySubscribers },
        { mongoose, user }: { mongoose: any; user: ISimpleUser },
      ) {
        const { EventModel, UserModel } = mongoose;

        const eventWithCreator = {
          ...event,
          creator: user,
        };

        const withMe = addMe
          ? assoc('participants', [user], eventWithCreator)
          : eventWithCreator;

        const createdEvent = await EventModel.create(withMe);

        if (notifySubscribers) {
          notifyEventCreationSubscribers(UserModel, createdEvent);
        }

        return createdEvent;
      },
    });

    t.field('batchImport', {
      type: 'Boolean',
      args: {},
      async resolve(
        _,
        {},
        { mongoose, user }: { mongoose: any; user: ISimpleUser },
      ) {
        const { EventModel } = mongoose;

        const events = await fetchOldEvents();

        events.forEach(async evt => {
          const eventWithCreator = {
            ...evt,
            creator: user,
          };
          const e = await EventModel.create(eventWithCreator);
          console.log('Added', e.title);
        });
        return true;
      },
    });

    t.field('updateEvent', {
      type: 'Event',
      args: {
        id: idArg({ required: true }),
        event: EventInput,
      },
      async resolve(_, { event, id }, { mongoose }) {
        const { EventModel } = mongoose;
        const conditions = { _id: id };
        const update = event;
        const options = {
          new: true,
        };

        const res = await EventModel.findOneAndUpdate(
          conditions,
          update,
          options,
        );
        return res;
      },
    });

    t.field('deleteEvent', {
      type: 'IDPayload',
      args: {
        id: idArg({ required: true }),
      },
      async resolve(_, { id }, { mongoose }) {
        const { EventModel } = mongoose;
        const res = await EventModel.deleteOne({ _id: id });

        const { deletedCount } = res;
        if (deletedCount === 1) {
          return { id };
        }
        return new NotFoundError({
          message: `Delete failed. Event with id ${id} not found`,
        });
      },
    });

    t.field('toggleJoinEvent', {
      type: 'Event',
      args: {
        id: idArg({ required: true }),
      },
      resolve: async (_, { id }, { mongoose, user }) => {
        const { EventModel } = mongoose;
        const evt = await EventModel.findById(id);

        if (!evt) {
          return new NotFoundError({
            message: `Event with id ${id} not found`,
          });
        }

        const partIndex = findParticipantIndex(user.username, evt.participants);

        const isAlreadyParticipating = partIndex >= 0;
        if (isAlreadyParticipating) {
          const reducedParts = remove(partIndex, 1, evt.participants);
          evt.participants = reducedParts;
          const updated = await evt.save();
          return updated;
        } else {
          evt.participants.push({
            username: user.username,
            _id: user.id,
          });
          const updated = await evt.save();
          return updated;
        }
      },
    });
  },
});
