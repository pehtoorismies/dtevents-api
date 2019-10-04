import { objectType } from 'nexus';

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('accessToken');
    t.string('idToken');
    t.string('expiresIn');
  },
});

export const IDPayload = objectType({
  name: 'IDPayload',
  definition(t) {
    t.string('id');
  },
});
