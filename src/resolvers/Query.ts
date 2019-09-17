import { idArg, intArg, objectType } from 'nexus';

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
        const events = await EventModel.find({ date: { $gte: new Date() } })
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
        return event;
      },
    });

    t.field('me', {
      type: 'User',
      async resolve(_, __, { user }) {
        return user;
      },
    });
  },
});
