import * as R from 'ramda';
import * as RA from 'ramda-adjunct';

import { rule, shield } from 'graphql-shield';

interface Context {
  scopes?: string[];
}

export const verifyRole = (role: string, context: Context): boolean => {
  console.log('Verify role', role)
  const scopes = context.scopes || [];
  
  if (RA.isNilOrEmpty(role)) {
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
    // allUsers: rules.isUserReader,
    // allEvents: rules.isEventReader,
    // event: rules.isEventReader,
    // user: rules.isUserReader,
    me: rules.isMeReader,
  },
  Mutation: {
    createEvent: rules.isEventWriter,
    // deleteEvent: rules.isEventWriter,
    // updateEvent: rules.isEventWriter,
    joinEvent: rules.isEventWriter,
    unjoinEvent: rules.isEventWriter,
  },
});
export default permissions;
