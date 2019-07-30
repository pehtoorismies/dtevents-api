import { objectType } from '@prisma/nexus';

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('accessToken');
    t.string('idToken');
    t.string('expiresIn');
  },
});
