import { objectType } from 'nexus';

export const Preferences = objectType({
  name: 'Preferences',
  definition(t) {
    t.boolean('subscribeWeeklyEmail');
    t.boolean('subscribeEventCreationEmail');
  },
});

export const User = objectType({
  name: 'User',
  definition(t) {
    t.string('id');
    t.string('auth0Id');
    t.string('email');
    t.string('username');
    t.string('name');
    t.string('nickname', { nullable: true });
    t.field('preferences', {
      type: 'Preferences',
    });
    t.date('createdAt');
    t.date('updatedAt', { nullable: true });
  },
});

export const SimpleUser = objectType({
  name: 'SimpleUser',
  definition(t) {
    t.string('sub', { description: "Auth0 subject", nullable: true});
    t.string('nickname', { description: "Auth0 nickname", nullable: true});
    t.string('username', { description: "Auth0 username (backwards comp)", nullable: true});
    t.string('id', { description: "Auth0 id (backwards comp)", nullable: false});
  },
});

export const BaseUser = objectType({
  name: 'BaseUser',
  definition(t) {
    t.string('id');
    t.string('username');
    t.string('name');
    t.string('nickname');
    t.string('email');
    t.string('picture');
  },
});
