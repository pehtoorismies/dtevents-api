import { rule, shield } from 'graphql-shield';
import R from 'ramda';
import { isNilOrEmpty } from 'ramda-adjunct';

interface Context {
  scopes?: string[];
}

export const verifyRole = (role: string, context: Context): boolean => {
  const scopes = context.scopes || [];

  if (isNilOrEmpty(role)) {
    return true;
  }

  return R.findIndex(R.equals(role))(scopes) >= 0;
};

const rules = {
  isUserReader: rule()((parent, args, context) => {
    return verifyRole('read:users', context);
  }),
  isMeReader: rule()((parent, args, context) => {
    return verifyRole('read:me', context);
  }),
  isMeWriter: rule()((parent, args, context) => {
    return verifyRole('write:me', context);
  }),
  isEventReader: rule()(async (parent, { id }, context) => {
    return verifyRole('read:events', context);
  }),
  isEventWriter: rule()(async (parent, { id }, context) => {
    return verifyRole('write:events', context);
  }),
};

const permissions = shield({
  Query: {
    sendWeeklyEmail: rules.isUserReader,
    findManyEvents: rules.isEventReader,
    findOldEvents: rules.isEventReader,
    // findEvent: rules.isEventReader,
    // user: rules.isUserReader,
    me: rules.isMeReader,
  },
  Mutation: {
    createEvent: rules.isEventWriter,
    deleteEvent: rules.isEventWriter,
    updateEvent: rules.isEventWriter,
    toggleJoinEvent: rules.isEventWriter,
    updateMyPreferences: rules.isMeWriter,
    updateMe: rules.isMeWriter,
  },
});
export { permissions };
