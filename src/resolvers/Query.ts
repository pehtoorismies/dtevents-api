import { objectType } from '@prisma/nexus';

export const Query = objectType({
  name: 'Query',
  description: 'Queries',
  definition(t) {
    // TODO: fix readiness
    t.field('readiness', {
      type: 'Boolean',
      resolve: (_, { }, ctx) => {
        return true;
      },
    });
    t.field('liveness', {
      type: 'Boolean',
      resolve: (_, { }, ctx) => {
        return true;
      },
    });
    t.crud.findManyEvent({
      alias: 'allEvents',
    });
    t.crud.findOneEvent({
      alias: 'event',
    });
    t.crud.findManyUser({
      alias: 'allUsers',
    });
    t.crud.findOneUser({
      alias: 'user',
    });
  },
});
