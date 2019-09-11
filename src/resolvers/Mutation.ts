import * as EmailValidator from 'email-validator';

import { Auth0Error, NotFoundError, UserInputError } from '../errors';
import { assoc, contains, findIndex, propEq, remove } from 'ramda';
import {
  booleanArg,
  idArg,
  inputObjectType,
  objectType,
  stringArg,
} from 'nexus';
import { createAuthZeroUser, loginAuthZeroUser } from '../auth';

import { AuthPayload } from './AuthPayload';
import { Event } from './Event';
import { ISimpleUser } from '../types';
import { config } from '../config';

const fetchUserEmail = async (username: string, UserModel: any) => {
  const user = await UserModel.findOne({ username: username }).select({
    email: 1,
  });
  if (!user) {
    throw new NotFoundError({ message: `No user found '${username}` });
  }
  return user.email;
};

const findParticipantIndex = (username: string, participants: ISimpleUser[]) => {
  return findIndex(propEq('username', username))(participants);
};

const joinFunc = async (
  eventId: string,
  eventModel: any,
  user: any,// TODO: fixme
  wantToJoin: boolean,
) => {
  const evt = await eventModel.findById(eventId);
  if (!evt) {
    return new NotFoundError({
      message: `Event with id ${eventId} not found`,
    });
  }

  const simpleUser = {
    userId: user.id,
    username: user.user.username
  }

  const partIndex = findParticipantIndex(simpleUser.username, evt.participants);
  const isAlreadyParticipating = partIndex >= 0;

  if (wantToJoin && isAlreadyParticipating) {
    return evt;
  }
  if (!wantToJoin && !isAlreadyParticipating) {
    return evt;
  }

  // Add
  if (wantToJoin) {
    evt.participants.push(simpleUser);
    const updated = await evt.save();
    return updated;
  }

  // Remove
  const reducedParts = remove(partIndex, 1, evt.participants);
  evt.participants = reducedParts;
  const updated = await evt.save();
  return updated;
};

export const EventInput = inputObjectType({
  name: 'EventData',
  definition(t) {
    t.string('title', { required: true });
    t.string('subtitle');
    t.boolean('race');
    t.string('type', { required: true });
    t.string('date', { required: true });
    t.string('time');
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
        const createdUser = await UserModel.create({
          email,
          username,
          password,
          name,
          auth0Id,
        });

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
              field: 'usernameOrEmail',
              message: 'Käyttäjätunnus puuttuu',
            },
          });
        }
        const isEmail = contains('@', usernameOrEmail);
        console.log('isEmail', isEmail);
        console.log('validate', !EmailValidator.validate(usernameOrEmail))
        if (isEmail && !EmailValidator.validate(usernameOrEmail)) {
          return new UserInputError({
            data: {
              field: 'email',
              message: 'Email väärässä muodossa',
            },
          });
        }
        const { UserModel } = mongoose;

        const userEmail = isEmail
          ? usernameOrEmail
          : await fetchUserEmail(usernameOrEmail, UserModel);
        try {
          const authZeroUser = await loginAuthZeroUser(userEmail, password);
          return authZeroUser;
        } catch (error) {
          const errorMsg = JSON.parse(error.message);
          console.log(errorMsg)
          return new Auth0Error({
            data: {
              message: errorMsg.error_description,
            },
          });
        }
      },
    });

    t.field('createEvent', {
      type: Event,
      args: {
        event: EventInput,
        addMe: booleanArg({ default: false }),
      },
      async resolve(_, { addMe, event }, { mongoose, user }) {
        const { EventModel } = mongoose;

        const eventWithCreator = {
          ...event,
          creator: user,
        };

        const withMe = addMe
          ? assoc('participants', [user], eventWithCreator)
          : eventWithCreator;

        return EventModel.create(withMe);
      },
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
      },
    });

    t.field('joinEvent', {
      type: Event,
      args: {
        eventId: idArg({ required: true }),
      },
      resolve: async (_, { eventId }, { mongoose, user }) => {
        const { EventModel } = mongoose;
        return await joinFunc(eventId, EventModel, user, true);
      },
    });

    t.field('unjoinEvent', {
      type: Event,
      args: {
        eventId: idArg({ required: true }),
      },
      resolve: async (_, { eventId }, { mongoose, user }) => {
        const { EventModel } = mongoose;
        return await joinFunc(eventId, EventModel, user, false);
      },
    });
  },
});
