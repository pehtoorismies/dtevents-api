import { idArg, objectType, stringArg, booleanArg, inputObjectType } from 'nexus';
import * as EmailValidator from 'email-validator';
import { contains, assoc, findIndex, propEq, remove } from 'ramda';
import { loginAuthZeroUser, createAuthZeroUser } from '../auth';
import { config } from '../config';
import { UserInputError, Auth0Error, NotFoundError } from '../errors';
import { AuthPayload } from './AuthPayload';
import { Event } from './Event';
import { SimpleUser } from '../db-schema';

interface SimpleUser {
  username: string;
  userId: string;
}

const fetchUserEmail = async (username: string, UserModel: any) => {
  const { email } = await UserModel.findOne({ 'username': username }).select({ email: 1 });
  return email;
}

const findParticipantIndex = (username: string, participants: SimpleUser[]) => {
  return findIndex(propEq('username', username))(participants);
}


const joinFunc = async (eventId: string, eventModel: any, user: SimpleUser, wantToJoin: boolean) => {
  const evt = await eventModel.findById(eventId);
  if (!evt) {
    return new NotFoundError({
      message: `Event with id ${eventId} not found`,
    });
  }

  const partIndex = findParticipantIndex(user.username, evt.participants);
  const isAlreadyParticipating = partIndex >= 0;

  if (wantToJoin && isAlreadyParticipating) {
    return evt;
  }
  if (!wantToJoin && !isAlreadyParticipating) {
    return evt;
  }

  // Add
  if (wantToJoin) {
    evt.participants.push(user);
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
      async resolve(_, { addMe, event }, { mongoose, user }) {
        const { EventModel } = mongoose;

        const eventWithCreator = {
          ...event,
          creator: user,
        }

        const withMe = addMe ? assoc('participants', [user], eventWithCreator) : eventWithCreator

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

    t.field('joinEvent', {
      type: Event,
      args: {
        eventId: idArg({ required: true }),
      },
      resolve: async (_, { eventId }, { mongoose, user }) => {
        const { EventModel } = mongoose;
        return await joinFunc(eventId, EventModel, user, true);
      }
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
