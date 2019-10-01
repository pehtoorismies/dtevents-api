import { DateTime } from './DateTime';
import { Event } from './Event';
import { EventTypeEnum } from './EventTypeEnum';
import { Mutation } from './Mutation';
import { AuthPayload, IDPayload } from './Payloads';
import { Query } from './Query';
import { Preferences, SimpleUser, User } from './User';

const resolvers = {
  AuthPayload,
  DateTime,
  Event,
  EventTypeEnum,
  IDPayload,
  Mutation,
  Preferences,
  Query,
  SimpleUser,
  User,
};

export default resolvers;
