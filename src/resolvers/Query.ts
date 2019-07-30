import { objectType } from '@prisma/nexus';

export const Query = objectType({
  name: 'Query',
  description: 'Queries',
  definition(t) {
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
