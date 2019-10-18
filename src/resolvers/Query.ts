import startOfToday from 'date-fns/startOfToday';
import { idArg, intArg, objectType } from 'nexus';

import { fetchUsers, fetchMyProfile } from '../auth';
import { NotFoundError } from '../errors';
import { notifyWeeklySubscribers } from '../nofications';
import { IAuth0Profile } from '../types'

export const Query = objectType({
  name: 'Query',
  description: 'Queries',
  definition(t) {
    // TODO: fix readiness
    t.field('readiness', {
      type: 'Boolean',
      resolve: (_, {}, ctx) => {
        return true;
      },
    });
    t.field('liveness', {
      type: 'Boolean',
      resolve: (_, {}, ctx) => {
        return true;
      },
    });

    t.list.field('findManyEvents', {
      type: 'Event',
      args: {
        limit: intArg({ default: 0 }),
      },
      async resolve(_, { limit = 0 }, { mongoose }) {
        const { EventModel } = mongoose;

        const events = await EventModel.find({ date: { $gte: startOfToday() } })
          .sort('date')
          .limit(limit);

        return events;
      },
    });

    t.field('findEvent', {
      type: 'Event',
      args: {
        id: idArg({ required: true }),
      },
      async resolve(_, { id }, { mongoose }) {
        const { EventModel } = mongoose;
        const event = await EventModel.findById(id);
        if (!event) {
          return new NotFoundError({
            message: `Event with id ${id} not found`,
          });
        }
        return event;
      },
    });

    t.list.field('users', {
      type: 'BaseUser',
      async resolve() {
        const users = await fetchUsers();
        return users;
      },
    });

    t.field('me', {
      type: 'User',
      async resolve(_, __, { sub }) {
        
        const me : IAuth0Profile = await fetchMyProfile(sub);
        return {
          ...me,
          auth0Id: sub,
        };
      },
    });

    t.field('sendWeeklyEmail', {
      type: 'Boolean',
      async resolve(_, __, { mongoose }) {
        const { EventModel, UserModel } = mongoose;
        notifyWeeklySubscribers(UserModel, EventModel);
        return true;
      },
    });
  },
});
