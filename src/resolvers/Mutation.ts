import * as EmailValidator from 'email-validator';
import {
  arg,
  booleanArg,
  idArg,
  inputObjectType,
  objectType,
  stringArg,
} from 'nexus';
import { assoc, contains, findIndex, propEq, remove } from 'ramda';

import {
  createAuth0User,
  loginAuth0User,
  requestChangePasswordEmail,
  updatePreferences,
  updateUserProfiles,
  updateProfile,
} from '../auth';
import { config } from '../config';
import { Auth0Error, NotFoundError, UserInputError } from '../errors';
import { notifyEventCreationSubscribers } from '../nofications';
import { IAuth0Profile, ISimpleUser } from '../types';
import { filterUndefined } from '../util';

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

const createInputError = (
  isValid: boolean,
  errorField: string,
  errorMessage: string,
): any | undefined => {
  if (!isValid) {
    return new UserInputError({
      data: {
        field: errorField,
        message: errorMessage,
      },
    });
  }
};

export const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: 'Boolean',
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
        // Check input
        const errRegisterSecret = createInputError(
          config.registerSecret === registerSecret,
          'registerSecret',
          'Väärä rekisteröintikoodi',
        );
        if (errRegisterSecret) {
          return errRegisterSecret;
        }
        const errEmail = createInputError(
          EmailValidator.validate(email),
          'email',
          'Email väärässä muodossa',
        );
        if (errEmail) {
          return errEmail;
        }
        const errUsername = createInputError(
          !!username,
          'username',
          'Käyttäjätunnus puuttuu',
        );
        if (errUsername) {
          return errUsername;
        }
        const errPassword = createInputError(
          !!password,
          'password',
          'Salasana puuttuu',
        );
        if (errPassword) {
          return errPassword;
        }
        try {
          const resp = await createAuth0User({
            email,
            username,
            password,
            name,
          });
          console.log('Created auth0 user: ', resp.auth0UserId);
          return true;
        } catch (error) {
          return new Auth0Error({
            data: {
              message: error.response.data.message,
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

        try {
          const tokens = await loginAuth0User(usernameOrEmail, password);
          return tokens;
        } catch (error) {
          return new Auth0Error({
            data: {
              message: 'Kirjautumisvirhe',
              internalData: {
                error,
              },
            },
          });
        }
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

    t.field('updateMe', {
      type: 'User',
      args: {
        name: stringArg({ required: false }),
        username: stringArg({ required: false }),
        nickname: stringArg({ required: false }),
      },
      async resolve(_, { name, username, nickname }, { mongoose, sub }) {
        // const { UserModel, EventModel } = mongoose;
        const updatetable = filterUndefined({
          name,
          username,
          nickname,
        });

        const auth0User: IAuth0Profile = await updateProfile(
          sub,
          updatetable,
        );
        return {
          ...auth0User,
          auth0Id: sub,
        } 

        // TODO: update events if nickchanges...

        // const options = {
        //   new: true,
        // };

        // const updatedUser = await UserModel.findOneAndUpdate(
        //   conditions,
        //   updatetable,
        //   options,
        // );

        // if (!username || oldUsername === username) {
        //   return updatedUser;
        // }

        // // update events
        // await EventModel.updateMany(
        //   { 'participants.username': oldUsername },
        //   { $set: { username: username } },
        // );
        // await EventModel.updateMany(
        //   { 'creator.username': oldUsername },
        //   { $set: { 'creator.username': username } },
        // );
        // return updatedUser;
      },
    });

    t.field('updateMyPreferences', {
      type: 'User',
      args: {
        subscribeEventCreationEmail: booleanArg({ required: true }),
        subscribeWeeklyEmail: booleanArg({ required: true }),
      },
      async resolve(
        _,
        { subscribeEventCreationEmail, subscribeWeeklyEmail },
        { sub },
      ) {
        const auth0User: IAuth0Profile = await updatePreferences(sub, {
          subscribeEventCreationEmail,
          subscribeWeeklyEmail,
        });

        return {
          ...auth0User,
          auth0Id: sub,
        };
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
        {
          mongoose,
          sub,
          nickname,
        }: { mongoose: any; sub: string; nickname: string },
      ) {
        const { EventModel, UserModel } = mongoose;

        const user = {
          sub,
          nickname,
        };

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
      resolve: async (_, { id }, { mongoose, sub, nickname }) => {
        const { EventModel } = mongoose;
        const evt = await EventModel.findById(id);

        if (!evt) {
          return new NotFoundError({
            message: `Event with id ${id} not found`,
          });
        }

        const user = {
          id: sub,
          username: nickname,
        };

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

    t.field('updateAuth0Users', {
      type: 'Boolean',
      args: {},
      resolve: async (_, {}, { mongoose }) => {
        const { UserModel } = mongoose;
        const users = await UserModel.find();
        try {
          await updateUserProfiles(users);
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },
    });
  },
});
