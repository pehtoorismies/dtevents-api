import { objectType } from '@prisma/nexus';

export const Event = objectType({
  name: 'Event',
  definition(t) {
    t.model.id();
    t.model.date();
    t.model.createdAt();
    t.model.updatedAt();
    t.model.title();
    t.model.subtitle();
    t.model.type();
    t.model.race();
    t.model.date();
    t.model.time();
    t.model.address();
    t.model.description();
    t.model.participants();
  },
});
