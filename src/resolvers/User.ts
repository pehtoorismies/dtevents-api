import { objectType } from 'nexus';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.string("id", { description: "Id of the user" });
    t.string('auth0Id');
    t.string('email');
    t.string('username');
    t.string('name');
    t.date('createdAt');
    t.date('updatedAt');
  },
});

export const SimpleUser = objectType({
  name: 'SimpleUser',
  definition(t) {
    t.string("userId", { description: "Id of the user" });
    t.string('username');
  },
});
