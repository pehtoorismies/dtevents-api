import { objectType } from 'nexus';

export const Preferences = objectType({
  name: 'Preferences',
  definition(t) {
    t.boolean('subscribeWeeklyEmail');
    t.boolean('subscribeEventCreationEmail');
  },
});

export const UserDetails = objectType({
  name: 'UserDetails',
  definition(t) {
    t.string('id');
    t.string('userId');
    t.field('preferences', {
      type: 'Preferences',
    });
  },
});
