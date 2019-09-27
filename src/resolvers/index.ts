import { AuthPayload } from './AuthPayload';
import { DateTime } from './DateTime';
import { Event } from './Event';
import { EventTypeEnum } from './EventTypeEnum';
import { Mutation } from './Mutation';
import { Query } from './Query';
import { SimpleUser, User } from './User';
import { UserDetails, Preferences } from './UserDetails';

const resolvers = {
  AuthPayload,
  DateTime,
  Event,
  EventTypeEnum,
  Mutation,
  Preferences,
  Query,
  SimpleUser,
  User,
  UserDetails,
};

export default resolvers;
